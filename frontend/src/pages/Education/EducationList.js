// // import React, { useEffect, useMemo, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import api from "../../api"; 
// // import { useAuth } from "../../context/AuthContext";

// // // Placeholder image map (replace with your learning platform images)
// // const imageMap = {
// //   programming: "commons.wikimedia.org",
// //   design: "commons.wikimedia.org",
// //   marketing: "commons.wikimedia.org",
// // };

// // const FALLBACK_IMG =
// //   "commons.wikimedia.org";

// // // Normalize DB course -> UI course
// // const normalizeCourse = (c) => {
// //   return {
// //     ...c,
// //     title: c.title || "Unknown Course",
// //     instructorName: c.instructor?.name || "Unknown Instructor", // Use 'name' field
// //     price: c.price ?? 0,
// //     difficulty: c.difficulty || "Beginner",
// //     status: c.published ? "PUBLISHED" : "DRAFT",
// //     category: c.category || "General",
// //   };
// // };

// // const EducationList = () => { // Name changed from CourseList to EducationList
// //   const nav = useNavigate();
// //   const { user } = useAuth();
  
// //   // Define authorized roles: Admin, Farmer, Gov Official
// //   const authorizedToManage = ["ADMIN", "FARMER", "GOV_OFFICIAL"];
// //   const canManageCourses = user && authorizedToManage.includes(user.role); 

// //   const [courses, setCourses] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [err, setErr] = useState("");

// //   const [q, setQ] = useState("");
// //   const [filter, setFilter] = useState("ALL"); 

// //   const fetchCourses = async () => {
// //     try {
// //       setErr("");
// //       setLoading(true);

// //       // We call the NEW backend endpoint: /api/courses
// //       const res = await api.get("/courses"); 
// //       const list = Array.isArray(res.data) ? res.data.data : res.data?.data || []; 

// //       if (list.length) {
// //         setCourses(list.map(normalizeCourse));
// //       } else {
// //         setCourses([]); // No courses found in the DB
// //       }
// //     } catch (e) {
// //       console.error(e);
// //       setErr("Could not load courses from server.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchCourses();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   const filtered = useMemo(() => {
// //     const text = q.trim().toLowerCase();

// //     return courses.filter((c) => {
// //       const matchesText =
// //         !text ||
// //         (c.title || "").toLowerCase().includes(text) ||
// //         (c.description || "").toLowerCase().includes(text) ||
// //         (c.instructorName || "").toLowerCase().includes(text);

// //       const status = (c.status || "DRAFT").toUpperCase();
// //       const matchesFilter = filter === "ALL" || status === filter;

// //       return matchesText && matchesFilter;
// //     });
// //   }, [courses, q, filter]);

// //   const getImageForCourse = (c) => {
// //     const raw = c.image || c.thumbnailUrl;
// //     if (raw && typeof raw === "string" && raw.startsWith("http")) return raw;

// //     const key = (c.category || "").toLowerCase().trim();
// //     return imageMap[key] || FALLBACK_IMG;
// //   };

// //   const viewCourse = (courseId) => {
// //     nav(`/education/courses/${courseId}`); 
// //   };


// //   // Admin-specific approval function
// //   const approveCourse = async (courseId) => {
// //     try {
// //       // Call the NEW backend endpoint: PATCH /api/courses/:id/approve
// //       await api.patch(`/courses/${courseId}/approve`);
// //       fetchCourses(); // Refresh the list
// //     } catch (e) {
// //       alert(e.response?.data?.message || "Failed to approve course.");
// //     }
// //   };

// //   return (
// //     <div className="container">
// //       {/* ... (Rest of the JSX structure is the same as the previous CourseList code you received) ... */}
// //       <div className="hero">
// //         <div className="hero-row">
// //           <div>
// //             <h1 className="h1">Learning Platform</h1>
// //             <p className="subhead">Browse available courses.</p>
// //           </div>

// //           <div className="hero-actions" style={{ display: "flex", gap: 10 }}>
// //             <button className="btn" onClick={fetchCourses}>Refresh</button>

