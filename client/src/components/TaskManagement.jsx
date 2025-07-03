import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { API } from '../API/API.mjs';
import { TaskTable, TaskHeader } from './TaskTable';

const TaskManagement = (props) => {
    const [tasks, setTasks] = useState([]);
    const [closedTasks, setClosedTasks] = useState([]);
    const [weightedAverage, setWeightedAverage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [scoringTask, setScoringTask] = useState(null);
    const [editingAnswer, setEditingAnswer] = useState(null);
    const [activeTab, setActiveTab] = useState('open');

    const isTeacher = props.user.role === 'teacher';
    const isStudent = props.user.role === 'student';

    useEffect(() => {
        fetchTasks();
        if (isStudent) {
            fetchClosedTasks();
        }
    }, [props.user.role]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            let tasksData;
            
            if (isTeacher) {
                tasksData = await API.getTeacherTasks();
            } else if (isStudent) {
                tasksData = await API.getOpenTasks();
            }
            
            setTasks(tasksData || []);
        } catch (err) {
            setError('Errore nel caricamento dei compiti: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchClosedTasks = async () => {
        try {
            const data = await API.getClosedTasks();
            setClosedTasks(data.tasks || []);
            setWeightedAverage(data.weightedAverage || 0);
        } catch (err) {
            setError('Errore nel caricamento dei compiti chiusi: ' + err.message);
        }
    };

    const toggleRowExpansion = (taskId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(taskId)) {
            newExpanded.delete(taskId);
        } else {
            newExpanded.add(taskId);
        }
        setExpandedRows(newExpanded);
    };

    const handleScoreSubmit = async (taskId, scoreValue) => {
        if (!scoreValue.trim() || isNaN(scoreValue) || scoreValue < 0 || scoreValue > 30) {
            setError('Inserisci un punteggio valido (0-30)');
            return;
        }

        try {
            setScoringTask(taskId);
            await API.scoreTask(taskId, parseInt(scoreValue));
            setSuccess('Punteggio assegnato con successo!');
            fetchTasks();
        } catch (err) {
            setError('Errore nell\'assegnazione del punteggio: ' + err.message);
        } finally {
            setScoringTask(null);
        }
    };

    const handleAnswerSubmit = async (taskId, answerValue) => {
        if (!answerValue.trim()) {
            setError('La risposta non può essere vuota');
            return;
        }

        try {
            setEditingAnswer(taskId);
            await API.submitAnswer(taskId, answerValue.trim());
            setSuccess('Risposta salvata con successo!');
            setEditingAnswer(null);
            await fetchTasks(); 
        } catch (err) {
            setError('Errore durante il salvataggio della risposta: ' + err.message);
        } finally {
            setEditingAnswer(null);
        }
    };

    const handleStartEditingAnswer = (taskId) => {
        setEditingAnswer(taskId);
    };

    const handleCancelEditingAnswer = () => {
        setEditingAnswer(null);
    };

    const getCurrentTasks = () => {
        if (isTeacher) return tasks;
        return activeTab === 'open' ? tasks : closedTasks;
    };

    const getCurrentTasksTitle = () => {
        if (isTeacher) return '📝 Compiti Assegnati';
        return activeTab === 'open' ? '📚 I Tuoi Compiti Aperti' : '✅ Compiti Completati';
    };

    const getEmptyMessage = () => {
        if (isTeacher) return 'Nessun compito assegnato ancora.';
        return activeTab === 'open' ? 'Non hai compiti aperti al momento.' : 'Non hai ancora completato nessun compito.';
    };


    const getTaskStatusBadge = (task) => {
        // Per i compiti chiusi (tab "closed") mostra sempre il punteggio se presente
        if (activeTab === 'closed' && task.score !== null) {
            return <Badge bg="success">Valutato ({task.score}/30)</Badge>;
        }
        
        // Per i compiti aperti dello studente
        if (isStudent && activeTab === 'open') {
            if (task.answer) {
                return <Badge bg="warning">In attesa di valutazione</Badge>;
            } else {
                return <Badge bg="secondary">Senza risposta</Badge>;
            }
        }
        
        // Per gli insegnanti (logica originale)
        if (isTeacher) {
            if (task.score !== null) {
                return <Badge bg="success">Valutato ({task.score}/30)</Badge>;
            } else if (task.answer) {
                return <Badge bg="warning">Da valutare</Badge>;
            } else {
                return <Badge bg="secondary">In attesa</Badge>;
            }
        }
        
        // Fallback
        return <Badge bg="secondary">In attesa</Badge>;
    };
    return (
        <Container className="mt-4">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h2>{isTeacher ? 'Gestione Compiti' : 'I Tuoi Compiti'}</h2>
                            <p className="text-muted mb-0">
                                {isTeacher 
                                    ? 'Visualizza, valuta e gestisci tutti i compiti assegnati ai tuoi studenti.'
                                    : 'Visualizza e rispondi ai compiti che ti sono stati assegnati.'
                                }
                            </p>
                        </div>
                        {isTeacher && (
                            <Button 
                                variant="success" 
                                size="lg"
                                as={Link} 
                                to="/tasks/new"
                                className="d-flex align-items-center"
                            >
                                ➕ Nuovo Compito
                            </Button>
                        )}
                    </div>

                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                            {success}
                        </Alert>
                    )}

                    <Card className="mb-4">
                        <TaskHeader 
                            isStudent={isStudent}
                            isTeacher={isTeacher}
                            activeTab={activeTab}
                            onTabSelect={setActiveTab}
                            weightedAverage={weightedAverage}
                        />
                        <Card.Body>
                            {loading ? (
                                <div className="text-center">
                                    <p>Caricamento compiti...</p>
                                </div>
                            ) : getCurrentTasks().length === 0 ? (
                                <div className="text-center">
                                    <p className="text-muted">
                                        {getEmptyMessage()}
                                    </p>
                                </div>
                            ) : (
                                <TaskTable
                                    tasks={getCurrentTasks()}
                                    isTeacher={isTeacher}
                                    isStudent={isStudent}
                                    activeTab={activeTab}
                                    expandedRows={expandedRows}
                                    onToggleExpansion={toggleRowExpansion}
                                    onScoreSubmit={handleScoreSubmit}
                                    onAnswerSubmit={handleAnswerSubmit}
                                    getTaskStatusBadge={getTaskStatusBadge}
                                    scoringTask={scoringTask}
                                    editingAnswer={editingAnswer}
                                    onStartEditingAnswer={handleStartEditingAnswer}
                                    onCancelEditingAnswer={handleCancelEditingAnswer}
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default TaskManagement;