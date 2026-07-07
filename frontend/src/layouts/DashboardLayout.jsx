import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import {
  LayoutDashboard,
  Globe,
  Settings,
  LogOut,
  Server,
  User,
} from "lucide-react";

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    {
      name: "Deployments",
      path: "/dashboard/deployments",
      icon: Globe,
      disabled: true,
    },
    {
      name: "Settings",
      path: "/dashboard/settings",
      icon: Settings,
      disabled: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100">
      {/* Side Navigation Bar */}
      <aside className="w-64 border-r border-[#1e293b] bg-[#0d1321]/60 backdrop-blur-xl flex flex-col">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#1e293b]">
          <Server className="h-6 w-6 text-indigo-500 mr-2" />
          <span className="font-semibold text-lg bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
            CloudNest
          </span>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            if (link.disabled) {
              return (
                <div
                  key={link.name}
                  className="flex items-center px-4 py-3 text-sm rounded-lg text-slate-600 cursor-not-allowed select-none group"
                  title="Coming soon in a later sprint"
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{link.name}</span>
                  <span className="ml-auto text-[10px] bg-slate-800/60 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                    : "text-slate-400 hover:bg-[#1e293b]/50 hover:text-slate-200 border border-transparent"
                }`}
              >
                <Icon
                  className={`h-5 w-5 mr-3 transition-colors ${
                    isActive ? "text-indigo-400" : "text-slate-400"
                  }`}
                />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info Footbar */}
        <div className="p-4 border-t border-[#1e293b] bg-[#0d1321]/40">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold">
              {user?.name?.charAt(0).toUpperCase() || (
                <User className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-[#1e293b] bg-[#0d1321]/30 backdrop-blur-md flex items-center justify-between px-8">
          <h1 className="text-sm font-medium text-slate-400">
            Console &gt;{" "}
            <span className="text-slate-200 font-semibold">Dashboard</span>
          </h1>
          <div className="flex items-center space-x-2 text-xs bg-slate-800/40 px-3 py-1.5 rounded-full border border-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">Control Plane Active</span>
          </div>
        </header>

        {/* Workspace Display */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