// //             {canManageCourses && (
// //               <button className="btn btn-primary" onClick={() => nav("/education/admin/add-course")}>
// //                 + Add Course
// //               </button>
// //             )}
// //           </div>
// //         </div>
// //       </div>
      
// //       {/* Toolbar for search and filter (from your CropList structure) */}
// //       <div className="toolbar">
// //         <div className="search">
// //           <input
// //             className="input"
// //             placeholder="Search by title, instructor, or category..."
// //             value={q}
// //             onChange={(e) => setQ(e.target.value)}
// //           />
// //         </div>

// //         <div className="chips">
// //           <button className={`chip ${filter === "ALL" ? "active" : ""}`} onClick={() => setFilter("ALL")}>
// //             All
// //           </button>
// //           <button className={`chip ${filter === "PUBLISHED" ? "active" : ""}`} onClick={() => setFilter("PUBLISHED")}>
// //             Published
// //           </button>
// //           <button className={`chip ${filter === "DRAFT" ? "active" : ""}`} onClick={() => setFilter("DRAFT")}>
// //             Drafts
// //           </button>
// //         </div>
// //       </div>

// //       {err && <div className="error">{err}</div>}

// //       {loading ? (
// //         <div className="card">Loading courses...</div>
// //       ) : filtered.length === 0 ? (
// //         <div className="card">
// //           <h3 style={{ marginTop: 0 }}>No courses found</h3>
// //           <p style={{ color: "var(--muted)", marginBottom: 0 }}>
// //             Try a different search or filter.
// //           </p>
// //         </div>
// //       ) : (
// //         <div className="course-grid">
// //           {filtered.map((c) => {
// //             const status = (c.status || "DRAFT").toUpperCase();
// //             const published = status === "PUBLISHED";
// //             const img = getImageForCourse(c);

// //             return (
// //               <div className="course-card" key={c._id} onClick={() => viewCourse(c._id)} style={{cursor: 'pointer'}}>
// //                 <div className="course-media">
// //                   <img
// //                     className="course-img"
// //                     src={img}
// //                     alt={c.title}
// //                     loading="lazy"
// //                     referrerPolicy="no-referrer"
// //                     onError={(e) => {
// //                       e.currentTarget.onerror = null;
// //                       e.currentTarget.src = FALLBACK_IMG;
// //                     }}
// //                   />
// //                 </div>

// //                 <div className="course-body">
// //                   <div className="course-top">
// //                     <div>
// //                       <h3 className="course-name">{c.title}</h3>
// //                       <p className="course-meta">
// //                         {c.category ? `${c.category} • ` : ""}
// //                         {c.instructorName || "Admin"}
// //                       </p>
// //                     </div>

// //                     <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
// //                       <span className={`badge ${published ? "published" : "draft"}`}>
// //                         {status}
// //                       </span>
// //                     </div>
// //                   </div>

// //                   <p className="course-description">{c.description.substring(0, 80)}...</p>

// //                   <div className="course-actions">
// //                     <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); viewCourse(c._id); }}>
// //                         {published ? 'View Course' : 'Review Draft'}

// //                     </button>
// //                   {user?.role === "ADMIN" && !published && (
// //                         <button 
// //                             className="btn btn-sm btn-primary" 
// //                             onClick={(e) => { e.stopPropagation(); approveCourse(c._id); }}
// //                         >
// //                             Approve Course
// //                         </button> 
                    
// //                     )}
// //                   </div>
// //                 </div>
// //               </div>
// //             );
// //           })}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default EducationList;
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../api"; 
// import { useAuth } from "../../context/AuthContext";

// // Placeholder image map (replace with your learning platform images)
// // const imageMap = {
// //   programming: "commons.wikimedia.org",
// //   design: "commons.wikimedia.org",
// //   marketing: "commons.wikimedia.org",
// // };

// // const FALLBACK_IMG = "commons.wikimedia.org";
// const imageMap = {
//   programming: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Wheat_field.jpg/1200px-Wheat_field.jpg",
//   marketing: "https://via.placeholder.com/300x150/ffc107/343a40?text=Marketing",
// };

