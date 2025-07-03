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
    const sqlTasks = `
      SELECT DISTINCT a.*
      FROM tasks a
      WHERE a.teacher_id = ?
      ORDER BY a.created_at DESC
    `;
    
    db.all(sqlTasks, [teacherId], (err, taskRows) => {
      if (err) {
        reject(err);
        return;
      }

      if (taskRows.length === 0) {
        resolve([]);
        return;
      }

      const taskIds = taskRows.map(task => task.id);
      const placeholders = taskIds.map(() => '?').join(',');
      
      const sqlStudents = `
        SELECT tk.task_id, u.id, u.name, u.surname, u.username, u.avatar, u.role
        FROM task_students tk
        JOIN users u ON tk.student_id = u.id
        WHERE tk.task_id IN (${placeholders})
        ORDER BY tk.task_id, u.name, u.surname
      `;

      db.all(sqlStudents, taskIds, (err, studentRows) => {
        if (err) {
          reject(err);
          return;
        }

        const studentsByTask = {};
        studentRows.forEach(student => {
          if (!studentsByTask[student.task_id]) {
            studentsByTask[student.task_id] = [];
          }
          studentsByTask[student.task_id].push({
            id: student.id,
            name: student.name,
            surname: student.surname,
            username: student.username,
            avatar: student.avatar,
            role: student.role
          });
        });

        const tasks = taskRows.map(task => ({
          id: task.id,
          question: task.question,
          status: task.status,
          answer: task.answer,
          score: task.score,
          date: task.created_at,
          students: studentsByTask[task.id] || []
        }));

        resolve(tasks);
      });
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
      SELECT a.*, u_teacher.name as teacher_name, u_teacher.surname as teacher_surname,
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
          teacherSurname: row.teacher_surname,
          studentCount: row.student_count,
          studentNames: row.student_names
        }));
        resolve(tasks);
      }
    });
  });
};

//FIXME: undersand if created_at is needed in the response

// Get closed tasks for a student with scores
export const getClosedTasksByStudent = (studentId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT a.*, u_teacher.name as teacher_name, u_teacher.surname as teacher_surname,
             COUNT(tk2.student_id) as group_size,
             GROUP_CONCAT(u_students.name || ' ' || u_students.surname, ', ') as student_names
      FROM tasks a
      JOIN task_students tk ON a.id = tk.task_id
      JOIN users u_teacher ON a.teacher_id = u_teacher.id
      JOIN task_students tk2 ON a.id = tk2.task_id
      JOIN users u_students ON tk2.student_id = u_students.id
      WHERE tk.student_id = ? AND a.status = "closed"
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
          score: row.score,
          groupSize: row.group_size,
          createdAt: row.created_at,
          teacherName: row.teacher_name,
          teacherSurname: row.teacher_surname,
          studentNames: row.student_names
        }));

        const calculateWeightedAverage = (tasks) => {
          if (tasks.length === 0) return 0;
          
          const weightedSum = tasks.reduce((sum, task) => {
            return sum + (task.score * (1.0 / task.groupSize));
          }, 0);
          
          const totalWeight = tasks.reduce((sum, task) => {
            return sum + (1.0 / task.groupSize);
          }, 0);
          
          return Math.round((weightedSum / totalWeight) * 100) / 100;
        };
        
        const weightedAverage = calculateWeightedAverage(tasks);
        
        resolve({
          tasks,
          weightedAverage,
        });
      }
    });
  });
};

// Get class overview for teacher
export const getClassOverview = (teacherId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT u.id, u.name, u.surname, u.username, u.avatar, u.role,
             a.id as task_id, a.status, a.score,
             group_sizes.group_size
      FROM users u
      LEFT JOIN task_students tk ON u.id = tk.student_id
      LEFT JOIN tasks a ON tk.task_id = a.id AND a.teacher_id = ?
      LEFT JOIN (
        SELECT task_id, COUNT(*) as group_size
        FROM task_students
        GROUP BY task_id
      ) group_sizes ON a.id = group_sizes.task_id
      WHERE u.role = 'student' AND a.id IS NOT NULL
      ORDER BY u.id, a.created_at
    `;

    db.all(sql, [teacherId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const studentsMap = new Map();

      rows.forEach(row => {
        if (!studentsMap.has(row.id)) {
          studentsMap.set(row.id, {
            id: row.id,
            name: row.name,
            surname: row.surname,
            username: row.username,
            avatar: row.avatar,
            role: row.role,
            tasks: []
          });
        }

        if (row.task_id) {
          studentsMap.get(row.id).tasks.push({
            id: row.task_id,
            status: row.status,
            score: row.score,
            groupSize: row.group_size
          });
        }
      });

      const students = Array.from(studentsMap.values()).map(student => {
        const openTasks = student.tasks.filter(t => t.status === 'open').length;
        const closedTasks = student.tasks.filter(t => t.status === 'closed').length;
        const totalTasks = student.tasks.length;
        
        const closedTasksWithScores = student.tasks.filter(t => t.status === 'closed' && t.score !== null);
        let averageScore = 0;
        
        if (closedTasksWithScores.length > 0) {
          const weightedSum = closedTasksWithScores.reduce((sum, task) => {
            return sum + (task.score * (1.0 / task.groupSize));
          }, 0);
          
          const totalWeight = closedTasksWithScores.reduce((sum, task) => {
            return sum + (1.0 / task.groupSize);
          }, 0);
          
          averageScore = Math.round((weightedSum / totalWeight) * 100) / 100;
        }

        return {
          id: student.id,
          name: student.name,
          surname: student.surname,
          username: student.username,
          avatar: student.avatar,
          role: student.role,
          openTasks,
          closedTasks,
          totalTasks,
          averageScore
        };
      });

      // Ora eseguiamo le query per i task globali del teacher
      const sql_open_tasks = `
        SELECT COUNT(*) as count 
        FROM tasks 
        WHERE teacher_id = ? AND status = "open"`;

      const sql_closed_tasks = `
        SELECT COUNT(*) as count 
        FROM tasks 
        WHERE teacher_id = ? AND status = "closed"`;

      db.get(sql_open_tasks, [teacherId], (err, openRow) => {
        if (err) {
          reject(err);
          return;
        }

        db.get(sql_closed_tasks, [teacherId], (err, closedRow) => {
          if (err) {
            reject(err);
            return;
          }

          const totalOpenTasks = openRow.count;
          const totalClosedTasks = closedRow.count;
          const totalTasks = totalOpenTasks + totalClosedTasks;

          const result = {
            students,
            totalOpenTasks,
            totalClosedTasks,
            totalTasks
          };

          resolve(result);
        });
      });
    });
  });
};