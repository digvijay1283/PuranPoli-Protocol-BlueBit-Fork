import { NavLink } from "react-router-dom";

const items = [
  { to: "/app", icon: "dashboard", label: "Home" },
  { to: "/app/graph", icon: "hub", label: "Graph" },
  { to: "/app/risk", icon: "warning", label: "Risk" },
  { to: "/app/simulation", icon: "science", label: "Sim" },
  { to: "/app/reports", icon: "summarize", label: "Reports" },
];

function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#b1b2ff]/20 bg-white/95 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-semibold ${
                isActive ? "text-[#6d6fd8]" : "text-slate-500"
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
