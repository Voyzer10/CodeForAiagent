// Simple UUID generator (RFC4122 v4-like)
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const items = $input.all();

// Trigger node se UserID lena hai
const userId = $('When Executed by Another Workflow').first().json['userid'];

if (!userId) {
  throw new Error("⚠ Missing UserID from trigger node. Stopping workflow.");
}

// Collections
const jobs = [];
const companies = [];
const jobPosters = [];
const applications = [];

// Deduplication maps
const companyMap = new Map();
const jobPosterMap = new Map();

items.forEach((item, index) => {
  // ✅ Direct item.json access (pehle try karo)
  let data = item.json;
  
  // ✅ Agar nested hai toh yeh try karo
  if (!data.jobPosterName && item.json?.json) {
    data = item.json.json;
  }
  
  // --- Company (Master) ---
  let companyId;
  const companyKey = data.companyName || Unknown_Company_${index};
  
  if (companyMap.has(companyKey)) {
    companyId = companyMap.get(companyKey);
  } else {
    companyId = uuid();
    companyMap.set(companyKey, companyId);
    companies.push({
      json: {
        CompanyID: companyId,
        Comp_Name: data.companyName || null,
        Linkedin_URL: data.companyLinkedinUrl || null,
        logo: data.companyLogo || null,
        website: data.companyWebsite || null,
        slogan: data.companySlogan || null,
        description: data.companyDescription || null,
        employeesCount: data.companyEmployeesCount || null,
        address: data.companyAddress || null,
        type: 'company'
      }
    });
  }
  
  // --- Job Poster ---
  let jobPosterId;
  
  if (data.jobPosterName) {
    if (jobPosterMap.has(data.jobPosterName)) {
      jobPosterId = jobPosterMap.get(data.jobPosterName);
    } else {
      jobPosterId = uuid();
      jobPosterMap.set(data.jobPosterName, jobPosterId);
      jobPosters.push({
        json: {
          jobPosterId: jobPosterId,
          name: data.jobPosterName || null,
          title: data.jobPosterTitle || null,
          profileUrl: data.jobPosterProfileUrl || null,
          photo: data.jobPosterPhoto || null,
          email: data.jobPosterEmail || null,
          phone: data.jobPosterPhone || null,
          companyId: companyId,
          type: 'jobPoster'
        }
      });
    }
  }
  
  // --- JobDetails (Master) ---
  const jobId = uuid();
  jobs.push({
    json: {
      jobid: jobId,  // ✅ JobID → jobid
      Title: data.title || null,
      Location: data.location || null,
      Posted_At: data.postedAt || null,
      applicantsCount: data.applicantsCount || null,
      Salary: data.salary || (Array.isArray(data.salaryInfo) ? data.salaryInfo[0] : null) || null,
      benefits: Array.isArray(data.benefits) ? data.benefits : [],
      DescriptionText: data.descriptionText || null,
      descriptionHtml: data.descriptionHtml || null,
      seniorityLevel: data.seniorityLevel || null,
      EmploymentType: data.employmentType || null,
      jobFunction: data.jobFunction || null,
      industries: data.industries || null,
      link: data.link || null,
      applyUrl: data.applyUrl || null,
      inputUrl: data.inputUrl || null,
      CompanyID: companyId,
      jobPosterid: jobPosterId,
      userid: userId,
      type: 'job'
    }
  });
  
  // --- Job_Applications (Transaction) ---
  applications.push({
    json: {
      id: data.id || null,
      jobid: jobId,  // ✅ jobId → jobid (same name)
      trackingId: data.trackingId || null,
      refId: data.refId || null,
      sent: data.sent?.toString().trim().toLowerCase() === "true",
      email_to: data.email_to || null,
      email_subject: data.email_subject || null,
      email_content: data.email_content || null,
      type: 'application'
    }
  });
});

// ✅ Combine all collections
const allItems = [
  ...companies,
  ...jobPosters,
  ...jobs,
  ...applications
];

return allItems;