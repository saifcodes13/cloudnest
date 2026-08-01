import api from "./api.js";

export const configService = {
  /**
   * Fetch base domain and protocol configuration from backend
   */
  async getConfig() {
    const response = await api.get("/config");
    return response.data; // { success: true, message, data: { baseDomain, protocol } }
  },
};

export default configService;
