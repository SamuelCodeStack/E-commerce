import React, { useState, useEffect } from "react";
import { Container, Form, Row, Col, Button, Alert } from "react-bootstrap";
import Select from "react-select";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { useNavigate } from "react-router-dom";

countries.registerLocale(enLocale);

export default function Checkout({ user, cartTotal, cartItems, setCartItems }) {
  const [countryOptions, setCountryOptions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [validated, setValidated] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    address1: "",
    address2: "",
    country: "",
    state: "",
    zip: "",
    payment: "",
    price: cartTotal || 0,
  });

  useEffect(() => {
    const countryList = countries.getNames("en", { select: "official" });
    const options = Object.entries(countryList).map(([code, name]) => ({
      value: code,
      label: name,
    }));
    setCountryOptions(options);
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
    }));
  }, [user]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, price: cartTotal || 0 }));
  }, [cartTotal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      country: selected ? selected.value : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Built-in form validation + custom field checks
    if (
      form.checkValidity() === false ||
      !formData.country ||
      !formData.payment
    ) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);

    const {
      firstName,
      lastName,
      address1,
      address2,
      country,
      state,
      zip,
      payment,
      price,
    } = formData;

    const orderData = {
      user_id: user?.id,
      firstName,
      lastName,
      address1,
      address2,
      country,
      state,
      zip,
      payment,
      price,
      items: cartItems,
    };

    try {
      const response = await fetch("http://localhost:5000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Order placed successfully!");
        setCartItems([]);
        navigate("/orders");
      } else {
        alert("Checkout failed: " + result.error);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout.");
    }
  };

  return (
    <Container className="my-5">
      <h2 className="mb-4">Checkout</h2>

      {submitted && <Alert variant="success">Order placed successfully!</Alert>}

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <h5 className="mb-3">Billing address</h5>

        <Row>
          <Col md={6}>
            <Form.Group controlId="firstName" className="mb-3">
              <Form.Label>First name</Form.Label>
              <Form.Control
                required
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Required
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="lastName" className="mb-3">
              <Form.Label>Last name</Form.Label>
              <Form.Control
                required
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Required
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group controlId="address1" className="mb-3">
          <Form.Label>Address</Form.Label>
          <Form.Control
            required
            type="text"
            name="address1"
            value={formData.address1}
            onChange={handleChange}
          />
          <Form.Control.Feedback type="invalid">
            Please enter your address.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="address2" className="mb-3">
          <Form.Label>Address 2 (Optional)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Apartment or suite"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
          />
        </Form.Group>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="country">
              <Form.Label>Country</Form.Label>
              <Select
                options={countryOptions}
                onChange={handleCountryChange}
                value={countryOptions.find(
                  (option) => option.value === formData.country
                )}
                placeholder="Select a country"
                isClearable
              />
              {!formData.country && validated && (
                <div className="invalid-feedback d-block">
                  Please select a country.
                </div>
              )}
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group controlId="state">
              <Form.Label>State</Form.Label>
              <Form.Control
                required
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Required
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group controlId="zip">
              <Form.Label>Zip</Form.Label>
              <Form.Control
                required
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Zip code required
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <h5 className="mt-4">Payment</h5>
        <Form.Group className="mt-3">
          <Form.Check
            required
            type="radio"
            label="Cash on delivery"
            name="payment"
            value="cod"
            checked={formData.payment === "cod"}
            onChange={handleChange}
            isInvalid={validated && !formData.payment}
            feedback="Please select a payment method"
            feedbackType="invalid"
          />
        </Form.Group>

        <div className="mt-4 fw-bold">Total: ${formData.price.toFixed(2)}</div>

        <Button type="submit" variant="warning" className="mt-4 w-100">
          Confirm
        </Button>
      </Form>
    </Container>
  );
}
