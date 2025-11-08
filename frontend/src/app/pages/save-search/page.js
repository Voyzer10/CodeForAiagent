"use client";

import { useState } from "react";

export default function SaveSearchPage({ filteredJobs = [], API_BASE_URL }) {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);

  const saveCurrentSearch = async () => {
    if (!newSearchName.trim()) {
      alert("Please enter a search name.");
      return;
    }

    const jobsPayload = filteredJobs.map((job) => ({
      title: job.Title || job.title || "(No title)",
      company:
        job.Company ||
        job.CompanyName ||
        job.organization ||
        "Unknown Company",
      description:
        job.Description ||
        job.descriptionText ||
        job.descriptionHtml ||
        "No description available",
      location: job.Location || job.location || "",
      link: job.link || job.applyUrl || "",
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/userjobs/searches/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newSearchName, jobs: jobsPayload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save search");

      setRecentSearches((prev) => [data.savedSearch, ...prev.slice(0, 9)]);
      setSaveModalOpen(false);
      setNewSearchName("");
      alert("Search saved successfully!");
    } catch (err) {
      console.error("[JobFound] saveCurrentSearch error:", err);
      alert(err.message || "Error saving search");
    }
  };

  return (
    <div>
      {/* Save Button */}
      <button
        onClick={() => setSaveModalOpen(true)}
        className="px-3 py-2 text-sm rounded-md bg-green-700/30 border border-green-700 text-green-300 hover:bg-green-700/50 transition"
      >
        Save This Search
      </button>

      {/* Save Search Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-[#13201c] border border-green-900 rounded-xl w-11/12 md:w-1/3 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-green-400 mb-4">
              Save This Search
            </h3>

            <input
              type="text"
              placeholder="Enter search name"
              value={newSearchName}
              onChange={(e) => setNewSearchName(e.target.value)}
              className="w-full px-3 py-2 mb-4 text-black rounded-md"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={saveCurrentSearch}
                className="px-4 py-2 bg-green-600 text-black rounded-md hover:bg-green-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
