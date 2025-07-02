import db from '../data/db.mjs';

// Create a new task
export const createTask = (teacherId, question, studentIds) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION", (err) => {
        if (err) return reject(err);

        const sqltask = 'INSERT INTO tasks(teacher_id, question, status, created_at) VALUES(?, ?, "open", datetime("now"))';
        db.run(sqltask, [teacherId, question], function (err) {
          if (err) {
            db.run("ROLLBACK");
            return reject(err);
          }

          const taskId = this.lastID;

          const sqlStudents = 'INSERT INTO task_students(task_id, student_id) VALUES(?, ?)';
          let completed = 0;
          let hasError = false;

          studentIds.forEach(studentId => {
            db.run(sqlStudents, [taskId, studentId], function (err) {
              if (err && !hasError) {
                hasError = true;
                db.run("ROLLBACK");
                return reject(err);
              }
              
              completed++;
              if (completed === studentIds.length && !hasError) {
                db.run("COMMIT", (err) => {
                  if (err) return reject(err);
                  resolve(taskId);
                });
              }
            });
          });
        });
      });
    });
  });
};

// Get all tasks by teacher
export const getTasksByTeacher = (teacherId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT a.*, 
             COUNT(tk.student_id) as student_count,
             GROUP_CONCAT(u.name || ' ' || u.surname, ', ') as student_names
      FROM tasks a
      JOIN task_students tk ON a.id = tk.task_id
      JOIN users u ON tk.student_id = u.id
      WHERE a.teacher_id = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `;
    
    db.all(sql, [teacherId], (err, rows) => {
      if (err)
        reject(err);
      else {
        const tasks = rows.map(row => ({
          id: row.id,
          question: row.question,
          status: row.status,
          answer: row.answer,
          score: row.score,
          createdAt: row.created_at,
          studentCount: row.student_count,
          studentNames: row.student_names
        }));
        resolve(tasks);
      }
    });
  });
};

// Get task by ID with full details
export const getTaskById = (taskId, teacherId = null) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT a.*, u_teacher.name as teacher_name
      FROM tasks a
      JOIN users u_teacher ON a.teacher_id = u_teacher.id
      WHERE a.id = ?
    `;
    let params = [taskId];

    if (teacherId) {
      sql += ' AND a.teacher_id = ?';
      params.push(teacherId);
    }

    db.get(sql, params, (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve(null);
      else {
        const sqlStudents = `
          SELECT u.id, u.username, u.name, u.surname, u.avatar
          FROM users u
          JOIN task_students tk ON u.id = tk.student_id
          WHERE tk.task_id = ?
        `;
        
        db.all(sqlStudents, [taskId], (err, students) => {
          if (err)
            reject(err);
          else {
            const task = {
              id: row.id,
              question: row.question,
              answer: row.answer,
              score: row.score,
              status: row.status,
              createdAt: row.created_at,
              teacherId: row.teacher_id,
              teacherName: row.teacher_name,
              students: students
            };
            resolve(task);
          }
        });
      }
    });
  });
};

// Update task score and close it
export const updateTaskScore = (taskId, score) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE tasks SET score = ? WHERE id = ?';
    db.run(sql, [score, taskId], function (err) {
      if (err)
        reject(err);
      else
        resolve(this.changes);
    });
  });
};

// Close task
export const closeTask = (taskId) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE tasks SET status = "closed" WHERE id = ?';
    db.run(sql, [taskId], function (err) {
      if (err)
        reject(err);
      else
        resolve(this.changes);
    });
  });
};

// Update task answer
export const updateTaskAnswer = (taskId, answer) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE tasks SET answer = ? WHERE id = ?';
    db.run(sql, [answer, taskId], function (err) {
      if (err)
        reject(err);
      else
        resolve(this.changes);
    });
  });
};

// Get open tasks for a student
export const getOpenTasksByStudent = (studentId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT a.*, u_teacher.name as teacher_name,
             COUNT(tk2.student_id) as student_count,
             GROUP_CONCAT(u_students.name || ' ' || u_students.surname, ', ') as student_names
      FROM tasks a
      JOIN task_students tk ON a.id = tk.task_id
      JOIN users u_teacher ON a.teacher_id = u_teacher.id
      JOIN task_students tk2 ON a.id = tk2.task_id
      JOIN users u_students ON tk2.student_id = u_students.id
      WHERE tk.student_id = ? AND a.status = "open"
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `;
    
    db.all(sql, [studentId], (err, rows) => {
      if (err)
        reject(err);
      else {
        const tasks = rows.map(row => ({
          id: row.id,
          question: row.question,
          answer: row.answer,
          createdAt: row.created_at,
          teacherName: row.teacher_name,
          studentCount: row.student_count,
          studentNames: row.student_names
        }));
        resolve(tasks);
      }
    });
  });
};

// Get closed tasks for a student with scores
export const getClosedTasksByStudent = (studentId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT a.*, u_teacher.name as teacher_name,
             COUNT(tk2.student_id) as group_size
      FROM tasks a
      JOIN task_students tk ON a.id = tk.task_id
      JOIN users u_teacher ON a.teacher_id = u_teacher.id
      JOIN task_students tk2 ON a.id = tk2.task_id
      WHERE tk.student_id = ? AND a.status = "closed"
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `;
    
    db.all(sql, [studentId], (err, rows) => {
      if (err)
        reject(err);
      else {
        const tasks = rows.map(row => {
          const weightedScore = row.score / row.group_size;
          
          return {
            id: row.id,
            question: row.question,
            answer: row.answer,
            score: row.score,
            weightedScore: weightedScore,
            groupSize: row.group_size,
            createdAt: row.created_at,
            teacherName: row.teacher_name
          };
        });
        resolve(tasks);
      }
    });
  });
};

//FIXME
// Get class overview for teacher
export const getClassOverview = (teacherId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT u.id, u.name, u.surname, u.username, u.avatar,
             COUNT(CASE WHEN a.status = 'open' THEN 1 END) as open_tasks,
             COUNT(CASE WHEN a.status = 'closed' THEN 1 END) as closed_tasks,
             COUNT(a.id) as total_tasks,
             ROUND(
               AVG(CASE WHEN a.status = 'closed' THEN a.score END), 2
             ) as average_score
      FROM users u
      LEFT JOIN task_students tk ON u.id = tk.student_id
      LEFT JOIN tasks a ON tk.task_id = a.id AND a.teacher_id = ?
      WHERE u.role = 'student'
      GROUP BY u.id, u.name, u.surname, u.username, u.avatar
      ORDER BY u.name, u.surname
    `;

    db.all(sql, [teacherId], (err, rows) => {
      if (err)
        reject(err);
      else {
        const students = rows.map(row => ({
          id: row.id,
          name: row.name,
          surname: row.surname,
          username: row.username,
          avatar: row.avatar,
          openTasks: row.open_tasks,
          closedTasks: row.closed_tasks,
          totalTasks: row.total_tasks,
          averageScore: row.average_score || 0
        }));

        resolve(students);
      }
    });
  });
};