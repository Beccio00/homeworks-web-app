import { Navbar, Nav, Button, Container, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Avatar from './Avatar';

function NavHeader() {
  const { loggedIn, user, handleLogout } = useContext(AuthContext);
  
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container className={loggedIn ? "d-flex justify-content-between align-items-center" : ""}>
        {loggedIn && (
          <Nav>
            <Nav.Link as={Link} to="/" className="text-white">
              🏠 Home
            </Nav.Link>
          </Nav>
        )}
        
        <Navbar.Brand 
          as={Link} 
          to="/" 
          className={loggedIn ? "position-absolute start-50 translate-middle-x" : "text-white"}
        >
          Compiti App
        </Navbar.Brand>
        
        <Nav className="ms-auto">
          {loggedIn ? (
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
          ) : (
            <Button as={Link} to="/login" variant="outline-light">
              Login
            </Button>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavHeader;
