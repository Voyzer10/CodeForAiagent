/**
 * Job Search & Filtration Engine - Pure Logic Module
 * 🚫 DO NOT ADD UI LOGIC HERE
 * 🚫 DO NOT MODIFY SEARCHING/FILTERING LOGIC WITHOUT EXPLICIT APPROVAL
 */

/**
 * Normalizes and deduplicates jobs for saved searches
 * @param {Array} jobsArray 
 * @returns {Array}
 */
export const normalizeJobs = (jobsArray = []) => {
    const map = new Map();

    jobsArray.forEach((item) => {
        if (item?.jobs && Array.isArray(item.jobs)) {
            item.jobs.forEach(addJob);
        } else {
            addJob(item);
        }
    });

    function addJob(job) {
        const uuid = job?.jobid || job?.jobId || job?.id || job?._id;
        if (!uuid) return;
        map.set(uuid, job);
    }

    return Array.from(map.values());
};

/**
 * Filter logic for Saved Searches
 * @param {Object|String} search 
 * @param {Array} userJobs 
 * @returns {Object} { filteredJobs, activeSearch, currentSession }
 */
export const getFilteredJobsBySearch = (search, userJobs) => {
    console.log("🔍 [SearchEngine] Saved search logic running:", search);

    if (search === "All Jobs") {
        return {
            filteredJobs: userJobs,
            activeSearch: "All Jobs",
            currentSession: null
        };
    }

    if (!search?.runId) {
        console.warn("⚠️ [SearchEngine] Saved search has no runId:", search);
        return {
            filteredJobs: [],
            activeSearch: search?.name || "Filtered Search",
            currentSession: null
        };
    }

    const matchedJobs = userJobs.filter((job) => {
        return (
            job.runId === search.runId ||
            job.sessionId === search.runId ||
            job.sessionid === search.runId
        );
    });

    console.log("⚡ [SearchEngine] Search runId:", search.runId, "| Found:", matchedJobs.length);

    return {
        filteredJobs: matchedJobs,
        activeSearch: search.name,
        currentSession: null
    };
};

/**
 * Filter logic for Session Waves
 * @param {Object} session 
 * @param {Array} userJobs 
 * @returns {Object} { filteredJobs, activeSearch }
 */
export const getFilteredJobsBySession = (session, userJobs) => {
    console.log("🌊 [SearchEngine] Session logic running:", session);

    const sessionId = session.sessionId;
    const sessionTime = new Date(session.timestamp).getTime();

    let sessionJobs = userJobs.filter((job) => job.sessionId === sessionId);
    console.log(`🔍 [SearchEngine] Exact ID match for sessionId="${sessionId}": ${sessionJobs.length} jobs`);

    if (sessionJobs.length === 0) {
        console.warn("🕒 [SearchEngine] No jobs found by Session ID. Trying time-based matching...");
        sessionJobs = userJobs.filter((job) => {
            const jobTime = new Date(job.postedAt || job.createdAt || job.datePosted).getTime();
            if (isNaN(jobTime)) return false;

            const diff = Math.abs(jobTime - sessionTime);
            return diff < 10 * 60 * 1000; // 10 minute window
        });
        console.log(`🕒 [SearchEngine] Time-based match: ${sessionJobs.length} jobs found`);
    }

    const displayName = session.sessionName || new Date(session.timestamp).toLocaleString();

    return {
        filteredJobs: sessionJobs,
        activeSearch: `Session: ${displayName}`
    };
};
