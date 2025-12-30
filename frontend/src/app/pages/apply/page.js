"use client";

import { useState } from "react";
import axios from "axios";
import { Mail } from "lucide-react";

export default function ApplyPage() {
  const [form, setForm] = useState({
    userId: "",
    to: "",
    subject: "",
    body: "",
    attachment: null,
    attachmentName: "",
    attachmentBase64: "",
  });

  const [loading, setLoading] = useState(false);

  // ---------------------------
  // Handle Input Changes
  // ---------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ---------------------------
  // File to Base64 Converter
  // ---------------------------
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setForm({
        ...form,
        attachment: file,
        attachmentName: file.name,
        attachmentBase64: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  // ---------------------------
  // Create Gmail Draft
  // ---------------------------
  const handleOpenGmail = async () => {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "");
    try {
      if (!form.userId) return alert("User ID is required!");

      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/gmail/create-draft`, {
        userId: form.userId,
        to: form.to,
        subject: form.subject,
        body: form.body,
        attachmentName: form.attachmentName,
        attachmentBase64: form.attachmentBase64,
      });

      if (res.data.gmailUrl) {
        window.open(res.data.gmailUrl, "_blank");
      } else {
        alert("Failed to open Gmail draft!");
      }
    } catch (err) {
      console.error(err);
      alert("Gmail draft creation failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-8">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Apply for Job</h1>

        {/* USER ID */}
        <div className="mb-4">
          <label className="block font-medium">User ID</label>
          <input
            type="text"
            name="userId"
            value={form.userId}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
            placeholder="Enter your userId"
          />
        </div>

        {/* TO FIELD */}
        <div className="mb-4">
          <label className="block font-medium">To</label>
          <input
            type="email"
            name="to"
            value={form.to}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
            placeholder="recipient@example.com"
          />
        </div>

        {/* SUBJECT FIELD */}
        <div className="mb-4">
          <label className="block font-medium">Subject</label>
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
            placeholder="Enter subject"
          />
        </div>

        {/* BODY FIELD */}
        <div className="mb-4">
          <label className="block font-medium">Body</label>
          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            rows={5}
            className="w-full border p-2 rounded mt-1"
            placeholder="Write your message here..."
          ></textarea>
        </div>

        {/* ATTACHMENT */}
        <div className="mb-4">
          <label className="block font-medium">Resume Attachment</label>
          <input
            type="file"
            onChange={handleFile}
            className="w-full border p-2 rounded mt-1"
          />
          {form.attachmentName && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {form.attachmentName}
            </p>
          )}
        </div>

        {/* OPEN GMAIL BUTTON */}
        <button
          onClick={handleOpenGmail}
          disabled={loading}
          className="mt-6 flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition"
        >
          <Mail size={22} />
          {loading ? "Creating Draft..." : "Open Gmail Draft"}
        </button>
      </div>
    </div>
  );
}\\\\\\\\\\\