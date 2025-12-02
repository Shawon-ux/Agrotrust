// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <div className="brand-badge" />
          <Link to="/" style={{ fontWeight: 800 }}>AgroTrust</Link>
        </div>

        <div className="nav-links">
          {user && (
            <>
              <Link className="nav-link" to="/">Home</Link>
              <Link className="nav-link" to="/crops">Crops</Link>
              <Link className="nav-link" to="/education">Education</Link>
              <Link className="nav-link" to="/complaints">Complaints</Link>
            </>
          )}
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <span className="pill">{user.name} ({user.role})</span>
              <button className="btn btn-danger" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn" to="/login">Login</Link>
              <Link className="btn btn-primary" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
