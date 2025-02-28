import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register({ API_URL, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState(''); // Stores the actual secret code

  // Handle the secret code change and mask the input
  const handleSecretChange = (e) => {
    setSecretCode(e.target.value);  // Store the real secret code
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send the real secret code to the backend
      await axios.post(`${API_URL}/register`, { username, password, secretCode });

      toast.success('Registration successful!');
      onClose();  // Close the modal on successful registration
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span> {/* Ensure the close button calls onClose */}
        <form onSubmit={handleSubmit}>
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password" // Use password input for secret code
            placeholder="Admin Secret Code (optional)"
            value={secretCode}  // Display masked version (●)
            onChange={handleSecretChange}  // Handle secret code change
          />
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
