import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Itemcard({
  search,
  selectedCategory,
  user,
  handleAddToCart,
}) {
  const [items, setItems] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [showMessage, setShowMessage] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false); // 🔁 modal control
  const [pendingItem, setPendingItem] = useState(null); // to hold item user tried to add

  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemRes = await fetch("http://localhost:5000/api/items");
        const itemsData = await itemRes.json();

        const catRes = await fetch("http://localhost:5000/api/categories");
        const catData = await catRes.json();
        const map = {};
        catData.forEach((c) => (map[c.id] = c.title));
        setCategoryMap(map);

        const formatted = itemsData.map((item) => ({
          ...item,
          name: item.item_name,
          priceDisplay: `$${item.price.toFixed(2)}`,
          image: item.image
            ? `http://localhost:5000/${item.image.replace(/\\/g, "/")}`
            : "/placeholder.png",
          categoryTitle: map[item.category_id],
        }));

        setItems(formatted);
      } catch (err) {
        console.error("Failed to fetch items:", err);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = selectedCategory
      ? item.categoryTitle === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const handleClick = (item) => {
    if (!user) {
      setPendingItem(item); // save item for later
      setShowLoginModal(true); // 🔁 open login modal
      return;
    }

    handleAddToCart(item);
    setShowMessage(`"${item.name}" added to cart!`);
    setTimeout(() => setShowMessage(""), 2000);
  };

  const confirmLogin = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  return (
    <Container className="my-5">
      {/* ✅ Add-to-cart alert */}
      {showMessage && (
        <Alert
          variant="success"
          className="text-center"
          style={{ position: "sticky", top: "70px", zIndex: 1000 }}
        >
          {showMessage}
        </Alert>
      )}

      {/* 🔁 Login modal */}
      <Modal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>Please log in to add items to your cart.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmLogin}>
            Go to Login
          </Button>
        </Modal.Footer>
      </Modal>

      <h4 className="mb-4">
        {search.trim() || selectedCategory
          ? `Showing results for "${search}"${
              selectedCategory ? ` in "${selectedCategory}"` : ""
            }`
          : "All Products"}
      </h4>

      <Row>
        {filteredItems.map((item) => (
          <Col key={item.id} xs={6} md={3} className="mb-4">
            <Card className="border-0 text-center h-100 shadow-sm">
              <Card.Img
                variant="top"
                src={item.image}
                alt={item.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder.png";
                }}
                style={{
                  borderRadius: "10px",
                  padding: "10px",
                  height: "200px",
                  objectFit: "cover",
                }}
              />
              <Card.Body className="p-2 d-flex flex-column justify-content-between">
                <div>
                  <Card.Title as="h6" className="mb-1">
                    {item.name}
                  </Card.Title>
                  <Card.Text className="text-muted">
                    {item.priceDisplay}
                  </Card.Text>
                </div>
                <Button
                  variant="warning"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleClick(item)}
                >
                  Add to Cart
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
