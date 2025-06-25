import React, { useEffect, useState } from "react";
import { Table, Button, Container, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function PagesList() {
  const [pages, setPages] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pagesPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/pages");
      const data = await res.json();
      setPages(data);
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  const handleEditClick = (id) => {
    navigate(`/edit-page/${id}`);
  };

  const confirmDelete = (page) => {
    setPageToDelete(page);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!pageToDelete) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/pages/${pageToDelete.id}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        const updatedPages = pages.filter((p) => p.id !== pageToDelete.id);
        setPages(updatedPages);
        setShowDeleteModal(false);
        setPageToDelete(null);

        // Adjust current page if needed
        const lastPage = Math.ceil(updatedPages.length / pagesPerPage);
        if (currentPage > lastPage) {
          setCurrentPage(lastPage);
        }
      }
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setPageToDelete(null);
  };

  const indexOfLast = currentPage * pagesPerPage;
  const indexOfFirst = indexOfLast - pagesPerPage;
  const currentPages = pages.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(pages.length / pagesPerPage);

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Pages</h4>
        <Button variant="warning" onClick={() => navigate("/add-page")}>
          Add Page
        </Button>
      </div>

      {pages.length === 0 ? (
        <p>No pages found.</p>
      ) : (
        <>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPages.map((page) => (
                <tr key={page.id}>
                  <td>{page.id}</td>
                  <td>{page.title}</td>
                  <td>
                    {new Date(page.created).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>
                    <Button
                      variant="dark"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditClick(page.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => confirmDelete(page)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Page Numbers */}
          <div className="d-flex justify-content-center mt-3">
            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index}
                variant={
                  currentPage === index + 1 ? "primary" : "outline-primary"
                }
                size="sm"
                className="me-1"
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the page{" "}
          <strong>{pageToDelete?.title}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
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
