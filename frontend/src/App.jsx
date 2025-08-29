import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Income from "./pages/Income";
import Expense from "./pages/Expense";
import AddTransaction from "./pages/AddTransactions";
import axios from "axios";
import Report from "./pages/Report";
import { useEffect } from "react";
import PrivateRoute from "./components/PrivateRoute";
import DashboardLayout from "./pages/DashboardLayout";

function App() {
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true;
          const { data } = await axios.post(
            "http://localhost:5000/auth/refresh",
            {
              token: localStorage.getItem("refreshToken"),
            }
          );
          console.log(data);
          localStorage.setItem("token", data.accessToken);
          originalRequest.headers["Authorization"] =
            "Bearer " + data.accessToken;
          return axios(originalRequest);
        }
        return Promise.reject(error);
      }
    );
  }, []);
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route path="/income" element={<Income />} />
          <Route path="/add-transaction" element={<AddTransaction />} />
          <Route path="/edit-transaction/:id" element={<AddTransaction />} />
          <Route path="/expense" element={<Expense />} />
          <Route path="/reports" element={<Report />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
