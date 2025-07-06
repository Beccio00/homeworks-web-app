import { Alert, Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import NavHeader from "./NavHeader";

function DefaultLayout() {
  const { message, setMessage } = useContext(AuthContext);
  
  return(
    <>
      <NavHeader />
      
      {message && (
        <Alert 
          variant={message.type} 
          onClose={() => setMessage('')} 
          dismissible
          className="position-fixed top-0 start-50 translate-middle-x mt-2"
          style={{ 
            zIndex: 1050,
            minWidth: '300px',
            maxWidth: '500px'
          }}
        >
          {message.msg}
        </Alert>
      )}
      
      <Container fluid className="mt-3">
        <Outlet />
      </Container>
    </>
  );
}

export default DefaultLayout;
