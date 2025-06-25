import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Pagination,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState({ id: "", title: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });
  const [deleteId, setDeleteId] = useState(null); // For delete confirm modal

  const navigate = useNavigate();

  const itemsPerPage = 5;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = categories.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setAlert({
          show: true,
          message: "❌ Failed to load categories.",
          variant: "danger",
        });
      }
    };

    fetchCategories();
  }, []);

  const handleEditClick = (category) => {
    setEditCategory({
      id: category.id || "",
      title: category.title || "",
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setEditCategory({ id: "", title: "" });
    setShowModal(false);
  };

  const handleEditChange = (e) => {
    setEditCategory((prev) => ({
      ...prev,
      title: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/categories/${editCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: editCategory.title }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const updated = await response.json();

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === updated.id ? { ...cat, title: updated.title } : cat
        )
      );

      setAlert({
        show: true,
        message: "✅ Category updated successfully!",
        variant: "success",
      });

      handleModalClose();
    } catch (err) {
      console.error("Failed to update category:", err.message);
      setAlert({
        show: true,
        message: "❌ Update failed: " + err.message,
        variant: "danger",
      });
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/categories/${deleteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      setCategories((prev) => prev.filter((cat) => cat.id !== deleteId));
      setAlert({
        show: true,
        message: "✅ Category deleted successfully!",
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to delete category:", err.message);
      setAlert({
        show: true,
        message: "❌ Delete failed: " + err.message,
        variant: "danger",
      });
    } finally {
      setDeleteId(null); // Close confirm modal
    }
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Category List</h3>
        <Button variant="warning" onClick={() => navigate("/add-category")}>
          Add Category
        </Button>
      </div>

      {alert.show && (
        <Alert
          variant={alert.variant}
          onClose={() => setAlert({ ...alert, show: false })}
          dismissible
        >
          {alert.message}
        </Alert>
      )}

      <Table striped bordered hover responsive>
        <thead className="text-center">
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th style={{ width: "180px" }}>Actions</th>
          </tr>
        </thead>
        <tbody className="text-center align-middle">
          {currentItems.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>{cat.title}</td>
              <td>
                <Button
                  variant="dark"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEditClick(cat)}
                >
                  Update
                </Button>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => confirmDelete(cat.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>ID</Form.Label>
              <Form.Control type="text" value={editCategory.id} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editCategory.title}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button type="submit" variant="warning">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal show={!!deleteId} onHide={() => setDeleteId(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this category?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirmed}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
