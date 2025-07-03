import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NavHeader({ loggedIn, handleLogout }) {
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          📚 Compiti App
        </Navbar.Brand>
        
        {loggedIn && (
          <Nav className="ms-auto">
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        )}
      </Container>
    </Navbar>
  );
}

export default NavHeader;
