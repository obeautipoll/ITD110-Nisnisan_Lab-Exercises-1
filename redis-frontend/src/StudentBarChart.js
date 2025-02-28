import React from "react";
import "./StudentBarChart.css";
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from "recharts";

const StudentBarChart = ({ students }) => {
    // Group students by course
    const courseCounts = students.reduce((acc, student) => {
        acc[student.course] = (acc[student.course] || 0) + 1;
        return acc;
    }, {});

    // Group students by gender
    const genderCounts = students.reduce((acc, student) => {
        acc[student.gender] = (acc[student.gender] || 0) + 1;
        return acc;
    }, { Male: 0, Female: 0 });

    // Convert grouped data into array format for recharts
    const chartData = Object.keys(courseCounts).map(course => ({
        course,
        count: courseCounts[course]
    }));

    // Total number of students
    const totalStudents = students.length;

    // Data for the Pie Chart (Gender distribution with percentages)
    const pieData = Object.keys(genderCounts).map(gender => ({
        name: gender,
        value: genderCounts[gender],
        percent: ((genderCounts[gender] / totalStudents) * 100).toFixed(1) + "%" // Calculate percentage
    }));

    // Colors for Pie Chart (Shades for better contrast)
    const COLORS = ["#7c2727", "#f8bc41"]; // Male: Maroon, Female: Gold

    return (
        <div className="chart-container">
            <h3>Students Per Course</h3>
            
            <div className="chart-row">
                {/* Bar Chart */}
                <div className="recharts-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="course" angle={-30} textAnchor="end" height={60} />
                            <YAxis allowDecimals={false} />
                            <Tooltip 
                                cursor={{ fill: "#f8bc41" }} 
                                contentStyle={{ backgroundColor: "#fffff0", color: "#7c2727", fontSize: "14px" }} 
                            />
                            <Legend wrapperStyle={{ color: "#7e0a0a", fontSize: "16px", fontWeight: "bold" }} />
                            <Bar
                                dataKey="count"
                                fill="#7c2727"
                                activeBar={{ fill: "#fffff0" }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart for Gender Distribution */}
                <div className="pie-chart-container">
                    <h3>Gender Distribution</h3>
                    <PieChart width={280} height={200}>
                        <Pie 
                            data={pieData} 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={40} 
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${percent}`} // Show gender & percent
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>

                    {/* Custom Legend for Pie Chart */}
                    <div className="pie-legend">
                        {pieData.map((entry, index) => (
                            <div key={index} className="legend-item">
                                <span 
                                    className="legend-color" 
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></span>
                                {entry.name}: {entry.percent}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Total Number of Students */}
            <div className="total-students">
                Total Students: {totalStudents}
            </div>
        </div>
    );
};

export default StudentBarChart;
