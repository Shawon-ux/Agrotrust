// src/App.js
import React from "react";
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
import SubsidyApply from "./pages/Subsidies/SubsidyApply";
import ComplaintForm from "./pages/Complaints/ComplaintForm";
import EducationList from "./pages/Education/EducationList";
import FeedbackForm from "./pages/Feedback/FeedbackForm";

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

  // Redirect-ish behaviour based on role
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
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />

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

          {/* Subsidies - Farmer only */}
          <Route
            path="/subsidies/apply"
            element={
              <ProtectedRoute allowedRoles={["FARMER"]}>
                <SubsidyApply />
              </ProtectedRoute>
            }
          />

          {/* Complaints - any logged in */}
          <Route
            path="/complaints"
            element={
              <ProtectedRoute>
                <ComplaintForm />
              </ProtectedRoute>
            }
          />

          {/* Education - any logged in */}
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
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
