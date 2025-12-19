// import React, { useEffect, useState } from "react";
// import api from "../../api";

// export default function LedgerPage() {
//   const [items, setItems] = useState([]);
//   const [err, setErr] = useState("");

//   const load = async () => {
//     try {
//       setErr("");
//       const res = await api.get("/ledger");
//       setItems(res.data || []);
//     } catch (e) {
//       setErr(
//         e.response?.data?.message ||
//           "Failed to load ledger (Admin/Gov only)"
//       );
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   return (
//     <div className="container">
//       <div className="hero">
//         <h1 className="h1">Blockchain Ledger</h1>
//         <p className="subhead">
//           Tamper-evident ledger with chained hashes
//         </p>
//       </div>

//       {err && <div className="error">{err}</div>}

//       {items.map((x) => (
//         <div className="card" key={x._id} style={{ marginBottom: 12 }}>
//           <div style={{ marginBottom: 6 }}>
//             <b>Block #{x.index}</b> • {x.action}
//           </div>

//           <div className="mini">
//             Reference: {x.refType} {x.refId || "-"}
//           </div>

//           <div className="mini">
//             Actor: {x.actor?.name || "System"} ({x.actor?.role})
//           </div>

//           <div
//             style={{
//               marginTop: 8,
//               fontFamily: "monospace",
//               fontSize: 12,
//               color: "var(--muted)",
//             }}
//           >
//             <div>
//               <b>Hash:</b> {x.hash}
//             </div>
//             <div>
//               <b>Previous:</b> {x.previousHash}
//             </div>
//           </div>

//           <div className="mini" style={{ marginTop: 6 }}>
//             Time: {new Date(x.createdAt).toLocaleString()}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";

export default function LedgerPage() {
  const [items, setItems] = useState([]);

  // 🔒 DEMO LEDGER DATA (HARDCODED)
  useEffect(() => {
    const demoData = [
      {
        _id: "1",
        action: "SUBSIDY_APPROVED",
        refType: "SUBSIDY",
        refId: "SUB-1023",
        dataHash: "a9f5c1e2b7d93a81f0c4e9a6a12f3b9c7e2d4a6f",
        createdAt: "2025-08-10",
      },
      {
        _id: "2",
        action: "CROP_VERIFIED",
        refType: "CROP",
        refId: "CROP-556",
        dataHash: "c4e2f9a8b7d1e6a03f5c9a7e2b8d4f6a1c3e9d",
        createdAt: "2025-08-11",
      },
      {
        _id: "3",
        action: "COMPLAINT_RESOLVED",
        refType: "COMPLAINT",
        refId: "COMP-88",
        dataHash: "f1a7d9e3c8b2a5e6d4f9c0a8b7e1d3f5c6a2",
        createdAt: "2025-08-12",
      },
    ];

    setItems(demoData);
  }, []);

  return (
    <div className="container">
      <div className="hero">
        <h1 className="h1">Blockchain Ledger</h1>
        <p className="subhead">
          Tamper-evident ledger 
        </p>
      </div>

      {items.map((x) => (
        <div className="card" key={x._id} style={{ marginBottom: 12 }}>
          <div>
            <b>{x.action}</b> • {x.refType}
          </div>

          <div className="mini">Reference ID: {x.refId}</div>
          <div className="mini">Date: {x.createdAt}</div>

          <div
            style={{
              marginTop: 6,
              fontFamily: "monospace",
              fontSize: 12,
              color: "var(--muted)",
              wordBreak: "break-all",
            }}
          >
            Hash: {x.dataHash}
          </div>
        </div>
      ))}
    </div>
  );
}
