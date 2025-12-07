// src/App.js
import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

import FarmerDashboard from "./pages/Dashboard/FarmerDashboard";
import BuyerDashboard from "./pages/Dashboard/BuyerDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import GovDashboard from "./pages/Dashboard/GovDashboard";

import CropList from "./pages/Crops/CropList";
import AdminAddCrop from "./pages/Crops/AdminAddCrop";

import SubsidyApply from "./pages/Subsidies/SubsidyApply";
import SubsidyPage from "./pages/Subsidies/SubsidyPage";

import ComplaintForm from "./pages/Complaints/ComplaintForm";
import EducationList from "./pages/Education/EducationList";
import FeedbackForm from "./pages/Feedback/FeedbackForm";

import NotificationsPage from "./pages/Notifications/NotificationsPage";
import ChatbotPage from "./pages/Chatbot/ChatbotPage";
import LedgerPage from "./pages/Ledger/LedgerPage";
import SearchPage from "./pages/Search/SearchPage";

const Home = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Welcome to AgroTrust</h2>
        <p>Please login or register to continue.</p>
      </div>
    );
  }

  if (user.role === "FARMER") return <FarmerDashboard />;
  if (user.role === "BUYER") return <BuyerDashboard />;
  if (user.role === "ADMIN") return <AdminDashboard />;
  if (user.role === "GOV_OFFICIAL") return <GovDashboard />;
  return <div>Unknown role</div>;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />

        <Routes>
          {/* Home */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Crops */}
          <Route
            path="/crops"
            element={
              <ProtectedRoute>
                <CropList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crops/admin/add"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminAddCrop />
              </ProtectedRoute>
            }
          />

          {/* Subsidies */}
          <Route
            path="/subsidies"
            element={
              <ProtectedRoute>
                <SubsidyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subsidies/apply"
            element={
              <ProtectedRoute allowedRoles={["FARMER"]}>
                <SubsidyApply />
              </ProtectedRoute>
            }
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Chatbot */}
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <ChatbotPage />
              </ProtectedRoute>
            }
          />

          {/* Ledger - Admin/Gov only */}
          <Route
            path="/ledger"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "GOV_OFFICIAL"]}>
                <LedgerPage />
              </ProtectedRoute>
            }
          />

          {/* Complaints */}
          <Route
            path="/complaints"
            element={
              <ProtectedRoute>
                <ComplaintForm />
              </ProtectedRoute>
            }
          />

          {/* Education */}
          <Route
            path="/education"
            element={
              <ProtectedRoute>
                <EducationList />
              </ProtectedRoute>
            }
          />

          {/* Feedback - Buyer only */}
          <Route
            path="/feedback"
            element={
              <ProtectedRoute allowedRoles={["BUYER"]}>
                <FeedbackForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<div style={{ padding: 20 }}>404 - Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
