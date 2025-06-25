import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BsFileText,
  BsCart3,
  BsSearch,
  BsGear,
  BsBoxArrowRight,
  BsBoxSeam,
  BsTags,
} from "react-icons/bs";
import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Form,
  InputGroup,
  FormControl,
  Button,
} from "react-bootstrap";

export default function Header({
  search,
  setSearch,
  categories = [],
  selectedCategory,
  setSelectedCategory,
  user,
  setUser,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const hideExtras =
    (location.pathname === "/" || location.pathname === "/login") && !user;

  const handleSearch = (e) => {
    e.preventDefault();
    navigate("/itemcard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user"); // ✅ clear from localStorage
    navigate("/");
  };

  const level = Number(user?.level || 0);

  return (
    <Navbar bg="light" expand="lg" className="py-3 shadow-sm">
      <Container>
        <Navbar.Brand href="#" onClick={() => navigate("/")}>
          E-COMMERCE
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-end">
          <Nav className="align-items-center gap-3 me-3">
            <Nav.Link onClick={() => navigate("/")}>Home</Nav.Link>

            {!hideExtras && (
              <NavDropdown
                title={selectedCategory || "Categories"}
                id="categories-dropdown"
                onSelect={(eventKey) => {
                  setSelectedCategory(eventKey);
                  navigate("/itemcard");
                }}
              >
                {categories.length > 0 ? (
                  categories.map((cat, index) => (
                    <NavDropdown.Item key={index} eventKey={cat}>
                      {cat}
                    </NavDropdown.Item>
                  ))
                ) : (
                  <NavDropdown.Item disabled>No categories</NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item eventKey="">All Categories</NavDropdown.Item>
              </NavDropdown>
            )}

            {user && (
              <Nav.Link onClick={() => navigate("/cart")}>
                <BsCart3 size={20} />
              </Nav.Link>
            )}

            {user ? (
              <NavDropdown
                title={`${user.first_name} ${user.last_name}`}
                id="user-dropdown"
                align="end"
              >
                {(level === 1 || level === 2) && (
                  <>
                    <NavDropdown.Item onClick={() => navigate("/items")}>
                      <BsBoxSeam className="me-2" /> Products
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => navigate("/categorylist")}>
                      <BsTags className="me-2" /> Categories
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => navigate("/pages")}>
                      <BsFileText className="me-2" /> Pages
                    </NavDropdown.Item>
                  </>
                )}

                {level === 1 && (
                  <NavDropdown.Item onClick={() => navigate("/users")}>
                    <BsGear className="me-2" /> Users
                  </NavDropdown.Item>
                )}

                <NavDropdown.Divider />

                {(level === 1 || level === 2 || level === 3) && (
                  <NavDropdown.Item onClick={() => navigate("/orderlist")}>
                    <BsBoxSeam className="me-2" /> My Orders
                  </NavDropdown.Item>
                )}

                <NavDropdown.Item onClick={handleLogout}>
                  <BsBoxArrowRight className="me-2" /> Log Out
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Button variant="warning" onClick={() => navigate("/login")}>
                Login
              </Button>
            )}
          </Nav>

          {location.pathname === "/itemcard" && (
            <Form className="d-flex" onSubmit={handleSearch}>
              <InputGroup>
                <FormControl
                  type="search"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <InputGroup.Text
                  style={{ cursor: "pointer" }}
                  onClick={handleSearch}
                >
                  <BsSearch />
                </InputGroup.Text>
              </InputGroup>
            </Form>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
