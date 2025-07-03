import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';

const Dashboard = (props) => {
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

      <Row>
        {/* Colonna sinistra - Profilo utente */}
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">👤 Il Tuo Profilo</h5>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="mb-3">
                <Avatar {...props.user} size={170} />
              </div>
              <h4 className="mb-1">{props.user.name} {props.user.surname}</h4>
              <p className="text-muted mb-2">{props.user.role === 'teacher' ? 'Codice insegnante: ' : 'Metricola: '}{props.user.username}</p>
              <div className="bg-light rounded p-2 mb-3">
                <span className={`ms-1`}>
                  {props.user.role === 'teacher' ? '🎓 Insegnante' : '📚 Studente'}
                </span>
              </div>

            </Card.Body>
          </Card>
        </Col>

        {/* Colonna destra - Funzionalità */}
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                {props.user.role === 'teacher' ? '🏫 Dashboard Insegnante' : '📖 Dashboard Studente'}
              </h5>
            </Card.Header>
            <Card.Body>
              {props.user.role === 'teacher' ? (
                <Row>
                  <Col sm={6} className="mb-3">
                    <Card className="h-100 border-primary">
                      <Card.Body className="text-center">
                        <div className="display-6 text-primary mb-2">📝</div>
                        <h6>Gestione Compiti</h6>
                        <p className="text-muted small">Crea e gestisci i compiti per i tuoi studenti</p>
                        <Button variant="primary" as={Link} to="/tasks" className="mt-auto">
                          Vai ai Compiti
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <Card className="h-100 border-success">
                      <Card.Body className="text-center">
                        <div className="display-6 text-success mb-2">👥</div>
                        <h6>Valutazione</h6>
                        <p className="text-muted small">Visualizza e valuta le consegne degli studenti</p>
                        <Button variant="success" as={Link} to="/evaluation" className="mt-auto">
                          Vai alle Valutazioni
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={12}>
                    <Card className="border-info">
                      <Card.Body className="text-center">
                        <div className="display-6 text-info mb-2">📊</div>
                        <h6>Monitoraggio Classe</h6>
                        <p className="text-muted small">Monitora i progressi e le statistiche della tua classe</p>
                        <Button variant="info" as={Link} to="/progress" className="mt-auto">
                          Visualizza Progressi
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col sm={6} className="mb-3">
                    <Card className="h-100 border-primary">
                      <Card.Body className="text-center">
                        <div className="display-6 text-primary mb-2">📋</div>
                        <h6>I Tuoi Compiti</h6>
                        <p className="text-muted small">Visualizza i compiti assegnati</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <Card className="h-100 border-warning">
                      <Card.Body className="text-center">
                        <div className="display-6 text-warning mb-2">📤</div>
                        <h6>Consegne</h6>
                        <p className="text-muted small">Consegna i tuoi lavori</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <Card className="h-100 border-success">
                      <Card.Body className="text-center">
                        <div className="display-6 text-success mb-2">🏆</div>
                        <h6>I Tuoi Voti</h6>
                        <p className="text-muted small">Visualizza le tue valutazioni</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <Card className="h-100 border-info">
                      <Card.Body className="text-center">
                        <div className="display-6 text-info mb-2">📈</div>
                        <h6>Progressi</h6>
                        <p className="text-muted small">Monitora i tuoi progressi</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
export default Dashboard;