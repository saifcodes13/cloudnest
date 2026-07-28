import api from "./api.js";

export const websiteService = {
  /**
   * Fetch all websites registered by the authenticated user
   */
  async getWebsites() {
    const response = await api.get("/websites");
    return response.data; // { success: true, message, data: [websites] }
  },

  /**
   * Upload and deploy a static site zip archive
   * @param {string} name - Subdomain name for the website
   * @param {File} file - Compressed zip file
   * @param {function} onProgress - Progress status callback
   */
  async uploadSite(name, file, onProgress) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("file", file);

    const response = await api.post("/websites/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data; // { success: true, message, data: { website, deployment } }
  },
};

export default websiteService;
