import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ── Init Resend ───────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

const HOST_NAME = "Rohit Mondal";
const HOST_EMAIL = "rohit.simbanic2023@gmail.com";
const MEET_LINK = "https://meet.google.com/adg-ndsh-ppk";
const DURATION = 30;
const TIMEZONE = "Asia/Kolkata";

// ── Build Google Calendar URL (unchanged) ─────────────────────────────────
function buildCalendarUrl(body: {
  meetingType: string;
  date: string;
  time: string;
  name: string;
  note: string;
}) {
  const [rawTime, meridiem] = body.time.split(" ");
  let [hours, minutes] = rawTime.split(":").map(Number);
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  const start = new Date(`${body.date}T00:00:00`);
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + DURATION * 60 * 1000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const title = encodeURIComponent(`${body.meetingType} with ${HOST_NAME}`);
  const details = encodeURIComponent(
    `Booked by: ${body.name}\nMeeting: ${body.meetingType}\nJoin: ${MEET_LINK}` +
      (body.note ? `\n\nNote: ${body.note}` : ""),
  );

  return (
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${title}&dates=${fmt(start)}/${fmt(end)}` +
    `&details=${details}&location=${encodeURIComponent(MEET_LINK)}` +
    `&ctz=${encodeURIComponent(TIMEZONE)}`
  );
}

// ── Send email via Resend ─────────────────────────────────────────────────
async function sendNotificationEmail(body: {
  meetingType: string;
  date: string;
  time: string;
  name: string;
  email: string;
  note: string;
  calendarUrl: string;
}) {
  await resend.emails.send({
    from: "Booking Schedule Notification <onboarding@resend.dev>", // use your verified domain later
    to: HOST_EMAIL,
    subject: `📅 New Booking: ${body.meetingType} — ${body.date} at ${body.time}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;background:#FAF6ED;border-radius:16px;">
        <h2 style="color:#1a1208;margin-bottom:4px;">New Appointment Booking</h2>
        <p style="color:#888;font-size:13px;margin-bottom:24px;">Someone just booked a slot on your calendar.</p>

        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#888;width:80px;">Meeting</td><td style="color:#1a1208;font-weight:600;">${body.meetingType}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Date</td><td style="color:#1a1208;font-weight:600;">${body.date}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Time</td><td style="color:#1a1208;font-weight:600;">${body.time} (${TIMEZONE})</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Name</td><td style="color:#1a1208;font-weight:600;">${body.name}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Email</td><td style="color:#1a1208;font-weight:600;">${body.email}</td></tr>
          ${body.note ? `<tr><td style="padding:8px 0;color:#888;vertical-align:top;">Note</td><td style="color:#1a1208;">${body.note}</td></tr>` : ""}
        </table>

        <div style="margin-top:24px;display:flex;gap:12px;">
          <a href="${body.calendarUrl}" style="display:inline-block;background:#F4A024;color:#1a1208;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">
            📅 Add to Google Calendar
          </a>
          <a href="${MEET_LINK}" style="display:inline-block;background:#1a1208;color:#FAF6ED;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">
            🎥 Join Meet
          </a>
        </div>
      </div>
    `,
  });
}

// ── POST /api/bookings ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      meetingType: string;
      date: string;
      time: string;
      name: string;
      email: string;
      note?: string;
    };

    if (
      !body.meetingType ||
      !body.date ||
      !body.time ||
      !body.name ||
      !body.email
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("date", body.date)
      .eq("time_slot", body.time)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "This slot was just taken. Please choose another time." },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        meeting_type: body.meetingType,
        date: body.date,
        time_slot: body.time,
        customer_name: body.name,
        customer_email: body.email,
        note: body.note ?? "",
      })
      .select()
      .single();

    if (error) throw error;

    const calendarUrl = buildCalendarUrl({
      meetingType: body.meetingType,
      date: body.date,
      time: body.time,
      name: body.name,
      note: body.note ?? "",
    });

    // ✅ Send email instead of mailto
    await sendNotificationEmail({
      meetingType: body.meetingType,
      date: body.date,
      time: body.time,
      name: body.name,
      email: body.email,
      note: body.note ?? "",
      calendarUrl,
    });

    return NextResponse.json({ success: true, booking: data, calendarUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── GET (unchanged) ───────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date)
    return NextResponse.json({ error: "date param required" }, { status: 400 });

  const { data, error } = await supabase
    .from("bookings")
    .select("time_slot")
    .eq("date", date)
    .eq("status", "confirmed");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    bookedSlots: (data ?? []).map((b) => b.time_slot),
  });
}
