// backend/server.js (excerpt)

// ... other imports and middleware (cors, express.json())

const courseRoutes = require("./routes/courseRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
// const userRoutes = require("./routes/userRoutes"); // You would need this too

// Mount the routers to specific API endpoints
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
// app.use("/api/users", userRoutes); 

// ... rest of your server code (app.listen(...))