// // Use a proper fallback image URL
// const FALLBACK_IMG = "https://commons.wikimedia.org/wiki/Special:FilePath/Agriculture%20in%20Bangladesh.jpg?width=1200";
// const normalizeCourse = (c) => {
//   return {
//     ...c,
//     _id: c._id || c.id, // Ensure we have the ID for API calls
//     title: c.title || "Unknown Course",
//     instructorName: c.instructor?.name || "Unknown Instructor", // Use 'name' field
//     price: c.price ?? 0,
//     difficulty: c.difficulty || "Beginner",
//     status: c.published ? "PUBLISHED" : "DRAFT", // Derive initial status string
//     category: c.category || "General",
//     isPublished: c.published, // Store the boolean directly
//   };
// };

// const EducationList = () => { // Name changed from CourseList to EducationList
//   const nav = useNavigate();
//   const { user } = useAuth();
  
//   // Define roles authorized to *create* a course (and manage their own drafts)
//   const authorizedToManage = ["ADMIN", "FARMER", "GOV_OFFICIAL"];
//   const canManageCourses = user && authorizedToManage.includes(user.role); 

//   // Define roles authorized to use the admin /approve endpoint
//   const authorizedToApprove = ["ADMIN", "GOV_OFFICIAL"]; 
//   const canApproveCourses = user && authorizedToApprove.includes(user.role);

//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   const [q, setQ] = useState("");
//   const [filter, setFilter] = useState("ALL"); 

//   const fetchCourses = async () => {
//     try {
//       setErr("");
//       setLoading(true);

//       // We call the backend endpoint: /api/courses
//       // (Requires backend modification to show unpublished courses to admins)
//       const res = await api.get("/courses"); 
//       const list = Array.isArray(res.data) ? res.data.data : res.data?.data || []; 

//       if (list.length) {
//         setCourses(list.map(normalizeCourse));
//       } else {
//         setCourses([]); // No courses found in the DB
//       }
//     } catch (e) {
//       console.error(e);
//       setErr("Could not load courses from server.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCourses();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const filtered = useMemo(() => {
//     const text = q.trim().toLowerCase();

//     return courses.filter((c) => {
//       const matchesText =
//         !text ||
//         (c.title || "").toLowerCase().includes(text) ||
//         (c.description || "").toLowerCase().includes(text) ||
//         (c.instructorName || "").toLowerCase().includes(text);

//       // Use c.status which was derived correctly in normalizeCourse
//       const status = c.status.toUpperCase(); 
//       const matchesFilter = filter === "ALL" || status === filter;

//       return matchesText && matchesFilter;
//     });
//   }, [courses, q, filter]);

//   const getImageForCourse = (c) => {
//     const raw = c.image || c.thumbnailUrl;
//     if (raw && typeof raw === "string" && raw.startsWith("http")) return raw;

//     const key = (c.category || "").toLowerCase().trim();
//     return imageMap[key] || FALLBACK_IMG;
//   };

//   const viewCourse = (courseId) => {
//     nav(`/education/courses/${courseId}`); 
//   };

//   // Admin-specific approval function (renamed for clarity)
//   const handleApproveCourse = async (courseId) => {
//     try {
//       if (!canApproveCourses) return;

//       // Call the correct backend endpoint: PATCH /api/courses/:id/approve
//       await api.patch(`/courses/${courseId}/approve`);
      
//       alert("Course approved successfully!");
//       fetchCourses(); // Refresh the list
//     } catch (e) {
//       alert(e.response?.data?.message || "Failed to approve course.");
//     }
//   };

//   return (
//     <div className="container">
//       <div className="hero">
//         <div className="hero-row">
//           <div>
//             <h1 className="h1">Learning Platform</h1>
//             <p className="subhead">Browse available courses.</p>
//           </div>

//           <div className="hero-actions" style={{ display: "flex", gap: 10 }}>
//             <button className="btn" onClick={fetchCourses}>Refresh</button>

//             {canManageCourses && (
//               <button className="btn btn-primary" onClick={() => nav("/education/admin/add-course")}>
//                 + Add Course
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
      
