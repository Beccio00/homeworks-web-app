import { Alert, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import NavHeader from "./NavHeader";

function DefaultLayout() {
  const { message, setMessage } = useContext(AuthContext);
  
  return(
    <>
      <NavHeader />
      <Container fluid className="mt-3">
        {message && <Row>
          <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
        </Row>}
        <Outlet />
      </Container>
    </>
  );
}

export default DefaultLayout;
