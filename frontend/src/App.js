import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Layout/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CourseDetails from './components/Course/CourseDetail';
import CourseViewer from './components/Course/CourseViewer';
import QuizAttempt from './components/Course/QuizAttempt';
import UserProfile from './components/Profile/UserProfile';
import PrivateRoute from './components/Auth/PrivateRoute';
import Dashboard from './components/Dashboard/Dashboard';
import Subscription from './components/Subscription/Subscription';
import AdminDashboard from './components/Admin/AdminDashboard';
import CourseManagement from './components/Admin/CourseManagement';
import CategoryManagement from './components/Admin/CategoryManagement';
import ModuleManagement from './components/Admin/ModuleManagement';
import SubModuleManagement from './components/Admin/SubModuleManagement';
import LessonManagement from './components/Admin/LessonManagement';
import QuizManagement from './components/Admin/QuizManagement';
import SearchResults from './components/Search/SearchResults';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path='/courses/:id' element={<CourseDetails />} />
          <Route path='/subscription' element={<Subscription />} />
          <Route path='/search' element={<SearchResults />} />
          
          {/* Student Course & Quiz Routes */}
          <Route path="/courses/:courseId/lessons/:lessonId" element={<PrivateRoute />}>
            <Route path="/courses/:courseId/lessons/:lessonId" element={<CourseViewer />} />
          </Route>
          <Route path="/courses/:courseId/lessons" element={<PrivateRoute />}>
            <Route path="/courses/:courseId/lessons" element={<CourseViewer />} />
          </Route>
          <Route path="/courses/:courseId/quizzes/:quizId" element={<PrivateRoute />}>
            <Route path="/courses/:courseId/quizzes/:quizId" element={<QuizAttempt />} />
          </Route>
          
          {/* Dashboard & Profile Routes */}
          <Route path="/dashboard" element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route path="/profile" element={<PrivateRoute />}>
            <Route path="/profile" element={<UserProfile />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<CourseManagement />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/admin/courses/:courseId/modules" element={<ModuleManagement />} />
            <Route path="/admin/modules/:moduleId/submodules" element={<SubModuleManagement />} />
            <Route path="/admin/modules/:moduleId/lessons" element={<LessonManagement />} />
            <Route path="/admin/modules/:moduleId/quizzes" element={<QuizManagement />} />
            <Route path="/admin/submodules/:subModuleId/lessons" element={<LessonManagement />} />
            <Route path="/admin/submodules/:subModuleId/quizzes" element={<QuizManagement />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;