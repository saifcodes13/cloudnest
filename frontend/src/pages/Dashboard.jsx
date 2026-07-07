import { useAuth } from "../hooks/useAuth.js";
import { Plus, Globe, Shield, CreditCard, ChevronRight } from "lucide-react";

export const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: "Total Websites",
      value: "0",
      description: "Created websites",
      icon: Globe,
    },
    {
      name: "Security Gateways",
      value: "Active",
      description: "SSL & rate limiters",
      icon: Shield,
    },
    {
      name: "Platform Plan",
      value: "Developer",
      description: "Self-hosted Tier",
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-slate-400 mt-1">
            Deploy, monitor, and scale your hosted websites.
          </p>
        </div>
        <button
          onClick={() => alert("Website uploads are coming soon in Sprint 4!")}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition duration-200 shadow-lg shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4 mr-2" />
          Deploy New Site
        </button>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="border border-[#1e293b] bg-[#0d1321]/40 rounded-2xl p-6 relative overflow-hidden group hover:border-[#334155] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {stat.name}
                </span>
                <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600/15 group-hover:text-indigo-400 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-slate-100">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  {stat.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Workspace Container */}
      <div className="border border-[#1e293b] bg-[#0d1321]/20 rounded-2xl p-8 relative overflow-hidden">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-slate-800/40 border border-slate-700 flex items-center justify-center text-slate-500 mb-6">
            <Globe className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">
            No websites deployed yet
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mt-2 mb-6">
            Upload your static index bundle files (HTML, CSS, JS) and deploy
            them to CloudNest in minutes.
          </p>
          <button
            onClick={() =>
              alert("Website uploads are coming soon in Sprint 4!")
            }
            className="inline-flex items-center px-4 py-2 border border-[#1e293b] rounded-lg text-sm font-semibold hover:bg-[#1e293b]/60 transition-colors text-slate-300"
          >
            <span>Learn how deployments work</span>
            <ChevronRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
