// src/components/DashBanner.js — photo banner + photo shortcut tiles for dashboards
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const img = (n) => `${process.env.PUBLIC_URL}/images/${n}.jpg`;

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const PRESETS = {
  FARMER: {
    photo: "farmer", tag: "Farmer", text: "Manage your crops, orders and subsidies in one place.",
    tiles: [
      { to: "/crops", photo: "harvest", label: "My Crops", text: "List & sell your harvest" },
      { to: "/farm", photo: "farmer", label: "My Farm", text: "Track sowing to harvest" },
      { to: "/market", photo: "market", label: "Market Prices", text: "Check today's rates" },
    ],
  },
  BUYER: {
    photo: "market", tag: "Buyer", text: "Discover fresh crops from verified farmers and order directly.",
    tiles: [
      { to: "/crops", photo: "harvest", label: "Browse Crops", text: "Fresh from the farm" },
      { to: "/orders", photo: "market", label: "My Orders", text: "Track your purchases" },
      { to: "/market", photo: "hero", label: "Market Prices", text: "Compare today's rates" },
    ],
  },
  ADMIN: {
    photo: "hero", tag: "Admin", text: "Oversee users, crops and platform activity.",
    tiles: [
      { to: "/verification", photo: "farmer", label: "Verification", text: "Review user requests" },
      { to: "/analytics", photo: "market", label: "Analytics", text: "Platform insights" },
      { to: "/ledger", photo: "harvest", label: "Ledger", text: "Transparent records" },
    ],
  },
  GOV_OFFICIAL: {
    photo: "hero", tag: "Government Official", text: "Monitor subsidies, compliance and fund usage.",
    tiles: [
      { to: "/subsidies", photo: "farmer", label: "Subsidies", text: "Manage programs" },
      { to: "/ledger", photo: "harvest", label: "Agro Ledger", text: "Audit transactions" },
      { to: "/analytics", photo: "market", label: "Analytics", text: "Data-driven insight" },
    ],
  },
};

const DashBanner = () => {
  const { user } = useAuth();
  const p = PRESETS[user?.role];
  if (!p) return null;
  return (
    <>
      <section className="db-banner" style={{ backgroundImage: `url(${img(p.photo)})` }}>
        <div className="db-shade" />
        <div className="db-text">
          <span className="db-tag">{p.tag}</span>
          <h1>{greeting()}, {user.name?.split(" ")[0]} 👋</h1>
          <p>{p.text}</p>
        </div>
      </section>
      <div className="db-tiles">
        {p.tiles.map((t) => (
          <Link key={t.label} to={t.to} className="db-tile" style={{ backgroundImage: `url(${img(t.photo)})` }}>
            <div className="db-tile-shade" />
            <div className="db-tile-text"><b>{t.label}</b><span>{t.text}</span></div>
            <span className="db-arrow">→</span>
          </Link>
        ))}
      </div>
    </>
  );
};

export default DashBanner;
