// src/context/LanguageContext.js — English / বাংলা (NFR-15)
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const dict = {
  en: {
    dashboard: "Dashboard", crops: "Crops", prices: "Prices", education: "Education", complaints: "Complaints",
    search: "Search", orders: "My Orders", notifications: "Notifications", assistant: "AI Assistant", messages: "Messages",
    profile: "My Profile", logout: "Logout", login: "Login", signup: "Sign up", lightMode: "Light mode", darkMode: "Dark mode",
    farmPlan: "My Farm", getVerified: "Get Verified", language: "বাংলা",
    // landing
    pill: "🌱 Trusted farm-to-market platform",
    heroA: "Grow, trade and ", heroB: "trust", heroC: " every harvest.", welcome: "Welcome back, ",
    heroText: "AgroTrust connects farmers, buyers and government officials through verified profiles, transparent trading, smart learning tools and a tamper-proof ledger — all on one platform.",
    signupFree: "Sign up free", goDash: "Go to my dashboard", browse: "Browse crops",
    s1: "Verified users", s2: "Middlemen", s3: "AI assistant",
    rolesTitle: "Built for everyone in the food chain", rolesSub: "One platform that brings growers and buyers together.",
    featTitle: "Everything you need, in one place", featSub: "Tools that make agriculture simpler, fairer and more transparent.",
    howTitle: "How it works", howSub: "Three simple steps to start trading with trust.",
    ctaTitle: "Ready to join AgroTrust?", ctaTitle2: "Ready to get to work?", ctaSub: "Create your free account in under a minute, or log in to continue.", ctaSub2: "Jump back into your dashboard.",
    createAcc: "Create account", openDash: "Open dashboard",
    // generic
    send: "Send", save: "Save", cancel: "Cancel", loading: "Loading…",
    // messages
    msgTitle: "💬 Messages", msgEmpty: "No conversations yet. Start one below.", msgPlaceholder: "Type a message…", msgNew: "Start a new chat", msgSearch: "Search by name…", msgPick: "Select a conversation",
    // farm
    farmTitle: "🌾 My Farm & Crop Lifecycle", farmSub: "Record your land and follow every crop from sowing to harvest.",
    // receipt
    receipt: "Receipt", print: "Print", exportCsv: "Export CSV",
  },
  bn: {
    dashboard: "ড্যাশবোর্ড", crops: "ফসল", prices: "বাজারদর", education: "শিক্ষা", complaints: "অভিযোগ",
    search: "অনুসন্ধান", orders: "আমার অর্ডার", notifications: "বিজ্ঞপ্তি", assistant: "এআই সহকারী", messages: "বার্তা",
    profile: "আমার প্রোফাইল", logout: "লগআউট", login: "লগইন", signup: "নিবন্ধন", lightMode: "লাইট মোড", darkMode: "ডার্ক মোড",
    farmPlan: "আমার খামার", getVerified: "যাচাইকরণ", language: "English",
    pill: "🌱 বিশ্বস্ত কৃষক-থেকে-বাজার প্ল্যাটফর্ম",
    heroA: "প্রতিটি ফসলে ", heroB: "বিশ্বাস", heroC: " রেখে চাষ করুন ও বেচাকেনা করুন।", welcome: "স্বাগতম, ",
    heroText: "অ্যাগ্রোট্রাস্ট যাচাইকৃত প্রোফাইল, স্বচ্ছ লেনদেন, শেখার সরঞ্জাম ও নিরাপদ লেজারের মাধ্যমে কৃষক, ক্রেতা ও সরকারি কর্মকর্তাদের এক প্ল্যাটফর্মে যুক্ত করে।",
    signupFree: "বিনামূল্যে নিবন্ধন", goDash: "আমার ড্যাশবোর্ডে যান", browse: "ফসল দেখুন",
    s1: "যাচাইকৃত ব্যবহারকারী", s2: "মধ্যস্বত্বভোগী", s3: "এআই সহকারী",
    rolesTitle: "খাদ্য শৃঙ্খলের সবার জন্য", rolesSub: "চাষি ও ক্রেতাদের এক প্ল্যাটফর্মে নিয়ে আসে।",
    featTitle: "সবকিছু এক জায়গায়", featSub: "কৃষিকে সহজ, ন্যায্য ও স্বচ্ছ করার সরঞ্জাম।",
    howTitle: "কীভাবে কাজ করে", howSub: "বিশ্বাসের সাথে লেনদেন শুরু করতে তিনটি সহজ ধাপ।",
    ctaTitle: "অ্যাগ্রোট্রাস্টে যোগ দিতে প্রস্তুত?", ctaTitle2: "কাজ শুরু করতে প্রস্তুত?", ctaSub: "এক মিনিটেরও কম সময়ে বিনামূল্যে অ্যাকাউন্ট খুলুন, অথবা লগইন করুন।", ctaSub2: "আপনার ড্যাশবোর্ডে ফিরে যান।",
    createAcc: "অ্যাকাউন্ট খুলুন", openDash: "ড্যাশবোর্ড খুলুন",
    send: "পাঠান", save: "সংরক্ষণ", cancel: "বাতিল", loading: "লোড হচ্ছে…",
    msgTitle: "💬 বার্তা", msgEmpty: "এখনও কোনো কথোপকথন নেই। নিচে নতুন শুরু করুন।", msgPlaceholder: "বার্তা লিখুন…", msgNew: "নতুন চ্যাট শুরু করুন", msgSearch: "নাম দিয়ে খুঁজুন…", msgPick: "একটি কথোপকথন বেছে নিন",
    farmTitle: "🌾 আমার খামার ও ফসলের ধাপ", farmSub: "আপনার জমি লিখে রাখুন এবং বপন থেকে কর্তন পর্যন্ত প্রতিটি ফসল অনুসরণ করুন।",
    receipt: "রশিদ", print: "প্রিন্ট", exportCsv: "CSV এক্সপোর্ট",
  },
};

const LanguageContext = createContext({ lang: "en", t: (k) => k, toggleLang: () => {} });

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("lang") || "en"; } catch (e) { return "en"; }
  });
  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem("lang", lang); } catch (e) {}
  }, [lang]);
  const t = useCallback((k) => dict[lang]?.[k] ?? dict.en[k] ?? k, [lang]);
  const toggleLang = useCallback(() => setLang((l) => (l === "en" ? "bn" : "en")), []);
  return <LanguageContext.Provider value={{ lang, t, toggleLang }}>{children}</LanguageContext.Provider>;
};

export const useLang = () => useContext(LanguageContext);
