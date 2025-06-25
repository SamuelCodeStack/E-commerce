import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Image,
  Pagination,
  Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

export default function ItemList({ categories = [] }) {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const navigate = useNavigate();
  const itemsPerPage = 5;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = items.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const showAlert = (message, variant = "success") => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: "", variant: "" }), 4000);
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/items");
        const data = await res.json();

        const formatted = data.map((item) => ({
          id: item.id,
          name: item.item_name,
          description: item.description,
          price: item.price,
          image: item.image
            ? `http://localhost:5000/${item.image.replace(/\\/g, "/")}`
            : "/placeholder.png",
          category: item.category_id || "",
        }));

        setItems(formatted);
      } catch (err) {
        console.error("Failed to fetch items:", err);
        showAlert("❌ Failed to fetch items", "danger");
      }
    };

    fetchItems();
  }, []);

  const handleEditClick = (item) => {
    setEditItem(item);
    setImageFile(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setEditItem(null);
    setImageFile(null);
    setShowModal(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setEditItem((prev) => ({ ...prev, image: preview }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", editItem.name);
    formData.append("description", editItem.description);
    formData.append("price", editItem.price);
    formData.append("category_id", editItem.category);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/items/${editItem.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const result = await response.json();

      setItems((prev) =>
        prev.map((item) =>
          item.id === editItem.id
            ? {
                ...editItem,
                image: imageFile
                  ? `http://localhost:5000/${result.image.replace(/\\/g, "/")}`
                  : item.image,
              }
            : item
        )
      );

      showAlert("✅ Item updated successfully!", "success");
      handleModalClose();
    } catch (err) {
      console.error("Failed to update item:", err.message);
      showAlert("❌ Update failed: " + err.message, "danger");
    }
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/items/${itemToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        const error = contentType?.includes("application/json")
          ? await response.json()
          : await response.text();

        throw new Error(
          typeof error === "string" ? error : error.error || "Unknown error"
        );
      }

      await response.json();
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      showAlert("🗑️ Item deleted successfully!", "warning");
    } catch (err) {
      console.error("Error deleting item:", err.message);
      showAlert("❌ Failed to delete item: " + err.message, "danger");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Items</h3>
        <Button variant="warning" onClick={() => navigate("/add-item")}>
          Add Item
        </Button>
      </div>

      {alert.show && (
        <Alert
          variant={alert.variant}
          dismissible
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}

      <Table striped bordered hover responsive>
        <thead className="text-center">
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th style={{ width: "180px" }}>Actions</th>
          </tr>
        </thead>
        <tbody className="align-middle text-center">
          {currentItems.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>
                <Image
                  src={item.image}
                  width={80}
                  rounded
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.png";
                  }}
                />
              </td>
              <td>{item.name}</td>
              <td>${parseFloat(item.price).toFixed(2)}</td>
              <td>{item.description}</td>
              <td>
                <Button
                  variant="dark"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEditClick(item)}
                >
                  Update
                </Button>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleDelete(item)}
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

      {/* Edit Item Modal */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Item</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdate} encType="multipart/form-data">
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>ID</Form.Label>
              <Form.Control
                type="text"
                value={editItem?.id || ""}
                disabled
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editItem?.name || ""}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <Image
                src={editItem?.image}
                className="mt-2"
                width={120}
                onError={(e) => (e.target.src = "/placeholder.png")}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={editItem?.description || ""}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={editItem?.price || ""}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Enter Category ID</Form.Label>
              <Form.Control
                type="number"
                name="category"
                value={editItem?.category || ""}
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{itemToDelete?.name || "this item"}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
