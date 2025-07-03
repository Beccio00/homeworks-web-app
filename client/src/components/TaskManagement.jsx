import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Alert, Collapse, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { API } from '../API/API.mjs';
import Avatar from './Avatar';

const TaskManagement = (props) => {
    const [tasks, setTasks] = useState([]);
    const [closedTasks, setClosedTasks] = useState([]);
    const [weightedAverage, setWeightedAverage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [scoringTask, setScoringTask] = useState(null);
    const [scoreValue, setScoreValue] = useState('');
    const [editingAnswer, setEditingAnswer] = useState(null);
    const [answerValue, setAnswerValue] = useState('');
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

    const handleScoreSubmit = async (taskId) => {
        if (!scoreValue.trim() || isNaN(scoreValue) || scoreValue < 0 || scoreValue > 30) {
            setError('Inserisci un punteggio valido (0-30)');
            return;
        }

        try {
            setScoringTask(taskId);
            await API.scoreTask(taskId, parseInt(scoreValue));
            setSuccess('Punteggio assegnato con successo!');
            setScoreValue('');
            fetchTasks();
        } catch (err) {
            setError('Errore nell\'assegnazione del punteggio: ' + err.message);
        } finally {
            setScoringTask(null);
        }
    };

    const handleAnswerSubmit = async (taskId) => {
        if (!answerValue.trim()) {
            setError('Inserisci una risposta valida');
            return;
        }

        try {
            setEditingAnswer(taskId);
            await API.submitAnswer(taskId, answerValue.trim());
            setSuccess('Risposta salvata con successo!');
            setEditingAnswer(null);
            setAnswerValue('');
            await fetchTasks(); // Ricarica i compiti per aggiornare la vista
        } catch (err) {
            setError('Errore durante il salvataggio della risposta: ' + err.message);
        } finally {
            setEditingAnswer(null);
        }
    };

    const startEditingAnswer = (task) => {
        setEditingAnswer(task.id);
        setAnswerValue(task.answer || '');
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
        if (task.score !== null) {
            return <Badge bg="success">Valutato ({task.score}/30)</Badge>;
        } else if (task.answer) {
            return <Badge bg="warning">Da valutare</Badge>;
        } else {
            return <Badge bg="secondary">In attesa</Badge>;
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

                    {success && (
                        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                            {success}
                        </Alert>
                    )}

                    <Card className="mb-4">
                        <Card.Header>
                            {isStudent ? (
                                <Tabs 
                                    activeKey={activeTab}
                                    onSelect={(k) => setActiveTab(k)}
                                    className="border-bottom-0"
                                >
                                    <Tab eventKey="open" title="📚 Compiti Aperti">
                                        <div className="mt-3">
                                            <h5 className="mb-0">📚 I Tuoi Compiti Aperti</h5>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="closed" title="✅ Compiti Completati">
                                        <div className="mt-3 d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">✅ Compiti Completati</h5>
                                            {weightedAverage > 0 && (
                                                <Badge bg="info" className="fs-6 p-2">
                                                    Media Pesata: {weightedAverage}/30
                                                </Badge>
                                            )}
                                        </div>
                                    </Tab>
                                </Tabs>
                            ) : (
                                <h5 className="mb-0">📝 Compiti Assegnati</h5>
                            )}
                        </Card.Header>
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
                                <Table responsive hover>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40%' }}>Domanda</th>
                                            {isTeacher && <th style={{ width: '25%' }}>Studenti</th>}
                                            {isStudent && <th style={{ width: '25%' }}>Risposta</th>}
                                            <th style={{ width: '20%' }}>Stato</th>
                                            <th style={{ width: '15%' }}>Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getCurrentTasks().map((task) => (
                                            <>
                                                <tr 
                                                    key={task.id} 
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => toggleRowExpansion(task.id)}
                                                    className={expandedRows.has(task.id) ? 'table-active' : ''}
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
                                                                    ID: {task.id} • {isTeacher ? `Creato: ${new Date(task.date || task.createdAt).toLocaleDateString('it-IT')}` : `Insegnante: ${task.teacher?.name || 'N/A'} ${task.teacher?.surname || ''}`}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    
                                                    {isTeacher && (
                                                        <td>
                                                            <div className="d-flex flex-wrap align-items-center">
                                                                {task.students && task.students.map((student) => 
                                                                    <Avatar key={student.id} {...student} size={32} />
                                                                )}
                                                                <small className="text-muted ms-1">
                                                                    ({task.students?.length || 0} studenti)
                                                                </small>
                                                            </div>
                                                        </td>
                                                    )}
                                                    
                                                    {isStudent && (
                                                        <td>
                                                            {task.answer ? (
                                                                <span className="text-truncate" style={{maxWidth: '150px', display: 'inline-block'}}>
                                                                    {task.answer.length > 50 ? `${task.answer.substring(0, 50)}...` : task.answer}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted fst-italic">Non risposto</span>
                                                            )}
                                                        </td>
                                                    )}
                                                    
                                                    <td>
                                                        {getTaskStatusBadge(task)}
                                                    </td>
                                                    <td>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleRowExpansion(task.id);
                                                            }}
                                                        >
                                                            {expandedRows.has(task.id) ? 'Chiudi' : 'Dettagli'}
                                                        </Button>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={isTeacher ? "4" : "4"} className="p-0">
                                                        <Collapse in={expandedRows.has(task.id)}>
                                                            <div className="bg-light p-4 border-top">
                                                                <Row>
                                                                    <Col md={8}>
                                                                        <h6>📋 Domanda Completa:</h6>
                                                                        <p className="mb-3">{task.question}</p>
                                                                        
                                                                        <h6>� Risposta:</h6>
                                                                        {isStudent && editingAnswer === task.id ? (
                                                                            <div className="mb-3">
                                                                                <Form.Group>
                                                                                    <Form.Control
                                                                                        as="textarea"
                                                                                        rows={4}
                                                                                        value={answerValue}
                                                                                        onChange={(e) => setAnswerValue(e.target.value)}
                                                                                        placeholder="Scrivi la tua risposta..."
                                                                                    />
                                                                                </Form.Group>
                                                                                <div className="mt-2">
                                                                                    <Button
                                                                                        variant="success"
                                                                                        size="sm"
                                                                                        className="me-2"
                                                                                        onClick={() => handleAnswerSubmit(task.id)}
                                                                                        disabled={editingAnswer === task.id}
                                                                                    >
                                                                                        Salva Risposta
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="secondary"
                                                                                        size="sm"
                                                                                        onClick={() => setEditingAnswer(null)}
                                                                                    >
                                                                                        Annulla
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div>
                                                                                {task.answer ? (
                                                                                    <div className="bg-white p-3 rounded border mb-2">
                                                                                        <p className="mb-0">{task.answer}</p>
                                                                                    </div>
                                                                                ) : (
                                                                                    <p className="text-muted fst-italic">Nessuna risposta fornita ancora</p>
                                                                                )}
                                                                                {isStudent && (
                                                                                    <Button
                                                                                        variant="outline-primary"
                                                                                        size="sm"
                                                                                        onClick={() => startEditingAnswer(task)}
                                                                                    >
                                                                                        {task.answer ? 'Modifica Risposta' : 'Aggiungi Risposta'}
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </Col>
                                                                    <Col md={4}>
                                                                        {isTeacher && (
                                                                            <>
                                                                                <h6>👥 Partecipanti:</h6>
                                                                                <div className="mb-3">
                                                                                    {task.students && task.students.map((student) => (
                                                                                        <div key={student.id} className="d-flex align-items-center mb-2">
                                                                                            <Avatar {...student} size={28} />
                                                                                            <div className="ms-1">
                                                                                                <span className="small fw-medium">
                                                                                                    {student.name} {student.surname}
                                                                                                </span>
                                                                                                <br />
                                                                                                <small className="text-muted">
                                                                                                    {student.username}
                                                                                                </small>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>

                                                                                {task.answer && task.score === null && (
                                                                                    <div className="mt-3">
                                                                                        <h6>⭐ Assegna Punteggio:</h6>
                                                                                        <Form.Group className="mb-2">
                                                                                            <Form.Control
                                                                                                type="number"
                                                                                                placeholder="Punteggio (0-30)"
                                                                                                value={scoreValue}
                                                                                                onChange={(e) => setScoreValue(e.target.value)}
                                                                                                min="0"
                                                                                                max="30"
                                                                                                disabled={scoringTask === task.id}
                                                                                            />
                                                                                        </Form.Group>
                                                                                        <Button
                                                                                            variant="success"
                                                                                            size="sm"
                                                                                            onClick={() => handleScoreSubmit(task.id)}
                                                                                            disabled={scoringTask === task.id || !scoreValue.trim()}
                                                                                        >
                                                                                            {scoringTask === task.id ? 'Assegnazione...' : 'Assegna Punteggio'}
                                                                                        </Button>
                                                                                    </div>
                                                                                )}

                                                                                {task.score !== null && (
                                                                                    <div className="mt-3">
                                                                                        <h6>✅ Punteggio Assegnato:</h6>
                                                                                        <Badge bg="success" className="fs-6 p-2">
                                                                                            {task.score}/30
                                                                                        </Badge>
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                        
                                                                        {isStudent && (
                                                                            <div>
                                                                                <h6>👨‍🏫 Insegnante:</h6>
                                                                                <div className="d-flex align-items-center mb-2">
                                                                                    <Avatar {...task.teacher} size={32} />
                                                                                    <div className="ms-2">
                                                                                        <span className="fw-medium">{task.teacher?.name} {task.teacher?.surname}</span>
                                                                                        <br />
                                                                                        <small className="text-muted">{task.teacher?.username}</small>
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                <h6>👥 Gruppo:</h6>
                                                                                <div className="mb-3">
                                                                                    {task.students && task.students.map((student, index) => (
                                                                                        <div key={index} className="d-flex align-items-center mb-2">
                                                                                            <Avatar {...student} size={28} />
                                                                                            <div className="ms-1">
                                                                                                <span className="small fw-medium">
                                                                                                    {student.name} {student.surname}
                                                                                                </span>
                                                                                                <br />
                                                                                                <small className="text-muted">
                                                                                                    {student.username}
                                                                                                </small>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                                
                                                                                {task.score !== null && (
                                                                                    <div className="mt-3">
                                                                                        <h6>⭐ Punteggio:</h6>
                                                                                        <Badge bg="success" className="fs-6 p-2">
                                                                                            {task.score}/30
                                                                                        </Badge>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                        </Collapse>
                                                    </td>
                                                </tr>
                                            </>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default TaskManagement;