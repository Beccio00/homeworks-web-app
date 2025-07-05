import { Navbar, Nav, Button, Container, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Avatar from './Avatar';

function NavHeader() {
  const { loggedIn, user, handleLogout } = useContext(AuthContext);
  
  if (!loggedIn) {
    return null;
  }

  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container className="d-flex justify-content-between align-items-center">
        <Nav>
          <Nav.Link as={Link} to="/" className="text-white">
            🏠 Home
          </Nav.Link>
        </Nav>
        
        <Navbar.Brand as={Link} to="/" className="position-absolute start-50 translate-middle-x">
          Compiti App
        </Navbar.Brand>
        
        <Nav className="ms-auto">
          <Dropdown align="end">
            <Dropdown.Toggle 
              as="div" 
              bsPrefix="custom"
              className="d-flex align-items-center" 
              style={{ cursor: 'pointer', border: 'none', background: 'none' }}
            >
              <Avatar {...user} size={40} />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                🚪 Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavHeader;
