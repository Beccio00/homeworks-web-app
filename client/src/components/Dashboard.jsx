import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { API } from '../API/API.mjs';
import Avatar from './Avatar';
import GaugeChart from './GaugeChart';

const Dashboard = (props) => {
    const [loading, setLoading] = useState(true);
    const [studentAverage, setStudentAverage] = useState(0);
    const [totalStudents, setTotalStudents] = useState(0);

    useEffect(() => {
        if (props.user.role === 'teacher') {
            fetchTeacherStats();
        } else if (props.user.role === 'student') {
            fetchStudentStats();
        }
    }, [props.user.role]);

    const fetchTeacherStats = async () => {
        try {
            setLoading(true);
            const data = await API.getClassOverview();

            const studentsWithScores = data.students?.filter(student => student.averageScore > 0) || [];
            const classAverage = studentsWithScores.length > 0 
                ? studentsWithScores.reduce((sum, student) => sum + student.averageScore, 0) / studentsWithScores.length
                : 0;
            setStudentAverage(classAverage);
            setTotalStudents(data.students?.length || 0);
        } catch (err) {
            console.error('Errore nel caricamento statistiche insegnante:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentStats = async () => {
        try {
            setLoading(true);
            const data = await API.getClosedTasks();
            setStudentAverage(data.weightedAverage || 0);
            setTotalStudents(data.tasks?.length || 0);
        } catch (err) {
            console.error('Errore nel caricamento statistiche studente:', err);
        } finally {
            setLoading(false);
        }
    };
    return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2>Benvenuto nella tua Dashboard!</h2>
          <p className="text-muted mb-4">
            Gestisci i tuoi compiti e monitora i progressi
          </p>
        </Col>
      </Row>

      <Row className="h-100">
        <Col className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">👤 Il Tuo Profilo</h5>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="mb-3">
                <Avatar {...props.user} size={170} />
              </div>
              <h4 className="mb-1">{props.user.name} {props.user.surname}</h4>
              <p className="text-muted mb-2">{props.user.role === 'teacher' ? 'Codice insegnante: ' : 'Matricola: '}{props.user.username}</p>
              <div className="bg-light rounded p-2 mb-3">
                <span>
                  {props.user.role === 'teacher' ? '🎓 Insegnante' : '📚 Studente'}
                </span>
              </div>

            </Card.Body>
          </Card>
        </Col>

        <Col md={8} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                {props.user.role === 'teacher' ? '🏫 Dashboard Insegnante' : '📖 Dashboard Studente'}
              </h5>
            </Card.Header>
            <Card.Body>
              {props.user.role === 'teacher' ? (
                <>
                  <Row>
                    <Col sm={6} className="mb-3">
                      <Card className="h-100 border-primary">
                        <Card.Body className="text-center">
                          <div className="display-6 text-primary mb-2">📝</div>
                          <h6>Gestione Compiti</h6>
                          <p className="text-muted small">Visualizza, valuta o crea nuovi compiti per i tuoi studenti</p>
                          <Button variant="primary" as={Link} to="/tasks" className="mt-auto">
                            Vai alla Gestione
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} className="mb-3">
                      <Card className="h-100 border-info">
                        <Card.Body className="text-center">
                          <div className="display-6 text-info mb-2">📊</div>
                          <h6>Monitoraggio Classe</h6>
                          <p className="text-muted small">Visualizza gli studenti della tua classe e i loro voti</p>
                          <Button variant="info" as={Link} to="/progress" className="mt-auto">
                            Visualizza Progressi
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  
                  <Row className="mt-3">
                    <Col>
                      <Card className="border-success">
                        <Card.Body>
                          <h6 className="mb-3">📈 Media Classe</h6>
                          {loading ? (
                            <div className="text-center py-2">
                              <small>Caricamento...</small>
                            </div>
                          ) : studentAverage === 0 ? (
                            <div className="text-center py-2">
                              <small className="text-muted">Nessun dato disponibile</small>
                            </div>
                          ) : (
                            <Row>
                              <Col lg={6}>
                                <GaugeChart value={studentAverage} />
                              </Col>
                              <Col lg={6} className="d-flex align-items-center">
                                <div>
                                  <p className="mb-2">
                                    <strong>👥 Studenti totali:</strong> {totalStudents}
                                  </p>
                                  <p className="mb-2">
                                    <strong>📊 Media classe:</strong> {studentAverage.toFixed(1)}/30
                                  </p>
                                </div>
                              </Col>
                            </Row>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </>
              ) : (
                <>
                  <Row>
                    <Col className="mb-3">
                      <Card className="h-100 border-primary">
                        <Card.Body className="text-center">
                          <div className="display-6 text-primary mb-2">📋</div>
                          <h6>I Tuoi Compiti</h6>
                          <p className="text-muted small">Visualizza o completa i compiti assegnati</p>
                          <Button variant="primary" as={Link} to="/tasks" className="mt-auto">
                            Vai ai Compiti
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  
                  <Row className="mt-3">
                    <Col>
                      <Card className="border-info">
                        <Card.Body>
                          <h6 className="mb-3">⭐ La Tua Media</h6>
                          {loading ? (
                            <div className="text-center py-2">
                              <small>Caricamento...</small>
                            </div>
                          ) : studentAverage === 0 ? (
                            <div className="text-center py-2">
                              <small className="text-muted">Non hai ancora voti registrati</small>
                            </div>
                          ) : (
                            <Row>
                              <Col lg={6}>
                                <GaugeChart value={studentAverage} />
                              </Col>
                              <Col lg={6} className="d-flex align-items-center">
                                <div>
                                  <p className="mb-2">
                                    <strong>📝 Compiti completati:</strong> {totalStudents}
                                  </p>
                                  <p className="mb-2">
                                    <strong>📊 Media pesata:</strong> {studentAverage.toFixed(1)}/30
                                  </p>
                                </div>
                              </Col>
                            </Row>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
export default Dashboard;