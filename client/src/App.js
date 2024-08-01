import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/Home/home';
import ProtectedRoute from './utils/ProtectedRoute';
import Login from './components/Login/login';
import Register from './components/Register/register';


function App() {
  return (
    <Router>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
