import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import axios from "axios";
import ConfirmModal from "../components/ConfirmModal";
import * as XLSX from "xlsx";

export default function Report() {
  const [transactions, setTransactions] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  // Inside your component
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchReport = async (page = 1, limit = rowsPerPage) => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page,
        limit,
      });
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);

      const res = await axios.get(
        `http://localhost:5000/api/get/transactions?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTransactions(res.data.transactions || []);
      setSummary(
        res.data.summary || { total_income: 0, total_expense: 0, balance: 0 }
      );
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  const exportToExcel = async (type = "all") => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (type !== "all") params.append("type", type);
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);

      const res = await axios.get(
        `http://localhost:5000/api/export/transactions?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const wsData = res.data.transactions.map((t) => ({
        Description: t.description,
        Amount: t.amount,
        Type: t.type,
        Date: new Date(t.date).toLocaleDateString(),
      }));

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");

      const fileName = `Report_${type}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };
  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/api/transactions/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh report after clearing
      setTransactions([]);
      setSummary({ total_income: 0, total_expense: 0, balance: 0 });
      setShowConfirm(false);
    } catch (err) {
      console.error("Failed to clear transactions:", err);
    }
  };

  useEffect(() => {
    fetchReport(currentPage, rowsPerPage);
    // eslint-disable-next-line
  }, [fromDate, toDate, currentPage, rowsPerPage]);

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <div className="p-4">
          <h2 className="mb-4">Transaction Report</h2>

          {/* Filters */}
          <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ width: "150px" }}
            />
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ width: "150px" }}
            />
            <button
              className="btn btn-secondary"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setCurrentPage(1);
              }}
            >
              Reset Dates
            </button>
          </div>

          {/* Summary Cards */}
          <div className="d-flex flex-wrap gap-3 mb-4">
            <div
              className="card text-white bg-success"
              style={{ flex: "1", minWidth: "150px" }}
            >
              <div className="card-body">
                <h5 className="card-title">Total Income</h5>
                <p className="card-text">${summary.total_income.toFixed(2)}</p>
              </div>
            </div>
            <div
              className="card text-white bg-danger"
              style={{ flex: "1", minWidth: "150px" }}
            >
              <div className="card-body">
                <h5 className="card-title">Total Expense</h5>
                <p className="card-text">${summary.total_expense.toFixed(2)}</p>
              </div>
            </div>
            <div
              className="card text-white bg-primary"
              style={{ flex: "1", minWidth: "150px" }}
            >
              <div className="card-body">
                <h5 className="card-title">Balance</h5>
                <p className="card-text">${summary.balance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="mb-3">
            <button
              className="btn btn-success me-2"
              onClick={() => exportToExcel("income")}
            >
              Export Income
            </button>
            <button
              className="btn btn-danger me-2"
              onClick={() => exportToExcel("expense")}
            >
              Export Expense
            </button>
            <button
              className="btn btn-primary me-2"
              onClick={() => exportToExcel("all")}
            >
              Export All
            </button>
            <button
              className="btn btn-warning"
              onClick={() => setShowConfirm(true)}
            >
              Clear All
            </button>
          </div>
          <ConfirmModal
            show={showConfirm}
            title="Clear All Transactions"
            message="Are you sure you want to delete all your transactions? This action cannot be undone."
            onConfirm={handleClearAll}
            onCancel={() => setShowConfirm(false)}
          />

          {/* Transactions Table */}
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Description</th>
                  <th>Amount ($)</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t._id}>
                      <td>{t.description}</td>
                      <td>{t.amount}</td>
                      <td>{t.type}</td>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <span>Rows per page: </span>
              <select
                className="form-select d-inline-block w-auto"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>

            <nav>
              <ul className="pagination mb-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>

                {[...Array(totalPages)].map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
