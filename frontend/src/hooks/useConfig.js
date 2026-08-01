import { useQuery } from "@tanstack/react-query";
import configService from "../services/configService.js";

export const useConfig = () => {
  return useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      let baseDomain = "localhost:8082";
      let protocol = "http";

      try {
        const response = await configService.getConfig();
        baseDomain = response.data.baseDomain || "localhost:8082";
        protocol = response.data.protocol || "http";
      } catch (err) {
        protocol = window.location.protocol.replace(":", "");
        baseDomain = window.location.host.includes("5173")
          ? "localhost:8082"
          : window.location.host;
      }

      // Dynamically resolve base domain if accessed via a public domain (like cloudcodes.online)
      const currentHost = window.location.host;
      if (
        currentHost &&
        !currentHost.includes("localhost") &&
        !currentHost.includes("127.0.0.1") &&
        !currentHost.includes("5173") &&
        !currentHost.includes("5001")
      ) {
        baseDomain = currentHost;
        protocol = window.location.protocol.replace(":", "");
      }

      return { baseDomain, protocol };
    },
    staleTime: Infinity, // The domain config won't change at runtime
  });
};

export default useConfig;