//       <div className="toolbar">
//         <div className="search">
//           <input
//             className="input"
//             placeholder="Search by title, instructor, or category..."
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//           />
//         </div>

//         <div className="chips">
//           <button className={`chip ${filter === "ALL" ? "active" : ""}`} onClick={() => setFilter("ALL")}>
//             All
//           </button>
//           <button className={`chip ${filter === "PUBLISHED" ? "active" : ""}`} onClick={() => setFilter("PUBLISHED")}>
//             Published
//           </button>
//           <button className={`chip ${filter === "DRAFT" ? "active" : ""}`} onClick={() => setFilter("DRAFT")}>
//             Drafts (Pending)
//           </button>
//         </div>
//       </div>

//       {err && <div className="error">{err}</div>}

//       {loading ? (
//         <div className="card">Loading courses...</div>
//       ) : filtered.length === 0 ? (
//         <div className="card">
//           <h3 style={{ marginTop: 0 }}>No courses found</h3>
//           <p style={{ color: "var(--muted)", marginBottom: 0 }}>
//             Try a different search or filter.
//           </p>
//         </div>
//       ) : (
//         <div className="course-grid">
//           {filtered.map((c) => {
//             // Use the derived boolean value from the normalized course object
//             const published = c.isPublished; 
//             const img = getImageForCourse(c);

//             return (
//               <div className="course-card" key={c._id} onClick={() => viewCourse(c._id)} style={{cursor: 'pointer'}}>
//                 <div className="course-media">
//                   <img
//                     className="course-img"
//                     src={img}
//                     alt={c.title}
//                     loading="lazy"
//                     referrerPolicy="no-referrer"
//                     onError={(e) => {
//                       e.currentTarget.onerror = null;
//                       e.currentTarget.src = FALLBACK_IMG;
//                     }}
//                   />
//                 </div>

//                 <div className="course-body">
//                   <div className="course-top">
//                     <div>
//                       <h3 className="course-name">{c.title}</h3>
//                       <p className="course-meta">
//                         {c.category ? `${c.category} • ` : ""}
//                         {c.instructorName || "Admin"}
//                       </p>
//                     </div>

//                     <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//                       {/* Show 'PUBLISHED' or 'PENDING REVIEW' UI badge */}
//                       <span className={`badge ${published ? "published" : "draft"}`}>
//                         {published ? "PUBLISHED" : "PENDING REVIEW"}
//                       </span>
//                     </div>
//                   </div>

//                   <p className="course-description">{c.description.substring(0, 80)}...</p>

//                   <div className="course-actions">
//                     <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); viewCourse(c._id); }}>
//                         View Details
//                     </button>
                    
//                     {/* Admin/Gov official approval button (only for unpublished items) */}
//                     {canApproveCourses && !published && (
//                         <button 
//                             className="btn btn-sm btn-primary" 
//                             onClick={(e) => { e.stopPropagation(); handleApproveCourse(c._id); }}
//                         >
//                             Approve Course
//                         </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default EducationList;
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
    difficulty: c.difficulty || "Beginner",
    status: c.published ? "PUBLISHED" : "DRAFT", 
    category: c.category || "General",
    isPublished: c.published, 
  };
};

const EducationList = () => { 
  const nav = useNavigate();
  const { user } = useAuth();
  
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

      const status = c.status.toUpperCase(); 
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
  
  // ⭐️ NEW ENROLLMENT FUNCTION ⭐️
  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      
      alert("Enrollment successful!");
      // Optionally re-fetch courses or update user state here if needed
      
    } catch (e) {
      alert(e.response?.data?.message || "Failed to enroll in course. You may already be enrolled.");
    }
  };
  // ⭐️ END ENROLLMENT FUNCTION ⭐️


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
            Drafts (Pending)
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
                    
                    {/* ⭐️ NEW ENROLL BUTTON (Only on published courses) ⭐️ */}
                    {published && (
                        <button 
                            className="btn btn-sm btn-primary" 
                            onClick={(e) => { e.stopPropagation(); handleEnroll(c._id); }}
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