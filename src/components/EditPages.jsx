import React, { useEffect, useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function EditPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [created, setCreated] = useState(""); // ✅ New state for created date
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/pages/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title);
          setContent(data.content || "");
          setCreated(data.created); // ✅ Set the created date
        } else {
          console.error("Failed to fetch page.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchPage();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedPage = { title, content };

    try {
      const res = await fetch(`http://localhost:5000/api/pages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPage),
      });

      if (res.ok) {
        alert("Page updated successfully!");
        navigate("/pages");
      } else {
        alert("Failed to update page.");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred.");
    }
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Edit Page</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="title" className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter page title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        {/* ✅ Show created date */}
        {created && (
          <p className="text-muted mb-4">
            Created on:{" "}
            {new Date(created).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}

        <Form.Group controlId="content" className="mb-4">
          <Form.Label>Content</Form.Label>
          <CKEditor
            editor={ClassicEditor}
            data={content}
            onChange={(event, editor) => {
              const data = editor.getData();
              setContent(data);
            }}
          />
        </Form.Group>

        <div className="d-flex justify-content-end">
          <Button variant="warning" type="submit">
            Save Changes
          </Button>
        </div>
      </Form>
    </Container>
  );
}
