import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-grow-1">
        {/* Topbar */}
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Dynamic page content */}
        <div className="p-3">
          <Outlet />{" "}
          {/* React Router will inject Dashboard/Expense/etc. here */}
        </div>
      </div>
    </div>
  );
}
