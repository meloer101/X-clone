import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1265px] mx-auto flex">
        <Sidebar />

        <main className="flex-1 min-h-screen border-x border-[#2f3336] max-w-[600px]">
          {children}
        </main>

        <RightPanel />
      </div>
    </div>
  );
}
