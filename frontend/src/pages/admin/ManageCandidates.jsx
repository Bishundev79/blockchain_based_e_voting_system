import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Trash2, 
  Edit3, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  UserPlus,
  Inbox,
  AlertCircle
} from "lucide-react";
import { listElections } from "../../services/electionService";
import { useCandidateAdmin } from "../../hooks/useCandidateAdmin";
import Modal from "../../components/ui/Modal";
import toast from "react-hot-toast";

const ManageCandidates = () => {
  const [elections, setElections] = useState([]);
  const [electionId, setElectionId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", party: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    candidates,
    error,
    add,
    update,
    remove,
    nextPage,
    prevPage,
    hasMore,
    offset,
  } = useCandidateAdmin(electionId);

  useEffect(() => { listElections().then((r) => setElections(r.data)); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", party: "", description: "" }); setFormError(""); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, party: c.party || "", description: c.description || "" }); setFormError(""); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError("");
    try {
      if (editing) {
        await update(editing.candidate_id, { name: form.name, party: form.party || null, description: form.description || null });
        toast.success("Candidate updated successfully!");
      } else {
        await add({ name: form.name, party: form.party || null, description: form.description || null });
        toast.success("Candidate added successfully!");
      }
      setShowModal(false);
    } catch (err) {
      const msg = err.response?.data?.detail || "Save failed.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this candidate? This action is irreversible.")) return;
    try {
        await remove(id);
        toast.success("Candidate deleted.");
    } catch (err) {
        toast.error(err.response?.data?.detail || "Failed to delete candidate.");
    }
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
            Manage Candidates
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 mt-2 font-medium"
          >
            Registry control for system nominees
          </motion.p>
        </div>
        
        {electionId && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={openAdd}
            className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-sky-600/20 active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            Add Candidate
          </motion.button>
        )}
      </header>

      <div className="relative group overflow-hidden p-6 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm">
         <div className="flex items-center gap-4">
           <div className="p-3 bg-sky-100 dark:bg-sky-500/10 rounded-xl text-sky-600 dark:text-sky-400">
             <Search className="w-5 h-5" />
           </div>
           <select 
              value={electionId} 
              onChange={(e) => setElectionId(e.target.value)}
              className="flex-1 bg-transparent text-slate-900 dark:text-white border-none focus:ring-0 focus:outline-none font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-600"
            >
              <option value="" className="bg-white dark:bg-slate-900">Search by Active Election...</option>
              {elections.map((el) => <option key={el.election_id} value={el.election_id} className="bg-white dark:bg-slate-900">{el.name}</option>)}
            </select>
         </div>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}
        
        <AnimatePresence mode="popLayout">
          {candidates.map((c, i) => (
            <motion.div 
              key={c.candidate_id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all flex items-start justify-between gap-6 shadow-sm"
            >
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-slate-100 dark:border-white/10">
                    <Users className="w-6 h-6 text-slate-400 group-hover:text-sky-500 transition-colors" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{c.name}</h3>
                    <div className="flex items-center gap-3 mt-1 underline-offset-4">
                      {c.party && <span className="text-xs font-bold text-sky-600 dark:text-sky-400/80 uppercase tracking-widest">{c.party}</span>}
                      {c.description && <span className="text-xs text-slate-500 line-clamp-1">{c.description}</span>}
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-2">
                 <button 
                    onClick={() => openEdit(c)}
                    className="p-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all active:scale-95"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(c.candidate_id)}
                    className="p-2.5 bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/10 rounded-xl text-red-600 dark:text-red-500/60 hover:text-red-700 dark:hover:text-red-400 transition-all active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {electionId && candidates.length === 0 && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/10 rounded-3xl"
          >
            <Inbox className="w-12 h-12 text-slate-400 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No candidates registered for this event</p>
          </motion.div>
        )}

        {/* Pagination */}
        {electionId && (candidates.length > 0 || offset > 0) && (
          <div className="flex justify-between items-center mt-10 p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm">
             <button 
                onClick={prevPage} 
                disabled={offset === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-700 dark:text-white transition-all shadow-sm dark:shadow-none"
             >
               <ChevronLeft className="w-4 h-4" />
               Previous
             </button>
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
               Index {offset + 1} — {offset + candidates.length}
             </span>
             <button 
                onClick={nextPage}
                disabled={!hasMore}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-700 dark:text-white transition-all shadow-sm dark:shadow-none"
             >
               Next
               <ChevronRight className="w-4 h-4" />
             </button>
          </div>
        )}
      </div>

      {/* Needs refactored dark/light Modal logic, assuming Modal renders cleanly or we can pass classes */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Update Nominations" : "Permanent Registration"}
        footer={
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={() => setShowModal(false)} className="px-6 py-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-bold transition-colors">Cancel</button>
            <button 
              form="candidate-form" 
              type="submit" 
              disabled={saving}
              className="px-8 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95"
            >
              {saving ? "Saving..." : "Commit Changes"}
            </button>
          </div>
        }>
        <form id="candidate-form" onSubmit={handleSave} className="space-y-6">
          {formError && (
            <div className="p-4 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {formError}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Candidate Legal Name</label>
            <input 
              required 
              value={form.name} 
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Political Affiliation</label>
            <input 
              value={form.party} 
              onChange={(e) => setForm((p) => ({ ...p, party: e.target.value }))}
              placeholder="e.g. Independent Space Party"
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Biography / Statement</label>
            <textarea 
              rows={3}
              value={form.description} 
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="A brief statement for the voters..."
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none" 
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCandidates;
