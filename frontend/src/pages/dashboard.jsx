import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import axios from "axios";

// Register all required Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    total: { total_income: 0, total_expense: 0, total_balance: 0 },
    monthly: [],
    weekly: [],
  });

  // Logout function

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDashboard();
  }, []);

  // Prepare Bar chart data from monthly data
  const barData = {
    labels: dashboardData.monthly.map((m) => {
      const date = new Date(m.month + "-01");
      return date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
    }),
    datasets: [
      {
        label: "Expenses",
        data: dashboardData.monthly.map((m) => m.expense),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Income",
        data: dashboardData.monthly.map((m) => m.income),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  // Prepare Line chart data from weekly data
  const lineData = {
    labels: dashboardData.weekly.map((w) => w.week),
    datasets: [
      {
        label: "Cash Flow",
        data: dashboardData.weekly.map((w) => w.income - w.expense),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
      },
    ],
  };

  return (
    <div className="d-flex">
      {/* <Sidebar /> */}

      <div className="flex-grow-1">
        {/* <Topbar /> */}

        <div className="p-4">
          <h2 className="mb-4">Dashboard Overview</h2>

          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm p-3 text-center">
                <h5>Total Income</h5>
                <h3 className="text-success">
                  ${dashboardData.total.total_income}
                </h3>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm p-3 text-center">
                <h5>Total Expenses</h5>
                <h3 className="text-danger">
                  ${dashboardData.total.total_expense}
                </h3>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm p-3 text-center">
                <h5>Balance</h5>
                <h3 className="text-primary">
                  ${dashboardData.total.total_balance}
                </h3>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm p-3">
                <h5 className="card-title">Income vs Expenses</h5>
                <Bar data={barData} options={{ responsive: true }} />
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm p-3">
                <h5 className="card-title">Cash Flow</h5>
                <Line data={lineData} options={{ responsive: true }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
