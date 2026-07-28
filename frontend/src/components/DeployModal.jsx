import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import websiteService from "../services/websiteService.js";
import { X, Upload, FileArchive, AlertCircle, Loader2 } from "lucide-react";

// Client-side validation schema
const deploySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Website name must be at least 3 characters")
    .max(63, "Website name cannot exceed 63 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Can only contain lowercase letters, numbers, and dashes",
    ),
});

export const DeployModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(deploySchema),
  });

  if (!isOpen) {
    return null;
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setFileError("");
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.name.endsWith(".zip")) {
      setFileError("Only compressed .zip archives are allowed");
      setFile(null);
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setFileError("Maximum file size limit is 50MB");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const onSubmit = async (data) => {
    setSubmitError("");
    if (!file) {
      setFileError("Please select a static site zip archive to deploy");
      return;
    }

    setIsDeploying(true);
    setUploadProgress(0);

    try {
      const response = await websiteService.uploadSite(
        data.name,
        file,
        (progress) => {
          setUploadProgress(progress);
        },
      );

      if (response.success) {
        reset();
        setFile(null);
        onSuccess();
        onClose();
      } else {
        setSubmitError(response.message || "Deployment failed");
      }
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        "Internal server error during upload";
      const details = error.response?.data?.error?.details || null;
      if (details && Array.isArray(details)) {
        setSubmitError(`${message}: ${details.join(", ")}`);
      } else {
        setSubmitError(message);
      }
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg border border-[#1e293b] bg-[#0d1321] rounded-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col">
        {/* Modal Header */}
        <div className="h-14 border-b border-[#1e293b] px-6 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200">
            Deploy a Static Website
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {submitError && (
            <div className="flex items-start p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Website Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Website Name (Subdomain)
              </label>
              <div className="flex rounded-xl bg-slate-900 border border-[#1e293b] focus-within:border-indigo-500 transition-colors overflow-hidden">
                <input
                  type="text"
                  className="flex-1 bg-transparent px-4 py-3 text-sm placeholder-slate-500 text-slate-200 focus:outline-none"
                  placeholder="my-cool-site"
                  disabled={isDeploying}
                  {...register("name")}
                />
                <span className="bg-slate-800 border-l border-[#1e293b] px-4 py-3 text-xs font-semibold text-slate-500 flex items-center select-none">
                  .localhost:8082
                </span>
              </div>
              <p className="mt-1.5 text-[10px] text-slate-500">
                Can only contain lowercase letters, numbers, and dashes.
              </p>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Upload Build Folder (.zip)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".zip"
                className="hidden"
                disabled={isDeploying}
              />

              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className={`border-2 border-dashed border-[#1e293b] hover:border-indigo-500/60 hover:bg-indigo-600/5 cursor-pointer rounded-2xl py-8 flex flex-col items-center justify-center transition-all ${
                    fileError
                      ? "border-red-500/40 bg-red-500/5 hover:border-red-500/60 hover:bg-red-500/10"
                      : ""
                  }`}
                >
                  <Upload
                    className={`h-8 w-8 mb-3 ${fileError ? "text-red-400" : "text-slate-500"}`}
                  />
                  <p className="text-sm text-slate-300 font-medium">
                    Drag and drop your project `.zip` here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    or click to browse local files (max 50MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-slate-900 border border-[#1e293b] rounded-xl">
                  <div className="flex items-center space-x-3 min-w-0">
                    <FileArchive className="h-8 w-8 text-indigo-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {!isDeploying && (
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 px-3 py-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
              {fileError && (
                <p className="mt-2 text-xs text-red-400 font-medium flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span>{fileError}</span>
                </p>
              )}
            </div>

            {/* Progress Bar */}
            {isDeploying && (
              <div className="space-y-2 bg-[#090d16] border border-[#1e293b] rounded-xl p-4">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
                  <span className="text-indigo-400 flex items-center">
                    <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                    {uploadProgress < 100
                      ? "Uploading assets..."
                      : "Extracting and Deploying..."}
                  </span>
                  <span className="text-slate-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Modal Controls */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-[#1e293b]">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeploying}
                className="px-5 py-2.5 text-sm font-semibold border border-[#1e293b] hover:bg-[#1e293b] rounded-xl text-slate-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDeploying}
                className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition duration-200 shadow-lg shadow-indigo-600/10 flex items-center justify-center"
              >
                Deploy Site
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeployModal;
