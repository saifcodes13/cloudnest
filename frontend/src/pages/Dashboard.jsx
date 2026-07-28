import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth.js";
import websiteService from "../services/websiteService.js";
import DeployModal from "../components/DeployModal.jsx";
import {
  Plus,
  Globe,
  Shield,
  CreditCard,
  ChevronRight,
  Loader2,
  ExternalLink,
  Calendar,
  Layers,
} from "lucide-react";

export const Dashboard = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Load registered websites owned by the user
  const {
    data: responseData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["websites"],
    queryFn: () => websiteService.getWebsites(),
  });

  const websites = responseData?.data || [];

  const stats = [
    {
      name: "Total Websites",
      value: websites.length.toString(),
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
          onClick={() => setIsModalOpen(true)}
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

      {/* Websites Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0d1321]/20 rounded-2xl border border-[#1e293b]">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-500 mb-3" />
          <p className="text-sm text-slate-400">Loading your websites...</p>
        </div>
      ) : websites.length === 0 ? (
        <div className="border border-[#1e293b] bg-[#0d1321]/20 rounded-2xl p-8 relative overflow-hidden animate-fade-in">
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
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-[#1e293b] rounded-lg text-sm font-semibold hover:bg-[#1e293b]/60 transition-colors text-slate-300"
            >
              <span>Deploy your first website</span>
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {websites.map((site) => {
            const domainUrl = `http://${site.name}.localhost:8082`;
            const isDeployed = site.activeDeployment?.status === "deployed";

            return (
              <div
                key={site._id}
                className="border border-[#1e293b] bg-[#0d1321]/40 hover:bg-[#0d1321]/70 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h4 className="font-bold text-lg text-slate-200 truncate">
                        {site.name}
                      </h4>
                      <a
                        href={domainUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center mt-1"
                      >
                        <span>{site.name}.localhost:8082</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isDeployed
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {site.activeDeployment?.status || "unknown"}
                    </span>
                  </div>

                  {/* Deploy Stats */}
                  <div className="space-y-2 pt-2 text-xs text-slate-400">
                    <div className="flex items-center">
                      <Layers className="h-3.5 w-3.5 mr-2 text-slate-500" />
                      <span>
                        Version: {site.activeDeployment?.version || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-slate-500" />
                      <span>
                        Updated: {new Date(site.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="mt-6 pt-4 border-t border-[#1e293b] flex justify-end">
                  <a
                    href={domainUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-[#1e293b] rounded-lg transition-colors flex items-center"
                  >
                    <span>Visit Site</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deployment Modal Overlay */}
      <DeployModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["websites"] });
          refetch();
        }}
      />
    </div>
  );
};

export default Dashboard;
