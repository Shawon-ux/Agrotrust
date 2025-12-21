import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("FARMER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const data = await register(name, email, password, role, phone);
      // Redirect to verify page with email
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Registration failed";
      setError(msg);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "30px auto" }}>
        <h1 className="h1" style={{ fontSize: 28 }}>Create account</h1>
        <p className="subhead">Join AgroTrust and get started.</p>

        {error && <div className="error">{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          <div>
            <label className="mini">Name</label>
            <input className="input" value={name}
              onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="mini">Phone (optional)</label>
            <input className="input" value={phone}
              onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div>
            <label className="mini">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="FARMER">Farmer</option>
              <option value="BUYER">Buyer</option>
              <option value="ADMIN">Admin</option>
              <option value="GOV_OFFICIAL">Government Official</option>
            </select>
          </div>

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

          <button className="btn btn-primary" type="submit">Register</button>
        </form>

        <p className="mini" style={{ marginTop: 12 }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)" }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
