const SERVER_URL = "http://localhost:3001/api";

export const API = {};

/* --- AUTH --- */
API.login = async (credentials) => {
  const response = await fetch(`${SERVER_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (response.ok) return await response.json();
  throw new Error(await response.text());
};

API.getUserInfo = async () => {
  const response = await fetch(`${SERVER_URL}/sessions/current`, {
    credentials: "include",
  });

  if (response.ok) return await response.json();
  return null;
};

API.logout = async () => {
  const response = await fetch(`${SERVER_URL}/sessions/current`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) throw new Error(await response.text());
};

/* --- TEACHER ENDPOINTS --- */
API.getStudents = async () => {
  const response = await fetch(`${SERVER_URL}/students`, {
    credentials: "include",
  });

  if (response.ok) return await response.json();
  throw new Error(await response.text());
};

API.createTask = async (taskData) => {
  const response = await fetch(`${SERVER_URL}/tasks/teacher`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(taskData),
  });

  if (response.ok) return await response.json();
  throw new Error(await response.text());
};

API.getTeacherTasks = async () => {
  const response = await fetch(`${SERVER_URL}/tasks/teacher`, {
    credentials: "include",
  });

  if (response.ok) return await response.json();
  throw new Error(await response.text());
};

API.getTaskById = async (taskId) => {
  const response = await fetch(`${SERVER_URL}/tasks/teacher/${taskId}`, {
    credentials: "include",
  });

  if (response.ok) return await response.json();
  throw new Error(await response.text());
};

API.scoreTask = async (taskId, score) => {
  const response = await fetch(`${SERVER_URL}/tasks/teacher/${taskId}/score`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ score }),
  });

  if (response.ok) return await response.json();
  throw new Error(await response.text());
};

API.getClassOverview = async () => {
  const response = await fetch(`${SERVER_URL}/class-overview`, {
    credentials: "include",
  });

  if (response.ok) return await response.json();
  throw new Error(await response.text());
};

/* --- STUDENT ENDPOINTS --- */
API.getOpenTasks = async () => {
  const response = await fetch(`${SERVER_URL}/tasks/student/open`, {
    credentials: "include",
  });

  if (response.ok) return await response.json();
  throw new Error(await response.text());
};

API.getClosedTasks = async () => {
  const response = await fetch(`${SERVER_URL}/tasks/student/closed`, {
    credentials: "include",
  });

  if (response.ok) return await response.json();
  throw new Error(await response.text());
};

API.submitAnswer = async (taskId, answer) => {
  const response = await fetch(`${SERVER_URL}/tasks/student/${taskId}/answer`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ answer }),
  });

  if (response.ok) return await response.json();
  throw new Error(await response.text());
};

/* --- SHARED ENDPOINTS --- */
API.getProfile = async () => {
  const response = await fetch(`${SERVER_URL}/profile`, {
    credentials: "include",
  });

  if (response.ok) return await response.json();
  throw new Error(await response.text());
};

export default API;
