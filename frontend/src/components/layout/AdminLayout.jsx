import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import useAuth from "../../hooks/useAuth";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/elections", label: "Elections" },
  { to: "/admin/candidates", label: "Candidates" },
  { to: "/admin/voters", label: "Voters" },
  { to: "/admin/results", label: "Results" },
  { to: "/admin/votes", label: "Votes" },
  { to: "/admin/blockchain", label: "Blockchain" },
];

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex bg-slate-50 dark:bg-[#050505] min-h-screen font-sans">
      <Sidebar links={adminLinks} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 bg-white dark:bg-[#0B0F19] border-b border-slate-200 dark:border-white/5 flex items-center px-8 justify-between sticky top-0 z-10 transition-colors">
          <h1 className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-sm">
              AD
            </span>
            System Administration
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 px-4 py-2 rounded-lg transition-colors border border-red-100 dark:border-red-500/20"
            >
              Secure Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
