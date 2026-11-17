const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia",
  "Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts",
  "Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey",
  "New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming"
];

const INDUSTRIES = [
  "Technology",
  "Finance & FinTech",
  "Healthcare & HealthTech",
  "Government & Public Sector",
  "Education & EdTech",
  "Consulting & Professional Services",
  "Retail & E-commerce",
  "Manufacturing & Industrial",
  "Telecommunications",
  "Media & Entertainment",
  "Transportation & Logistics",
  "Energy & Utilities",
  "Nonprofit & NGOs",
  "Hospitality & Tourism",
  "Real Estate & PropTech"
];

const INDUSTRY_TARGET_ROLES = {
  "Technology": [
    "Software Engineer","Backend Developer","Frontend Developer","Full-Stack Developer","Cloud Engineer",
    "DevOps Engineer","Site Reliability Engineer","AI Engineer","Machine Learning Engineer","Data Engineer",
    "Data Analyst","Cybersecurity Analyst","Security Engineer","Solutions Architect","Product Analyst",
    "Product Manager","Database Administrator","Network Engineer","Systems Analyst"
  ],
  "Finance & FinTech": [
    "Business Analyst","Data Analyst","Product Analyst","Product Manager","Software Engineer",
    "Backend Developer","Cloud Engineer","Cybersecurity Analyst","Risk Analyst","Compliance Analyst"
  ],
  "Healthcare & HealthTech": [
    "Data Analyst","Business Analyst","Software Engineer","Backend Developer","Cloud Engineer",
    "AI Engineer","Cybersecurity Analyst","Systems Analyst","Product Analyst"
  ],
  "Government & Public Sector": [
    "Business Analyst","Systems Analyst","Data Analyst","Cybersecurity Analyst","Security Engineer",
    "Cloud Engineer","Solutions Architect","Project Manager"
  ],
  "Education & EdTech": [
    "Business Analyst","Data Analyst","Software Engineer","Full-Stack Developer","Product Analyst",
    "Product Manager","Systems Analyst","Cloud Engineer"
  ],
  "Consulting & Professional Services": [
    "Business Analyst","Systems Analyst","Data Analyst","Product Analyst","Project Manager",
    "Cloud Engineer","Solutions Architect","Cybersecurity Analyst"
  ],
  "Retail & E-commerce": [
    "Data Analyst","Product Analyst","Product Manager","Software Engineer","Frontend Developer",
    "Backend Developer","Full-Stack Developer","Cloud Engineer"
  ],
  "Manufacturing & Industrial": [
    "Business Analyst","Data Analyst","Systems Analyst","Network Engineer","Cloud Engineer","Project Manager"
  ],
  "Telecommunications": [
    "Network Engineer","Cloud Engineer","Cybersecurity Analyst","Systems Analyst","Data Analyst","Software Engineer"
  ],
  "Media & Entertainment": [
    "Frontend Developer","Full-Stack Developer","Data Analyst","Product Analyst","Product Manager","Software Engineer"
  ],
  "Transportation & Logistics": [
    "Data Analyst","Business Analyst","Systems Analyst","Cloud Engineer","Software Engineer","Product Analyst"
  ],
  "Energy & Utilities": [
    "Data Analyst","Business Analyst","Systems Analyst","Cloud Engineer","Cybersecurity Analyst","Project Manager"
  ],
  "Nonprofit & NGOs": [
    "Business Analyst","Data Analyst","Project Manager","Systems Analyst","Product Analyst"
  ],
  "Hospitality & Tourism": [
    "Business Analyst","Data Analyst","Product Analyst","Software Engineer","Frontend Developer"
  ],
  "Real Estate & PropTech": [
    "Business Analyst","Data Analyst","Product Analyst","Software Engineer","Full-Stack Developer","Cloud Engineer"
  ]
};

