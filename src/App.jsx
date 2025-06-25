import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Footer from "./components/Footer";
import Header from "./components/Header";
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import AddItem from "./components/AddItem";
import ItemList from "./components/Itemlist";
import Itemcard from "./components/Itemcard";
import Addcategory from "./components/Addcategory";
import CategoryList from "./components/CategoryList";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderList from "./components/OrderList";
import PagesList from "./components/PagesList";
import AddPages from "./components/AddPages";
import EditPages from "./components/EditPages";
import PagesDetail from "./components/PagesDetail";
import UserList from "./components/UserList";
import PrivateRoute from "./components/PrivateRoute"; // ✅ new import

function App() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const titles = data.map((cat) => cat.title);
        setCategories(titles);
      })
      .catch((err) => {
        console.error("Failed to fetch categories", err);
      });
  }, []);

  const addCategory = (title) => {
    setCategories((prev) => [...prev, title]);
  };

  const handleAddToCart = (item) => {
    if (!cartItems.find((i) => i.id === item.id)) {
      setCartItems((prev) => [...prev, item]);
    }
  };

  const handleRemoveFromCart = (idToRemove) => {
    setCartItems((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price, 0);

  return (
    <Router>
      <Header
        search={search}
        setSearch={setSearch}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        user={user}
        setUser={setUser}
      />

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route
          path="/add-category"
          element={<Addcategory addCategory={addCategory} />}
        />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/items" element={<ItemList categories={categories} />} />
        <Route
          path="/itemcard"
          element={
            <Itemcard
              search={search}
              selectedCategory={selectedCategory}
              user={user}
              handleAddToCart={handleAddToCart}
            />
          }
        />

        {/* ✅ Protected Routes */}
        <Route
          path="/cart"
          element={
            <PrivateRoute user={user}>
              <Cart
                cartItems={cartItems}
                handleRemoveFromCart={handleRemoveFromCart}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute user={user}>
              <Checkout
                user={user}
                cartItems={cartItems}
                setCartItems={setCartItems}
                cartTotal={cartTotal}
              />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/categorylist"
          element={
            <PrivateRoute user={user}>
              <CategoryList />
            </PrivateRoute>
          }
        />
        <Route
          path="/orderlist"
          element={
            <PrivateRoute user={user}>
              <OrderList user={user} />
            </PrivateRoute>
          }
        />
        <Route
          path="/pages"
          element={
            <PrivateRoute user={user}>
              <PagesList />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-page"
          element={
            <PrivateRoute user={user}>
              <AddPages />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-page/:id"
          element={
            <PrivateRoute user={user}>
              <EditPages />
            </PrivateRoute>
          }
        />
        <Route path="/pages/:id" element={<PagesDetail />} />
        <Route
          path="/users"
          element={
            <PrivateRoute user={user}>
              <UserList />
            </PrivateRoute>
          }
        />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
