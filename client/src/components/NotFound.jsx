import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <Container className="text-center mt-5">
      <h1 className="display-1 text-muted">404</h1>
      <h2 className="mb-3">Pagina Non Trovata</h2>
      <p className="lead mb-4">
        Pagina non trovata non c'è nulla da vedere qui.
      </p>
      <Button as={Link} to="/" variant="primary" size="lg">
        Torna indietro
      </Button>
    </Container>
  );
}

export default NotFound;