const SKILL_CATEGORIES = {
  "Programming": [
    "Python","Java","JavaScript","TypeScript","C","C++","C#","Go","Rust","R","MATLAB",
    "Kotlin","Swift","PHP","Ruby","Scala","Perl","Shell Scripting (Bash)"
  ],
  "Web Development": [
    "HTML","CSS","React","Angular","Vue.js","Node.js","Express.js","Next.js","Bootstrap",
    "Tailwind CSS","REST API Development","GraphQL","jQuery","Responsive Design",
    "JWT Authentication","API Integration"
  ],
  "Databases": [
    "SQL","MySQL","PostgreSQL","MongoDB","Oracle Database","Microsoft SQL Server","Firebase",
    "Redis","Cassandra","DynamoDB","Snowflake","Data Warehousing","Database Design",
    "Database Normalization","ETL"
  ],
  "Cloud & Platforms": [
    "AWS","AWS EC2","AWS S3","AWS Lambda","AWS RDS","AWS IAM","AWS CloudFormation","AWS VPC",
    "Microsoft Azure","Azure Functions","Azure Blob Storage","Azure Virtual Machines","Azure DevOps",
    "Google Cloud Platform (GCP)","Cloud Run","Serverless Architecture","Cloud Architecture","Cloud Security"
  ],
  "Data & BI": [
    "Data Analysis","Data Visualization","Power BI","Tableau","Excel Analytics","Pandas","NumPy",
    "Data Cleaning","Data Transformation","Dashboard Development","KPI Reporting",
    "Business Intelligence","Statistical Analysis","Exploratory Data Analysis (EDA)"
  ],
  "AI / ML": [
    "Machine Learning","Deep Learning","Natural Language Processing (NLP)","Computer Vision",
    "Feature Engineering","Model Evaluation","TensorFlow","Keras","PyTorch","Scikit-learn",
    "OpenCV","Prompt Engineering","LLM Applications","Model Deployment"
  ],
  "DevOps": [
    "Docker","Kubernetes","CI/CD Pipelines","GitHub Actions","Jenkins","Terraform","Ansible","Linux",
    "Infrastructure as Code (IaC)","Containerization","Deployment Automation","Monitoring","Prometheus","Grafana"
  ],
  "Networking": [
    "TCP/IP","DNS","HTTP/HTTPS","VPN","Load Balancing","Routing & Switching","Firewalls",
    "OSI Model","Subnetting","Network Troubleshooting","Network Security"
  ],
  "Cybersecurity": [
    "Identity & Access Management (IAM)","Penetration Testing","Security Auditing","Encryption",
    "Threat Detection","Vulnerability Assessment","Security Compliance (ISO/NIST)","Incident Response",
    "SIEM Tools","Ethical Hacking","Risk Assessment","Security Monitoring","Access Control",
    "Cybersecurity Fundamentals"
  ],
  "Software Engineering": [
    "Data Structures","Algorithms","Object-Oriented Programming (OOP)","Functional Programming",
    "Design Patterns","System Design","Scalable System Design","Microservices Architecture",
    "Monolithic Architecture","API Design","RESTful API Design","GraphQL API Design",
    "Software Development Lifecycle (SDLC)","Test-Driven Development (TDD)","Unit Testing",
    "Integration Testing","Debugging","Code Optimization","Performance Tuning","Version Control (Git)",
    "Clean Code Principles","Refactoring","Concurrency & Multithreading","Memory Management",
    "Distributed Systems","Event-Driven Architecture","Domain-Driven Design (DDD)"
  ],
  "Business / Functional Tech": [
    "Business Analysis","Requirement Gathering","Stakeholder Management","Stakeholder Communication",
    "Process Modeling","Process Improvement","Business Process Reengineering (BPR)","Agile Methodology",
    "Scrum Framework","Kanban","User Story Writing","Use Case Development","Product Management",
    "Product Roadmapping","Market Analysis","Data-Driven Decision Making","KPI & Metrics Definition",
    "Risk Assessment","Cost-Benefit Analysis","Change Management","Documentation & Reporting",
    "Project Management","Cross-functional Collaboration","Strategic Planning","Customer Journey Mapping",
    "UX Thinking (Basic)"
  ],
  "Tools & Platforms": [
    "VS Code","IntelliJ IDEA","Eclipse","Jupyter Notebook","Postman","Figma","Jira","ServiceNow",
    "SAP","UiPath","Power Automate","GitHub","GitLab","Bitbucket","Notion"
  ]
};

