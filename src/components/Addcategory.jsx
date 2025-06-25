import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

export default function Addcategory({ addCategory }) {
  const [category, setCategory] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);
  const [alertVariant, setAlertVariant] = useState("success");

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = category.trim();
    if (trimmed === "") {
      setAlertVariant("danger");
      setAlertMsg("Please enter a category name.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });

      if (!res.ok) throw new Error("Failed to add category");

      addCategory(trimmed); // Update frontend dropdown
      setCategory(""); // Clear input
      setAlertVariant("success");
      setAlertMsg("✅ Category added successfully!");
    } catch (err) {
      console.error(err.message);
      setAlertVariant("danger");
      setAlertMsg("❌ Failed to add category.");
    }
  };

  return (
    <Container className="my-5">
      <h4 className="mb-4">Add Category</h4>

      {alertMsg && (
        <Alert
          variant={alertVariant}
          onClose={() => setAlertMsg(null)}
          dismissible
        >
          {alertMsg}
        </Alert>
      )}

      <Form onSubmit={handleAddCategory}>
        <Row className="align-items-center">
          <Col xs={9} sm={10}>
            <Form.Control
              type="text"
              placeholder="Enter category name"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Col>
          <Col xs={3} sm={2}>
            <Button type="submit" variant="warning" className="w-100">
              Add
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
