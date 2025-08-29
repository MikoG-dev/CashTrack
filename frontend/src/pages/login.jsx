import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SuccessToast from "../components/SuccessToast";

export default function Login() {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 👇 change this to your backend login endpoint
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // save token (if backend sends it)
        console.log(data);
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <SuccessToast
        message="🎉 Login successful!"
        show={showToast}
        onClose={() => setShowToast(false)}
        duration={3000} // Auto-dismiss after 3 seconds
      /> */}
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div
          className="card shadow-lg p-4 rounded-4"
          style={{ width: "380px" }}
        >
          <h3 className="text-center fw-bold mb-4">Login</h3>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 rounded-3 fw-semibold shadow-sm"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center mt-4 small">
            Don’t have an account?{" "}
            <Link to="/register" className="text-primary fw-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
