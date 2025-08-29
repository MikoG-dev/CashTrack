import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

export default function AddTransaction() {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "income",
  });

  const navigate = useNavigate();
  const { id } = useParams(); // for edit mode
  const location = useLocation();

  useEffect(() => {
    if (id && location.state?.transaction) {
      const transaction = location.state.transaction;
      setFormData({
        description: transaction.description || "",
        amount: transaction.amount || "",
        type: transaction.type || "income",
      });
    }
  }, [id, location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (id) {
        // update existing transaction
        await axios.put(
          `http://localhost:5000/api/transactions/${location.state.transaction.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // add new transaction
        await axios.post(
          "http://localhost:5000/api/add/transactions",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      navigate(`/${location.state?.page}`);
    } catch (err) {
      console.error(err);
      alert("Error saving transaction");
    }
  };

  return (
    <div
      className="p-4 d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <div className="w-100" style={{ maxWidth: "500px" }}>
        <h2>{id ? "Edit Transaction" : "Add Transaction"}</h2>
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-3">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-control"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <button type="submit" className="btn btn-success">
            {id ? "Update" : "Add"}
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => navigate("/income")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
