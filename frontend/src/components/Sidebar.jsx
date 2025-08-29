import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaMoneyBillAlt,
  FaShoppingCart,
  FaChartBar,
  FaTimes,
} from "react-icons/fa";

export default function Sidebar({ collapsed, setCollapsed }) {
  const links = [
    { to: "/dashboard", name: "Dashboard", icon: <FaHome /> },
    { to: "/income", name: "Income", icon: <FaMoneyBillAlt /> },
    { to: "/expense", name: "Expenses", icon: <FaShoppingCart /> },
    { to: "/reports", name: "Reports", icon: <FaChartBar /> },
  ];

  const isMobile = window.innerWidth <= 768;

  return (
    <div
      className="bg-dark text-white"
      style={{
        width: collapsed ? "0px" : "220px",
        height: "100vh",
        top: 0,
        left: 0,
        overflowY: "auto",
        transition: "width 0.3s",
        zIndex: 1050,
        position: isMobile ? "fixed" : "sticky",
      }}
    >
      {/* Header with optional close button */}
      <div className="d-flex align-items-center justify-content-between p-3">
        {!collapsed && <h3 className="mb-0">CashTrack</h3>}

        {/* Close button only on mobile */}
        {isMobile && !collapsed && (
          <button
            className="btn btn-sm btn-outline-light"
            onClick={() => setCollapsed(true)}
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="nav flex-column">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="nav-link text-white mb-2 d-flex align-items-center"
          >
            <span className="me-2">{link.icon}</span>
            {!collapsed && link.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
