
# "Compiti" 

## Project Overview

A set of NT teachers from a class of NS students must organize and evaluate a series of assignments that students must complete in groups.

An assignment consists of a 'question', a 'group' of involved students, an 'answer' provided by the students, and a final 'evaluation' (a score from 0 to 30).

## Teacher Functionality

An authenticated teacher can perform the following operations:

### Define New Assignment
- Write the question and select the group of participating students (from all students)
- The system must prevent the creation of a group where any pair of students has already participated together in at least 2 previous assignments assigned by the authenticated teacher
- Immediately after creation, the assignment becomes "open"
- A group must include between 2 and 6 students

### Grade Assignment
- View the answer given to the assignment and enter an evaluation score, only if an answer has been provided by the students
- After entering the evaluation, an assignment becomes "closed" and can no longer be modified (neither the answer nor the score can be altered)

### View Class Status
- Display the general status of the class, listing for each student:
  - How many of their assignments are open
  - How many are closed
  - The average score they obtained for assignments assigned only by that teacher
- This list can be sorted alphabetically, by total number of student assignments, or by average score

## Student Functionality

An authenticated student can perform the following operations:

### View Open Assignments
- Display open assignments in which they are involved

### Submit Answers
- Enter and submit answers
- Any student in the group can submit an answer
- The answer can be modified/updated by the same student or any other student in the group, until the teacher evaluates it

### View Grades
- Display evaluation scores received in all closed assignments they participated in, along with their own average score

## System Notes

- At any time, there can be an arbitrary number of open assignments
- All NT teachers supervise the same group of NS students
- Each teacher sees and evaluates only their own assignments (not those of other teachers)
- Each assignment is assigned to a single group of students; if the teacher wants to assign the same assignment to different groups, they must create multiple (identical) assignments
- Each student's average score is calculated as a weighted average, where the weights are the inverse of the number of students in the group (a score in a group of 6 students is worth half of a score in a group of 3 students)
- For simplicity, both the question and answer are considered text blocks of arbitrary length

The organization of these specifications into different screens (and possibly different routes) is left to the student.

## Project Requirements

### Technical Architecture
- The application architecture and source code must be developed adopting software development best practices, particularly for single-page applications (SPA) using React and HTTP APIs
- APIs must be carefully protected and the front-end should not receive unnecessary information
- The application must be designed for a desktop browser. Responsiveness for mobile devices is not required or evaluated

### Technology Stack
- The project must be implemented as a React application that interacts with HTTP APIs implemented in Node.js + Express
- Node.js version must be the one used during the course (22.x, LTS)
- The database must be stored in an SQLite file
- The programming language must be JavaScript

### Communication Pattern
- Communication between client and server must follow the "two servers" pattern, correctly configuring CORS and with React in "development" mode with Strict Mode enabled

### Application Behavior
- Project evaluation will be performed by navigating within the application
- The "refresh" button and manual URL setting (except /) will not be tested or used, and their behavior is not specified
- The application should never "auto-reload" as a consequence of normal application use

### Project Structure
- The project root directory must contain a README.md file and two subdirectories (client and server)
- The project must be launchable with the commands: `cd server; nodemon index.mjs` and `cd client; npm run dev`
- A template with the project directory skeleton is available in the exam repository
- It can be assumed that nodemon is already installed at the system level
- No other modules will be available globally

### Delivery
- The entire project must be delivered via GitHub, in the repository created by GitHub Classroom
- The project must not include node_modules directories. They must be recreatable via the "npm install" command immediately after "git clone"

### Libraries
- The project can use popular and commonly adopted libraries (for example, day.js, react-bootstrap, etc.), if applicable and useful
- Such libraries must be correctly declared in package.json files so that the npm install command can download and install them

### Authentication
- User authentication (login and logout) and API access must be implemented using Passport.js and session cookies
- Credentials must be stored in hashed format with salt
- Registration of a new user is not required or evaluated

## Quality Requirements

In addition to implementing the required application functionality, the following quality requirements will be evaluated:

- **Database Design and Organization**
- **HTTP API Design**
- **React Component Organization and Routes**
- **Correct Use of React Patterns** (functional behavior, hooks, state, context and effects). This includes avoiding direct DOM manipulation
- **Code Clarity**
- **Absence of Errors** (and warnings) in the browser console (except those caused by errors in imported libraries)
- **No Application Crashes** or unhandled exceptions
- **Essential Data Validation** (in Express and React)
- **Basic Usability and Ease of Use**
- **Solution Originality**

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

### Dashboard
- **Teacher version:**
![Dashboard Teacher](./screen/dashboard_teacher.png)

- **Student version:**
![Dashboard Student](./screen/dashboard_student.png)

### Task Management
- **Teacher - Task Manager:**
![Task Manager Teacher](./screen/task_manager_teacer.png)

- **Teacher - Create New Task:**
![Create New Task](./screen/create_new_task_teacher.png)

- **Teacher - Class Overview:**
![Class Overview](./screen/class_overview.png)

### Student Task Views
- **Student - Open Task:**
![Student Open Task](./screen/task_open_student.png)

- **Student - Closed Task:**
![Student Closed Task](./screen/task_close_student.png)

## Users Credentials

student: 
- username: from "s0001" to "s0020" , password: "password1".

theacher: 
- username: from "d0001" to "d0003" , password: "password1".

