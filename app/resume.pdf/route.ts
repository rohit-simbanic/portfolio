import { NextRequest, NextResponse } from "next/server";
import { getSiteContent } from "@/lib/actions";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const resume = await getSiteContent("resume");
    if (resume && resume.url) {
      return NextResponse.redirect(resume.url);
    }
  } catch (error) {
    console.error("Error retrieving custom resume from database:", error);
  }

  // Fallback to local public/resume.pdf file
  try {
    const filePath = path.join(process.cwd(), "public", "resume.pdf");
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline; filename=\"resume.pdf\"",
        },
      });
    }
  } catch (error) {
    console.error("Error reading fallback resume file:", error);
  }

  return new Response("Resume not found", { status: 404 });
}
