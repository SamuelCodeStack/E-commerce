import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function AddItem() {
  const navigate = useNavigate();

  const [item, setItem] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });

  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => {
        console.error("Failed to fetch categories", err);
        setAlert({
          show: true,
          message: "Failed to load categories.",
          variant: "danger",
        });
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files?.length > 0) {
      const file = files[0];
      setItem((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setItem((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", item.name);
    formData.append("description", item.description);
    formData.append("price", item.price);
    formData.append("category_id", item.category_id);
    if (item.image) {
      formData.append("image", item.image);
    }

    try {
      const res = await fetch("http://localhost:5000/api/items", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setAlert({
          show: true,
          message: "✅ Item added successfully!",
          variant: "success",
        });
        setTimeout(() => navigate("/items"), 1500); // Redirect after short delay
      } else {
        setAlert({
          show: true,
          message: "❌ Failed to add item.",
          variant: "danger",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setAlert({
        show: true,
        message: "❌ An error occurred while adding the item.",
        variant: "danger",
      });
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4 shadow-sm">
            <h3 className="mb-4">Add New Item</h3>

            {alert.show && (
              <Alert
                variant={alert.variant}
                dismissible
                onClose={() => setAlert({ ...alert, show: false })}
              >
                {alert.message}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Item Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={item.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  rows={3}
                  value={item.description}
                  onChange={handleChange}
                  placeholder="Enter item description"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Price ($)</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={item.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category_id"
                  value={item.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Image</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                />
              </Form.Group>

              {preview && (
                <div className="mb-3 text-center">
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ maxHeight: "200px", objectFit: "contain" }}
                  />
                </div>
              )}

              <Button type="submit" variant="warning">
                Add Item
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
