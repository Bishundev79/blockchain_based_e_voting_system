import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../../services/voterService";
import { User, Mail, Calendar, Shield, Activity, Key } from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
  const [form, setForm] = useState({ name: "", email: "" });
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Retrieve wallet address if it exists
  const walletKey = localStorage.getItem("evoting_wallet_pub");

  useEffect(() => {
    getMyProfile()
      .then((r) => {
        setForm({ name: r.data.name, email: r.data.email });
        setOriginal(r.data);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
           // User's account no longer exists (e.g. database was reset)
           localStorage.removeItem("token");
           localStorage.removeItem("refresh_token");
           localStorage.removeItem("evoting_wallet_pub");
           localStorage.removeItem("evoting_wallet_priv");
           window.location.href = "/login";
        } else {
           setError("Could not load profile.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(""); setError("");
    try {
      await updateMyProfile({ name: form.name, email: form.email });
      setMsg("Profile updated successfully!");
      setOriginal(prev => ({ ...prev, name: form.name, email: form.email }));
    } catch (err) {
      setError(err.response?.data?.detail || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-sky-500/30 border-t-sky-500 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">Identity & Wallet</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your demographic details and verify your cryptographic wallet connection.</p>
      </motion.div>

      {msg && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-3 rounded-xl flex items-center font-medium shadow-sm">
          {msg}
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl flex items-center font-medium shadow-sm">
          {error}
        </motion.div>
      )}

      {original && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[1.5rem] p-8 shadow-sm space-y-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-sky-500" /> Personal Information
              </h2>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || (form.name === original.name && form.email === original.email)}
                className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-500 py-3.5 rounded-xl font-bold transition-colors mt-4 shadow-lg shadow-slate-200/50 dark:shadow-none"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 rounded-[1.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              
              <h2 className="text-xl font-bold flex items-center gap-2 mb-8 relative z-10">
                <Shield className="w-5 h-5 text-sky-400" /> Election Status
              </h2>

              <div className="space-y-5 relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-xl"><Activity className="w-4 h-4 text-sky-300" /></div>
                    <span className="text-sm font-medium text-slate-300">System Role</span>
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full text-sky-300">{original.role}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-xl"><Calendar className="w-4 h-4 text-emerald-300" /></div>
                    <span className="text-sm font-medium text-slate-300">Registration Date</span>
                  </div>
                  <span className="text-sm font-bold">{new Date(original.registration_date).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-xl"><Shield className="w-4 h-4 text-indigo-300" /></div>
                    <span className="text-sm font-medium text-slate-300">Voting Network</span>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${original.has_voted ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'}`}>
                    {original.has_voted ? "Vote Mined on Chain" : "No Votes Cast"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[1.5rem] p-8 shadow-sm">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
                  <Key className="w-5 h-5 text-indigo-500" /> Cryptographic Identity
                </h2>
                
                {walletKey ? (
                   <div className="space-y-3">
                     <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse block" />
                        Wallet Connected
                     </p>
                     <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 overflow-x-auto">
                       <code className="text-xs text-slate-600 dark:text-slate-400 break-all">{walletKey}</code>
                     </div>
                     <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed font-medium">This local Elliptic Curve (secp256k1) public key represents your decentralized governance identity.</p>
                   </div>
                ) : (
                   <div className="space-y-3">
                     <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 block" />
                        No Local Wallet
                     </p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">A decentralized wallet will be automatically generated and cryptographically bound to this device when you invoke your first smart contract (cast a vote).</p>
                   </div>
                )}
            </div>

          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
