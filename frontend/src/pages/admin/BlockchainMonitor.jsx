import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, 
  Cpu, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Hash, 
  Activity,
  ChevronDown,
  RefreshCw,
  Box,
  Layers
} from "lucide-react";
import { fetchStats, fetchPending, mine, fetchChain } from "../../services/blockchainService";

const BlockchainMonitor = () => {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [chain, setChain] = useState([]);
  const [mining, setMining] = useState(false);
  const [mineResult, setMineResult] = useState(null);
  const [mineError, setMineError] = useState("");
  const [expandedBlock, setExpandedBlock] = useState(null);

  const reload = () => {
    Promise.all([fetchStats(), fetchPending(), fetchChain()])
      .then(([s, p, c]) => { 
        setStats(s.data); 
        setPending(p.data); 
        setChain(c.data.reverse()); // Show latest first
      })
      .catch((error) => console.error("BlockchainMonitor API Error:", error.response || error));
  };

  useEffect(() => { reload(); }, []);

  const handleMine = async () => {
    setMining(true); setMineResult(null); setMineError("");
    try {
      const { data } = await mine();
      setMineResult(data);
      reload();
    } catch (err) {
      setMineError(err.response?.data?.detail || "Mining failed.");
    } finally {
      setMining(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            Network Monitor
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 mt-2 font-medium"
          >
            Real-time block propagation & consensus validation
          </motion.p>
        </div>
        
        <button 
          onClick={reload}
          className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl border border-slate-200 dark:border-white/10 transition-all text-slate-600 dark:text-slate-400 shadow-sm"
        >
          <RefreshCw className={`w-5 h-5 ${mining ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Chain Length", value: stats?.block_count, icon: Box, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-500/10" },
          { label: "Mempool Count", value: stats?.pending_transactions, icon: Activity, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10" },
          { label: "Consensus Status", value: stats?.is_valid ? "Valid" : "Invalid", icon: stats?.is_valid ? ShieldCheck : ShieldAlert, color: stats?.is_valid ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400", bg: stats?.is_valid ? "bg-emerald-100 dark:bg-emerald-500/10" : "bg-red-100 dark:bg-red-500/10" }
        ].map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative p-6 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-5"
          >
            <div className={`p-3 rounded-2xl ${s.bg} ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value ?? "—"}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Mempool & Mining */}
        <div className="space-y-8">
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-sky-50 dark:from-sky-500/10 to-transparent border border-sky-200 dark:border-sky-500/20 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                Mining Console
              </h2>
              {mining && <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-ping" />}
            </div>

            <div className="bg-white/80 dark:bg-black/20 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
               <div className="flex items-center justify-between text-xs">
                 <span className="text-slate-500 font-bold uppercase tracking-widest">Difficulty</span>
                 <span className="text-sky-600 dark:text-sky-400 font-mono font-bold">d=2 (00...)</span>
               </div>
               <div className="flex items-center justify-between text-xs">
                 <span className="text-slate-500 font-bold uppercase tracking-widest">Load</span>
                 <span className="text-sky-600 dark:text-sky-400 font-mono font-bold">{pending.length} Transactions</span>
               </div>
               
               <button
                  onClick={handleMine}
                  disabled={mining || pending.length === 0}
                  className="w-full py-4 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
               >
                 {mining ? (
                   <>
                     <RefreshCw className="w-5 h-5 animate-spin" />
                     Solving PoW Hash...
                   </>
                 ) : (
                   "Commit Next Block"
                 )}
               </button>
            </div>

            <AnimatePresence>
              {mineResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm p-4 rounded-2xl font-medium flex items-start gap-3 shadow-sm"
                >
                  <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">Block Committed!</p>
                    <p className="text-xs opacity-80 mt-1 font-mono break-all">{mineResult.hash.slice(0, 32)}...</p>
                  </div>
                </motion.div>
              )}
              {mineError && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm p-4 rounded-2xl flex items-start gap-3 shadow-sm"
                >
                  <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
                  <span>{mineError}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="space-y-4">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Transactions in Mempool</h3>
             <AnimatePresence mode="popLayout">
               {pending.map((tx, i) => (
                 <motion.div 
                   key={tx.vote_id || i}
                   layout
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-2 hover:border-slate-300 dark:hover:border-white/20 transition-colors shadow-sm"
                 >
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider bg-sky-100 dark:bg-sky-500/10 px-2 py-0.5 rounded-lg">Unconfirmed</span>
                     <span className="text-[10px] text-slate-500 font-mono">ID: {tx.vote_id?.slice(0,8) || "N/A"}</span>
                   </div>
                   <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold truncate">Candidate: {tx.candidate_id}</p>
                   <div className="flex items-center gap-2 text-[10px] text-slate-500">
                     <Clock className="w-3 h-3" />
                     {tx.timestamp}
                   </div>
                 </motion.div>
               ))}
               {pending.length === 0 && (
                 <p className="text-sm text-center text-slate-500 py-8 italic bg-white dark:bg-transparent rounded-2xl border border-slate-200 dark:border-transparent">Memory pool is currently empty</p>
               )}
             </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Block Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 px-2">
            <Layers className="w-5 h-5 text-sky-500 dark:text-sky-400" />
            Immutable Block Feed
          </h2>

          <div className="space-y-4 relative">
             <div className="absolute left-[34px] top-8 bottom-8 w-px bg-gradient-to-b from-slate-300 dark:from-white/10 via-slate-200 dark:via-white/5 to-transparent" />
             
             {chain.map((block, idx) => (
               <motion.div 
                 key={block.hash}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 className="relative pl-16 group"
               >
                 {/* Connection Node */}
                 <div className="absolute left-6 top-8 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-white/20 group-hover:border-sky-500 transition-colors flex items-center justify-center z-10 shadow-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white group-hover:bg-sky-500 transition-colors" />
                 </div>

                 <div className="relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm">
                   <div 
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                      onClick={() => setExpandedBlock(expandedBlock === block.index ? null : block.index)}
                   >
                     <div className="space-y-1">
                       <div className="flex items-center gap-3">
                         <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Block #{block.index}</span>
                         {block.index === 0 && <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-200 dark:border-sky-500/20 uppercase">Genesis</span>}
                       </div>
                       <div className="font-mono text-[11px] text-slate-500 flex flex-wrap gap-x-4">
                         <span className="flex items-center gap-1.5"><Hash className="w-3 h-3" /> {block.hash.slice(0, 16)}...</span>
                         <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500/80"><ShieldCheck className="w-3 h-3" /> Proof Satisfied</span>
                       </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{block.transactions.length} Transactions</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{new Date(block.timestamp).toLocaleDateString()}</p>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedBlock === block.index ? "rotate-180" : ""}`} />
                     </div>
                   </div>

                   <AnimatePresence>
                     {expandedBlock === block.index && (
                       <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                       >
                         <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1">
                                 <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Previous Hash</p>
                                 <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all bg-slate-50 dark:bg-black/20 p-2 rounded-xl border border-slate-200 dark:border-transparent">{block.previous_hash}</p>
                               </div>
                               <div className="space-y-1">
                                 <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Block Nonce</p>
                                 <p className="font-mono text-xl font-bold text-sky-600 dark:text-sky-400 bg-slate-50 dark:bg-black/20 px-3 py-1.5 rounded-xl w-max border border-slate-200 dark:border-transparent">{block.nonce}</p>
                               </div>
                            </div>
                            
                            <div className="space-y-3">
                               <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Block Content (Transactions)</p>
                               {block.transactions.length === 0 ? (
                                 <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-transparent p-3 rounded-xl border border-slate-200 dark:border-transparent">This block contains no application data.</p>
                               ) : (
                                 <div className="space-y-2">
                                   {block.transactions.map((tx, tIdx) => (
                                     <div key={tIdx} className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 space-y-3">
                                       <div className="flex items-start justify-between">
                                          <div className="space-y-1">
                                            <p className="text-xs text-slate-800 dark:text-white font-bold">{tx.candidate_id}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Voter Public Key Hash: {tx.voter_id.slice(0, 32)}...</p>
                                          </div>
                                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-300 dark:border-emerald-500/20 uppercase">Signature Verified</span>
                                       </div>
                                       <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                                          <p className="text-[9px] text-slate-500 dark:text-slate-600 font-mono truncate">SIG: {tx.signature}</p>
                                       </div>
                                     </div>
                                   ))}
                                 </div>
                               )}
                            </div>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainMonitor;
