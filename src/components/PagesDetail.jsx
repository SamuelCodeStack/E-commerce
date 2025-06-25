import React, { useEffect, useState } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";

export default function PagesDetail() {
  const { id } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/pages/${id}`);
        if (!res.ok) {
          throw new Error("Page not found");
        }
        const data = await res.json();
        setPage(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [id]);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const formattedDate = page.created
    ? new Date(page.created).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <Container className="mt-5">
      <h2>{page.title}</h2>
      {formattedDate && (
        <p className="text-muted small">Published on {formattedDate}</p>
      )}
      <hr />
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </Container>
  );
}
