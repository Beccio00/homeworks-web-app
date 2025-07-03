import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { API } from '../API/API.mjs';

const CreateTasks = (props) => {
    const [question, setQuestion] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [failedGroupIndices, setFailedGroupIndices] = useState([]);
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

    const createGroup = () => {
        if (selectedStudents.length < 2 || selectedStudents.length > 6) {
            setError('Seleziona da 2 a 6 studenti per creare un gruppo');
            return;
        }

        const newGroup = selectedStudents.map(id => 
            students.find(student => student.id === id)
        );
        
        setGroups([...groups, newGroup]);
        setSelectedStudents([]);
        setError('');
    };

    const removeGroup = (index) => {
        setGroups(groups.filter((_, i) => i !== index));
        // Aggiorna anche gli indici dei gruppi falliti
        setFailedGroupIndices(failedGroupIndices
            .filter(failedIndex => failedIndex !== index)
            .map(failedIndex => failedIndex > index ? failedIndex - 1 : failedIndex)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setFailedGroupIndices([]);
        setLoading(true);

        if (!question.trim()) {
            setError('Inserisci una domanda per il compito');
            setLoading(false);
            return;
        }

        if (groups.length === 0) {
            setError('Crea almeno un gruppo di studenti');
            setLoading(false);
            return;
        }

        try {
            const results = [];
            const failedGroups = [];
            
            // Prova a creare ogni gruppo
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                try {
                    const studentIds = group.map(student => student.id);
                    await API.createTask({
                        question: question.trim(),
                        studentIds: studentIds
                    });
                    results.push({ groupIndex: i + 1, success: true });
                } catch (err) {
                    // Gruppo non valido (probabilmente studenti già assegnati insieme)
                    failedGroups.push({ 
                        groupIndex: i + 1, 
                        group: group,
                        error: err.message 
                    });
                    results.push({ groupIndex: i + 1, success: false, error: err.message });
                }
            }
            
            // Gestisci i risultati
            const successfulGroups = results.filter(r => r.success).length;
            
            if (successfulGroups > 0 && failedGroups.length === 0) {
                // Tutti i gruppi creati con successo
                setSuccess(`Compito creato con successo per tutti i ${successfulGroups} gruppi!`);
                setQuestion('');
                setGroups([]);
                setSelectedStudents([]);
            } else if (successfulGroups > 0 && failedGroups.length > 0) {
                // Alcuni gruppi creati, altri falliti
                setSuccess(`Compito creato per ${successfulGroups} gruppi.`);
                setError(`Impossibile creare il compito per ${failedGroups.length} gruppi: alcuni studenti potrebbero essere già stati assegnati insieme in precedenza. Controlla i gruppi evidenziati.`);
                
                // Memorizza gli indici dei gruppi falliti per evidenziarli
                const failedIndices = failedGroups.map(fg => fg.groupIndex - 1);
                setFailedGroupIndices(failedIndices);
                
                // Rimuovi i gruppi creati con successo, mantieni quelli falliti
                const remainingGroups = groups.filter((_, index) => 
                    failedGroups.some(fg => fg.groupIndex === index + 1)
                );
                setGroups(remainingGroups);
            } else {
                // Nessun gruppo creato
                setError(`Impossibile creare il compito per nessun gruppo. Motivo: alcuni studenti potrebbero essere già stati assegnati insieme in precedenza. Verifica la composizione dei gruppi.`);
                // Evidenzia tutti i gruppi come falliti
                setFailedGroupIndices(groups.map((_, index) => index));
            }
            
        } catch (err) {
            setError(`Errore generale: ${err.message}`);
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
                                <Row>
                                    <Col md={8}>
                                        <p className="mb-3">Seleziona da 2 a 6 studenti per creare un gruppo:</p>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="border rounded p-3">
                                            {students.map((student) => (
                                                <Form.Check
                                                    key={student.id}
                                                    type="checkbox"
                                                    id={`student-${student.id}`}
                                                    label={`${student.name} ${student.surname} (${student.username})`}
                                                    checked={selectedStudents.includes(student.id)}
                                                    onChange={(e) => handleStudentChange(student.id, e.target.checked)}
                                                    disabled={loading}
                                                    className="mb-2"
                                                />
                                            ))}
                                        </div>
                                        <div className="mt-2">
                                            <small className="text-muted">
                                                Selezionati: {selectedStudents.length} studenti
                                            </small>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <Button 
                                            variant="success" 
                                            onClick={createGroup}
                                            disabled={selectedStudents.length < 2 || selectedStudents.length > 6 || loading}
                                            className="w-100"
                                        >
                                            ➕ Crea Gruppo
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0">📋 Gruppi Creati ({groups.length})</h5>
                            </Card.Header>
                            <Card.Body>
                                {groups.length === 0 ? (
                                    <p className="text-muted">Nessun gruppo creato ancora</p>
                                ) : (
                                    groups.map((group, index) => {
                                        const isFailed = failedGroupIndices.includes(index);
                                        return (
                                            <div 
                                                key={index} 
                                                className={`border rounded p-3 mb-3 ${isFailed ? 'bg-danger-subtle border-danger' : 'bg-light'}`}
                                            >
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <h6>
                                                            Gruppo {index + 1}
                                                            {isFailed && (
                                                                <Badge bg="danger" className="ms-2">
                                                                    ⚠️ Non valido
                                                                </Badge>
                                                            )}
                                                        </h6>
                                                        <div>
                                                            {group.map((student, studentIndex) => (
                                                                <Badge key={student.id} bg="primary" className="me-1 mb-1">
                                                                    {student.name} {student.surname}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        {isFailed && (
                                                            <small className="text-danger mt-1 d-block">
                                                                Alcuni studenti di questo gruppo potrebbero essere già stati assegnati insieme
                                                            </small>
                                                        )}
                                                    </div>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm"
                                                        onClick={() => removeGroup(index)}
                                                        disabled={loading}
                                                    >
                                                        ❌
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </Card.Body>
                        </Card>

                        <div className="d-flex justify-content-end mb-5" >
                            <Button 
                                type="submit" 
                                variant="primary" 
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? 'Creazione in corso...' : `Crea Compito per ${groups.length} Gruppo/i`}
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default CreateTasks;