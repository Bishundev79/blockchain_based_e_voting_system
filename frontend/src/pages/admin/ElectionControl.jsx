import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Plus, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Archive, 
  FileEdit,
  AlertCircle
} from "lucide-react";
import {
  listElections,
  createElection,
  updateElectionStatus,
} from "../../services/electionService";
import Modal from "../../components/ui/Modal";

const STATUS_ACTIONS = {
  draft: ["scheduled", "active"],
  scheduled: ["active", "draft"],
  active: ["completed"],
  completed: ["archived"],
  archived: [],
};

const ActivityIcon = ({ className }) => (
  <span className={`relative flex h-3 w-3 ${className}`}>
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
  </span>
);

const statusConfig = {
  draft: { color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-500/10", border: "border-slate-200 dark:border-slate-500/20", icon: FileEdit },
  scheduled: { color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-500/10", border: "border-sky-200 dark:border-sky-500/20", icon: Clock },
  active: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", icon: ActivityIcon },
  completed: { color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/20", icon: CheckCircle2 },
  archived: { color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-700/10", border: "border-slate-200 dark:border-slate-700/20", icon: Archive },
};

const ElectionControl = () => {
  const [elections, setElections] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reload = () => listElections().then((r) => setElections(r.data));
  useEffect(() => { reload(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await createElection({
        name: form.name,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });
      setShowCreate(false);
      setForm({ name: "", start_date: "", end_date: "" });
      reload();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create election.");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id, newStatus) => {
    await updateElectionStatus(id, { status: newStatus }).catch(() => {});
    reload();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            Election Control
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 dark:text-slate-400 mt-2 font-medium"
          >
            Orchestrate system-wide voting events
          </motion.p>
        </div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-sky-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Initialize Election
        </motion.button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {elections.map((el, i) => {
            const config = statusConfig[el.status];
            const Icon = config.icon;
            
            return (
              <motion.div 
                key={el.election_id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-slate-900/[0.03] border border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-300 dark:border-white/20 transition-all flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm dark:shadow-none"
              >
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className={`p-4 rounded-2xl ${config.bg} ${config.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{el.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg border ${config.border} ${config.bg} ${config.color}`}>
                        {el.status}
                      </span>
                      {el.start_date && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(el.start_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  {(STATUS_ACTIONS[el.status] || []).map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus(el.election_id, s)}
                      className="group/btn flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all active:scale-95 capitalize"
                    >
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      Set {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {elections.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-slate-50 dark:bg-white dark:bg-slate-900/[0.02] border border-dashed border-slate-200 dark:border-white/10 rounded-3xl"
          >
            <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No elections found in system storage</p>
          </motion.div>
        )}
      </div>

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Initialize New Election"
        footer={
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-bold">Cancel</button>
            <button 
              form="create-election-form" 
              type="submit" 
              disabled={saving}
              className="px-8 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-sky-600/20 active:scale-95"
            >
              {saving ? "Deploying..." : "Deploy Election"}
            </button>
          </div>
        }
      >
        <form id="create-election-form" onSubmit={handleCreate} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Election Title</label>
            <input 
              required 
              placeholder="e.g. National Presidential 2026"
              value={form.name} 
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Start Window</label>
              <input 
                type="datetime-local" 
                value={form.start_date} 
                onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all [color-scheme:light] dark:[color-scheme:dark]" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Close Window</label>
              <input 
                type="datetime-local" 
                value={form.end_date} 
                onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all [color-scheme:light] dark:[color-scheme:dark]" 
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ElectionControl;