const ALL_SKILLS = [...new Set(Object.values(SKILL_CATEGORIES).flat())];

const sectionConfig = {
  education: {
    template: "educationTemplate",
    container: "educationContainer",
    addBtn: 'button[data-add="education"]',
    max: 3,
    title: ["Latest Education", "Education 2", "Education 3"]
  },
  targetRole: {
    template: "targetRoleTemplate",
    container: "targetRoleContainer",
    addBtn: 'button[data-add="targetRole"]',
    max: 3,
    title: ["Target Role 1", "Target Role 2", "Target Role 3"]
  },
  location: {
    template: "locationTemplate",
    container: "locationContainer",
    addBtn: 'button[data-add="location"]',
    max: 5,
    title: ["Preferred Location 1", "Preferred Location 2", "Preferred Location 3", "Preferred Location 4", "Preferred Location 5"]
  },
  experience: {
    template: "experienceTemplate",
    container: "experienceContainer",
    addBtn: 'button[data-add="experience"]',
    max: 3,
    title: ["Latest Experience", "Experience 2", "Experience 3"]
  },
  project: {
    template: "projectTemplate",
    container: "projectContainer",
    addBtn: 'button[data-add="project"]',
    max: 3,
    title: ["Related Project 1", "Related Project 2", "Related Project 3"]
  },
  certification: {
    template: "certificationTemplate",
    container: "certificationContainer",
    addBtn: 'button[data-add="certification"]',
    max: 3,
    title: ["Related Certification 1", "Related Certification 2", "Related Certification 3"]
  }
};

function populateStates(root = document) {
  root.querySelectorAll('.us-state-select').forEach(select => {
    const existing = new Set(Array.from(select.options).map(opt => opt.value));
    US_STATES.forEach(state => {
      if (!existing.has(state)) {
        const opt = document.createElement('option');
        opt.value = state;
        opt.textContent = state;
        select.appendChild(opt);
      }
    });
  });
}

function fillSimpleSelect(select, options) {
  if (!select) return;
  options.forEach(value => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value;
    select.appendChild(opt);
  });
}

function buildMenu(menu, values, inputName) {
  menu.innerHTML = '';
  values.forEach(value => {
    const label = document.createElement('label');
    label.className = 'msItem';
    label.innerHTML = `<input type="checkbox" value="${value}" name="${inputName}"> ${value}`;
    menu.appendChild(label);
  });
}

function setupMultiSelect(ms, onChangeCallback = null) {
  if (!ms) return;
  ms.dataset.bound = 'true';

  const max = Number(ms.dataset.max || '99');
  const btn = ms.querySelector('.msBtn');
  const menu = ms.querySelector('.msMenu');
  const chips = ms.querySelector('.msChips');
  const placeholder = ms.querySelector('.msPlaceholder');

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    menu.hidden = !menu.hidden;
  });

  document.addEventListener('click', (e) => {
    if (!ms.contains(e.target)) menu.hidden = true;
  });

  function renderChips() {
    const checked = Array.from(ms.querySelectorAll('.msItem input:checked'));
    chips.innerHTML = '';

    checked.forEach(input => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.innerHTML = `${input.value} <button type="button" aria-label="Remove">✕</button>`;
      chip.querySelector('button').addEventListener('click', () => {
        input.checked = false;
        renderChips();
        if (onChangeCallback) onChangeCallback(getSelectedValues(ms));
      });
      chips.appendChild(chip);
    });

    placeholder.textContent = checked.length ? `${checked.length} selected` : 'Select options';
  }

  ms.querySelectorAll('.msItem input').forEach(cb => {
    cb.addEventListener('change', () => {
      const count = ms.querySelectorAll('.msItem input:checked').length;
      if (count > max) cb.checked = false;
      renderChips();
      if (onChangeCallback) onChangeCallback(getSelectedValues(ms));
    });
  });

  renderChips();
}

