import  db  from '../data/db.mjs';

export const getAllStudents = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, username, name, surname, avatar FROM users WHERE role = "student" ORDER BY surname, name';
    db.all(sql, [], (err, rows) => {
      if (err)
        reject(err);
      else {
        const students = rows.map(row => ({
          id: row.id,   
          username: row.username,
          name: row.name,
          surname: row.surname,
          avatar: row.avatar,
        }));
        resolve(students);
      }
    });
  });
};


export const  checkGroupCollaborations = (studentIds, teacherId) => { 
  return new Promise((resolve, reject) => {
    const pairs = [];
    for (let i = 0; i < studentIds.length; i++) {
      for (let j = i + 1; j < studentIds.length; j++) {
        pairs.push([studentIds[i], studentIds[j]]);
      }
    }

    let checkedPairs = 0;
    let problematicPairs = [];

    pairs.forEach(pair => {
      const sql = `
        SELECT COUNT(*) as collaboration_count,
               u1.username as student1_username,
               u2.username as student2_username
        FROM tasks a
        LEFT JOIN task_students tk1 ON a.id = tk1.task_id
        LEFT JOIN task_students tk2 ON a.id = tk2.task_id
        LEFT JOIN users u1 ON tk1.student_id = u1.id
        LEFT JOIN users u2 ON tk2.student_id = u2.id
        WHERE a.teacher_id = ?
        AND tk1.student_id = ?
        AND tk2.student_id = ?
        AND tk1.student_id != tk2.student_id
      `;

      db.get(sql, [teacherId, pair[0], pair[1]], (err, row) => {
        if (err) {
          return reject(err);
        }

        if (row.collaboration_count >= 2) {
          problematicPairs.push({
            student1: row.student1_username,
            student2: row.student2_username
          });
        }

        checkedPairs++;
        if (checkedPairs === pairs.length) {
          resolve(problematicPairs);
        }
      });
    });
  });
};

export const getStudentsCollaborationHistory = (teacherId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        u1.id as student1_id,
        u1.name as student1_name,
        u2.id as student2_id,
        u2.name as student2_name,
        COUNT(*) as collaboration_count
      FROM tasks a
      LEFT JOIN task_students tk1 ON a.id = tk1.task_id
      LEFT JOIN task_students tk2 ON a.id = tk2.task_id
      LEFT JOIN users u1 ON tk1.student_id = u1.id
      LEFT JOIN users u2 ON tk2.student_id = u2.id
      WHERE a.teacher_id = ?
      AND tk1.student_id < tk2.student_id
      GROUP BY u1.id, u2.id, u1.name, u2.name
      ORDER BY collaboration_count DESC, u1.name, u2.name
    `;

    db.all(sql, [teacherId], (err, rows) => {
      if (err)
        reject(err);
      else {
        const collaborations = rows.map(row => ({
          student1: {
            id: row.student1_id,
            name: row.student1_name
          },
          student2: {
            id: row.student2_id,
            name: row.student2_name
          },
          collaborationCount: row.collaboration_count
        }));
        resolve(collaborations);
      }
    });
  });
};