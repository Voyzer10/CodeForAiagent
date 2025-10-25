"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { Edit2Icon, Trash2 } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  const [updatedName, setUpdatedName] = useState("");
  const [updatedLinkedin, setUpdatedLinkedin] = useState("");
  const [updatedGithub, setUpdatedGithub] = useState("");
  const [updatedPlanType, setUpdatedPlanType] = useState("");

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [modalLink, setModalLink] = useState("");

  // 🟢 Fetch users on load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiFetch("/api/auth/users");
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🟡 Delete user
  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await apiFetch(`/api/auth/users/${userId}`, { method: "DELETE" });
      alert("User deleted successfully");
      fetchUsers(); // refresh list
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user");
    }
  };

  // 🔵 Update user
  const handleUpdate = async (userId) => {
    try {
      await apiFetch(`/api/auth/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedName,
          linkedin: updatedLinkedin,
          github: updatedGithub,
          plan: { type: updatedPlanType },
        }),
      });

      alert("User updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user");
    }
  };

  // 🔹 Open modal to show link
  const openLinkModal = (link) => {
    setModalLink(link);
    setLinkModalOpen(true);
  };

  if (loading) return <p className="p-4">Loading Applicants...</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        User Data for Applicants Database
      </h1>

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">User ID</th>
            <th className="border p-2">Plan Type</th>
            <th className="border p-2">Remaining Jobs</th>
            <th className="border p-2">Purchased At</th>
            <th className="border p-2">Expires At</th>
            <th className="border p-2">LinkedIn</th>
            <th className="border p-2">GitHub</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 text-center">
                <td className="px-4 py-2 border">{user._id}</td>

                {/* Editable Name */}
                <td className="px-4 py-2 border">
                  {editingUser === user._id ? (
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-32"
                      value={updatedName}
                      onChange={(e) => setUpdatedName(e.target.value)}
                    />
                  ) : (
                    user.name
                  )}
                </td>

                <td className="px-4 py-2 border">{user.email}</td>
                <td className="px-4 py-2 border">{user.userId}</td>

                {/* Editable Plan Type */}
                <td className="px-4 py-2 border">
                  {editingUser === user._id ? (
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-24"
                      value={updatedPlanType}
                      onChange={(e) => setUpdatedPlanType(e.target.value)}
                    />
                  ) : (
                    user.plan.type
                  )}
                </td>

                <td className="px-4 py-2 border">{user.plan.remainingJobs}</td>

                <td className="px-4 py-2 border">
                  {new Date(user.plan.purchasedAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                <td className="px-4 py-2 border">
                  {new Date(user.plan.expiresAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                {/* Editable LinkedIn */}
                <td className="px-4 py-2 border">
                  {editingUser === user._id ? (
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-40"
                      value={updatedLinkedin}
                      onChange={(e) => setUpdatedLinkedin(e.target.value)}
                    />
                  ) : user.linkedin ? (
                    <button
                      onClick={() => openLinkModal(user.linkedin)}
                      className="text-blue-500 underline"
                    >
                      View Link
                    </button>
                  ) : (
                    "N/A"
                  )}
                </td>

                {/* Editable GitHub */}
                <td className="px-4 py-2 border">
                  {editingUser === user._id ? (
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-40"
                      value={updatedGithub}
                      onChange={(e) => setUpdatedGithub(e.target.value)}
                    />
                  ) : user.github ? (
                    <button
                      onClick={() => openLinkModal(user.github)}
                      className="text-blue-500 underline"
                    >
                      View Link
                    </button>
                  ) : (
                    "N/A"
                  )}
                </td>

                {/* Action Buttons */}
                <td className="px-4 py-2 border space-x-2">
                  {editingUser === user._id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(user._id)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="bg-gray-400 text-white px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(user._id);
                          setUpdatedName(user.name);
                          setUpdatedLinkedin(user.linkedin);
                          setUpdatedGithub(user.github);
                          setUpdatedPlanType(user.plan.type);
                        }}
                        className="text-blue-500 px-2 py-1 rounded"
                      >
                        <Edit2Icon />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-500 px-2 py-1 rounded"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="px-4 py-2 text-center">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🔹 Modal for showing link */}
      {linkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center w-96">
            <h2 className="text-lg font-semibold mb-3">Profile Link</h2>
            <p className="break-words text-blue-600 underline">{modalLink}</p>
            <div className="mt-4 flex justify-center gap-4">
              <a
                href={modalLink}
                target="_blank"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Open in New Tab
              </a>
              <button
                onClick={() => setLinkModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