function getSelectedValues(ms) {
  return Array.from(ms.querySelectorAll('.msItem input:checked')).map(i => i.value);
}

function createSectionCard(section) {
  const config = sectionConfig[section];
  const container = document.getElementById(config.container);
  const currentCount = container.children.length;
  if (currentCount >= config.max) return;

  const template = document.getElementById(config.template);
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector('[data-block]');
  const index = currentCount + 1;

  card.dataset.index = index;
  card.querySelector('.subCardTitle').textContent = config.title[currentCount];

  card.querySelectorAll('[data-field]').forEach(el => {
    const field = el.dataset.field;
    if (el.type === 'radio') {
      el.name = `${section}_${field}_${index}`;
    } else {
      el.name = `${section}[${index}][${field}]`;
    }
  });

  const removeBtn = card.querySelector('[data-remove]');
  if (index === 1) {
    removeBtn.style.visibility = 'hidden';
    removeBtn.tabIndex = -1;
  } else {
    removeBtn.addEventListener('click', () => {
      card.remove();
      refreshSectionTitles(section);
    });
  }

  container.appendChild(card);
  initializeDynamicCard(card, section);
  refreshSectionTitles(section);
}

function refreshSectionTitles(section) {
  const config = sectionConfig[section];
  const container = document.getElementById(config.container);

  Array.from(container.children).forEach((card, idx) => {
    card.dataset.index = idx + 1;

    const title = card.querySelector('.subCardTitle');
    if (title) title.textContent = config.title[idx];

    card.querySelectorAll('[data-field]').forEach(el => {
      const field = el.dataset.field;
      if (el.type === 'radio') {
        el.name = `${section}_${field}_${idx + 1}`;
      } else {
        el.name = `${section}[${idx + 1}][${field}]`;
      }
    });

    if (section === 'location') {
      const note = card.querySelector('.miniMuted');
      if (note) {
        note.textContent = idx === 0 ? 'Required location preference.' : 'Optional location preference.';
      }

      card.querySelectorAll('[data-field]').forEach(el => {
        if (idx === 0 && ['state', 'city', 'priority'].includes(el.dataset.field)) {
          el.required = true;
        } else {
          el.required = false;
        }
      });
    }

    const removeBtn = card.querySelector('[data-remove]');
    if (removeBtn) {
      const locked = idx === 0;
      removeBtn.style.visibility = locked ? 'hidden' : 'visible';
      removeBtn.tabIndex = locked ? -1 : 0;
      if (!locked && !removeBtn.dataset.bound) {
        removeBtn.dataset.bound = 'true';
        removeBtn.addEventListener('click', () => {
          card.remove();
          refreshSectionTitles(section);
        });
      }
    }
  });

  const addBtn = document.querySelector(config.addBtn);
  if (addBtn) addBtn.disabled = container.children.length >= config.max;
}

function initializeDynamicCard(card, section) {
  populateStates(card);

  card.querySelectorAll('.industry-select').forEach(select => {
    fillSimpleSelect(select, INDUSTRIES);
  });

  if (section === 'targetRole') {
    const industrySelect = card.querySelector('.target-industry-select');
    const roleSelect = card.querySelector('.target-role-select');

    industrySelect.addEventListener('change', () => {
      roleSelect.innerHTML = '<option value="" selected>Select role</option>';
      const roles = INDUSTRY_TARGET_ROLES[industrySelect.value] || [];
      fillSimpleSelect(roleSelect, roles);
    });
  }

  card.querySelectorAll('.skill-multiselect').forEach((ms, index) => {
    const inputName = `${section}SkillSet${index + 1}`;
    buildMenu(ms.querySelector('.msMenu'), ALL_SKILLS, inputName);
    setupMultiSelect(ms);
  });

  card.querySelectorAll('.wordLimit').forEach(setupWordLimit);
}

