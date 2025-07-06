import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { API } from '../API/API.mjs';
import { TaskTable, TaskHeader } from './TaskTable';

const TaskManagement = () => {
    const { user, setMessage } = useContext(AuthContext);
    const [allTasks, setAllTasks] = useState([]);
    const [weightedAverage, setWeightedAverage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [scoringTask, setScoringTask] = useState(null);
    const [editingAnswer, setEditingAnswer] = useState(null);
    const [activeTab, setActiveTab] = useState('open');

    const isTeacher = user.role === 'teacher';
    const isStudent = user.role === 'student';

    useEffect(() => {
        fetchTasks();
    }, [user.role]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            let tasksData;
            
            if (isTeacher) {
                tasksData = await API.getTeacherTasks();
                setAllTasks(tasksData);
            } else if (isStudent) {
                const data = await API.getAllTasks();
                setAllTasks(data.tasks);
                setWeightedAverage(data.weightedAverage);
            }
        } catch (err) {
            setError('Errore nel caricamento dei compiti: ' + err.message);
        } finally {
            setLoading(false);
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
            setMessage({ msg: 'Punteggio assegnato con successo!', type: 'success' });
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
            setMessage({ msg: 'Risposta salvata con successo!', type: 'success' });
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
        return activeTab === 'open' ? 
            allTasks.filter(task => task.status === 'open') : 
            allTasks.filter(task => task.status === 'closed');
    };

    const getCurrentTasksTitle = () => {
        if (isTeacher) {
            return activeTab === 'open' ? '� Compiti Aperti' : '✅ Compiti Chiusi';
        }
        return activeTab === 'open' ? '📚 I Tuoi Compiti Aperti' : '✅ Compiti Completati';
    };

    const getEmptyMessage = () => {
        if (isTeacher) {
            return activeTab === 'open' ? 'Nessun compito aperto al momento.' : 'Nessun compito chiuso ancora.';
        }
        return activeTab === 'open' ? 'Non hai compiti aperti al momento.' : 'Non hai ancora completato nessun compito.';
    };


    const getTaskStatusBadge = (task) => {
        if (activeTab === 'closed' && task.score !== null) {
            return <Badge bg="success">Valutato ({task.score}/30)</Badge>;
        }
        
        if (isStudent && activeTab === 'open') {
            if (task.answer) {
                return <Badge bg="warning">In attesa di valutazione (modificabile)</Badge>;
            } else {
                return <Badge bg="secondary">Senza risposta</Badge>;
            }
        }
        
        if (isTeacher) {
            if (task.answer) {
                return <Badge bg="warning">Da valutare</Badge>;
            } else {
                return <Badge bg="secondary">In attesa di una risposta</Badge>;
            }
        }
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