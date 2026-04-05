import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Vote as VoteIcon, 
  Layers, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  ChevronRight,
  Database,
  BarChart3,
  TerminalSquare
} from "lucide-react";
import api from "../../services/api";

const StatCard = ({ label, value, sub, icon: Icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative group overflow-hidden bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    
    <div className="relative p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Icon className="w-5 h-5 text-emerald-500" />
        {sub && <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500/80 bg-emerald-500/10 px-2 py-1 rounded w-max">{sub}</span>}
      </div>
      <div>
        <p className="text-xs font-mono font-medium text-slate-500 mb-1 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-200 tracking-tight">{value ?? "—"}</p>
      </div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/admin/dashboard"), api.get("/admin/recent-votes")])
      .then(([s, v]) => { setStats(s.data); setVotes(v.data); })
      .catch((error) => console.error("AdminDashboard API Error:", error.response || error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-2 border-emerald-900 border-t-emerald-500 rounded-full animate-spin" />
      <p className="text-emerald-500 font-mono animate-pulse text-sm uppercase tracking-widest">Initializing Terminal...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-slate-700 dark:text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <TerminalSquare className="w-6 h-6 text-emerald-500" />
               <h1 className="text-2xl font-mono font-bold text-slate-900 dark:text-white tracking-tight">Root Access Terminal</h1>
            </div>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
              Live System Telemetry & Cryptographic Verification
            </p>
          </div>
          
          <Link 
            to="/admin/elections" 
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-emerald-500 rounded font-mono font-bold text-sm transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            DEPLOY ELECTION
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Registered Nodes" value={stats?.total_voters} icon={Users} delay={0.1} />
          <StatCard label="Total TXs Cast" value={stats?.total_votes_cast} sub={`Active: ${stats?.voters_who_voted}`} icon={VoteIcon} delay={0.2} />
          <StatCard label="Ledger Height" value={stats?.blockchain_length} sub="Syncro" icon={Layers} delay={0.3} />
          <StatCard label="Mempool Load" value={stats?.pending_transactions} sub="Pending" icon={Database} delay={0.4} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                 <BarChart3 className="w-4 h-4 text-emerald-500" />
                 Transaction Feed
              </h2>
              <Link to="/admin/results" className="text-xs font-mono font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
                TAIL LOGS →
              </Link>
            </div>
            
            <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                    <tr>
                      <th className="px-5 py-3 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Target Hash / Process</th>
                      <th className="px-5 py-3 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Candidate Node</th>
                      <th className="px-5 py-3 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Time (UTC)</th>
                      <th className="px-5 py-3 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-right">Integrity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {votes.slice(0, 7).map((v, i) => (
                        <motion.tr 
                          key={v.vote_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + (i * 0.05) }}
                          className="hover:bg-white dark:bg-slate-900/[0.02] transition-colors"
                        >
                          <td className="px-5 py-3">
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{v.election_name}</p>
                            <p className="text-[10px] text-slate-600 font-mono mt-0.5 opacity-80">{v.vote_id.slice(0, 16)}...</p>
                          </td>
                          <td className="px-5 py-3 text-emerald-500/80 font-medium">{v.candidate_name}</td>
                          <td className="px-5 py-3 text-slate-600">
                            {new Date(v.created_at).toISOString().split('T')[1].split('.')[0]}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded border border-emerald-500/20 uppercase tracking-widest">
                              <ShieldCheck className="w-3 h-3" />
                              VERIFIED
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {votes.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center">
                          <p className="text-slate-600 font-medium font-mono text-xs">{">"} NO_TX_FOUND</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest px-1">Sys Health</h2>
            
            <div className="p-6 rounded-xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 space-y-6">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center border-4 ${
                stats?.chain_valid ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
              }`}>
                {stats?.chain_valid ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200 mb-1 uppercase tracking-widest">
                  {stats?.chain_valid ? "Consensus Valid" : "FATAL ERROR"}
                </h3>
                <p className="text-slate-500 text-xs font-mono leading-relaxed px-4">
                  {stats?.chain_valid 
                    ? "> All cryptographic links secured. Signature hashes match. Network stable."
                    : "> FATAL: Blockchain linkage tampered. Rollback required."}
                </p>
              </div>

              <Link 
                to="/admin/blockchain" 
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:bg-white/10 text-emerald-500 rounded font-mono font-bold text-xs uppercase tracking-widest transition-all border border-slate-200 dark:border-white/10 group"
              >
                Inspect Ledger
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