function setupWordLimit(textarea) {
  const maxWords = Number(textarea.dataset.maxWords || '200');
  const label = textarea.closest('.field')?.querySelector('[data-count-label]');

  function update() {
    const words = textarea.value.trim().split(/\s+/).filter(Boolean);
    if (words.length > maxWords) {
      textarea.value = words.slice(0, maxWords).join(' ');
    }

    const currentWords = textarea.value.trim().split(/\s+/).filter(Boolean);
    const count = textarea.value.trim() ? currentWords.length : 0;
    if (label) label.textContent = `${count} / ${maxWords} words`;
  }

  textarea.addEventListener('input', update);
  update();
}

function createSkillCategoryCard() {
  const container = document.getElementById('skillCategoryContainer');
  const template = document.getElementById('skillCategoryTemplate');
  const index = container.children.length + 1;

  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector('.skillCategoryCard');
  card.dataset.index = index;
  card.querySelector('.subCardTitle').textContent = `Skill Category ${index}`;

  const categorySelect = card.querySelector('.skill-category-select');
  fillSimpleSelect(categorySelect, Object.keys(SKILL_CATEGORIES));
  categorySelect.name = `skillCategoryBlock[${index}][skillCategory]`;

  const skillMulti = card.querySelector('.category-skill-multiselect');
  const menu = skillMulti.querySelector('.msMenu');
  const generatedRows = card.querySelector('.generatedSkillRows');

  function renderGeneratedSkillRows(selectedSkills) {
    generatedRows.innerHTML = '';

    selectedSkills.forEach((skillName, skillIndex) => {
      const skillTemplate = document.getElementById('generatedSkillRowTemplate');
      const skillFragment = skillTemplate.content.cloneNode(true);
      const row = skillFragment.querySelector('.generatedSkillRow');

      row.querySelector('.generatedSkillName').textContent = skillName;

      row.querySelectorAll('[data-subfield]').forEach(el => {
        const subfield = el.dataset.subfield;
        el.name = `skillCategoryBlock[${index}][skills][${skillIndex + 1}][${subfield}]`;
      });

      const hiddenSkillName = document.createElement('input');
      hiddenSkillName.type = 'hidden';
      hiddenSkillName.name = `skillCategoryBlock[${index}][skills][${skillIndex + 1}][skillName]`;
      hiddenSkillName.value = skillName;
      row.appendChild(hiddenSkillName);

      generatedRows.appendChild(row);
    });
  }

  categorySelect.addEventListener('change', () => {
    menu.innerHTML = '';
    skillMulti.querySelector('.msChips').innerHTML = '';
    skillMulti.querySelector('.msPlaceholder').textContent = 'Select skills';
    generatedRows.innerHTML = '';

    const skills = SKILL_CATEGORIES[categorySelect.value] || [];
    buildMenu(menu, skills, `skillCategoryBlock${index}Skills`);
    setupMultiSelect(skillMulti, renderGeneratedSkillRows);
  });

  const removeBtn = card.querySelector('[data-remove]');
  if (index === 1) {
    removeBtn.style.visibility = 'hidden';
    removeBtn.tabIndex = -1;
  } else {
    removeBtn.addEventListener('click', () => {
      card.remove();
      refreshSkillCategoryCards();
    });
  }

  container.appendChild(card);
  refreshSkillCategoryCards();
}

