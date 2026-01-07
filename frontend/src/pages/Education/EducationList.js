// src/pages/Education/EducationList.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; 
import { useAuth } from "../../context/AuthContext";


// Placeholder image map (Corrected image links for stability)
const imageMap = {
  programming: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Wheat_field.jpg/1200px-Wheat_field.jpg",
  marketing: "https://via.placeholder.com/300x150/ffc107/343a40?text=Marketing",
};

// Use a proper fallback image URL (using a stable placeholder)
const FALLBACK_IMG = "https://via.placeholder.com/300x150/6c757d/ffffff?text=Course+Image";

const normalizeCourse = (c) => {
  return {
    ...c,
    _id: c._id || c.id, 
    title: c.title || "Unknown Course",
    instructorName: c.instructor?.name || "Unknown Instructor", 
    price: c.price ?? 0,
    difficulty: c.difficulty || "Beginender",
    status: c.published ? "PUBLISHED" : "DRAFT", 
    category: c.category || "General",
    isPublished: c.published, 
  };
};

const EducationList = () => { 
  const nav = useNavigate();
  const { user, refreshUser } = useAuth(); // 👈 USE refreshUser INSTEAD OF setUser
  
  const authorizedToManage = ["ADMIN", "FARMER", "GOV_OFFICIAL"];
  const canManageCourses = user && authorizedToManage.includes(user.role); 

  const authorizedToApprove = ["ADMIN", "GOV_OFFICIAL"]; 
  const canApproveCourses = user && authorizedToApprove.includes(user.role);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("ALL"); 

  const fetchCourses = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get("/courses"); 
      const list = Array.isArray(res.data) ? res.data.data : res.data?.data || []; 

      if (list.length) {
        setCourses(list.map(normalizeCourse));
      } else {
        setCourses([]); 
      }
    } catch (e) {
      console.error(e);
      setErr("Could not load courses from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();

    return courses.filter((c) => {
      const matchesText =
        !text ||
        (c.title || "").toLowerCase().includes(text) ||
        (c.description || "").toLowerCase().includes(text) ||
        (c.instructorName || "").toLowerCase().includes(text);

      if (filter === "MY_COURSES") {
        // Check if user is enrolled in this course
        return matchesText && user?.enrolledCourses?.some(
          id => id.toString() === c._id.toString()
        );
      }

      const status = c.status.toUpperCase(); 
      const matchesFilter = filter === "ALL" || status === filter;
      return matchesText && matchesFilter;
    });
  }, [courses, q, filter, user]); // 👈 IMPORTANT: user in dependencies

  const getImageForCourse = (c) => {
    const raw = c.image || c.thumbnailUrl;
    if (raw && typeof raw === "string" && raw.startsWith("http")) return raw;

    const key = (c.category || "").toLowerCase().trim();
    return imageMap[key] || FALLBACK_IMG;
  };

  const viewCourse = (courseId) => {
    nav(`/education/courses/${courseId}`); 
  };

  const handleApproveCourse = async (courseId) => {
    try {
      if (!canApproveCourses) return;

      await api.patch(`/courses/${courseId}/approve`);
      
      alert("Course approved successfully!");
      fetchCourses(); 
    } catch (e) {
      alert(e.response?.data?.message || "Failed to approve course.");
    }
  };

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">
              {filter === "MY_COURSES" ? "My Enrolled Courses" : "Learning Platform"}
            </h1>
            <p className="subhead">
              {filter === "MY_COURSES" 
                ? "Courses you're enrolled in." 
                : "Browse available courses."
              }
            </p>
          </div>

          <div className="hero-actions" style={{ display: "flex", gap: 10 }}>
            <button className="btn" onClick={fetchCourses}>Refresh</button>

            {canManageCourses && (
              <button className="btn btn-primary" onClick={() => nav("/education/admin/add-course")}>
                + Add Course
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="toolbar">
        <div className="search">
          <input
            className="input"
            placeholder="Search by title, instructor, or category..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="chips">
          <button className={`chip ${filter === "ALL" ? "active" : ""}`} onClick={() => setFilter("ALL")}>
            All
          </button>
          <button className={`chip ${filter === "PUBLISHED" ? "active" : ""}`} onClick={() => setFilter("PUBLISHED")}>
            Published
          </button>
          <button className={`chip ${filter === "DRAFT" ? "active" : ""}`} onClick={() => setFilter("DRAFT")}>
            Drafts (Pending)
          </button>
          <button className={`chip ${filter === "MY_COURSES" ? "active" : ""}`} 
            onClick={() => setFilter("MY_COURSES")}          
          >
            My Courses
          </button>
        </div>
      </div>

      {err && <div className="error">{err}</div>}

      {loading ? (
        <div className="card">Loading courses...</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No courses found</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            Try a different search or filter.
          </p>
        </div>
      ) : (
        <div className="course-grid">
          {filtered.map((c) => {
            const published = c.isPublished; 
            const img = getImageForCourse(c);

            return (
              <div className="course-card" key={c._id} onClick={() => viewCourse(c._id)} style={{cursor: 'pointer'}}>
                <div className="course-media">
                  <img
                    className="course-img"
                    src={img}
                    alt={c.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMG;
                    }}
                  />
                </div>

                <div className="course-body">
                  <div className="course-top">
                    <div>
                      <h3 className="course-name">{c.title}</h3>
                      <p className="course-meta">
                        {c.category ? `${c.category} • ` : ""}
                        {c.instructorName || "Admin"}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span className={`badge ${published ? "published" : "draft"}`}>
                        {published ? "PUBLISHED" : "PENDING REVIEW"}
                      </span>
                    </div>
                  </div>

                  <p className="course-description">{c.description.substring(0, 80)}...</p>

                  <div className="course-actions">
                    <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); viewCourse(c._id); }}>
                        View Details
                    </button>
                    
                    {/* ✅ FIXED ENROLL BUTTON */}
                    {published && (
                      <button 
                        className="btn btn-sm" 
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await api.post(`/courses/${c._id}/enroll`);
                            alert("Enrolled successfully!");
                            await refreshUser(); // 👈 ONLY THIS LINE NEEDED
                          } catch (err) {
                            alert(err.response?.data?.message || "Failed to enroll");
                          }
                        }}
                      >
                        Enroll Now
                      </button>
                    )}
                    
                    {/* Admin/Gov official approval button (only for unpublished items) */}
                    {canApproveCourses && !published && (
                        <button 
                            className="btn btn-sm btn-primary" 
                            onClick={(e) => { e.stopPropagation(); handleApproveCourse(c._id); }}
                        >
                            Approve Course
                        </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EducationList;