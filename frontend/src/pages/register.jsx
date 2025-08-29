import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SuccessToast from "../components/SuccessToast";

export default function Register() {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  // form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 👇 change this to your backend register endpoint
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowToast(true);
        navigate("/login"); // redirect to login
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SuccessToast
        message="🎉 Registration successful! Welcome aboard."
        show={showToast}
        onClose={() => setShowToast(false)}
        duration={3000} // Auto-dismiss after 3 seconds
      />
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div
          className="card shadow-lg p-4 rounded-4"
          style={{ width: "420px" }}
        >
          <h3 className="text-center fw-bold mb-4">Create Account</h3>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-control rounded-3"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                name="email"
                className="form-control rounded-3"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                name="password"
                className="form-control rounded-3"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control rounded-3"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Register button */}
            <button
              type="submit"
              className="btn btn-success w-100 rounded-3 fw-semibold shadow-sm"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-center mt-4 small">
            Already have an account?{" "}
            <Link to="/login" className="text-primary fw-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
