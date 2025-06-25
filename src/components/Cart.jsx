import React, { useState } from "react";
import { Container, Table, Button, Alert, Row, Col } from "react-bootstrap";
import { BsTrash } from "react-icons/bs";
import { useNavigate } from "react-router-dom"; // ← import this

export default function Cart({ cartItems, handleRemoveFromCart }) {
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate(); // ← hook for navigation

  const handleRemove = (id) => {
    handleRemoveFromCart(id);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <Container className="my-5">
      <h4 className="mb-4">Shopping Cart</h4>

      {showAlert && (
        <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
          Item removed from cart.
        </Alert>
      )}

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Image</th>
                <th>Item</th>
                <th>Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img
                      src={item.image}
                      alt={item.name}
                      width="50"
                      height="50"
                      style={{ objectFit: "cover" }}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemove(item.id)}
                    >
                      <BsTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Total & Checkout */}
          <Row className="justify-content-end align-items-center mt-4">
            <Col md="auto">
              <h5>Total: ${totalPrice.toFixed(2)}</h5>
            </Col>
            <Col md="auto">
              <Button variant="success" onClick={() => navigate("/checkout")}>
                Checkout
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}
