[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/F9jR7G97)
# Exam #2: "Compiti"
## Student: s349024 RICCARDO BECCIOLINI 

## React Client Application Routes

- Route `/`: Default redirect route - redirects authenticated users to `/dashboard`, unauthenticated users to `/login`
- Route `/dashboard`: Main dashboard page for both teachers and students showing class overview with student statistics for teachers or assigned tasks and weighted average score for students
- Route `/login`: Authentication page with username and password input fields with validation
- Route `/tasks`: Task management page with different views for teachers (list of created tasks) and students (list of assigned tasks)
- Route `/tasks/new`: Task creation page for teachers only with form to create new tasks and student selection
- Route `/progress`: Class progress overview page for teachers only with detailed analytics and progress tracking
- Route `/*`: 404 Not Found page for invalid routes

## API Server

### **Authentication Routes**

- **POST** `/api/sessions`
  - **Description**: User login
  - **Request body**:
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
  - **Response** (201 Created):
    ```json
    {
      "id": number,
      "username": "string",
      "name": "string",
      "surname": "string",
      "role": "teacher" | "student",
      "avatar": "string"
    }
    ```
  - **Errors**:
    - 401 Unauthorized: Authentication failed

- **GET** `/api/sessions/current`
  - **Description**: Get current user session
  - **Response** (200):
    ```json
    {
      "id": number,
      "username": "string",
      "name": "string",
      "surname": "string",
      "role": "teacher" | "student",
      "avatar": "string"
    }
    ```
  - **Errors**:
    - 401 Unauthorized: Not authenticated

- **DELETE** `/api/sessions/current`
  - **Description**: User logout
  - **Response**: 204 No Content
  - **Errors**:
    - 500 Internal Server Error: Logout failed

### **Teacher Routes** (Require teacher authentication)

- **GET** `/api/students`
  - **Description**: Get all students
  - **Response**:
    ```json
    [
      {
        "id": number,
        "username": "string",
        "name": "string",
        "surname": "string",
        "avatar": "string"
      }
    ]
    ```
  - **Errors**:
    - 500 Internal Server Error

- **POST** `/api/tasks/teacher`
  - **Description**: Create a new task
  - **Request body**:
    ```json
    {
      "question": "string",
      "studentIds": [number, number, ...]
    }
    ```
  - **Validation**:
    - `question`: minimum 1 character
    - `studentIds`: array with 2-6 valid student IDs
  - **Response** (201 Created):
    ```json
    {
      "message": "task created successfully"
    }
    ```
  - **Errors**:
    - 400 Bad Request: Invalid student IDs
    - 409 Conflict: Students have already collaborated together 2+ times
      ```json
      {
        "error": "Some students in this group have already collaborated together in 2 or more tasks",
        "problematicPairs": [
          {
            "student1": "username1",
            "student2": "username2"
          }
        ]
      }
      ```
    - 422 Validation Error
    - 500 Internal Server Error

- **GET** `/api/tasks/teacher`
  - **Description**: Get all tasks created by the teacher
  - **Response**:
    ```json
    [
      {
        "id": number,
        "question": "string",
        "status": "open" | "closed",
        "answer": "string" | null,
        "score": number | null,
        "createdAt": "string",
        "students": [
          {
            "name": "string",
            "surname": "string",
            "username": "string",
            "avatar": "string",
          }
        ]
      }
    ]
    ```
  - **Errors**:
    - 500 Internal Server Error

- **PUT** `/api/tasks/teacher/:id/score`
  - **Description**: Score and close a task
  - **Parameters**: `id` - task ID
  - **Request body**:
    ```json
    {
      "score": number
    }
    ```
  - **Validation**: `score` between 0 and 30
  - **Response**:
    ```json
    {
      "message": "Task scored and closed successfully"
    }
    ```
  - **Errors**:
    - 400 Bad Request: Cannot score task without an answer
    - 403 Forbidden: Access denied to this task
    - 404 Not Found: Task not found
    - 409 Conflict: Task is already closed
    - 500 Internal Server Error

- **GET** `/api/class-overview`
  - **Description**: Get class overview with all students and their statistics for tasks created by the teacher
  - **Response**:
    ```json
    {
      "students": [
        {
          "name": "string",
          "surname": "string",
          "username": "string",
          "avatar": "string",
          "openTasks": number,
          "closedTasks": number,
          "totalTasks": number,
          "averageScore": number
        }
      ],
      "totalOpenTasks": number,
      "totalClosedTasks": number,
      "totalTasks": number
    }
    ```
  - **Errors**:
    - 500 Internal Server Error

### **Student Routes** (Require student authentication)

