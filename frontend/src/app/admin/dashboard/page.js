"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    fetch("http://localhost:5000/api/admin/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setAdmins(data))
      .catch(() => window.location.href = "/admin/login");
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">👨‍💻 Admin Dashboard</h1>
      <ul className="mt-4">
        {admins.map((admin) => (
          <li key={admin._id} className="border-b py-2">
            {admin.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
