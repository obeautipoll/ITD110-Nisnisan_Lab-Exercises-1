import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserDashboard.css"; // Ensure correct path

const API_URL = "http://localhost:5000";

const UserDashboard = ({ students, searchQuery }) => {
    const [filteredStudents, setFilteredStudents] = useState(students);

    useEffect(() => {
        if (searchQuery) {
            const filtered = students.filter(student =>
                Object.values(student).some(value =>
                    String(value).toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(students);
        }
    }, [students, searchQuery]);

    return (
        <div>
            <h2>Welcome to User Dashboard</h2>
            <h3>Student List</h3>
            <table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Course</th>
                        <th>Email</th>
                        <th>Address</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.map((student, index) => (
                        <tr key={index}>
                            <td>{student.firstName}</td>
                            <td>{student.lastName}</td>
                            <td>{student.age}</td>
                            <td>{student.gender}</td>
                            <td>{student.course}</td>
                            <td>{student.email}</td>
                            <td>{student.address}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserDashboard;
