import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Shield, 
  User, 
  CheckCircle2, 
  XCircle, 
  UserCog,
  Search,
  Users2
} from "lucide-react";
import { listVoters, updateVoter } from "../../services/voterService";

const ManageVoters = () => {
  const [voters, setVoters] = useState([]);
  const [filter, setFilter] = useState({ role: "", has_voted: "" });
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    const params = {};
    if (filter.role) params.role = filter.role;
    if (filter.has_voted !== "") params.has_voted = filter.has_voted === "true";
    listVoters(params).then((r) => setVoters(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [filter]); // eslint-disable-line

  const toggleRole = async (voter) => {
    const newRole = voter.role === "admin" ? "voter" : "admin";
    if (!window.confirm(`Escalate privilege to ${newRole}? This granting session-wide admin access.`)) return;
    await updateVoter(voter.voter_id, { role: newRole }).catch(() => {});
    reload();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            Voter Registry
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 mt-2 font-medium"
          >
            Access control & session status for all registered nodes
          </motion.p>
        </div>
      </header>

      <div className="flex flex-wrap gap-4">
        {[
          { label: "Role Filter", key: "role", options: [{ v: "", l: "All Access Levels" }, { v: "voter", l: "Standard Voter" }, { v: "admin", l: "Root Administrator" }] },
          { label: "Voting Status", key: "has_voted", options: [{ v: "", l: "All Voting Status" }, { v: "true", l: "Vote Recorded" }, { v: "false", l: "No Data" }] }
        ].map((f, i) => (
          <motion.div 
            key={f.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative flex-1 min-w-[200px] overflow-hidden rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm"
          >
            <select 
              value={filter[f.key]} 
              onChange={(e) => setFilter(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full bg-transparent text-slate-900 dark:text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 appearance-none font-medium"
            >
              {f.options.map(opt => <option key={opt.v} value={opt.v} className="bg-white dark:bg-slate-900">{opt.l}</option>)}
            </select>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group overflow-hidden shadow-sm rounded-3xl"
      >
        <div className="absolute inset-0 bg-white dark:bg-white/[0.03] rounded-3xl" />
        <div className="absolute inset-0 border border-slate-200 dark:border-white/10 rounded-3xl" />
        
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5">
                <th className="px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Identify</th>
                <th className="px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-[10px] hidden sm:table-cell">Authorization</th>
                <th className="px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Ledger Status</th>
                <th className="px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              <AnimatePresence mode="popLayout">
                {voters.map((v, i) => (
                  <motion.tr 
                    key={v.voter_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group/row hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${v.role === 'admin' ? 'bg-sky-100 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'}`}>
                          {v.role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white tracking-tight">{v.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{v.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                        v.role === "admin" ? "bg-sky-100 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400" : "bg-slate-100 dark:bg-slate-700/10 border-slate-200 dark:border-slate-700/20 text-slate-500"
                      }`}>
                        {v.role} Access
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {v.has_voted ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold w-[120px]">
                            <CheckCircle2 className="w-4 h-4" />
                            VOTE DEPOSITED
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-600 text-xs font-bold w-[120px]">
                            <XCircle className="w-4 h-4" />
                            PENDING
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right w-[80px]">
                      <button 
                         onClick={() => toggleRole(v)}
                         className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-sky-100 dark:hover:bg-sky-500/20 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 transition-all active:scale-95 group/cog inline-flex"
                         title="Toggle Permissions"
                      >
                        <UserCog className="w-4 h-4 group-hover/cog:rotate-12 transition-transform" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {voters.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Users2 className="w-12 h-12 text-slate-400 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium tracking-tight">System registry returned no matching records</p>
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

export default ManageVoters;