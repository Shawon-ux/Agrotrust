import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await login(email, password);
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Login failed";
      setError(msg);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 460, margin: "30px auto" }}>
        <h1 className="h1" style={{ fontSize: 28 }}>Welcome back</h1>
        <p className="subhead">Login to continue to AgroTrust.</p>

        {error && <div className="error">{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          <div>
            <label className="mini">Email</label>
            <input className="input" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="mini">Password</label>
            <input className="input" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button className="btn btn-primary" type="submit">Login</button>
        </form>

        <p className="mini" style={{ marginTop: 12 }}>
          Don&apos;t have an account? <Link to="/register" style={{ color: "var(--primary)" }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
