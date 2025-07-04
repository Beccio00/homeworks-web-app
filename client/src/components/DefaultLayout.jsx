import { Alert, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import NavHeader from "./NavHeader";

function DefaultLayout(props) {
  return(
    <>
      <NavHeader loggedIn={props.loggedIn} handleLogout={props.handleLogout} user={props.user} />
      <Container fluid className="mt-3">
        {props.message && <Row>
          <Alert variant={props.message.type} onClose={() => props.setMessage('')} dismissible>{props.message.msg}</Alert>
        </Row>}
        <Outlet />
      </Container>
    </>
  );
}

export default DefaultLayout;
