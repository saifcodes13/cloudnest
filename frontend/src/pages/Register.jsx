import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth.js";
import { Server, Lock, Mail, User, Loader2, AlertCircle } from "lucide-react";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(50),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setError("");
    setIsSubmitting(true);
    const result = await register(data.name, data.email, data.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      if (result.details && Array.isArray(result.details)) {
        setError(`${result.message}: ${result.details.join(", ")}`);
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] px-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center mb-4">
            <Server className="h-6 w-6 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Create your Account
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Get started with CloudNest hosting
          </p>
        </div>

        {/* Card Form */}
        <div className="border border-[#1e293b] bg-[#0d1321]/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 flex items-center p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-[#1e293b] rounded-xl pl-11 pr-4 py-3 text-sm placeholder-slate-500 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  placeholder="John Doe"
                  {...registerField("name")}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  className="w-full bg-slate-900 border border-[#1e293b] rounded-xl pl-11 pr-4 py-3 text-sm placeholder-slate-500 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  placeholder="name@company.com"
                  {...registerField("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  className="w-full bg-slate-900 border border-[#1e293b] rounded-xl pl-11 pr-4 py-3 text-sm placeholder-slate-500 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  placeholder="At least 6 characters"
                  {...registerField("password")}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition duration-200 flex items-center justify-center shadow-lg shadow-indigo-600/10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          {/* Redirect Option */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
