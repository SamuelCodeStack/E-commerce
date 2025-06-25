import React from "react";
import { useNavigate } from "react-router-dom"; // 🆕 Import navigate
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Carousel, Button, Container, Row, Col } from "react-bootstrap";

export default function Homepage() {
  const navigate = useNavigate(); // 🆕 Hook to navigate

  return (
    <Container className="my-5">
      <Row>
        {/* Left Column - Carousel */}
        <Col md={6}>
          <Carousel style={{ maxHeight: "400px", overflow: "hidden" }}>
            <Carousel.Item>
              <img
                className="d-block"
                src="/images/1.png"
                alt="First slide"
                style={{ objectFit: "contain", height: "400px", width: "100%" }}
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block"
                src="/images/2.png"
                alt="Second slide"
                style={{ objectFit: "contain", height: "400px", width: "100%" }}
              />
            </Carousel.Item>
          </Carousel>
        </Col>

        {/* Right Column - Info */}
        <Col md={6} className="d-flex flex-column justify-content-center">
          <h1 className="mb-3">New Arrival</h1>
          <p className="mb-4">
            Check out our latest clothing collection, featuring stylish and
            comfortable pieces perfect for any occasion.
          </p>
          <Button
            variant="warning"
            className="text-dark fw-bold"
            onClick={() => navigate("/itemcard")} // 🆕 Navigate to /items
          >
            SHOP NOW
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
