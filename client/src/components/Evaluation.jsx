import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Alert, Collapse } from 'react-bootstrap';
import { API } from '../API/API.mjs';
import Avatar from './Avatar';

const Evaluation = (props) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [scoringTask, setScoringTask] = useState(null);
    const [scoreValue, setScoreValue] = useState('');

    useEffect(() => {
        if (props.user.role === 'teacher') {
            fetchTasks();
        }
    }, [props.user.role]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const tasksData = await API.getTeacherTasks();
            setTasks(tasksData);
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
                    <h2>Valutazione Compiti</h2>
                    <p className="text-muted mb-4">
                        Ruolo: <strong>{props.user.role === 'teacher' ? 'Insegnante' : 'Studente'}</strong>
                    </p>

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
                            <h5 className="mb-0">📝 Compiti Assegnati</h5>
                        </Card.Header>
                        <Card.Body>
                            {props.user.role === 'teacher' ? (
                                <>
                                    {loading ? (
                                        <div className="text-center">
                                            <p>Caricamento compiti...</p>
                                        </div>
                                    ) : tasks.length === 0 ? (
                                        <div className="text-center">
                                            <p className="text-muted">Nessun compito assegnato ancora.</p>
                                        </div>
                                    ) : (
                                        <Table responsive hover>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '40%' }}>Domanda</th>
                                                    <th style={{ width: '30%' }}>Studenti</th>
                                                    <th style={{ width: '20%' }}>Stato</th>
                                                    <th style={{ width: '10%' }}>Azioni</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tasks.map((task) => (
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
                                                                            ID: {task.id} • Creato: {new Date(task.date).toLocaleDateString('it-IT')}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex flex-wrap align-items-center">
                                                                    {task.students && task.students.map((student) => 
                                                                        Avatar(student)
                                                                    )}
                                                                    <small className="text-muted ms-1">
                                                                        ({task.students?.length || 0} studenti)
                                                                    </small>
                                                                </div>
                                                            </td>
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
                                                            <td colSpan="4" className="p-0">
                                                                <Collapse in={expandedRows.has(task.id)}>
                                                                    <div className="bg-light p-4 border-top">
                                                                        <Row>
                                                                            <Col md={8}>
                                                                                <h6>📋 Domanda Completa:</h6>
                                                                                <p className="mb-3">{task.question}</p>
                                                                                
                                                                                <h6>💬 Risposta:</h6>
                                                                                {task.answer ? (
                                                                                    <div className="bg-white p-3 rounded border">
                                                                                        <p className="mb-0">{task.answer}</p>
                                                                                    </div>
                                                                                ) : (
                                                                                    <p className="text-muted fst-italic">Nessuna risposta fornita ancora</p>
                                                                                )}
                                                                            </Col>
                                                                            <Col md={4}>
                                                                                <h6>👥 Partecipanti:</h6>
                                                                                <div className="mb-3">
                                                                                    {task.students && task.students.map((student) => (
                                                                                        <div key={student.id} className="d-flex align-items-center mb-2">
                                                                                            {Avatar(student, 28)}
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
                                </>
                            ) : (
                                <p>Solo gli insegnanti possono valutare i compiti.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Evaluation;