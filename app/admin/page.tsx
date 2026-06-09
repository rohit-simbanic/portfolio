import { redirect } from "next/navigation";
import { verifyAdminSession, getAllSiteContent } from "@/lib/actions";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // 1. Enforce Server-Side Auth Check
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  // 2. Load all content from Database/Fallbacks
  const content = await getAllSiteContent();

  return (
    <main className="min-h-screen bg-cream-100 text-ink-900 font-body antialiased">
      <AdminDashboard initialContent={content} />
    </main>
  );
}
