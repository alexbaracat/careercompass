// ======================================
// DASHBOARD JS
// ======================================


// ======================================
// 1. GENERAL HELPERS
// ======================================

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
}

function setWidth(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.width = value;
}

function safePercent(value) {
  if (value === null || value === undefined || value === "") return "%";
  return `${value}%`;
}

function safeValue(value, fallback = "--") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}


// ======================================
// 2. TOPBAR / PAGE HELPERS
// ======================================

function loadHelloUser() {
  const helloEl = document.getElementById("helloUser");
  if (!helloEl) return;

  const storedName = localStorage.getItem("cc_userName");
  helloEl.textContent = storedName ? `Hello, ${storedName}` : "Hello";
}

function loadNotificationState() {
  const notifDot = document.getElementById("notifDot");
  if (!notifDot) return;

  const hasNotifications = localStorage.getItem("cc_hasNotifications") === "true";

  if (hasNotifications) {
    notifDot.classList.add("show");
  } else {
    notifDot.classList.remove("show");
  }
}

function enableSmoothScrolling() {
  document.querySelectorAll(".subnav a").forEach(link => {
    link.addEventListener("click", function (e) {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      history.replaceState(null, "", href);
    });
  });
}


// ======================================
// 3. FIXED SECTION UPDATE FUNCTIONS
// Later backend data will call these.
// ======================================

function updateReadinessSection(data) {
  setText("readinessScoreValue", safePercent(data.ReadinessScore));
  setText("lastAssessmentDate", safeValue(data.LastAssessmentDate, "Not available"));
  setText("previousScore", safePercent(data.PreviousScore));
  setText("improvementTrend", safePercent(data.ImprovementTrend));
}

function updateComponentBreakdown(data) {
  setText("skillMatchValue", safePercent(data.SkillMatchScore));
  setWidth("skillMatchBar", safePercent(data.SkillMatchScore || 0));

  setText("experienceMatchValue", safePercent(data.ExperienceMatchScore));
  setWidth("experienceMatchBar", safePercent(data.ExperienceMatchScore || 0));

  setText("educationMatchValue", safePercent(data.EducationMatchScore));
  setWidth("educationMatchBar", safePercent(data.EducationMatchScore || 0));

  setText("readinessBandValue", safeValue(data.ReadinessBand, "--"));
  setWidth("readinessBandBar", safePercent(data.ReadinessBandProgress || 0));
}

function updateSkillBreakdown(data) {
  setText("matchedSkillsCount", safeValue(data.MatchedSkillsCount, "0"));
  setText("missingSkillsCount", safeValue(data.MissingSkillsCount, "0"));
  setText("gapSeverityText", safeValue(data.GapSeverityText, "--"));
}

function updateLearningPlanSection(data) {
  setText(
    "learningPlanDescription",
    safeValue(
      data.LearningPlanDescription,
      "Your personalized learning path will appear here after readiness analysis."
    )
  );
}

function updateNextBestAction(data) {
  setText(
    "priorityActionTitle",
    safeValue(data.PriorityActionTitle, "Start assessment to unlock your career roadmap")
  );

  setText(
    "priorityActionSub",
    safeValue(data.PriorityActionSub, "")
  );
}

function updateConstraintsSummary(data) {
  const constraintSubs = document.querySelectorAll(".constraint-item .c-sub");
  if (!constraintSubs || constraintSubs.length < 4) return;

  constraintSubs[0].textContent = safeValue(data.WorkAuthorization, "Not set");
  constraintSubs[1].textContent = safeValue(data.EmploymentTypePreference, "Not set");
  constraintSubs[2].textContent = safeValue(data.WorkModePreference, "Not set");
  constraintSubs[3].textContent = safeValue(data.ExperienceLevel, "Not set");
}

function updateLocationPreferences(locations) {
  const slots = document.querySelectorAll("#preferred-locations-card .location-slot");
  if (!slots.length) return;

  slots.forEach((slot, index) => {
    const value = locations && locations[index] ? locations[index] : "";
    slot.textContent = value;
  });
}

// ======================================
// 4. OVERALL READINESS SCORE SECTION
// ======================================

function getRoleMatchLabel(score) {
  if (score >= 80) return { text: "Great Fit", className: "strong" };
  if (score >= 70) return { text: "Good Match", className: "good" };
  if (score >= 60) return { text: "Growth Opportunity", className: "growth" };
  return { text: "Not a Great Match", className: "poor" };
}

