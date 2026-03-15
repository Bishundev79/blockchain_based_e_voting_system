import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isVoter, logout } = useAuth();

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const publicLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/how-it-works", label: "How It Works" },
  ];

  const voterLinks = [
    { to: "/voter/dashboard", label: "Dashboard" },
    { to: "/voter/vote", label: "Vote" },
    { to: "/voter/results", label: "Results" },
    { to: "/voter/candidates", label: "Candidates" },
    { to: "/voter/profile", label: "Profile" },
    { to: "/voter/blockchain", label: "Blockchain" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Admin Area" },
  ];

  const links = [
    ...publicLinks,
    ...(isAdmin ? adminLinks : []),
    ...(isVoter ? voterLinks : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-white/10 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-lg shadow-sm">
               B
            </span>
            eVoting
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                end={link.to === '/'}
                className={({ isActive }) => 
                  `text-sm transition-colors ${
                    isActive 
                      ? "font-bold text-sky-600 dark:text-sky-400" 
                      : "font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
            
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {!isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Sign In</Link>
                <Link to="/register" className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition-all hover:shadow">
                  Get Started
                </Link>
              </div>
            ) : (
              <button 
                onClick={handleLogout} 
                className="text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 px-4 py-2 rounded-full transition-colors"
              >
                Sign out
              </button>
            )}
          </div>
          {/* Mobile menu button could go here */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
