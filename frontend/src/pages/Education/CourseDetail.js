// src/pages/Education/CourseDetail.js
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";

export default function CourseDetail() {
  // 👇 GET COURSE ID FROM URL
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 👇 STATE HOOKS
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        navigate("/education");
        return;
      }

      try {
        setError("");
        setLoading(true);
        
        // 👇 FETCH COURSE FROM API
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, navigate]); // 👈 DEPENDENCIES

  // Loading state
  if (loading) {
    return <div className="container">Loading course details...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="container">
        <div className="error">Error: {error}</div>
        <button onClick={() => navigate("/education")} className="btn">
          Back to Courses
        </button>
      </div>
    );
  }

  // No course found
  if (!course) {
    return (
      <div className="container">
        <h2>Course not found</h2>
        <button onClick={() => navigate("/education")} className="btn">
          Back to Courses
        </button>
      </div>
    );
  }

  // Render course
  return (
    <div className="container" style={{ padding: "20px" }}>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      
      <h2>Lessons ({course.lessons?.length || 0})</h2>
      {course.lessons && course.lessons.length > 0 ? (
        <ul>
          {course.lessons.map((lesson) => (
            <li key={lesson._id}>{lesson.title}</li>
          ))}
        </ul>
      ) : (
        <p>No lessons available yet.</p>
      )}
      
      <button 
        onClick={() => navigate("/education")} 
        className="btn"
        style={{ marginTop: "20px" }}
      >
        ← Back to Courses
      </button>
    </div>
  );
}