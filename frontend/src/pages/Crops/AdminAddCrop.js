import React, { useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";

const AdminAddCrop = () => {
  const nav = useNavigate();
  const [form, setForm] = useState({
    cropName: "",
    variety: "",
    location: "",
    pricePerUnit: "",
    quantityAvailable: "",
    unit: "kg",
  });
  const [image, setImage] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      setErr(""); setOk(""); setLoading(true);

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);

      await api.post("/crops/admin", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOk("Crop added successfully!");
      setTimeout(() => nav("/crops"), 600);
    } catch (e2) {
      setErr(e2.response?.data?.message || e2.message || "Failed to add crop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Add New Crop (Admin)</h2>

        {err && <div className="error">{err}</div>}
        {ok && <div className="success">{ok}</div>}

        <form onSubmit={submit} className="form" style={{ display: "grid", gap: 12 }}>
          <div>
            <label className="mini">Crop Name</label>
            <input className="input" value={form.cropName} onChange={(e) => onChange("cropName", e.target.value)} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="mini">Variety</label>
              <input className="input" value={form.variety} onChange={(e) => onChange("variety", e.target.value)} />
            </div>

            <div>
              <label className="mini">Location</label>
              <input className="input" value={form.location} onChange={(e) => onChange("location", e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label className="mini">Price per unit</label>
              <input className="input" type="number" min="1" value={form.pricePerUnit} onChange={(e) => onChange("pricePerUnit", e.target.value)} required />
            </div>

            <div>
              <label className="mini">Quantity</label>
              <input className="input" type="number" min="0" value={form.quantityAvailable} onChange={(e) => onChange("quantityAvailable", e.target.value)} required />
            </div>

            <div>
              <label className="mini">Unit</label>
              <select className="input" value={form.unit} onChange={(e) => onChange("unit", e.target.value)}>
                <option value="kg">kg</option>
                <option value="ton">ton</option>
                <option value="pcs">pcs</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mini">Upload Photo</label>
            <input className="input" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
            <p className="mini" style={{ color: "var(--muted)", marginTop: 6 }}>
              JPG/PNG/WebP, max 3MB
            </p>
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Crop"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAddCrop;
