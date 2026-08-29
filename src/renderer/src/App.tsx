import { NavLink, Outlet } from "react-router-dom";
import { cn } from "./lib/utils";

const navItems = [
  { to: "/", label: "Explore", end: true },
  { to: "/my-assets", label: "My Assets", end: false }
];

function App(): React.JSX.Element {
  return (
    <div className="flex min-h-dvh w-full">
      <nav className="menu bg-base-200 w-48 p-2 gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn("btn btn-ghost justify-start", { "btn-active": isActive })
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
