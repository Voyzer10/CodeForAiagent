"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import UserNavbar from "./Navbar";
import Sidebar from "./Sidebar";





export default function UserPanel() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [showPrices, setShowPrices] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // ✅ Fetch current user (name + id) on mount
  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch user");

        setUser(data.user);
      } catch (err) {
        console.error("Fetch user error:", err);
        setError(err.message);
      }
    };
    fetchUser();
  }, []);





  // Step 1: Check payment before allowing job fetch
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // 1️⃣ Check if user has active plan
      const planRes = await fetch("http://localhost:5000/api/payment/check", {
        method: "GET",
        credentials: "include",
      });
      const planData = await planRes.json();

      if (!planData.hasPlan) {
        // ❌ No plan — open full-screen Prices popup
        setShowPrices(true);
        setLoading(false);
        return;
      }

      // ✅ Proceed only if user has plan
      await continueToFetchJobs();
    } catch (err) {
      setError("Error verifying plan: " + err.message);
      setLoading(false);
    }
  };

  // Step 2: Function to continue with job fetching after payment verification
  const continueToFetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/userjobs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen bg-[#0a0f0d] text-white flex flex-col items-center px-4 pb-20">
      <UserNavbar onSidebarToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      {/* Title Section */}
      <div className="text-center mt-24 mb-10">
        <h2 className=" text-gray-400 tracking-wide text-lg">
          Connect your profiles and let AI find the right opportunities for you
        </h2>
        <div className="w-24 h-[2px] bg-green-500 mx-auto mt-3"></div>
      </div>

      {/* Form Card */}
      <div className="bg-[#1F2937] shadow-[0_0_15px_#00ff9d33] border border-[#1b2b27] rounded-xl w-full max-w-lg p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 ">
          {/* Job Title */}
          <div>
            <label className="flex items-center gap-2 text-gray-400 text-sm mb-1">

              <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_27_472)">
                  <path d="M5.03125 2.0625H8.96875C9.08906 2.0625 9.1875 2.16094 9.1875 2.28125V3.375H4.8125V2.28125C4.8125 2.16094 4.91094 2.0625 5.03125 2.0625ZM3.5 2.28125V3.375H1.75C0.784766 3.375 0 4.15977 0 5.125V7.75H5.25H8.75H14V5.125C14 4.15977 13.2152 3.375 12.25 3.375H10.5V2.28125C10.5 1.43633 9.81367 0.75 8.96875 0.75H5.03125C4.18633 0.75 3.5 1.43633 3.5 2.28125ZM14 8.625H8.75V9.5C8.75 9.98398 8.35898 10.375 7.875 10.375H6.125C5.64102 10.375 5.25 9.98398 5.25 9.5V8.625H0V12.125C0 13.0902 0.784766 13.875 1.75 13.875H12.25C13.2152 13.875 14 13.0902 14 12.125V8.625Z" fill="#4ADE80" />
                </g>
                <defs>
                  <clipPath id="clip0_27_472">
                    <path d="M0 0.75H14V14.75H0V0.75Z" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              Job Title
            </label>
            <input
              type="text"
              placeholder="e.g., Frontend Developer"
              className="w-full rounded-md bg-[#0e1513] text-green-300 border border-[#1b2b27] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-inner shadow-[#00ff9d22]"
            />
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <svg width="11" height="15" viewBox="0 0 11 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.89805 14.4C7.30078 12.6445 10.5 8.38984 10.5 6C10.5 3.10156 8.14844 0.75 5.25 0.75C2.35156 0.75 0 3.10156 0 6C0 8.38984 3.19922 12.6445 4.60195 14.4C4.93828 14.8184 5.56172 14.8184 5.89805 14.4ZM5.25 4.25C5.71413 4.25 6.15925 4.43437 6.48744 4.76256C6.81563 5.09075 7 5.53587 7 6C7 6.46413 6.81563 6.90925 6.48744 7.23744C6.15925 7.56563 5.71413 7.75 5.25 7.75C4.78587 7.75 4.34075 7.56563 4.01256 7.23744C3.68437 6.90925 3.5 6.46413 3.5 6C3.5 5.53587 3.68437 5.09075 4.01256 4.76256C4.34075 4.43437 4.78587 4.25 5.25 4.25Z" fill="#4ADE80" />
              </svg>

              Location</label>
            <input
              type="text"
              placeholder="e.g., Bangalore, India"
              className="w-full rounded-md bg-[#0e1513] text-green-300 border border-[#1b2b27] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-inner shadow-[#00ff9d22]"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_27_478)">
                  <path d="M11.375 1.625H0.872266C0.391016 1.625 0 2.02148 0 2.5082V12.9918C0 13.4785 0.391016 13.875 0.872266 13.875H11.375C11.8562 13.875 12.25 13.4785 12.25 12.9918V2.5082C12.25 2.02148 11.8562 1.625 11.375 1.625ZM3.70234 12.125H1.88672V6.27891H3.70508V12.125H3.70234ZM2.79453 5.48047C2.21211 5.48047 1.7418 5.00742 1.7418 4.42773C1.7418 3.84805 2.21211 3.375 2.79453 3.375C3.37422 3.375 3.84727 3.84805 3.84727 4.42773C3.84727 5.01016 3.37695 5.48047 2.79453 5.48047ZM10.5082 12.125H8.69258V9.28125C8.69258 8.60313 8.67891 7.73086 7.74922 7.73086C6.80312 7.73086 6.6582 8.46914 6.6582 9.23203V12.125H4.84258V6.27891H6.58437V7.07734H6.60898C6.85234 6.61797 7.4457 6.13398 8.32891 6.13398C10.1664 6.13398 10.5082 7.34531 10.5082 8.92031V12.125Z" fill="#4ADE80" />
                </g>
                <defs>
                  <clipPath id="clip0_27_478">
                    <path d="M0 0.75H12.25V14.75H0V0.75Z" fill="white" />
                  </clipPath>
                </defs>
              </svg>

              LinkedIn Profile URL
            </label>

            <input
              type="url"
              placeholder="Paste your LinkedIn profile link"
              className="w-full rounded-md bg-[#0e1513] text-green-300 border border-[#1b2b27] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-inner shadow-[#00ff9d22]"
            />
          </div>

          {/* GitHub */}
          <div>
            <label className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.5625 17H0V0H13.5625V17Z" />
                <g clip-path="url(#clip0_27_451)">
                  <path d="M4.53633 12.6164C4.53633 12.6711 4.47344 12.7148 4.39414 12.7148C4.30391 12.723 4.24102 12.6793 4.24102 12.6164C4.24102 12.5617 4.30391 12.518 4.3832 12.518C4.46523 12.5098 4.53633 12.5535 4.53633 12.6164ZM3.68594 12.4934C3.6668 12.548 3.72148 12.6109 3.80352 12.6273C3.87461 12.6547 3.95664 12.6273 3.97305 12.5727C3.98945 12.518 3.9375 12.4551 3.85547 12.4305C3.78437 12.4113 3.70508 12.4387 3.68594 12.4934ZM4.89453 12.4469C4.81523 12.466 4.76055 12.518 4.76875 12.5809C4.77695 12.6355 4.84805 12.6711 4.93008 12.652C5.00938 12.6328 5.06406 12.5809 5.05586 12.5262C5.04766 12.4742 4.97383 12.4387 4.89453 12.4469ZM6.69375 1.96875C2.90117 1.96875 0 4.84805 0 8.64062C0 11.673 1.90859 14.268 4.63477 15.1813C4.98477 15.2441 5.10781 15.0281 5.10781 14.8504C5.10781 14.6809 5.09961 13.7457 5.09961 13.1715C5.09961 13.1715 3.18555 13.5816 2.78359 12.3566C2.78359 12.3566 2.47187 11.5609 2.02344 11.3559C2.02344 11.3559 1.39727 10.9266 2.06719 10.9348C2.06719 10.9348 2.74805 10.9895 3.12266 11.6402C3.72148 12.6957 4.725 12.3922 5.11602 12.2117C5.17891 11.7742 5.35664 11.4707 5.55352 11.2902C4.025 11.1207 2.48281 10.8992 2.48281 8.26875C2.48281 7.5168 2.69062 7.13945 3.12812 6.6582C3.05703 6.48047 2.82461 5.74766 3.19922 4.80156C3.7707 4.62383 5.08594 5.53984 5.08594 5.53984C5.63281 5.38672 6.2207 5.30742 6.80312 5.30742C7.38555 5.30742 7.97344 5.38672 8.52031 5.53984C8.52031 5.53984 9.83555 4.62109 10.407 4.80156C10.7816 5.75039 10.5492 6.48047 10.4781 6.6582C10.9156 7.14219 11.1836 7.51953 11.1836 8.26875C11.1836 10.9074 9.57305 11.118 8.04453 11.2902C8.29609 11.5062 8.50938 11.9164 8.50938 12.559C8.50938 13.4805 8.50117 14.6207 8.50117 14.8449C8.50117 15.0227 8.62695 15.2387 8.97422 15.1758C11.7086 14.268 13.5625 11.673 13.5625 8.64062C13.5625 4.84805 10.4863 1.96875 6.69375 1.96875ZM2.65781 11.3996C2.62227 11.427 2.63047 11.4898 2.67695 11.5418C2.7207 11.5855 2.78359 11.6047 2.81914 11.5691C2.85469 11.5418 2.84648 11.4789 2.8 11.427C2.75625 11.3832 2.69336 11.3641 2.65781 11.3996ZM2.3625 11.1781C2.34336 11.2137 2.3707 11.2574 2.42539 11.2848C2.46914 11.3121 2.52383 11.3039 2.54297 11.2656C2.56211 11.2301 2.53477 11.1863 2.48008 11.159C2.42539 11.1426 2.38164 11.1508 2.3625 11.1781ZM3.24844 12.1516C3.20469 12.1871 3.22109 12.2691 3.28398 12.3211C3.34687 12.384 3.42617 12.3922 3.46172 12.3484C3.49727 12.3129 3.48086 12.2309 3.42617 12.1789C3.36602 12.116 3.28398 12.1078 3.24844 12.1516ZM2.93672 11.7496C2.89297 11.777 2.89297 11.848 2.93672 11.9109C2.98047 11.9738 3.0543 12.0012 3.08984 11.9738C3.13359 11.9383 3.13359 11.8672 3.08984 11.8043C3.05156 11.7414 2.98047 11.7141 2.93672 11.7496Z" fill="#4ADE80" />
                </g>
                <defs>
                  <clipPath id="clip0_27_451">
                    <path d="M0 1.75H13.5625V15.75H0V1.75Z" fill="#4ADE80" />  </clipPath>
                </defs>
              </svg>

              GitHub Profile URL
            </label>
            <input
              type="url"
              placeholder="Paste your GitHub profile link"
              className="w-full rounded-md bg-[#0e1513] text-green-300 border border-[#1b2b27] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-inner shadow-[#00ff9d22]"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-green-300 text-black font-semibold py-2 rounded-md transition-all duration-300 shadow-[0_0_20px_#00ff9d55]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Processing...
              </>
            ) : (
              <>
                <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6562 20H0.65625V0H16.6562V20Z" />
                  <g clip-path="url(#clip0_27_456)">
                    <path d="M5.55003 14.0283L4.58441 13.0627C4.31878 12.7971 4.22503 12.4127 4.34378 12.0565C4.43753 11.7783 4.56253 11.4158 4.71253 11.0002H1.40628C1.13753 11.0002 0.88753 10.8565 0.753155 10.6221C0.61878 10.3877 0.621905 10.1002 0.759405 9.86896L2.40003 7.10334C2.80628 6.41896 3.54066 6.00021 4.33441 6.00021H6.90628C6.98128 5.87521 7.05628 5.75959 7.13128 5.64709C9.69066 1.87209 13.5032 1.74709 15.7782 2.16584C16.1407 2.23146 16.4219 2.51584 16.4907 2.87834C16.9094 5.15646 16.7813 8.96584 13.0094 11.5252C12.9 11.6002 12.7813 11.6752 12.6563 11.7502V14.3221C12.6563 15.1158 12.2375 15.8533 11.5532 16.2565L8.78753 17.8971C8.55628 18.0346 8.26878 18.0377 8.03441 17.9033C7.80003 17.769 7.65628 17.5221 7.65628 17.2502V13.9002C7.21566 14.0533 6.83128 14.1783 6.54066 14.2721C6.19066 14.3846 5.80941 14.2877 5.54691 14.0283H5.55003ZM12.6563 7.25021C12.9878 7.25021 13.3057 7.11852 13.5402 6.8841C13.7746 6.64968 13.9063 6.33173 13.9063 6.00021C13.9063 5.66869 13.7746 5.35075 13.5402 5.11633C13.3057 4.88191 12.9878 4.75021 12.6563 4.75021C12.3248 4.75021 12.0068 4.88191 11.7724 5.11633C11.538 5.35075 11.4063 5.66869 11.4063 6.00021C11.4063 6.33173 11.538 6.64968 11.7724 6.8841C12.0068 7.11852 12.3248 7.25021 12.6563 7.25021Z" fill="black" />
                  </g>
                  <defs>
                    <clipPath id="clip0_27_456">
                      <path d="M0.65625 2H16.6562V18H0.65625V2Z" fill="white" />
                    </clipPath>
                  </defs>
                </svg>

                Find Opportunities Now
              </>
            )}
          </button>

        </form>
      </div>
      {error && <p className="text-red-500 mt-2">Error: {error}</p>}

      {/* 🧑 User Info */}
      {user && (
        <div className="mt-10 p-4 bg-[#0d1512] border border-[#1b2b27] rounded-xl shadow-[0_0_10px_#00ff9d22] w-full max-w-lg text-sm text-gray-300">
          <p>
            <strong className="text-green-400">Name:</strong> {user.name}
          </p>
          <p>
            <strong className="text-green-400">User ID:</strong> {user.userId}
          </p>
        </div>
      )}

      {/* 🧠 Your Existing Prompt Section (Kept Intact) */}
      <div className="w-full max-w-3xl ">
        <div className="relative  mt-10  border-[#1b2b27] rounded-xl shadow-[0_0_15px_#00ff9d33]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              id="prompt"
              rows={5}
              cols={50}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              placeholder="Anything more to add..."
              className="border border-[#1b2b27] p-3 rounded bg-[#0e1513] text-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-inner shadow-[#00ff9d22]"
            />
          </form>



          {/* Job Results */}
          {response && Array.isArray(response) && (
            <div className="mt-6">
              <h3 className="text-green-400 font-semibold mb-3">Job Results:</h3>
              <div className="grid gap-4">
                {response.map((job, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[#0e1513] border border-[#1b2b27] rounded-md shadow-inner shadow-[#00ff9d22]"
                  >
                    <h4 className="text-green-300 font-semibold mb-1">
                      {job.title}
                    </h4>
                    <p className="font-medium text-gray-300">{job.company}</p>
                    <p className="text-sm text-gray-400">{job.location}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {job.description}
                    </p>
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 underline text-sm mt-2 inline-block"
                    >
                      View Job
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* n8n custom output */}
          {response && !Array.isArray(response) && response.output && (
            <div className="mt-6">
              <h3 className="text-green-400 font-semibold mb-2">Response:</h3>
              <p className="text-gray-300">{response.output}</p>
            </div>
          )}
        </div>

      </div>
      <div className="flex flex-col md:flex-row justify-center items-start gap-6 w-full  bg-[#0a0f0d] px-6 py-20 mt-10 ">
        {/* Lightning Fast */}
        <div className=" flex flex-col  justify-center items-center text-center bg-[#1F2937] border border-[#1b2b27] rounded-2xl shadow-[0_0_15px_#00ff9d33] p-6 transition-transform hover:scale-105 hover:shadow-[0_0_25px_#00ff9d55]">
          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-blue-500/20 text-blue-400 text-xl font-bold mb-4">
            ⚡
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Get job recommendations in seconds with our advanced AI algorithms.
          </p>
        </div>

        {/* Highly Targeted */}
        <div className="flex flex-col  justify-center items-center text-center bg-[#1F2937] border border-[#1b2b27] rounded-2xl shadow-[0_0_15px_#00ff9d33] p-6 transition-transform hover:scale-105 hover:shadow-[0_0_25px_#00ff9d55]">
          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-purple-500/20 text-purple-400 text-xl font-bold mb-4">
            🎯
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Highly Targeted</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Personalized matches based on your skills, preferences, and goals.
          </p>
        </div>

        {/* Privacy First */}
        <div className="flex flex-col  justify-center items-center text-center bg-[#1F2937] border border-[#1b2b27] rounded-2xl shadow-[0_0_15px_#00ff9d33] p-6 transition-transform hover:scale-105 hover:shadow-[0_0_25px_#00ff9d55]">
          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-green-500/20 text-green-400 text-xl font-bold mb-4">
            🔒
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Privacy First</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your data is secure and never shared with third parties.
          </p>
        </div>
      </div>
      {/* 💰 Prices Popup */}
      {/* 💰 Prices Popup */}
      {showPrices && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1F2937] border border-[#1b2b27] rounded-2xl shadow-[0_0_25px_#00ff9d66] p-8 max-w-3xl w-full mx-4 text-center relative">
            <button
              onClick={() => setShowPrices(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-green-400 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Choose Your Plan</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Basic Plan */}
              <div
                onClick={() => setSelectedPlan('basic')}
                className={`cursor-pointer p-6 rounded-xl border ${selectedPlan === 'basic'
                    ? 'border-green-400 shadow-[0_0_20px_#00ff9d66]'
                    : 'border-[#1b2b27]'
                  } bg-[#0d1512] hover:scale-105 transition-transform duration-300`}
              >
                <h3 className="text-lg font-semibold text-green-400 mb-2">Basic</h3>
                <p className="text-gray-300 mb-3">Access up to 10 AI job matches/month.</p>
                <p className="text-2xl font-bold text-green-400">₹199/mo</p>
              </div>

              {/* Pro Plan */}
              <div
                onClick={() => setSelectedPlan('pro')}
                className={`cursor-pointer p-6 rounded-xl border ${selectedPlan === 'pro'
                    ? 'border-green-400 shadow-[0_0_20px_#00ff9d66]'
                    : 'border-[#1b2b27]'
                  } bg-[#0d1512] hover:scale-105 transition-transform duration-300`}
              >
                <h3 className="text-lg font-semibold text-green-400 mb-2">Pro</h3>
                <p className="text-gray-300 mb-3">Unlimited job matches + resume AI tips.</p>
                <p className="text-2xl font-bold text-green-400">₹499/mo</p>
              </div>

              {/* Premium Plan */}
              <div
                onClick={() => setSelectedPlan('premium')}
                className={`cursor-pointer p-6 rounded-xl border ${selectedPlan === 'premium'
                    ? 'border-green-400 shadow-[0_0_20px_#00ff9d66]'
                    : 'border-[#1b2b27]'
                  } bg-[#0d1512] hover:scale-105 transition-transform duration-300`}
              >
                <h3 className="text-lg font-semibold text-green-400 mb-2">Premium</h3>
                <p className="text-gray-300 mb-3">
                  Pro features + priority AI matching + profile boost.
                </p>
                <p className="text-2xl font-bold text-green-400">₹999/mo</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!selectedPlan) return alert('Please select a plan!');
                // TODO: Redirect or call backend for payment
                alert(`Proceeding with ${selectedPlan.toUpperCase()} plan...`);
              }}
              className="mt-8 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-green-300 text-black font-semibold py-2 px-6 rounded-md transition-all duration-300 shadow-[0_0_20px_#00ff9d55]"
            >
              Continue
            </button>
          </div>
        </div>
      )}



    </div>
  );
}
