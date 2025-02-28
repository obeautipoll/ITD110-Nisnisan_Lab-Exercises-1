import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './EditStudent.css';

const EditStudent = ({ API_URL, token, studentId, fetchStudents, closeEditStudent }) => {
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    course: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await axios.get(`${API_URL}/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData(response.data);
      } catch (error) {
        toast.error('Failed to fetch student data');
      }
    };
    fetchStudentData();
  }, [studentId, token, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Create an object without the 'id' field (if your backend does not expect it)
    const updatedData = { ...formData };
    delete updatedData.id; 

    try {
        await axios.put(`${API_URL}/students/${studentId}`, updatedData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Student updated successfully!');
        fetchStudents(); // Refresh student list
        closeEditStudent(); // Close modal
    } catch (error) {
        console.error('Update Error:', error.response?.data);
        toast.error(error.response?.data?.message || 'Error updating student!');
    }
};


  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeEditStudent}>&times;</span>
        <form onSubmit={handleEditSubmit}>
          <h2>Edit Student</h2>
          <input
            type="text"
            name="id"
            placeholder="ID"
            value={formData.id}
            onChange={handleChange}
            required
            disabled
          />
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="gender"
            placeholder="Gender"
            value={formData.gender}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="course"
            placeholder="Course"
            value={formData.course}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <button type="submit">Update Student</button>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;
