// src/components/OfflineBanner.js
import React, { useEffect, useState } from "react";

const OfflineBanner = () => {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online ? null : <div className="offline-banner">📡 You are offline — showing saved pages</div>;
};

export default OfflineBanner;
