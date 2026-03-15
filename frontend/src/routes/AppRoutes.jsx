import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/layout/AdminLayout";
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import HowVotingWorks from "../pages/public/HowVotingWorks";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VoterDashboard from "../pages/voter/Dashboard";
import Vote from "../pages/voter/Vote";
import VoterResults from "../pages/voter/Results";
import Candidates from "../pages/voter/Candidates";
import Profile from "../pages/voter/Profile";
import BlockchainExplorer from "../pages/voter/BlockchainExplorer";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ElectionControl from "../pages/admin/ElectionControl";
import ManageCandidates from "../pages/admin/ManageCandidates";
import ManageVoters from "../pages/admin/ManageVoters";
import AdminResults from "../pages/admin/Results";
import Votes from "../pages/admin/Votes";
import BlockchainMonitor from "../pages/admin/BlockchainMonitor";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Public and Voter Routes under MainLayout + Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowVotingWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Voter Restricted Routes */}
        <Route path="/voter" element={<ProtectedRoute allowedRoles={["voter"]}><Outlet /></ProtectedRoute>}>
          <Route path="dashboard" element={<VoterDashboard />} />
          <Route path="vote" element={<Vote />} />
          <Route path="results" element={<VoterResults />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="profile" element={<Profile />} />
          <Route path="blockchain" element={<BlockchainExplorer />} />
        </Route>
      </Route>

      {/* Admin Protected Routes under AdminLayout + Sidebar */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="elections" element={<ElectionControl />} />
        <Route path="candidates" element={<ManageCandidates />} />
        <Route path="voters" element={<ManageVoters />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="votes" element={<Votes />} />
        <Route path="blockchain" element={<BlockchainMonitor />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
