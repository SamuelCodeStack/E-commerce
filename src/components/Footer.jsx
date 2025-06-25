import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col } from "react-bootstrap";
import { BsFacebook, BsTwitter, BsInstagram } from "react-icons/bs";
import { NavLink } from "react-router-dom";

export default function Footer() {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/pages");
        const data = await res.json();
        setPages(data);
      } catch (error) {
        console.error("Error fetching pages for footer:", error);
      }
    };

    fetchPages();
  }, []);

  return (
    <footer id="footer" className="py-4 mt-5 bg-light border-top">
      <Container>
        <Row className="align-items-start">
          {/* Company Info */}
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="fw-bold">E-COMMERCE</h5>
            <p className="small">
              Your go-to shop for modern fashion and lifestyle.
            </p>
          </Col>

          {/* Dynamic Page Links */}
          <Col md={4} className="mb-3 mb-md-0">
            <h6 className="fw-bold">Quick Pages</h6>
            <ul className="list-unstyled small">
              {pages.map((page) => (
                <li key={page.id}>
                  <NavLink
                    to={`/pages/${page.id}`}
                    className="text-decoration-none text-dark"
                  >
                    {page.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </Col>

          {/* Social Icons */}
          <Col md={4} className="text-md-end">
            <h6 className="fw-bold">Follow Us</h6>
            <div className="d-flex gap-3 justify-content-md-end">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-dark"
              >
                <BsFacebook />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-dark"
              >
                <BsTwitter />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-dark"
              >
                <BsInstagram />
              </a>
            </div>
          </Col>
        </Row>

        {/* Bottom Line */}
        <hr className="my-3" />
        <div className="text-center small">
          &copy; {new Date().getFullYear()} E-COMMERCE. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
