// src/pages/Education/EducationList.js
import React, { useEffect, useState } from "react";
import api from "../../api";

const EducationList = () => {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const res = await api.get("/education");
        setItems(res.data);
      } catch (e) {
        console.error(e);
        setErr("Failed to load educational content");
      }
    };
    fetchEducation();
  }, []);

  if (err) return <div>{err}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Educational Corner</h2>
      {items.length === 0 ? (
        <p>No content yet.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item._id}>
              {item.title} ({item.contentType}){" "}
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer">
                  Open
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EducationList;
