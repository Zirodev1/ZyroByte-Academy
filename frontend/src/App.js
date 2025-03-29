import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import './App.css';
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
import CourseManagement from './components/Admin/Course/CourseManagement';
import CourseCreate from './components/Admin/Course/CourseCreate';
import CourseEdit from './components/Admin/Course/CourseEdit';
import CategoryManagement from './components/Admin/CategoryManagement';
import CategoryForm from './components/Admin/CategoryForm';
import CategoryCourses from './components/Admin/Category/CategoryCourses';
import ModuleManagement from './components/Admin/Module/ModuleManagement';
import ModuleCreate from './components/Admin/Module/ModuleCreate';
import ModuleEdit from './components/Admin/Module/ModuleEdit';
import SubmoduleManagement from './components/Admin/Submodule/SubmoduleManagement';
import SubmoduleCreate from './components/Admin/Submodule/SubmoduleCreate';
import SubmoduleEdit from './components/Admin/Submodule/SubmoduleEdit';
import LessonManagement from './components/Admin/Lesson/LessonManagement';
import LessonCreate from './components/Admin/Lesson/LessonCreate';
import LessonEdit from './components/Admin/Lesson/LessonEdit';
import QuizManagement from './components/Admin/QuizManagement';
import ExerciseManagement from './components/Admin/ExerciseManagement';
import SearchResults from './components/Search/SearchResults';
import TestUploader from './components/Admin/EditorJS/TestUploader';
import SimpleUploader from './components/Admin/EditorJS/SimpleUploader';
import CourseList from './components/Course/CourseList';
import CategoryCoursesList from './components/Course/CategoryCourses';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/categories/:categoryId/courses" element={<CategoryCoursesList />} />
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
            
            {/* Course Management Routes */}
            <Route path="/admin/courses" element={<CourseManagement />} />
            <Route path="/admin/courses/create" element={<CourseCreate />} />
            <Route path="/admin/courses/edit/:id" element={<CourseEdit />} />
            
            {/* Category Management Routes */}
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/admin/categories/create" element={<CategoryForm />} />
            <Route path="/admin/categories/edit/:id" element={<CategoryForm />} />
            <Route path="/admin/categories/:id/courses" element={<CategoryCourses />} />
            
            {/* Module Management Routes */}
            <Route path="/admin/courses/:courseId/modules" element={<ModuleManagement />} />
            <Route path="/admin/courses/:courseId/modules/create" element={<ModuleCreate />} />
            <Route path="/admin/modules/edit/:moduleId" element={<ModuleEdit />} />
            
            {/* Submodule Management Routes */}
            <Route path="/admin/modules/:moduleId/submodules" element={<SubmoduleManagement />} />
            <Route path="/admin/modules/:moduleId/submodules/create" element={<SubmoduleCreate />} />
            <Route path="/admin/submodules/edit/:submoduleId" element={<SubmoduleEdit />} />
            
            {/* Lesson Management Routes */}
            <Route path="/admin/modules/:moduleId/lessons" element={<LessonManagement />} />
            <Route path="/admin/modules/:moduleId/lessons/create" element={<LessonCreate />} />
            <Route path="/admin/modules/:moduleId/lessons/edit/:lessonId" element={<LessonEdit />} />
            <Route path="/admin/submodules/:subModuleId/lessons" element={<LessonManagement />} />
            <Route path="/admin/submodules/:subModuleId/lessons/create" element={<LessonCreate />} />
            <Route path="/admin/submodules/:subModuleId/lessons/edit/:lessonId" element={<LessonEdit />} />
            
            {/* Quiz Management Routes */}
            <Route path="/admin/modules/:moduleId/quizzes" element={<QuizManagement />} />
            <Route path="/admin/submodules/:subModuleId/quizzes" element={<QuizManagement />} />
            
            {/* Exercise Management Routes */}
            <Route path="/admin/modules/:moduleId/exercises" element={<ExerciseManagement />} />
            <Route path="/admin/submodules/:subModuleId/exercises" element={<ExerciseManagement />} />

            {/* Test Uploader Route */}
            <Route path="/admin/test-uploader" element={<TestUploader />} />

            {/* Simple Uploader Route */}
            <Route path="/admin/simple-uploader" element={<SimpleUploader />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;