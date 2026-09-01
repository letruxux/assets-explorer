import { NavLink, Outlet } from "react-router-dom";
import { cn } from "./lib/utils";
import useWindowSize from "./hooks/use-window-size";
import { Compass, FolderOpen, Settings } from "lucide-react";

const navItems = [
  { to: "/", label: "Explore", end: true, icon: Compass },
  { to: "/my-assets", label: "My Assets", end: false, icon: FolderOpen },
  { to: "/settings", label: "Settings", end: false, icon: Settings }
];

const SIDEBAR_COLLAPSE_WIDTH = 640;

function App(): React.JSX.Element {
  const { width } = useWindowSize();
  const collapsed = width < SIDEBAR_COLLAPSE_WIDTH;

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <nav
        className={cn(
          "bg-base-200 flex flex-col gap-1 p-2 shrink-0 overflow-y-auto overflow-x-hidden",
          collapsed ? "w-12 items-center" : "w-48"
        )}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "btn btn-ghost gap-2",
                collapsed ? "btn-square px-0 justify-center" : "justify-start",
                {
                  "btn-active": isActive
                }
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