function refreshSkillCategoryCards() {
  const container = document.getElementById('skillCategoryContainer');

  Array.from(container.children).forEach((card, idx) => {
    const index = idx + 1;
    card.dataset.index = index;
    card.querySelector('.subCardTitle').textContent = `Skill Category ${index}`;

    const categorySelect = card.querySelector('.skill-category-select');
    if (categorySelect) {
      categorySelect.name = `skillCategoryBlock[${index}][skillCategory]`;
    }

    const selectedSkillRows = card.querySelectorAll('.generatedSkillRow');
    selectedSkillRows.forEach((row, skillIdx) => {
      row.querySelectorAll('[data-subfield]').forEach(el => {
        const subfield = el.dataset.subfield;
        el.name = `skillCategoryBlock[${index}][skills][${skillIdx + 1}][${subfield}]`;
      });
      const hidden = row.querySelector('input[type="hidden"]');
      if (hidden) {
        hidden.name = `skillCategoryBlock[${index}][skills][${skillIdx + 1}][skillName]`;
      }
    });

    const removeBtn = card.querySelector('[data-remove]');
    if (removeBtn) {
      const locked = idx === 0;
      removeBtn.style.visibility = locked ? 'hidden' : 'visible';
      removeBtn.tabIndex = locked ? -1 : 0;
    }
  });
}

function createLanguageRow() {
  const container = document.getElementById('languageContainer');
  const template = document.getElementById('languageRowTemplate');
  const index = container.children.length + 1;
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector('.languageCard');

  card.querySelector('.subCardTitle').textContent = `Language ${index}`;

  card.querySelectorAll('[data-field]').forEach(el => {
    el.name = `language[${index}][${el.dataset.field}]`;
  });

  const removeBtn = card.querySelector('[data-remove]');
  if (index === 1) {
    removeBtn.style.visibility = 'hidden';
    removeBtn.tabIndex = -1;
  } else {
    removeBtn.addEventListener('click', () => {
      card.remove();
      refreshLanguageRows();
    });
  }

  container.appendChild(card);
  refreshLanguageRows();
}

function refreshLanguageRows() {
  const container = document.getElementById('languageContainer');

  Array.from(container.children).forEach((card, idx) => {
    card.querySelector('.subCardTitle').textContent = `Language ${idx + 1}`;
    card.querySelectorAll('[data-field]').forEach(el => {
      el.name = `language[${idx + 1}][${el.dataset.field}]`;
    });

    const removeBtn = card.querySelector('[data-remove]');
    if (removeBtn) {
      const locked = idx === 0;
      removeBtn.style.visibility = locked ? 'hidden' : 'visible';
      removeBtn.tabIndex = locked ? -1 : 0;
    }
  });
}

function initializeFormStructure() {
  populateStates(document);

  createSectionCard('education');
  createSectionCard('targetRole');
  createSectionCard('location');
  createSkillCategoryCard();
  createSectionCard('experience');
  createSectionCard('project');
  createSectionCard('certification');
  createLanguageRow();

  document.querySelectorAll('button[data-add]').forEach(btn => {
    btn.addEventListener('click', () => createSectionCard(btn.dataset.add));
  });

  document.getElementById('addSkillCategoryBtn').addEventListener('click', createSkillCategoryCard);
  document.getElementById('addLanguageBtn').addEventListener('click', createLanguageRow);
}

document.addEventListener('DOMContentLoaded', () => {
  initializeFormStructure();

  const form = document.getElementById('assessmentForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const roleSelect = document.querySelector('[name="targetRole[1][targetRole]"]');
    const locState = document.querySelector('[name="location[1][state]"]');
    const locCity = document.querySelector('[name="location[1][city]"]');
    const locPriority = document.querySelector('[name="location[1][priority]"]');
    const skillCategory = document.querySelector('[name="skillCategoryBlock[1][skillCategory]"]');
    const generatedSkill = document.querySelector('.generatedSkillRows input[type="hidden"]');

    if (!roleSelect || !roleSelect.value) {
      alert('Please select at least 1 target role.');
      return;
    }

    if (!locState || !locState.value || !locCity || !locCity.value || !locPriority || !locPriority.value) {
      alert('Please complete at least Preferred Location 1.');
      return;
    }

    if (!skillCategory || !skillCategory.value || !generatedSkill) {
      alert('Please select at least 1 skill category and at least 1 skill.');
      return;
    }

    alert('Assessment form is ready for backend integration.');
  });
});