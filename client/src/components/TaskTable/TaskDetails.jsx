import { useState } from 'react';
import { Row, Col, Form, Button, Badge } from 'react-bootstrap';
import Avatar from '../Avatar';

const UserInfo = ({ user, size = 28, showUsername = true }) => (
    <div className="d-flex align-items-center mb-2">
        <Avatar {...user} size={size} />
        <div className="ms-1">
            <span className="small fw-medium">
                {user.name} {user.surname}
            </span>
            {showUsername && (
                <>
                    <br />
                    <small className="text-muted">
                        {user.username}
                    </small>
                </>
            )}
        </div>
    </div>
);

const GroupInfo = ({ students, title = "👥 Gruppo:" }) => (
    <div className="mb-3">
        <h6>{title}</h6>
        {students && students.map((student, index) => (
            <UserInfo key={student.id || index} user={student} />
        ))}
    </div>
);

const ScoreDisplay = ({ score, title = "⭐ Punteggio:" }) => (
    <div className="mt-3">
        <h6>{title}</h6>
        <Badge bg="success" className="fs-6 p-2">
            {score}/30
        </Badge>
    </div>
);

const TaskDetails = ({ 
    task, 
    isTeacher, 
    isStudent, 
    scoringTask, 
    editingAnswer, 
    onScoreSubmit, 
    onAnswerSubmit, 
    onStartEditingAnswer, 
    onCancelEditingAnswer 
}) => {
    const [scoreValue, setScoreValue] = useState('');
    const [answerValue, setAnswerValue] = useState(task.answer || '');

    const handleScoreSubmit = () => {
        onScoreSubmit(task.id, scoreValue);
        setScoreValue('');
    };

    const handleAnswerSubmit = () => {
        onAnswerSubmit(task.id, answerValue);
    };

    const handleStartEditingAnswer = () => {
        setAnswerValue(task.answer || '');
        onStartEditingAnswer(task.id);
    };

    return (
        <Row>
            <Col md={8}>
                <h6>📋 Domanda Completa:</h6>
                <p className="mb-3">{task.question}</p>
                
                <h6>📝 Risposta:</h6>
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
                                onClick={handleAnswerSubmit}
                            >
                                Salva Risposta
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onCancelEditingAnswer()}
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
                        {isStudent && task.status === 'open' && (
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={handleStartEditingAnswer}
                            >
                                {task.answer ? 'Modifica Risposta' : 'Aggiungi Risposta'}
                            </Button>
                        )}
                    </div>
                )}
            </Col>
            <Col md={4}>
                <GroupInfo students={task.students} />
                
                {isStudent && task.teacher && (
                    <div className="mb-3">
                        <h6>👨‍🏫 Insegnante:</h6>
                        <UserInfo user={task.teacher} size={32} />
                    </div>
                )}
                
                {isTeacher && task.answer && task.score === null && (
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
                            onClick={handleScoreSubmit}
                            disabled={scoringTask === task.id || !scoreValue.trim()}
                        >
                            {scoringTask === task.id ? 'Assegnazione...' : 'Assegna Punteggio'}
                        </Button>
                    </div>
                )}

                {task.score !== null && (
                    <ScoreDisplay 
                        score={task.score} 
                        title={isTeacher ? "✅ Punteggio Assegnato:" : "⭐ Punteggio:"} 
                    />
                )}
            </Col>
        </Row>
    );
};

export default TaskDetails;
