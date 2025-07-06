import { useState } from 'react';
import { Button, Badge, Collapse } from 'react-bootstrap';
import dayjs from 'dayjs';
import Avatar from '../Avatar';
import TaskDetails from './TaskDetails';

const TaskRow = ({ 
    task, 
    isTeacher, 
    isStudent, 
    activeTab, 
    expanded, 
    onToggleExpansion,
    onScoreSubmit,
    onAnswerSubmit,
    getTaskStatusBadge,
    scoringTask,
    editingAnswer,
    onStartEditingAnswer,
    onCancelEditingAnswer
}) => {
    return (
        <>
            <tr 
                style={{ cursor: 'pointer' }}
                onClick={() => onToggleExpansion(task.id)}
                className={expanded ? 'table-active' : ''}
            >
                <td>
                    <div className="d-flex align-items-center">
                        <div>
                            <div className="fw-medium">
                                {task.question.length > 100 
                                    ? `${task.question.substring(0, 100)}...` 
                                    : task.question
                                }
                            </div>
                            <small className="text-muted">
                                Creato il: {dayjs(task.createdAt).format('DD/MM/YYYY')}
                            </small>
                        </div>
                    </div>
                </td>
                
                
                <td>
                    <div className="d-flex flex-wrap align-items-center">
                        {task.students && task.students.map((student) => 
                            <Avatar key={student.id || student.username} {...student} size={32} />
                        )}
                        <small className="text-muted ms-1">
                            ({task.students?.length || 0} studenti)
                        </small>
                    </div>
                </td>
            
                
                <td>
                    {getTaskStatusBadge(task)}
                </td>
            </tr>
            <tr>
                <td colSpan={"4"} className="p-0">
                    <Collapse in={expanded}>
                        <div className="bg-light p-4 border-top">
                            <TaskDetails
                                task={task}
                                isTeacher={isTeacher}
                                isStudent={isStudent}
                                scoringTask={scoringTask}
                                editingAnswer={editingAnswer}
                                onScoreSubmit={onScoreSubmit}
                                onAnswerSubmit={onAnswerSubmit}
                                onStartEditingAnswer={onStartEditingAnswer}
                                onCancelEditingAnswer={onCancelEditingAnswer}
                            />
                        </div>
                    </Collapse>
                </td>
            </tr>
        </>
    );
};

export default TaskRow;
