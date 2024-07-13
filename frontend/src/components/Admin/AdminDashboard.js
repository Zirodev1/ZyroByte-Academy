import React from "react";
import { Link } from 'react-router-dom';
import Header from '../Header'
import Footer from '../Footer'

const AdminDashboard = () => {
    return (
        <div>
            <Header/>
            <main>
                <h2>Admin Dashboard</h2>
                <ul>
                    <li><Link to="/admin/courses">Manage Courses</Link></li>
                    <li><Link to="/admin/lessons">Manage Lessons</Link></li>
                    <li><Link to="/admin/quizzes">Manage Quizzes</Link></li>
                </ul>
            </main>
            <Footer/>
        </div>
    )
}

export default AdminDashboard;