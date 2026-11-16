// src/components/Navbar.js
import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLang } from "../context/LanguageContext";
import api from "../api";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";

import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import GrassOutlinedIcon from "@mui/icons-material/GrassOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AgricultureOutlinedIcon from "@mui/icons-material/AgricultureOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

const IconLink = ({ to, title, children }) => (
  <NavLink
    to={to}
    title={title}
    aria-label={title}
    className={({ isActive }) => `icon-btn ${isActive ? "active" : ""}`}
  >
    {children}
  </NavLink>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLang } = useLang();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return undefined;
    const load = () => api.get("/messages/unread-count").then((r) => setUnread(r.data.count)).catch(() => {});
    load();
    const i = setInterval(load, 20000);
    return () => clearInterval(i);
  }, [user]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const closeMenu = () => setAnchorEl(null);

  const canOrder = user && ["BUYER", "FARMER", "ADMIN"].includes(user.role);
  const isStaff = user && ["ADMIN", "GOV_OFFICIAL"].includes(user.role);

  // Extra links inside the profile menu (role based)
  const menuItems = useMemo(() => {
    if (!user) return [];
    const i = [];
    if (!isStaff) i.push({ to: "/verification/me", label: t("getVerified"), icon: <VerifiedUserOutlinedIcon fontSize="small" /> });
    if (user.role === "FARMER") {
      i.push({ to: "/farm", label: t("farmPlan"), icon: <AgricultureOutlinedIcon fontSize="small" /> });
      i.push({ to: "/subsidies", label: "Subsidies", icon: <PaymentsOutlinedIcon fontSize="small" /> });
      i.push({ to: "/crops/request", label: "Request Crop", icon: <AddCircleOutlineOutlinedIcon fontSize="small" /> });
    }
    if (user.role === "ADMIN") {
      i.push({ to: "/admin", label: "Admin Panel", icon: <AdminPanelSettingsOutlinedIcon fontSize="small" /> });
      i.push({ to: "/crops/admin/add", label: "Add Crop", icon: <AddCircleOutlineOutlinedIcon fontSize="small" /> });
    }
    if (isStaff) {
      i.push({ to: "/verification", label: "Verification Panel", icon: <VerifiedUserOutlinedIcon fontSize="small" /> });
      i.push({ to: "/ledger", label: "Blockchain Ledger", icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> });
      i.push({ to: "/analytics", label: "Analytics", icon: <InsightsOutlinedIcon fontSize="small" /> });
    }
    if (user.role === "GOV_OFFICIAL") {
      i.push({ to: "/subsidies", label: "Subsidy Programs", icon: <PaymentsOutlinedIcon fontSize="small" /> });
    }
    return i;
  }, [user, isStaff, t]);

  const initial = (user?.name || "?").trim().charAt(0).toUpperCase();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="nav-left">
          {/* Brand: click to go to the home overview page */}
          <Link to="/" className="brand-link" title="AgroTrust Home">
            <span className="brand-badge" />
            <span className="brand-name">AgroTrust</span>
          </Link>

          {user && (
            <nav className="nav-links">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/dashboard">
                <SpaceDashboardOutlinedIcon fontSize="small" /> <span>{t("dashboard")}</span>
              </NavLink>
              <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/crops">
                <GrassOutlinedIcon fontSize="small" /> <span>{t("crops")}</span>
              </NavLink>
              <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/market">
                <TrendingUpIcon fontSize="small" /> <span>{t("prices")}</span>
              </NavLink>
              <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/education">
                <SchoolOutlinedIcon fontSize="small" /> <span>{t("education")}</span>
              </NavLink>
              <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/complaints">
                <ReportGmailerrorredOutlinedIcon fontSize="small" /> <span>{t("complaints")}</span>
              </NavLink>
            </nav>
          )}
        </div>

        <div className="nav-right">
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? t("lightMode") : t("darkMode")}
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
          </button>

          <button className="lang-btn" onClick={toggleLang} aria-label="Change language">{t("language")}</button>

          {user ? (
            <>
              <IconLink to="/search" title={t("search")}><SearchIcon fontSize="small" /></IconLink>
              {canOrder && <IconLink to="/orders" title={t("orders")}><ShoppingCartOutlinedIcon fontSize="small" /></IconLink>}
              <IconLink to="/messages" title={t("messages")}>
                <ChatBubbleOutlineIcon fontSize="small" />
                {unread > 0 && <span className="icon-badge">{unread}</span>}
              </IconLink>
              <IconLink to="/notifications" title={t("notifications")}><NotificationsNoneIcon fontSize="small" /></IconLink>
              <IconLink to="/chatbot" title={t("assistant")}><SmartToyOutlinedIcon fontSize="small" /></IconLink>

              <button
                className="avatar-btn"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                title="My Profile"
                aria-label="Open profile menu"
              >
                {initial}
                {user.verificationStatus === "VERIFIED" && <span className="avatar-check">✓</span>}
              </button>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={closeMenu}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: "16px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--text)",
                    boxShadow: "var(--shadow)",
                    minWidth: 230,
                  },
                }}
              >
                <MenuItem onClick={closeMenu} component={NavLink} to="/profile" sx={{ gap: 1.2, fontWeight: 700 }}>
                  <PersonOutlineIcon fontSize="small" /> {t("profile")}
                </MenuItem>
                {menuItems.length > 0 && <Divider />}
                {menuItems.map((it) => (
                  <MenuItem key={it.to + it.label} onClick={closeMenu} component={NavLink} to={it.to} sx={{ gap: 1.2, fontWeight: 600 }}>
                    {it.icon} {it.label}
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem onClick={() => { closeMenu(); logout(); }} sx={{ gap: 1.2, fontWeight: 600, color: "#ef4444" }}>
                  <LogoutIcon fontSize="small" /> {t("logout")}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Link className="btn" to="/login">{t("login")}</Link>
              <Link className="btn btn-primary" to="/register">{t("signup")}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
