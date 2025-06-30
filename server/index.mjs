// imports
import cors from "cors";
import express from 'express';
import morgan from 'morgan';
import initializePassport from "./auth/passport-config.mjs";
import session from "express-session";
import { body, validationResult } from "express-validator";
import passport from "passport";

import {
  createtask,
  gettasksByTeacher,
  gettaskById,
  updatetaskscore,
  closetask,
  getOpentasksByStudent,
  getClosedtasksByStudent,
  updatetaskAnswer,
  getClassOverview
} from "./dao/taskDao.mjs";

import {
  getAllStudents,
  getStudentById,
  checkGroupCollaborations
} from "./dao/studentDao.mjs";


// init express
const app = new express();
const port = 3001;

app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5173",
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

const isLoggedIn = (req, res, next) =>
  req.isAuthenticated()
    ? next()
    : res.status(401).json({ error: "Not authorized" });

const isTeacher = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authorized" });
  }
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: "Teacher access required" });
  }
  next();
};

const isStudent = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authorized" });
  }
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: "Student access required" });
  }
  next();
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });
  next();
};

/* --- AUTH --- */
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
        role: user.role
      };
      res.status(201).json(userInfo);
    });
  })(req, res, next);
});

app.get("/api/sessions/current", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  const userInfo = {
    id: req.user.id,
    username: req.user.username,
    name: req.user.name,
    role: req.user.role    
  };
  res.json(userInfo);
});

app.delete("/api/sessions/current", (req, res) =>
  req.logout((err) =>
    err
      ? res.status(500).json({ error: "Logout failed" })
      : res.status(204).end()
  )
);

/* --- TEACHER ROUTES --- */

app.get("/api/students", isTeacher, async (req, res) => {
  try {
    const students = await getAllStudents();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  "/api/tasks",
  isTeacher,
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

      const canCreateGroup = await checkGroupCollaborations(studentIds, teacherId);
      if (!canCreateGroup) {
        return res.status(400).json({ 
          error: "Some students in this group have already collaborated together in 2 or more tasks" 
        });
      }

      const taskId = await createtask(teacherId, question, studentIds);
      res.status(201).json({ taskId, message: "task created successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get("/api/tasks", isTeacher, async (req, res) => {
  try {
    const tasks = await gettasksByTeacher(req.user.id);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/tasks/:id", isTeacher, async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await gettaskById(taskId, req.user.id);
    
    if (!task) {
      return res.status(404).json({ error: "task not found" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put(
  "/api/tasks/:id/score",
  isTeacher,
  [
    body("score").isFloat({ min: 0, max: 30 })
  ],
  validate,
  async (req, res) => {
    try {
      const taskId = req.params.id;
      const { score } = req.body;
      const teacherId = req.user.id;

      const task = await gettaskById(taskId, teacherId);
      if (!task) {
        return res.status(404).json({ error: "task not found" });
      }

      if (!task.answer) {
        return res.status(400).json({ error: "Cannot score task without an answer" });
      }

      if (task.status === 'closed') {
        return res.status(400).json({ error: "task is already closed" });
      }

      await updatetaskscore(taskId, score);
      await closetask(taskId);

      res.json({ message: "task scored and closed successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get("/api/class-overview", isTeacher, async (req, res) => {
  try {
    const { sortBy = 'alphabetical' } = req.query;
    const overview = await getClassOverview(req.user.id, sortBy);
    res.json(overview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* --- STUDENT ROUTES --- */

app.get("/api/tasks/open", isStudent, async (req, res) => {
  try {
    const tasks = await getOpentasksByStudent(req.user.id);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/tasks/closed", isStudent, async (req, res) => {
  try {
    const tasks = await getClosedtasksByStudent(req.user.id);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put(
  "/api/tasks/:id/answer",
  isStudent,
  [
    body("answer").isLength({ min: 1 })
  ],
  validate,
  async (req, res) => {
    try {
      const taskId = req.params.id;
      const { answer } = req.body;
      const studentId = req.user.id;

      const task = await gettaskById(taskId);
      if (!task) {
        return res.status(404).json({ error: "task not found" });
      }

      if (task.status === 'closed') {
        return res.status(400).json({ error: "task is closed and cannot be modified" });
      }

      const isStudentInGroup = task.students.some(s => s.id === studentId);
      if (!isStudentInGroup) {
        return res.status(403).json({ error: "You are not part of this task group" });
      }

      await updatetaskAnswer(taskId, answer);
      res.json({ message: "Answer submitted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get("/api/tasks/:id/details", isStudent, async (req, res) => {
  try {
    const taskId = req.params.id;
    const studentId = req.user.id;
    
    const task = await gettaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: "task not found" });
    }

    const isStudentInGroup = task.students.some(s => s.id === studentId);
    if (!isStudentInGroup) {
      return res.status(403).json({ error: "You are not part of this task group" });
    }

    const studentView = {
      id: task.id,
      question: task.question,
      answer: task.answer,
      status: task.status,
      students: task.students,
      score: task.status === 'closed' ? task.score : null
    };

    res.json(studentView);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* --- SHARED ROUTES --- */

app.get("/api/profile", isLoggedIn, async (req, res) => {
  try {
    const userInfo = {
      id: req.user.id,
      username: req.user.username,
      name: req.user.name,
      role: req.user.role
      };
    res.json(userInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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