import { Table } from 'react-bootstrap';
import TaskRow from './TaskRow';

const TaskTable = ({ 
    tasks, 
    isTeacher, 
    isStudent, 
    activeTab, 
    expandedRows, 
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
        <Table responsive hover>
            <thead>
                <tr>
                    <th style={{ width: '40%' }}>Domanda</th>
                    <th style={{ width: '25%' }}>Studenti</th>
                    <th style={{ width: '20%' }}>Stato</th>
                </tr>
            </thead>
            <tbody>
                {tasks.map((task) => (
                    <TaskRow
                        key={task.id}
                        task={task}
                        isTeacher={isTeacher}
                        isStudent={isStudent}
                        activeTab={activeTab}
                        expanded={expandedRows.has(task.id)}
                        onToggleExpansion={onToggleExpansion}
                        onScoreSubmit={onScoreSubmit}
                        onAnswerSubmit={onAnswerSubmit}
                        getTaskStatusBadge={getTaskStatusBadge}
                        scoringTask={scoringTask}
                        editingAnswer={editingAnswer}
                        onStartEditingAnswer={onStartEditingAnswer}
                        onCancelEditingAnswer={onCancelEditingAnswer}
                    />
                ))}
            </tbody>
        </Table>
    );
};

export default TaskTable;
