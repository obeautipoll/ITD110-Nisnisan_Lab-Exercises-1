import React from 'react';
import './DeleteStudent.css'; // Import styles for modal

const DeleteStudent = ({ studentId, onDeleteConfirm, onCancel }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onCancel}>&times;</span>
        <form onSubmit={(e) => { e.preventDefault(); onDeleteConfirm(studentId); }}>
          <h2>⚠ Confirm Deletion</h2>
          <p>Are you sure you want to delete the student with ID: <strong>{studentId}</strong>?</p>
          <div className="button-group">
            <button type="submit" className="confirm-btn">Yes, Delete</button>
            <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteStudent;
