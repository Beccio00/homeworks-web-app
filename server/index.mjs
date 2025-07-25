import cors from "cors";
import express from 'express';
import morgan from 'morgan';
import initializePassport from "./auth/passport-config.mjs";
import session from "express-session";
import { body, validationResult } from "express-validator";
import passport from "passport";

import {
  createTask,
  addStudentToTask,
  getTasksByTeacher,
  getTaskById,
  updateTaskScore,
  closeTask,
  getAllTasksByStudent,
  updateTaskAnswer,
  getClassOverview
} from "./dao/taskDao.mjs";

import {
  getAllStudents,
  checkGroupCollaborations
} from "./dao/studentDao.mjs";


const app = new express();
const port = 3001;

app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.use(
  session({
    secret: "compiti-web-app-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authorized" });
  }
  next();
};

const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ 
      error: `access required` 
    });
  }
  next();
};

const isTeacher = [requireAuth, requireRole('teacher')];
const isStudent = [requireAuth, requireRole('student')];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });
  next();
};

/* --- AUTH --- */

// Login
app.post("/api/sessions", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(401)
        .json({ error: info?.message || "Authentication failed" });

    req.login(user, (err) => {
      if (err) return next(err);
      const userInfo = {
        id: user.id,
        username: user.username,
        name: user.name,
        surname: user.surname,
        role: user.role,
        avatar: user.avatar
      };
      res.status(201).json(userInfo);
    });
  })(req, res, next);
});

// Session
app.get("/api/sessions/current", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  const userInfo = {
    id: req.user.id,
    username: req.user.username,
    name: req.user.name,
    surname: req.user.surname,
    role: req.user.role,
    avatar: req.user.avatar    
  };
  res.json(userInfo);
  res.status(200);
});

// Logout
app.delete("/api/sessions/current", (req, res) =>
  req.logout((err) =>
    err
      ? res.status(500).json({ error: "Logout failed" })
      : res.status(204).end()
  )
);

/* --- TEACHER ROUTES --- */

// Get all students
app.get("/api/students", isTeacher, async (req, res) => {
  try {
    const students = await getAllStudents();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a task
app.post("/api/tasks/teacher", isTeacher,
  [
    body("question").isLength({ min: 1 }),
    body("studentIds").isArray({ min: 2, max: 6 }),
    body("studentIds.*").isInt({ min: 1 })
  ],
  validate,
  async (req, res) => {
    try {
      const { question, studentIds } = req.body;
      const teacherId = req.user.id;

      const existingStudentsId = (await getAllStudents()).map(s => s.id);
      const invalidStudentIds = studentIds.filter(id => !existingStudentsId.includes(id));
      if (invalidStudentIds.length > 0) {
        return res.status(400).json({
          error: `Invalid student IDs: ${invalidStudentIds.join(", ")}`
        });
      }

      const problematicPairs = await checkGroupCollaborations(studentIds, teacherId);
      if (problematicPairs.length > 0) {
        return res.status(409).json({
          error: "Some students in this group have already collaborated together in 2 or more tasks",
          problematicPairs});
      }

      const taskId = await createTask(teacherId, question);
      
      for (const studentId of studentIds) {
        await addStudentToTask(taskId, studentId);
      }
      
      res.status(201).json({message: "task created successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get tasks by teacher
app.get("/api/tasks/teacher", isTeacher, async (req, res) => {
  try {
    const tasks = await getTasksByTeacher(req.user.id);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Score a task
app.put("/api/tasks/teacher/:id/score", isTeacher,
  [
    body("score").isFloat({ min: 0, max: 30 })
  ],
  validate,
  async (req, res) => {
    try {
      const taskId = req.params.id;
      const { score } = req.body;
      const teacherId = req.user.id;

      const task = await getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (task.teacherId !== teacherId) {
        return res.status(403).json({ error: "Access denied to this task" });
      }

      if (!task.answer) {
        return res.status(400).json({ error: "Cannot score task without an answer" });
      }

      if (task.status === 'closed') {
        return res.status(409).json({ error: "Task is already closed" });
      }

      await updateTaskScore(taskId, score);
      await closeTask(taskId);

      res.json({ message: "Task scored and closed successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get task overview
app.get("/api/class-overview", isTeacher, async (req, res) => {
  try {
    const overview = await getClassOverview(req.user.id);
    res.json(overview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* --- STUDENT ROUTES --- */

// Get tasks for a student
app.get("/api/tasks/student", isStudent, async (req, res) => {
  try {
    const result = await getAllTasksByStudent(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modify a task answer
app.put("/api/tasks/student/:id/answer", isStudent,
  [
    body("answer").isLength({ min: 1 })
  ],
  validate,
  async (req, res) => {
    try {
      const taskId = req.params.id;
      const { answer } = req.body;
      const studentId = req.user.id;

      const task = await getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (task.status === 'closed') {
        return res.status(409).json({ error: "Task is closed and cannot be modified" });
      }

      const isStudentInGroup = task.students.some(s => s.id === studentId);
      if (!isStudentInGroup) {
        return res.status(403).json({ error: "You are not part of this task group" });
      }

      await updateTaskAnswer(taskId, answer);
      res.json({ message: "Answer submitted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.use("/images/avatars", express.static("data/images/avatars"));

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});