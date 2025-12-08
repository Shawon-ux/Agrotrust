import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// Assuming you have an api file like the one in your code:
import api from "../../api"; 
import { useAuth } from "../../context/AuthContext";

// Placeholder image map (replace with your learning platform images)
const imageMap = {
  programming: "commons.wikimedia.org",
  design: "commons.wikimedia.org",
  marketing: "commons.wikimedia.org",
};

const FALLBACK_IMG =
  "commons.wikimedia.org";

// Normalize DB course -> UI course
const normalizeCourse = (c) => {
  return {
    ...c,
    title: c.title || "Unknown Course",
    instructorName: c.instructor?.firstName ? `${c.instructor.firstName} ${c.instructor.lastName}` : "Unknown Instructor",
    price: c.price ?? 0,
    difficulty: c.difficulty || "Beginner",
    status: c.published ? "PUBLISHED" : "DRAFT",
    category: c.category || "General",
  };
};

const CourseList = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  // Check if the user is an INSTRUCTOR or ADMIN (adjust roles as needed)
  const canManageCourses = user?.role === "ADMIN" || user?.role === "INSTRUCTOR"; 

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  // Filter for ALL | PUBLISHED | DRAFT
  const [filter, setFilter] = useState("ALL"); 

  const fetchCourses = async () => {
    try {
      setErr("");
      setLoading(true);

      // We call the new backend endpoint: /api/courses
      const res = await api.get("/courses"); 
      const list = Array.isArray(res.data) ? res.data.data : res.data?.data || []; // Match your backend structure

      if (list.length) {
        setCrops(list.map(normalizeCourse));
      } else {
        setCrops([]); // No courses found in the DB
        // You might add demo courses here if you want
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

      const status = (c.status || "DRAFT").toUpperCase();
      const matchesFilter = filter === "ALL" || status === filter;

      return matchesText && matchesFilter;
    });
  }, [courses, q, filter]);

  const getImageForCourse = (c) => {
    const raw = c.image || c.thumbnailUrl;
    if (raw && typeof raw === "string" && raw.startsWith("http")) return raw;

    const key = (c.category || "").toLowerCase().trim();
    return imageMap[key] || FALLBACK_IMG;
  };

  // Function to handle clicking into a course
  const viewCourse = (courseId) => {
    // Navigate to a details page (you'd need a route set up for this)
    nav(`/education/courses/${courseId}`); 
  };

  // ADMIN/INSTRUCTOR ONLY toggle publication status
  const togglePublish = async (course) => {
    try {
      if (!canManageCourses) return;

      // Call the backend PATCH route: /api/courses/:id/publish
      await api.patch(`/courses/${course._id}/publish`);
      
      // Refresh the list after success
      fetchCourses(); 

    } catch (e) {
      alert(e.response?.data?.message || "Failed to update publication status");
    }
  };

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">Learning Platform</h1>
            <p className="subhead">Browse available courses.</p>
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
            Drafts
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
            const status = (c.status || "DRAFT").toUpperCase();
            const published = status === "PUBLISHED";
            const img = getImageForCourse(c);

            return (
              // Use a div structured similar to your crop-card
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
                        {status}
                      </span>
                    </div>
                  </div>

                  <p className="course-description">{c.description.substring(0, 80)}...</p>

                  <div className="course-actions">
                    <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); viewCourse(c._id); }}>
                        Enroll Now
                    </button>
                    
                    {canManageCourses && (
                        <button 
                            className="btn btn-sm btn-secondary" 
                            onClick={(e) => { e.stopPropagation(); togglePublish(c); }}
                        >
                            {published ? 'Unpublish' : 'Publish'}
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

export default CourseList;
