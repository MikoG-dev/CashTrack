import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import axios from "axios";
import ConfirmModal from "../components/ConfirmModal";
import { useNavigate } from "react-router-dom";

export default function Expense() {
  const [incomes, setIncomes] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [id, setId] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const fetchIncome = async (page = 1, limit = rowsPerPage) => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page,
        limit,
        q: search || "",
      });
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);

      const res = await axios.get(
        `http://localhost:5000/api/get/expenses?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIncomes(res.data.transactions);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIncome(currentPage, rowsPerPage);
    // eslint-disable-next-line
  }, [currentPage, rowsPerPage, search, fromDate, toDate]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIncome(currentPage, rowsPerPage); // refresh after delete
      setShowConfirm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (income) => {
    navigate(`/edit-transaction/${income.id}`, {
      state: { transaction: income, page: "expense" },
    });
  };

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <div className="p-4">
          {/* Header with Add button */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Expense Transactions</h2>
            <button
              className="btn btn-success"
              onClick={() =>
                navigate("/add-transaction", { state: { page: "expense" } })
              }
            >
              + Add
            </button>
          </div>

          {/* Search & Date Filter */}
          <div className="d-flex mb-3 gap-2 flex-wrap">
            <input
              type="text"
              className="form-control"
              placeholder="Search by description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: "200px" }}
            />
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
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setSearch("");
              }}
            >
              Reset
            </button>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Description</th>
                  <th>Amount ($)</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No incomes found.
                    </td>
                  </tr>
                ) : (
                  incomes.map((income) => (
                    <tr key={income._id}>
                      <td>{income.description}</td>
                      <td>{income.amount}</td>
                      <td>{new Date(income.date).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEdit(income)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            setShowConfirm(true);
                            setId(income.id);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <ConfirmModal
            show={showConfirm}
            title="Clear All Transactions"
            message="Are you sure you want to delete ? This action cannot be undone."
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
          />

          {/* Pagination + rows per page */}
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
