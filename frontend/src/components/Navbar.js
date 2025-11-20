// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{ padding: "10px", background: "#0f766e", color: "#fff" }}>
      <span style={{ fontWeight: "bold", marginRight: "20px" }}>
        AgroTrust
      </span>

      {user && (
        <>
          <Link to="/" style={{ color: "#fff", marginRight: "10px" }}>
            Home
          </Link>
          <Link to="/crops" style={{ color: "#fff", marginRight: "10px" }}>
            Crops
          </Link>
          <Link to="/education" style={{ color: "#fff", marginRight: "10px" }}>
            Education
          </Link>
          <Link
            to="/complaints"
            style={{ color: "#fff", marginRight: "10px" }}
          >
            Complaints
          </Link>
        </>
      )}

      <span style={{ float: "right" }}>
        {user ? (
          <>
            <span style={{ marginRight: "10px" }}>
              {user.name} ({user.role})
            </span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "#fff", marginRight: "10px" }}>
              Login
            </Link>
            <Link to="/register" style={{ color: "#fff" }}>
              Register
            </Link>
          </>
        )}
      </span>
    </nav>
  );
};

export default Navbar;
