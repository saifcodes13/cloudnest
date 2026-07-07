import { Link } from "react-router-dom";
import { ServerCrash } from "lucide-react";

export const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#090d16] text-[#f1f5f9] px-4">
      <ServerCrash className="h-16 w-16 text-indigo-500 mb-6 animate-bounce" />
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">404</h1>
      <p className="text-lg text-slate-400 mb-6 text-center max-w-md">
        The page you are looking for does not exist or has been relocated in the
        cloud.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-3 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
      >
        Go to Console
      </Link>
    </div>
  );
};

export default NotFound;