function updateTargetRoles(roles) {
  const grid = document.getElementById("rolesChartGrid");
  if (!grid) return;

  grid.innerHTML = "";

  (roles || []).slice(0, 3).forEach((role, index) => {
    const score = Number(role.MatchScore) || 0;
    const degrees = Math.max(0, Math.min(360, (score / 100) * 360));
    const ringColor =
      index === 0 ? "#22c55e" :
      index === 1 ? "#3b82f6" :
      "#8b5cf6";

    const match = getRoleMatchLabel(score);

    const card = document.createElement("div");
    card.className = "role-chart-card";

    card.innerHTML = `
      <div class="role-title">${safeValue(role.RoleTitle, `Role 0${index + 1}`)}</div>

      <div class="role-donut"
           style="background: conic-gradient(${ringColor} 0deg, ${ringColor} ${degrees}deg, rgba(255,255,255,0.55) ${degrees}deg);">
        <span>${score}%</span>
      </div>

      <div class="role-match ${match.className}">
        ${match.text}
      </div>
    `;

    grid.appendChild(card);
  });
}

// ======================================
// 5. AUTO GENERATED SECTION HELPERS
// ======================================

function renderSection(items, containerId, renderFunction, emptyTitle, emptySub) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-title">${emptyTitle}</div>
        <div class="empty-state-sub">${emptySub}</div>
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const card = renderFunction(item);
    container.appendChild(card);
  });
}

function getPriorityClass(priority) {
  if (!priority) return "";

  const p = String(priority).toLowerCase();

  if (p === "high") return "badge-high";
  if (p === "medium") return "badge-medium";
  if (p === "low") return "badge-low";

  return "";
}


// ======================================
// 6. AUTO GENERATED CARD BUILDERS
// ======================================

// Learning Resource Card
function createLearningResourceCard(resource) {
  const card = document.createElement("div");
  card.className = "auto-card resource-card";

  card.innerHTML = `
    <div class="auto-card-top">
      <div class="auto-card-left">
        <div class="auto-card-ic">
          <i class="fa-solid fa-book-open"></i>
        </div>

        <div>
          <div class="auto-card-title">${safeValue(resource.ProviderName, "Not available")}</div>
          <div class="auto-card-sub">${safeValue(resource.ResourceType, "Not available")}</div>
        </div>
      </div>
    </div>

    <div class="auto-card-actions">
      <a class="auto-link primary"
         href="${safeValue(resource.ResourceURL, "#")}"
         target="_blank"
         rel="noopener noreferrer">
         Open resource
      </a>
    </div>
  `;

  return card;
}


// Learning Item Card
function createLearningItemCard(item) {
  const card = document.createElement("div");
  card.className = "auto-card learning-item-card";

  const estimatedHours =
    item.EstimatedHours !== null &&
    item.EstimatedHours !== undefined &&
    item.EstimatedHours !== ""
      ? `${item.EstimatedHours} hours`
      : "Not available";

  card.innerHTML = `
    <div class="auto-card-top">
      <div class="auto-card-left">
        <div class="auto-card-ic">
          <i class="fa-solid fa-list-check"></i>
        </div>

        <div>
          <div class="auto-card-title">${safeValue(item.TaskTitle, "Not available")}</div>
          <div class="auto-card-sub">Estimated effort: ${estimatedHours}</div>
        </div>
      </div>
    </div>

    <div class="auto-card-meta">
      <span class="auto-badge ${getPriorityClass(item.PriorityLevel)}">
        Priority: ${safeValue(item.PriorityLevel, "Not available")}
      </span>
    </div>
  `;

  return card;
}


// Recommended Match Card
function createJobMatchCard(job) {
  const card = document.createElement("div");
  card.className = "auto-card match-card";

  const companyName = safeValue(job.CompanyName, "Not available");
  const jobLocation = safeValue(job.JobLocation, "Not available");
  const matchScore = safeValue(job.MatchScore, "--");
  const employmentType = safeValue(job.EmploymentType, "Not available");
  const sourcePlatform = safeValue(job.SourcePlatform, "Not available");

  const requiredExperienceYears =
    job.RequiredExperienceYears !== null &&
    job.RequiredExperienceYears !== undefined &&
    job.RequiredExperienceYears !== ""
      ? `${job.RequiredExperienceYears} yrs exp`
      : "Experience not available";

  card.innerHTML = `
    <div class="auto-card-top">
      <div class="auto-card-left">
        <div class="auto-card-ic">
          <i class="fa-solid fa-briefcase"></i>
        </div>

        <div>
          <div class="auto-card-title">${safeValue(job.JobTitle, "Not available")}</div>
          <div class="auto-card-sub">${companyName} • ${jobLocation}</div>
        </div>
      </div>

      <span class="auto-badge">${matchScore}% match</span>
    </div>

    <div class="auto-card-meta">
      <span class="auto-badge">${employmentType}</span>
      <span class="auto-badge">${requiredExperienceYears}</span>
      <span class="auto-badge">${sourcePlatform}</span>
      ${job.Salary ? `<span class="auto-badge">${job.Salary}</span>` : ""}
    </div>

    <div class="auto-card-actions">
      <a class="auto-link primary"
         href="${safeValue(job.JobURL, "#")}"
         target="_blank"
         rel="noopener noreferrer">
         View job
      </a>
    </div>
  `;

  return card;
}


