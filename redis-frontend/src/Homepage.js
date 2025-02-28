import React from "react";
import "./Homepage.css"; // Add a CSS file for styling

function Homepage({ openLoginModal, openRegisterModal }) {
  return (
    <div className="homepage">
      <h1>Welcome to Student Management System</h1>
      <p>Simple Student Records</p>

      <button className="homepage-btn login" onClick={openLoginModal}>Login</button>
      <button className="homepage-btn register" onClick={openRegisterModal}>Register</button>
    </div>
  );
}

export default Homepage;