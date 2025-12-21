import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) setEmail(emailParam);
    }, [searchParams]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setErr("");
        setMsg("");
        setLoading(true);

        try {
            if (!email || !otp) {
                setErr("Email and OTP are required.");
                setLoading(false);
                return;
            }

            await api.post("/auth/verify-email", { email, otp });
            setMsg("Email verified successfully! Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (e) {
            console.error(e);
            setErr(e.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
            <div className="card" style={{ maxWidth: 400, width: "100%", padding: 30 }}>
                <h2 style={{ textAlign: "center", marginBottom: 20 }}>Verify Email</h2>
                <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: 20 }}>
                    Enter the 6-digit code sent to your email.
                </p>

                {msg && <div className="success" style={{ marginBottom: 15 }}>{msg}</div>}
                {err && <div className="error" style={{ marginBottom: 15 }}>{err}</div>}

                <form onSubmit={handleVerify} className="form">
                    <input
                        className="input"
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="input"
                        type="text"
                        placeholder="6-Digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        required
                        style={{ letterSpacing: 4, textAlign: "center", fontSize: "1.2rem" }}
                    />
                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
                        {loading ? "Verifying..." : "Verify Account"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmail;
