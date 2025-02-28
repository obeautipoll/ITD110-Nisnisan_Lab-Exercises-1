import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Homepage from "./Homepage";
import Login from "./Login";
import Register from "./Register";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";

const API_URL = "http://localhost:5000";

function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // State for login and register modals
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (storedToken) {
      setToken(storedToken);
      setRole(storedRole);
      setIsLoggedIn(true);
    }
  }, []);

  const fetchStudents = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
    } catch (error) {
      toast.error("Failed to fetch students.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);


  const handleLoginSuccess = (token, role) => {
    setToken(token);
    setRole(role);
    setIsLoggedIn(true);
    setSearchQuery("");
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setShowLogin(false);
  };
  

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setIsLoggedIn(false);
    setSearchQuery("");

    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  const filteredStudents = students.filter((student) =>
    Object.values(student).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Show Homepage only if user is NOT logged in */}
      {!isLoggedIn ? (
        <Homepage openLoginModal={() => setShowLogin(true)} openRegisterModal={() => setShowRegister(true)} />
      ) : (
        <div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {role === "admin" ? (
            <AdminDashboard
              API_URL={API_URL}
              token={token}
              students={filteredStudents}
              fetchStudents={fetchStudents}
            />
          ) : (
            <UserDashboard students={filteredStudents} searchQuery={searchQuery} />
          )}
        </div>
      )}

      {showLogin && (
        <Login
          API_URL={API_URL}
          onLogin={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}
      {showRegister && <Register API_URL={API_URL} onClose={() => setShowRegister(false)} />}
    </div>
  );
}

export default App;
