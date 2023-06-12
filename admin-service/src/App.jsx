import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom"; 
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from "./pages/dashboard/Dashboard";
import Category from "./pages/category/Category";

import { ToastContainer } from 'react-toastify';
import Transaction from "./pages/transaction/Transaction";
import User from "./pages/users/User";
import Photo from "./pages/photo/Photo";
import Video from "./pages/video/Video";
export default function App() {
  return (
    <div> 
      <ToastContainer />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/category" element={<Category />} />
          <Route path="/admin/transaction" element={<Transaction />} />
          <Route path="/admin/user" element={<User />} />
          <Route path="/admin/photo" element={<Photo />} />
          <Route path="/admin/video" element={<Video />} />
        </Routes>
      </Router>
    </div>
  );
}
