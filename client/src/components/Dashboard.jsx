import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Dashboard = (props) => {
    return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2>Benvenuto, {props.user.name}!</h2>
          <p className="text-muted mb-4">
            Ruolo: <strong>{props.user.role === 'teacher' ? 'Insegnante' : 'Studente'}</strong>
          </p>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Informazioni Profilo</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={6}>
                  <strong>Nome Completo:</strong> {props.user.name} {props.user.surname}
                </Col>
                <Col sm={6}>
                  <strong>Nome Utente:</strong> {props.user.username}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">
                {props.user.role === 'teacher' ? 'Dashboard Insegnante' : 'Dashboard Studente'}
              </h5>
            </Card.Header>
            <Card.Body>
              {props.user.role === 'teacher' ? (
                <div className="text-center">
                  <Button variant="primary" className="d-block mb-2" as={Link} to="/tasks">
                    📝 Crea e gestisci compiti
                  </Button>
                  <Button variant="primary" className="d-block mb-2" as={Link} to="/evaluation">
                    👥 Visualizza e valuta consegne studenti
                  </Button>
                  <Button variant="primary" className="d-block" as={Link} to="/progress">
                    📊 Monitora i progressi della classe
                  </Button>
                </div>
              ) : (
                <ul className="list-unstyled">
                  <li className="mb-2">📋 Visualizza i tuoi compiti</li>
                  <li className="mb-2">📤 Consegna i tuoi lavori</li>
                  <li className="mb-2">🏆 Visualizza i tuoi voti</li>
                  <li className="mb-2">📈 Monitora i tuoi progressi</li>
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
export default Dashboard;