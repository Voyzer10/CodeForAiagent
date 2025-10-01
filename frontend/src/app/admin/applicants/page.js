"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/users", {
          cache: "no-store", // no cache to always get fresh data
        });
        const data = await res.json();
        console.log("Fetched users:", data);
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p className="p-4">Loading users...</p>;



  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Data for Applicants Database </h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100 ">
            <th className="border p-2">ID </th>
            <th className="border p-2">Name </th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Password</th>
            <th className="border p-2">User Id </th>
        
          </tr>
        </thead>
        <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 text-center">
                  <td className="px-4 py-2 border">{user._id}</td>
                  <td className="px-4 py-2 border">{user.name}</td>
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border">{user.password}</td>
                  <td className="px-4 py-2 border">{user.userId}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-2 text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
      </table>
    </main>
  );
}