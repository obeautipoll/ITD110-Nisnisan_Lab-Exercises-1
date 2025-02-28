import React, { useState } from 'react';
import AddStudent from './AddStudent';
import EditStudent from './EditStudent';
import DeleteStudent from './DeleteStudent';
import { toast } from 'react-toastify';
import axios from 'axios';
import Papa from 'papaparse';
import StudentBarChart from "./StudentBarChart";

const AdminDashboard = ({ API_URL, token, students, fetchStudents }) => {
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showEditStudent, setShowEditStudent] = useState(false);
    const [studentIdToEdit, setStudentIdToEdit] = useState(null);
    const [showDeleteStudent, setShowDeleteStudent] = useState(false);
    const [studentIdToDelete, setStudentIdToDelete] = useState(null);
    
    const [tempData, setTempData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    // Handle CSV File Upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate File Type & Size
        if (!file.name.endsWith(".csv")) {
            toast.error("Invalid file format. Please upload a CSV file.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size exceeds 2MB limit.");
            return;
        }

        setSelectedFile(file);

        // Parse CSV
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                if (!result.data.length) {
                    toast.error("Uploaded CSV file is empty.");
                    return;
                }
                setTempData(result.data);
                setCsvHeaders(Object.keys(result.data[0] || {}));
            },
            error: (error) => {
                toast.error('Error parsing CSV file: ' + error.message);
            }
        });
    };

    // Restore the original student list
    const handleDone = () => {
        setSelectedFile(null);
        setTempData([]);
        setCsvHeaders([]);
        document.querySelector('input[type="file"]').value = "";
    };

    // Handle editing in temp data
    const handleTempEdit = (index, field, value) => {
        const updatedTempData = [...tempData];
        updatedTempData[index][field] = value;
        setTempData(updatedTempData);
    };

    // Handle deleting in temp data
    const handleTempDelete = (index) => {
        setTempData(tempData.filter((_, i) => i !== index));
    };

    // Confirm before deleting a student
    const confirmDelete = (id) => {
        setStudentIdToDelete(id);
        setShowDeleteStudent(true);
    };

    // Handle API Call for Deletion
    const handleDeleteStudent = async (studentId) => {
        try {
            const response = await axios.delete(`${API_URL}/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                toast.success('Student deleted successfully!');
                fetchStudents();
            } else {
                toast.error('Failed to delete student!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting student!');
        }
        setShowDeleteStudent(false);
    };

    return (
        <div>
            <h2>Welcome to Admin Dashboard</h2>
           

            {showAddStudent && (
                <AddStudent
                    API_URL={API_URL}
                    token={token}
                    fetchStudents={fetchStudents}
                    closeAddStudent={() => setShowAddStudent(false)}
                />
            )}

            <h2>Student List</h2>
            <input type="file" accept=".csv" onChange={handleFileUpload} />

            <button className="add-student-btn" onClick={() => setShowAddStudent(true)}>Add Student</button>

            {tempData.length > 0 ? (
    <div>
        <h3>Temporary CSV Data</h3>
        <table>
            <thead>
                <tr>
                    {csvHeaders.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {tempData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {csvHeaders.map((header, colIndex) => (
                            <td key={colIndex}>{row[header] || ''}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
        <button onClick={handleDone}>DONE</button>
    </div>
            ) : (
                <table>
                    <thead>
                   
                        <tr>
                            <th>ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Course</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td>{student.id}</td>
                                <td>{student.firstName}</td>
                                <td>{student.lastName}</td>
                                <td>{student.age}</td>
                                <td>{student.gender}</td>
                                <td>{student.course}</td>
                                <td>{student.email}</td>
                                <td>{student.address}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => {
                                        setStudentIdToEdit(student.id);
                                        setShowEditStudent(true);
                                    }}>Edit</button>
                                    <button className="delete-btn" onClick={() => confirmDelete(student.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showDeleteStudent && (
                <DeleteStudent
                    studentId={studentIdToDelete}
                    onDeleteConfirm={handleDeleteStudent}
                    onCancel={() => setShowDeleteStudent(false)}
                />
            )}

            {showEditStudent && (
                <EditStudent
                    API_URL={API_URL}
                    token={token}
                    fetchStudents={fetchStudents}
                    closeEditStudent={() => setShowEditStudent(false)}
                    studentId={studentIdToEdit}
                />
            )}
            {/* Chart Section */}
            <StudentBarChart students={students} />
        </div>
    );
};

export default AdminDashboard;
