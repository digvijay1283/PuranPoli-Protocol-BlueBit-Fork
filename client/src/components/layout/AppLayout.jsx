import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";

function AppLayout() {
  const location = useLocation();
  const isGraphPage = location.pathname === "/app/graph";

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#f8f6ff] text-slate-900">
      <Sidebar />

      <main className={`flex min-h-0 flex-1 flex-col overflow-hidden pb-16 lg:pb-0 ${isGraphPage ? "" : "overflow-y-auto"}`}>
        <Outlet />
      </main>

      <MobileBottomNav />
    </div>
  );
}

export default AppLayout;
