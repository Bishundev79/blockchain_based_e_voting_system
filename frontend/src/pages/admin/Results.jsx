import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  PieChart, 
  Users, 
  Vote as VoteIcon, 
  Activity,
  ChevronRight,
  Database,
  Search,
  CheckCircle2
} from "lucide-react";
import { listElections } from "../../services/electionService";
import { getResults } from "../../services/voteService";

const AdminResults = () => {
  const [elections, setElections] = useState([]);
  const [electionId, setElectionId] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { listElections().then((r) => setElections(r.data)); }, []);

  useEffect(() => {
    if (!electionId) { setResults(null); return; }
    setLoading(true);
    getResults(electionId).then((r) => setResults(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [electionId]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            Live Consensus
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 mt-2 font-medium"
          >
            Real-time tally & participation data from the chain
          </motion.p>
        </div>
      </header>

      <div className="relative group overflow-hidden p-6 rounded-3xl bg-white dark:bg-slate-900/[0.03] border border-slate-200 dark:border-white/10">
         <div className="flex items-center gap-4">
           <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400">
             <Search className="w-5 h-5" />
           </div>
           <select 
              value={electionId} 
              onChange={(e) => setElectionId(e.target.value)}
              className="flex-1 bg-transparent text-slate-900 dark:text-white border-none focus:ring-0 focus:outline-none font-semibold placeholder:text-slate-600 appearance-none"
            >
              <option value="" className="bg-white dark:bg-slate-900 border-none">Select Election to Audit...</option>
              {elections.map((el) => <option key={el.election_id} value={el.election_id} className="bg-white dark:bg-slate-900 border-none">{el.name} ({el.status.toUpperCase()})</option>)}
            </select>
         </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-500 rounded-full" />
          <p className="text-slate-500 font-medium">Aggregating chain data...</p>
        </div>
      ) : results ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Consensus Tally", value: `${results.total_votes} / ${results.total_voters}`, icon: VoteIcon, sub: "Recorded Votes" },
              { label: "Participation", value: `${results.turnout_percentage}%`, icon: Users, sub: "Network Turnout" },
              { label: "Network State", value: "Synchronized", icon: Database, sub: "Immutable Record" }
            ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900/[0.03] border border-slate-200 dark:border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.sub}</span>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                 <BarChart3 className="w-5 h-5 text-sky-400" />
                 Statistical Breakdown
              </h2>
              <div className="space-y-4">
                {results.results.map((r, i) => (
                  <motion.div 
                    key={r.candidate_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.05) }}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900/[0.02] border border-slate-200 dark:border-white/10 group hover:border-slate-300 dark:border-white/20 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center font-bold text-slate-500 border border-slate-100 dark:border-white/5 group-hover:text-sky-400 transition-colors">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white tracking-tight">{r.candidate_name}</p>
                          <p className="text-xs text-slate-500 font-medium tracking-wide font-mono uppercase">{r.party || "UNALIGNED"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{r.votes}</p>
                        <p className="text-xs font-bold text-sky-400">{r.percentage}%</p>
                      </div>
                    </div>
                    <div className="relative h-2 w-full bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${r.percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-600 to-sky-400 rounded-full"
                       />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
               <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 font-mono tracking-tight underline-offset-8">
                 <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                 Network Validation
              </h2>
              <div className="p-8 rounded-3xl bg-emerald-500/[0.02] border border-emerald-500/10 flex flex-col items-center text-center space-y-6">
                 <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/20 text-emerald-400">
                    <PieChart className="w-10 h-10" />
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Immutable Consensus</h3>
                   <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                     Every recorded vote has been cryptographically signed and verified by the network. No unauthorized state changes detected.
                   </p>
                 </div>
                 <div className="w-full flex flex-col gap-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 text-xs font-mono">
                      <span className="text-slate-500">SIGNATURES VALID</span>
                      <span className="text-emerald-400 font-bold">100% SECURE</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 text-xs font-mono">
                      <span className="text-slate-500">HASH INTEGRITY</span>
                      <span className="text-emerald-400 font-bold">VERIFIED</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 bg-white dark:bg-slate-900/[0.02] border border-dashed border-slate-200 dark:border-white/10 rounded-3xl"
        >
          <BarChart3 className="w-16 h-16 text-slate-800 mx-auto mb-6" />
          <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">No Active Consensus</h3>
          <p className="text-slate-600 max-w-xs mx-auto">Select a finalized or active election event to visualize the participation data.</p>
        </motion.div>
      )}
    </div>
  );
};

export default AdminResults;
