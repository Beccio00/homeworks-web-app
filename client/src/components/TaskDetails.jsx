import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, Button, ButtonGroup } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import { API } from '../API/API.mjs';
import Avatar from './Avatar';

const TaskDetails = () => {
    const { user } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [totalStats, setTotalStats] = useState({ totalOpenTasks: 0, totalClosedTasks: 0, totalTasks: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        if (user.role === 'teacher') {
            fetchClassOverview();
        }
    }, [user.role]);

    const fetchClassOverview = async () => {
        try {
            setLoading(true);
            const data = await API.getClassOverview();
            setStudents(data.students || []);
            setTotalStats({
                totalOpenTasks: data.totalOpenTasks || 0,
                totalClosedTasks: data.totalClosedTasks || 0,
                totalTasks: data.totalTasks || 0
            });
        } catch (err) {
            setError('Errore nel caricamento dello stato della classe: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getScoreBadgeVariant = (score) => {
        if (score >= 28) return 'success';
        if (score >= 24) return 'primary';
        if (score >= 18) return 'warning';
        return 'danger';
    };

    const getTasksStatusText = (openTasks, closedTasks, totalTasks) => {
        return `${closedTasks}/${totalTasks} completati`;
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getSortedStudents = () => {
        const sorted = [...students].sort((a, b) => {
            let valueA, valueB;
            
            switch (sortBy) {
                case 'name':
                    valueA = `${a.surname} ${a.name}`.toLowerCase();
                    valueB = `${b.surname} ${b.name}`.toLowerCase();
                    break;
                case 'totalTasks':
                    valueA = a.totalTasks;
                    valueB = b.totalTasks;
                    break;
                case 'averageScore':
                    valueA = a.averageScore || 0;
                    valueB = b.averageScore || 0;
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        return sorted;
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return '';
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    return (
        <Container className="mt-4">
            <Row>
                <Col>
                    <h2>Stato Generale della Classe</h2>
                    <p className="text-muted mb-4">
                        Panoramica completa dei progressi degli studenti per i tuoi compiti assegnati.
                    </p>

                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">📊 Riepilogo Studenti</h5>
                        </Card.Header>
                        <Card.Body>
                            {user.role === 'teacher' ? (
                                <>
                                    {loading ? (
                                        <div className="text-center">
                                            <p>Caricamento stato della classe...</p>
                                        </div>
                                    ) : students.length === 0 ? (
                                        <div className="text-center">
                                            <p className="text-muted">Nessuno studente trovato o nessun compito assegnato ancora.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Statistiche generali */}
                                            <Row className="mb-4">
                                                <Col md={3}>
                                                    <div className="text-center">
                                                        <h4 className="text-primary">{students.length}</h4>
                                                        <small className="text-muted">Studenti Totali</small>
                                                    </div>
                                                </Col>
                                                <Col md={3}>
                                                    <div className="text-center">
                                                        <h4 className="text-success">{totalStats.totalClosedTasks}</h4>
                                                        <small className="text-muted">Compiti Chiusi</small>
                                                    </div>
                                                </Col>
                                                <Col md={3}>
                                                    <div className="text-center">
                                                        <h4 className="text-warning">{totalStats.totalOpenTasks}</h4>
                                                        <small className="text-muted">Compiti Aperti</small>
                                                    </div>
                                                </Col>
                                                <Col md={3}>
                                                    <div className="text-center">
                                                        <h4 className="text-info">{totalStats.totalTasks}</h4>
                                                        <small className="text-muted">Compiti Totali</small>
                                                    </div>
                                                </Col>
                                            </Row>

                                            {/* Controlli di ordinamento */}
                                            <Row className="mb-3">
                                                <Col>
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-3 text-muted">Ordina per:</span>
                                                        <ButtonGroup size="sm">
                                                            <Button 
                                                                variant={sortBy === 'name' ? 'primary' : 'outline-secondary'}
                                                                onClick={() => handleSort('name')}
                                                            >
                                                                AZ {getSortIcon('name')}
                                                            </Button>
                                                            <Button 
                                                                variant={sortBy === 'totalTasks' ? 'primary' : 'outline-secondary'}
                                                                onClick={() => handleSort('totalTasks')}
                                                            >
                                                                N° Compiti {getSortIcon('totalTasks')}
                                                            </Button>
                                                            <Button 
                                                                variant={sortBy === 'averageScore' ? 'primary' : 'outline-secondary'}
                                                                onClick={() => handleSort('averageScore')}
                                                            >
                                                                Voto {getSortIcon('averageScore')}
                                                            </Button>
                                                        </ButtonGroup>
                                                    </div>
                                                </Col>
                                            </Row>

                                            {/* Tabella dettagliata */}
                                            <Table responsive hover>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '50%' }}>Studente</th>
                                                        <th style={{ width: '17%' }}>Aperti</th>
                                                        <th style={{ width: '17%' }}>Chiusi</th>
                                                        <th style={{ width: '16%' }}>Media</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getSortedStudents().map((student) => (
                                                        <tr key={student.id}>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <Avatar {...student} size={40} />
                                                                    <div>
                                                                        <div className="fw-medium">
                                                                            {student.surname} {student.name}
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            {student.username}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <Badge bg={student.openTasks > 0 ? "warning" : "secondary"}>
                                                                    {student.openTasks}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <Badge bg={student.closedTasks > 0 ? "success" : "secondary"}>
                                                                    {student.closedTasks}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                {student.averageScore > 0 ? (
                                                                    <Badge 
                                                                        bg={getScoreBadgeVariant(student.averageScore)}
                                                                        className="fs-6 p-2"
                                                                    >
                                                                        {student.averageScore}/30
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-muted">-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </>
                                    )}
                                </>
                            ) : (
                                <p>Solo gli insegnanti possono visualizzare lo stato della classe.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default TaskDetails;
