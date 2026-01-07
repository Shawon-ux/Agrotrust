// src/pages/Education/MyCourses.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const MyCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setError("");
        setLoading(true);
        
        // 👇 NEW: Fetch enrolled courses from your backend
        const res = await api.get("/courses/enrolled");
        setCourses(res.data.data || []);
      } catch (err) {
        console.error("Failed to load enrolled courses:", err);
        setError("Could not load your enrolled courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const viewCourse = (courseId) => {
    navigate(`/education/courses/${courseId}`);
  };

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-row">
          <div>
            <h1 className="h1">My Courses</h1>
            <p className="subhead">Courses you're enrolled in.</p>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="card">Loading your courses...</div>
      ) : courses.length === 0 ? (
        <div className="card">
          <h3>No enrolled courses yet</h3>
          <p>
            Browse available courses and click <strong>"Enroll Now"</strong> to get started.
          </p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <div
              className="course-card"
              key={course._id}
              onClick={() => viewCourse(course._id)}
              style={{ cursor: "pointer" }}
            >
              <div className="course-body">
                <h3 className="course-name">{course.title}</h3>
                <p className="course-meta">
                  Instructor: {course.instructor?.name || "Unknown"}
                </p>
                <p className="course-description">
                  {course.description?.substring(0, 80)}...
                </p>
                <button className="btn btn-sm">Continue Learning</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;