import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AddStudent.css';


const AddStudent = ({ API_URL, token, fetchStudents, closeAddStudent }) => {
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


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };


  const handleAddSubmit = async (e) => {
    e.preventDefault();
    console.log('Sending student data:', formData);  // 🔍 Debug log


    try {
        await axios.post(`${API_URL}/students`, formData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Student added successfully!');
        fetchStudents();
        closeAddStudent();
    } catch (error) {
        console.error('Error adding student:', error.response?.data || error);
        toast.error(error.response?.data?.message || 'Error adding student!');
    }
};
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeAddStudent}>&times;</span>
        <form onSubmit={handleAddSubmit}>
          <h2>Add Student</h2>
          <input
            type="text"
            name="id"
            placeholder="ID"
            value={formData.id}
            onChange={handleChange}
            required
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
          <select
  name="gender"
  value={formData.gender}
  onChange={handleChange}
  required
>
  <option value="" disabled>Select Gender</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
</select>
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
          <button type="submit">Add Student</button>
        </form>
      </div>
    </div>
  );
};


export default AddStudent;
