// src/pages/Landing/LandingPage.js
import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import "./Landing.css";

const img = (n) => `${process.env.PUBLIC_URL}/images/${n}.jpg`;

const features = [
  ["🌾", "Fresh crop marketplace", "Browse and order produce directly from farmers — no middlemen.", "/crops"],
  ["🛡️", "Verified identities", "Farmers and buyers are verified, so every trade is accountable.", "/verification/me"],
  ["⛓️", "Blockchain ledger", "Every transaction is recorded in a transparent, tamper-proof ledger.", "/dashboard"],
  ["📈", "Market price tracker", "Check live commodity prices across markets before you sell or buy.", "/market"],
  ["🤖", "AI farming assistant", "Ask the chatbot for crop, weather and market advice instantly.", "/chatbot"],
  ["🎓", "Learning platform", "Courses and guides to help farmers grow smarter.", "/education"],
  ["💰", "Government subsidies", "Discover and apply for subsidy programs in one place.", "/subsidies"],
];

const steps = [
  ["1", "Create your account", "Sign up as a farmer, buyer or government official."],
  ["2", "Get verified", "Submit your details and earn a trusted verified badge."],
  ["3", "Trade with confidence", "List crops, place orders and track everything on the ledger."],
];

const LandingPage = () => {
  const { user } = useAuth() || {};
  const { t } = useLang();
  const primary = user ? { to: "/dashboard", label: t("goDash") } : { to: "/register", label: t("signupFree") };
  const secondary = user ? { to: "/crops", label: t("browse") } : { to: "/login", label: t("login") };

  return (
    <div className="lp">
      {/* HERO — full width, two columns */}
      <section className="lp-hero" style={{ backgroundImage: `url(${img("hero")})` }}>
        <div className="lp-hero-overlay" />
        <div className="lp-wrap lp-hero-grid">
          <div className="lp-hero-text">
            <span className="lp-pill">{t("pill")}</span>
            <h1>
              {user ? <>{t("welcome")}<span>{user.name?.split(" ")[0]}</span>.</> : <>{t("heroA")}<span>{t("heroB")}</span>{t("heroC")}</>}
            </h1>
            <p>{t("heroText")}</p>
            <div className="lp-cta">
              <Link to={primary.to} className="lp-btn lp-btn-primary">{primary.label}</Link>
              <Link to={secondary.to} className="lp-btn lp-btn-glass">{secondary.label}</Link>
            </div>
            <div className="lp-stats">
              <div><b>100%</b><span>{t("s1")}</span></div>
              <div><b>0</b><span>{t("s2")}</span></div>
              <div><b>24/7</b><span>{t("s3")}</span></div>
            </div>
          </div>

          <div className="lp-collage">
            <img className="c1" src={img("farmer")} alt="Farmers working in a rice field" />
            <img className="c2" src={img("market")} alt="Fresh produce market" />
            <img className="c3" src={img("harvest")} alt="Fresh harvested vegetables" />
            <div className="lp-float f1">✅ <b>Verified</b><span>Farmer badge</span></div>
            <div className="lp-float f2">⛓️ <b>On-chain</b><span>Every trade logged</span></div>
          </div>
        </div>
      </section>

      {/* TRUST BAND */}
      <section className="lp-band">
        <div className="lp-wrap lp-band-grid">
          {[["🌾", "Farm-fresh crops"], ["🤝", "Direct farmer-to-buyer"], ["🔐", "Secure & verified"], ["📈", "Fair market prices"], ["🎓", "Free learning"]].map(([i, t]) => (
            <div key={t}><span>{i}</span>{t}</div>
          ))}
        </div>
      </section>

      <div className="lp-wrap lp-body">
        {/* ROLES */}
        <section className="lp-section">
          <h2 className="lp-h2">{t("rolesTitle")}</h2>
          <p className="lp-sub">{t("rolesSub")}</p>
          <div className="lp-roles">
            {[
              { i: "farmer", tag: "For Farmers", t: "Sell directly. Earn fairly.", d: "List your harvest, receive orders, apply for subsidies and learn new techniques.", c: "Join as a farmer" },
              { i: "market", tag: "For Buyers", t: "Fresh produce, trusted source.", d: "Search verified farmers, compare crops and order with full transparency.", c: "Join as a buyer" },
              { i: "harvest", tag: "For Officials", t: "Oversee with clarity.", d: "Verify users, run subsidy programs and monitor activity with analytics and the ledger.", c: "Join as an official" },
            ].map((r) => (
              <div className="lp-role" key={r.i}>
                <img src={img(r.i)} alt={r.t} loading="lazy" />
                <div className="lp-role-shade" />
                <div className="lp-role-text">
                  <span className="lp-tag">{r.tag}</span>
                  <h3>{r.t}</h3>
                  <p>{r.d}</p>
                  {!user && <Link to="/register" className="lp-btn lp-btn-primary">{r.c} →</Link>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="lp-section">
          <h2 className="lp-h2">{t("featTitle")}</h2>
          <p className="lp-sub">{t("featSub")}</p>
          <div className="lp-features">
            {features.map(([ico, t, d, to]) => (
              <Link to={user ? to : "/register"} className="card lp-feature" key={t}>
                <div className="lp-ico">{ico}</div>
                <h3>{t}</h3>
                <p>{d}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="lp-section lp-how">
          <div className="lp-how-img" style={{ backgroundImage: `url(${img("hero")})` }} />
          <div>
            <h2 className="lp-h2" style={{ textAlign: "left" }}>{t("howTitle")}</h2>
            <p className="lp-sub" style={{ textAlign: "left", marginBottom: 8 }}>{t("howSub")}</p>
            <div className="lp-steps">
              {steps.map(([n, t, d]) => (
                <div className="lp-step" key={n}>
                  <div className="lp-num">{n}</div>
                  <div><h3>{t}</h3><p>{d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="lp-final">
          <h2>{user ? t("ctaTitle2") : t("ctaTitle")}</h2>
          <p>{user ? t("ctaSub2") : t("ctaSub")}</p>
          <div className="lp-cta">
            <Link to={primary.to} className="lp-btn lp-btn-white">{user ? t("openDash") : t("createAcc")}</Link>
            {!user && <Link to="/login" className="lp-btn lp-btn-glass">{t("login")}</Link>}
          </div>
        </section>

        <footer className="lp-footer">© {new Date().getFullYear()} AgroTrust — Growing trust, one harvest at a time.</footer>
      </div>
    </div>
  );
};

export default LandingPage;
