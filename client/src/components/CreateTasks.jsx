import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { API } from '../API/API.mjs';
import Avatar from './Avatar';

const CreateTasks = (props) => {
    const [question, setQuestion] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const studentsData = await API.getStudents();
                setStudents(studentsData);
            } catch (err) {
                setError('Errore nel caricamento degli studenti');
            }
        };
        fetchStudents();
    }, []);

    const handleStudentChange = (studentId, isChecked) => {
        if (isChecked) {
            setSelectedStudents([...selectedStudents, studentId]);
        } else {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!question.trim()) {
            setError('Inserisci una domanda per il compito');
            setLoading(false);
            return;
        }

        if (selectedStudents.length < 2 || selectedStudents.length > 6) {
            setError('Seleziona da 2 a 6 studenti per il gruppo');
            setLoading(false);
            return;
        }

        try {
            await API.createTask({
                question: question.trim(),
                studentIds: selectedStudents
            });
            
            setSuccess('Compito creato con successo!');
            setQuestion('');
            setSelectedStudents([]);
            
        } catch (err) {
            setError(`Errore nella creazione del compito: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    return(
        <Container className="mt-4">
            <Row>
                <Col>
                    <h2>Crea Nuovi Compiti</h2>
                    <p className="text-muted mb-4">
                        Benvenuto, {props.user.name}! Qui puoi creare e gestire i compiti per i tuoi studenti.
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

                    <Form onSubmit={handleSubmit}>
                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0">📝 Domanda del Compito</h5>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group>
                                    <Form.Label>Inserisci la domanda</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder="Scrivi qui la domanda del compito..."
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>

                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0">👥 Selezione Studenti</h5>
                            </Card.Header>
                            <Card.Body>
                                <p className="mb-3">Seleziona da 2 a 6 studenti per il gruppo:</p>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="border rounded p-3">
                                    {students.map((student) => (
                                        <Form.Check
                                            key={student.id}
                                            type="checkbox"
                                            id={`student-${student.id}`}
                                            checked={selectedStudents.includes(student.id)}
                                            onChange={(e) => handleStudentChange(student.id, e.target.checked)}
                                            disabled={loading}
                                            className="mb-2"
                                            label={
                                                <div className="d-flex align-items-center">
                                                    <Avatar {...student} size={32} />
                                                    <span className="ms-2">
                                                        {student.surname} {student.name} ({student.username})
                                                    </span>
                                                </div>
                                            }
                                        />
                                    ))}
                                </div>
                                <div className="mt-3 d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                        Selezionati: {selectedStudents.length} studenti
                                        {selectedStudents.length > 0 && (
                                            <span className={selectedStudents.length >= 2 && selectedStudents.length <= 6 ? "text-success" : "text-danger"}>
                                                {selectedStudents.length < 2 && " (minimo 2)"}
                                                {selectedStudents.length > 6 && " (massimo 6)"}
                                                {selectedStudents.length >= 2 && selectedStudents.length <= 6 && " ✓"}
                                            </span>
                                        )}
                                    </small>
                                    {selectedStudents.length > 0 && (
                                        <Button 
                                            variant="outline-secondary" 
                                            size="sm"
                                            onClick={() => setSelectedStudents([])}
                                            disabled={loading}
                                        >
                                            Deseleziona Tutti
                                        </Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>

                        <div className="d-flex justify-content-end mb-5">
                            <Button 
                                type="submit" 
                                variant="primary" 
                                size="lg"
                                disabled={loading || selectedStudents.length < 2 || selectedStudents.length > 6}
                            >
                                {loading ? 'Creazione in corso...' : `Crea Compito per ${selectedStudents.length} Studenti`}
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default CreateTasks;