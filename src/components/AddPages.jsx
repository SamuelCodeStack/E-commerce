import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate } from "react-router-dom";

export default function AddPages() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pageData = {
      title,
      content,
    };

    try {
      const res = await fetch("http://localhost:5000/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pageData),
      });

      if (res.ok) {
        alert("Page created successfully!");
        setTitle("");
        setContent("");
        navigate("/pages");

        // Optional: Scroll to footer after short delay
        setTimeout(() => {
          const footer = document.getElementById("footer");
          footer?.scrollIntoView({ behavior: "smooth" });
        }, 500);
      } else {
        throw new Error("Failed to save page.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("An error occurred.");
    }
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Create New Page</h3>
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
            Save Page
          </Button>
        </div>
      </Form>
    </Container>
  );
}
