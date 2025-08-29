import React from "react";
import axios from "axios";
import { FaBars } from "react-icons/fa";

export default function Topbar({ collapsed, setCollapsed }) {
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        await axios.post("/auth/logout", { token: refreshToken });
      }

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-light px-3 d-flex justify-content-between">
      {/* Collapse Button now here 👇 */}
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => setCollapsed(!collapsed)}
      >
        <FaBars />
      </button>

      <div className="ms-auto dropdown">
        <button
          className="btn btn-light dropdown-toggle"
          type="button"
          id="accountDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="bi bi-person-circle fs-4"></i>
        </button>
        <ul
          className="dropdown-menu dropdown-menu-end"
          aria-labelledby="accountDropdown"
        >
          <li>
            <button className="dropdown-item" onClick={handleLogout}>
              Logout
            </button>
          </li>
          <li>
            <button className="dropdown-item">Profile</button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
