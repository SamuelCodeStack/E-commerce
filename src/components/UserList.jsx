import React, { useEffect, useState } from "react";
import { Container, Table, Form, Spinner } from "react-bootstrap";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, []);

  const handleLevelChange = async (userId, newLevel) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ level: parseInt(newLevel) }),
      });

      if (!res.ok) throw new Error("Failed to update level");

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, level: parseInt(newLevel) } : user
        )
      );
    } catch (err) {
      console.error("Error updating user level:", err);
      alert("Failed to update user level.");
    }
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-4">All Users</h3>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  {user.first_name} {user.last_name}
                </td>
                <td>{user.email}</td>
                <td>
                  <Form.Select
                    size="sm"
                    value={user.level}
                    onChange={(e) => handleLevelChange(user.id, e.target.value)}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </Form.Select>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