// ======================================
// 7. AUTO GENERATED SECTION RENDERERS
// ======================================

function renderLearningResources(resources) {
  renderSection(
    resources,
    "learningResourcesContainer",
    createLearningResourceCard,
    "Learning resources will appear here",
    "Resources will be generated automatically after readiness analysis."
  );
}

function renderLearningItems(items) {
  renderSection(
    items,
    "learningItemsContainer",
    createLearningItemCard,
    "Learning items will appear here",
    "Action steps will be generated automatically after assessment."
  );
}

function renderRecommendedMatches(matches) {
  renderSection(
    matches,
    "recommendedMatchesContainer",
    createJobMatchCard,
    "Recommended matches will appear here",
    "Matching opportunities will be generated automatically after readiness analysis."
  );
}


// ======================================
// 8. MAIN DASHBOARD LOADER
// In future backend API data will call this.
// ======================================

function loadDashboard(data) {
  updateReadinessSection(data);
  updateComponentBreakdown(data);
  updateSkillBreakdown(data);
  updateLearningPlanSection(data);
  updateNextBestAction(data);
  updateConstraintsSummary(data);
  updateLocationPreferences(data.LocationPreferences || []);
  updateTargetRoles(data.TargetRoles || []);

  renderLearningResources(data.LearningResources || []);
  renderLearningItems(data.LearningItems || []);
  renderRecommendedMatches(data.RecommendedMatches || []);
}


// ======================================
// 9. TEMPORARY TEST DATA
// REMOVE ONLY THIS SECTION LATER
// when backend API is connected
// ======================================

const dashboardData = {
  ReadinessScore: 78,
  LastAssessmentDate: "March 12, 2026",
  PreviousScore: 72,
  ImprovementTrend: 6,

  SkillMatchScore: 82,
  ExperienceMatchScore: 68,
  EducationMatchScore: 75,
  ReadinessBand: "Moderate",
  ReadinessBandProgress: 70,

  MatchedSkillsCount: 12,
  MissingSkillsCount: 5,
  GapSeverityText: "Moderate",

  LearningPlanDescription:
    "Your personalized learning path is focused on strengthening cloud foundations, role-specific technical depth, and interview readiness for your selected target roles.",

  PriorityActionTitle: "Strengthen your cloud fundamentals and close your top skill gaps",

  TargetRoles: [
    {
      RoleTitle: "Cloud Engineer",
      MatchScore: 84,
      MatchLabel: "Strong Match"
    },
    {
      RoleTitle: "Data Analyst",
      MatchScore: 72,
      MatchLabel: "Good Match"
    },
    {
      RoleTitle: "AI Engineer",
      MatchScore: 61,
      MatchLabel: "Growth Opportunity"
    }
  ],

  LearningResources: [
    {
      ProviderName: "Microsoft Learning",
      ResourceType: "Certification",
      ResourceURL: "https://learn.microsoft.com"
    },
    {
      ProviderName: "AWS",
      ResourceType: "Online Course",
      ResourceURL: "https://aws.amazon.com/training"
    }
  ],

  LearningItems: [
    {
      TaskTitle: "Learn AWS Lambda Basics",
      PriorityLevel: "High",
      EstimatedHours: 6
    },
    {
      TaskTitle: "Practice SQL Queries",
      PriorityLevel: "Medium",
      EstimatedHours: 4
    }
  ],

  RecommendedMatches: [
    {
      JobTitle: "Cloud Engineer",
      CompanyName: "Amazon",
      JobLocation: "Seattle",
      EmploymentType: "Full-time",
      MatchScore: 82,
      RequiredExperienceYears: 2,
      Salary: "$95k-$120k",
      SourcePlatform: "LinkedIn",
      JobURL: "#"
    }
  ]
};


// ======================================
// 10. INITIALIZE PAGE
// ======================================

document.addEventListener("DOMContentLoaded", function () {
  loadHelloUser();
  loadNotificationState();
  enableSmoothScrolling();

  loadDashboard(dashboardData);
});