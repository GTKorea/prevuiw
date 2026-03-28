import { NavBar } from "@/components/dashboard/nav-bar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      {children}
    </div>
  );
}
