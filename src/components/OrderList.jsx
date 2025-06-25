import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Image,
  Row,
  Col,
  Form,
  Pagination,
} from "react-bootstrap";
import { BsEye } from "react-icons/bs";

export default function OrderList({ user }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ordersPerPage = 10;
  const isAdminOrStaff = user?.level === 1 || user?.level === 2;

  useEffect(() => {
    if (!user?.id) return;

    const fetchOrders = async () => {
      try {
        const url =
          user.level === 3
            ? `http://localhost:5000/api/orders/${user.id}`
            : `http://localhost:5000/api/orders`;

        const headers = user.level === 3 ? {} : { "x-user-level": user.level };

        const res = await fetch(url, { headers });

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Order fetch error:", err);
        setOrders([]);
      }
    };

    fetchOrders();
  }, [user?.id, user?.level]);

  const handleViewClick = async (order) => {
    setSelectedOrder(order);
    setShowModal(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/${order.id}/items`
      );
      if (!res.ok) throw new Error("Failed to fetch order items");
      const items = await res.json();
      setOrderItems(items);
    } catch (err) {
      console.error("Error fetching order items:", err);
      setOrderItems([]);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setOrderItems([]);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status");
    }
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!user?.id) {
    return (
      <Container className="mt-5 text-center">
        <p>Please log in to view your orders.</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Orders</h3>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Order Date</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>
                    {new Date(order.order_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td>${parseFloat(order.price).toFixed(2)}</td>
                  <td>
                    {isAdminOrStaff ? (
                      <Form.Select
                        size="sm"
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Delivered">Delivered</option>
                      </Form.Select>
                    ) : (
                      <Form.Control
                        size="sm"
                        value={order.status}
                        readOnly
                        plaintext
                      />
                    )}
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleViewClick(order)}
                    >
                      <BsEye />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination className="justify-content-center">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
              (num) => (
                <Pagination.Item
                  key={num}
                  active={num === currentPage}
                  onClick={() => handlePageChange(num)}
                >
                  {num}
                </Pagination.Item>
              )
            )}
          </Pagination>
        </>
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order #{selectedOrder?.id} Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Date:</strong>{" "}
            {selectedOrder &&
              new Date(selectedOrder.order_at).toLocaleString("en-US")}
          </p>
          <p>
            <strong>Total:</strong> $
            {selectedOrder && parseFloat(selectedOrder.price).toFixed(2)}
          </p>
          <p>
            <strong>Status:</strong> {selectedOrder?.status}
          </p>

          <hr />
          <h5>Items</h5>
          {orderItems.length > 0 ? (
            orderItems.map((item, idx) => (
              <Row key={idx} className="mb-3 align-items-center">
                <Col xs={3} md={2}>
                  <Image
                    src={
                      item.image
                        ? `http://localhost:5000/${item.image.replace(
                            /\\/g,
                            "/"
                          )}`
                        : "/placeholder.png"
                    }
                    alt={item.item_name}
                    fluid
                    rounded
                  />
                </Col>
                <Col xs={6} className="text-center">
                  <h6 className="mb-0">{item.item_name}</h6>
                </Col>
                <Col xs={3} className="text-end">
                  ${parseFloat(item.price).toFixed(2)}
                </Col>
              </Row>
            ))
          ) : (
            <p>No items found for this order.</p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