- **GET** `/api/tasks/student`
  - **Description**: Get all tasks assigned to the student
  - **Response**:
    ```json
    {
      "tasks": [
        {
          "id": number,
          "question": "string",
          "answer": "string" | null,
          "score": number | null,
          "status": "open" | "closed",
          "groupSize": number,
          "createdAt": "string",
          "teacher": {
            "name": "string",
            "surname": "string",
            "username": "string",
            "avatar": "string"
          },
          "students": [
            {
              "name": "string",
              "surname": "string",
              "username": "string",
              "avatar": "string"
            }
          ]
        }
      ],
      "weightedAverage": number
    }
    ```

- **PUT** `/api/tasks/student/:id/answer`
  - **Description**: Submit or update answer for a task
  - **Parameters**: `id` - task ID
  - **Request body**:
    ```json
    {
      "answer": "string"
    }
    ```
  - **Validation**: `answer` minimum 1 character
  - **Response**:
    ```json
    {
      "message": "Answer submitted successfully"
    }
    ```
  - **Errors**:
    - 403 Forbidden: You are not part of this task group
    - 404 Not Found: Task not found
    - 409 Conflict: Task is closed and cannot be modified
    - 500 Internal Server Error

### **Static Files**

- **GET** `/images/avatars/:filename`
  - **Description**: Serves avatar images from `data/images/avatars/`

## Database Tables

### Table `users`

Contains information about registered users (teachers and students)

| Column     | Type                              | Description                    |
| ---------- | --------------------------------- | ------------------------------ |
| `id`       | INTEGER PRIMARY KEY AUTOINCREMENT | Identifier for the user        |
| `username` | TEXT NOT NULL UNIQUE              | Username                       |
| `password` | TEXT NOT NULL                     | User password                  |
| `salt`     | TEXT NOT NULL                     | Salt used for hashing password |
| `name`     | TEXT NOT NULL                     | User's first name              |
| `surname`  | TEXT NOT NULL                     | User's last name               |
| `role`     | TEXT NOT NULL                     | User role (teacher/student)    |
| `avatar`   | TEXT                              | Path to user's profile picture |

### Table `tasks`

Contains all tasks created by teachers

| Column       | Type                              | Description                           |
| ------------ | --------------------------------- | ------------------------------------- |
| `id`         | INTEGER PRIMARY KEY AUTOINCREMENT | Identifier for the task               |
| `teacher_id` | INTEGER NOT NULL                  | Teacher who created the task (FK)     |
| `question`   | TEXT NOT NULL                     | Task question/description             |
| `answer`     | TEXT                              | Student's answer to the task          |
| `score`      | INTEGER                           | Score assigned by teacher (0-30)      |
| `status`     | TEXT NOT NULL                     | Task status (open/closed)             |
| `created_at` | DATETIME DEFAULT CURRENT_TIME     | When the task was created             |

**Foreign Keys:**
- `teacher_id` REFERENCES `users(id)`

### Table `task_students`

M:N relation between tasks and students assigned to them

| Column       | Type    | Description                        |
| ------------ | ------- | ---------------------------------- |
| `task_id`    | INTEGER | The task assigned (FK)             |
| `student_id` | INTEGER | The student assigned to task (FK)  |

**Foreign Keys:**
- `task_id` REFERENCES `tasks(id)`
- `student_id` REFERENCES `users(id)`

## Main React Components

- `DefaultLayout` (in `DefaultLayout.jsx`): component to manage the navbar, authentication context, and the default layout wrapper for all pages
- `Dashboard` (in `Dashboard.jsx`): main dashboard component showing different views for teachers (class statistics, quick actions) and students (personal stats, assigned tasks overview)
- `TaskManagement` (in `TaskManagement.jsx`): core component for task management with different interfaces for teachers (view/score tasks) and students (view/answer tasks) with tab-based navigation
- `CreateTasks` (in `CreateTasks.jsx`): component for teachers to create new tasks with question input, student selection interface, and collaboration conflict detection
- `TaskDetails` (in `TaskDetails.jsx`): component for teachers to view complete class overview with all students and their statistics, task counts (including students with 0 tasks), and sortable table with progress tracking
- `AuthComponents` (in `AuthComponents.jsx`): authentication component managing login form with username/password validation and user session handling
- `TaskTable` (in `TaskTable/`): modular table system with components for displaying tasks (`TaskTable.jsx`), individual rows (`TaskRow.jsx`), headers with tabs (`TaskHeader.jsx`), and expandable details (`TaskDetails.jsx`)
- `NavHeader` (in `NavHeader.jsx`): navigation component with role-based menu items, user profile display, and logout functionality
- `NotFound` (in `NotFound.jsx`): 404 error page component with navigation back to main application areas

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

student: 
- username: from "s0001" to "s0020" , password: "password1".

theacher: 
- username: from "d0001" to "d0003" , password: "password1".

