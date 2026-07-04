import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandBar } from "@/components/layout/CommandBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CommandBar />
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden relative">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/20 relative">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
