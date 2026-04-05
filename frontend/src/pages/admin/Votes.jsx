import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, 
  Search, 
  Clock, 
  Hash, 
  ShieldCheck, 
  History,
  Activity,
  ChevronRight,
  Filter
} from "lucide-react";
import api from "../../services/api";

const Votes = () => {
  const [limit, setLimit] = useState(50);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVotes = () => {
    setLoading(true);
    setError("");
    api
      .get(`/admin/recent-votes?limit=${limit}`)
      .then((r) => setVotes(r.data))
      .catch((e) => setError(e.response?.data?.detail || "Failed to fetch votes."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVotes();
  }, [limit]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            Ledger Oversight
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 mt-2 font-medium"
          >
            Audit individual transaction hashes and vote identifiers
          </motion.p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-900/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl">
             <Filter className="w-4 h-4 text-slate-500" />
             <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="bg-transparent text-slate-900 dark:text-white text-sm font-bold focus:outline-none appearance-none cursor-pointer"
              >
                {[20, 50, 100, 200].map((n) => (
                  <option key={n} value={n} className="bg-white dark:bg-slate-900">Show {n} Records</option>
                ))}
              </select>
          </div>
          <button 
            onClick={loadVotes}
            className="p-2.5 bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 border border-sky-600/20 rounded-2xl transition-all active:scale-95"
          >
            <Activity className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </header>

      {error && (
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3"
        >
          <Hash className="w-5 h-5 shrink-0" />
          {error}
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white dark:bg-slate-900/[0.03] rounded-3xl" />
        <div className="absolute inset-0 border border-slate-200 dark:border-white/10 rounded-3xl" />
        
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Reference</th>
                <th className="px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Election Context</th>
                <th className="px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Transaction Hash</th>
                <th className="px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-[10px] hidden md:table-cell">Temporal</th>
                <th className="px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-[10px] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {votes.map((v, i) => (
                  <motion.tr 
                    key={v.vote_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="group/row hover:bg-white dark:bg-slate-900/[0.02] transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
                            <History className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="font-bold text-slate-900 dark:text-white tracking-tight font-mono text-xs">{v.vote_id.slice(0, 16)}...</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Vote ID</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{v.election_name}</p>
                      <p className="text-xs text-sky-400/80 font-medium">Candidate: {v.candidate_name}</p>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2 group/hash">
                         <span className="font-mono text-[10px] text-slate-500 bg-slate-50 dark:bg-black/20 px-2 py-1 rounded border border-slate-100 dark:border-white/5 max-w-[180px] truncate group-hover/hash:text-slate-700 dark:text-slate-300 transition-colors">
                           {v.tx_hash || "PENDING_CONSOLIDATION"}
                         </span>
                       </div>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                       <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-medium">{new Date(v.created_at).toLocaleString()}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <span className={`inline-flex items-center gap-1.5 px-2 py-1 ${v.tx_hash ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'} text-[10px] font-bold rounded-lg border uppercase tracking-widest`}>
                         {v.tx_hash ? <ShieldCheck className="w-3 h-3" /> : <Activity className="w-3 h-3 animate-pulse" />}
                         {v.tx_hash ? "COMMITTED" : "MEMPOOL"}
                       </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {votes.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <Database className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                    <p className="text-slate-500 font-medium italic">No ledger entries found in current session</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Votes;
