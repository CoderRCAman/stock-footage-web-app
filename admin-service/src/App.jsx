import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/dashboard/Dashboard";
import Category from "./pages/category/Category";

import { ToastContainer } from "react-toastify";
import Transaction from "./pages/transaction/Transaction";
import User from "./pages/users/User";
import Photo from "./pages/photo/Photo";
import Video from "./pages/video/Video";
import Login from "./pages/Signin";
export default function App() {
  const isAdmin = () =>  {
    return localStorage.getItem("role") === "admin";
  }
  return (
    <div>
      <ToastContainer />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isAdmin() ? (
                <Navigate to="/admin/category" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin/category"
            element={!isAdmin() ? <Navigate to="/login" /> : <Category />}
          />
          <Route
            path="/admin/transaction"
            element={!isAdmin() ? <Navigate to="/login" /> : <Transaction />}
          />
          <Route
            path="/admin/user"
            element={!isAdmin() ? <Navigate to="/login" /> : <User />}
          />
          <Route
            path="/admin/photo"
            element={!isAdmin() ? <Navigate to="/login" /> : <Photo />}
          />
          <Route
            path="/admin/video"
            element={!isAdmin() ? <Navigate to="/login" /> : <Video />}
          />
          <Route
            path="/login"
            element={isAdmin() ? <Navigate to="/admin/category" /> : <Login />}
          />
        </Routes>
      </Router>
    </div>
  );
}
