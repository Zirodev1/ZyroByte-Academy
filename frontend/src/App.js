import React from'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Layout/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CourseDetails from './components/Course/CourseDetail';
import PrivateRoute from './components/Auth/PrivateRoute';
import Dashboard from './components/Dashboard/Dashboard';
import Subscription from './components/Subscription/Subscription';

function App() {
  return (
    <Router>
    <div className="App">
      <Routes>
        <Route exact path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path='/courses/:id' element={<CourseDetails/>}/>
        <Route path='subscription' element={<Subscription/>}/>
        <Route path="/dashboard" element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </div>
    </Router>
  );
}

export default App;
