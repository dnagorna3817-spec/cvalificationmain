document.documentElement.classList.add("js-enabled");

const fallbackData = {
  stats: [
    { value: "5", label: "годин" },
    { value: "6", label: "практичних завданнь" },
    { value: "70", label: "тестів" },
    { value: "✓", label: "сертифікат" }
  ],
  authorityCards: [
    { number: "01", title: "Державний контроль", text: "Працюємо у межах чинного законодавства України" },
    { number: "02", title: "Відповідність стандартам", text: "Оцінювання за професійними стандартами" },
    { number: "03", title: "Визнання сертифікатів", text: "Документ підтверджує професійну кваліфікацію" }
  ],
  infoCards: [
    {
      number: "01",
      title: "Вимоги до кандидатів",
      answer:
        "1) отримання професійної кваліфікації «Бухгалтер»; наявність стажу роботи у сфері бухгалтерського обліку не менше п’яти років; 2) здобуття першого (бакалаврського) рівня вищої освіти у галузі знань «Бізнес, адміністрування та право»; набуття практичного досвіду у сфері бухгалтерського обліку протягом двох років, шляхом працевлаштування або стажування; 3) здобуття другого (магістерського) рівня вищої освіти у галузі знань «Бізнес, адміністрування та право»"
    },
    { number: "02", title: "Для яких професій актуально ?", answer: "Головні бухгалтери, бухгалтери" },
    {
      number: "03",
      title: "Якого типу видається сертифікат ?",
      answer: "Сертифікат фахівця (кваліфікаційний) про присвоєння/ підтвердження професійної кваліфікації “Бухгалтер дипломований”"
    },
    { number: "04", title: "Форма проведення іспиту", answer: "Іспит проводиться очно в кваліфікаційному центрі" }
  ],
  steps: ["Подача документів", "Консультація", "Іспит", "Отримання сертифіката"],
  results: [
    "Присвоєння/підтвердження професійної кваліфікації",
    "Довіру роботодавців та клієнтів",
    "Отримання сертифіката",
    "Актуальні знання відповідно до змін законодавства",
    "Внесення данних до реєстру виданих сертифікатів на офіційному сайті НАК",
    "Конкурентні переваги на ринку праці"
  ],
  formats: [
    { label: "доступно", title: "Повна оплата", text: "Оплата іспиту одним платежем.", price: "8 800", suffix: "грн" },
    { label: "у частинах", title: "Оплата частинами", text: "Комфортна оплата частинами без переплат.", price: "2 935", suffix: "грн / міс" },
    { label: "під ключ", title: "Корпоративний пакет", text: "Для вашої команди на вигідних умовах.", price: "Індивідуально", suffix: "" }
  ],
  reviews: [
    { name: "Ірина К.", text: "Дуже професійний підхід та супровід сертифікації, після якої отримала підвищення та матеріальну мотивацію" },
    { name: "Сергій С.", text: "Крутий виклик для перевірки особистого рівня знань, після чого став впевненіше працювати зі звітністю, обліком та законодавчими змінами" },
    { name: "Анна Т.", text: "Зручно, сучасно та швидко — саме те, що потрібно для отримання сертифіката." }
  ]
};

const icons = [
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 7v6c0 4 3.4 6.9 8 8 4.6-1.1 8-4 8-8V7l-8-4Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h10M7 12h10M7 16h6"/><rect x="4" y="4" width="16" height="16" rx="2"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="m4 8 8 6 8-6"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 20h10"/><path d="M8 20l1-6h6l1 6"/><path d="M9 5h6l2 5H7l2-5Z"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14c5 0 6-8 12-8h4"/><path d="M16 4l4 2-4 2"/><path d="M4 20c3.5 0 5.4-2.5 7.4-5"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18"/><path d="M5 8h14"/><path d="M7 8l-3 7h6L7 8Z"/><path d="M17 8l-3 7h6l-3-7Z"/></svg>'
];

const byId = (id) => document.getElementById(id);
const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const leadEndpoints = ["api/send-telegram", "send-telegram.php"];
let lastFocusedElement = null;
let currentFormSource = "Форма сайту";

async function loadData() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch("data.json", { signal: controller.signal });
    if (!response.ok) throw new Error("Cannot load data.json");
    return normalizeData(await response.json());
  } catch {
    return fallbackData;
  } finally {
    window.clearTimeout(timeout);
  }
}

function normalizeData(data) {
  return {
    stats: Array.isArray(data?.stats) ? data.stats : fallbackData.stats,
    authorityCards: Array.isArray(data?.authorityCards) ? data.authorityCards : fallbackData.authorityCards,
    infoCards: Array.isArray(data?.infoCards) ? data.infoCards : fallbackData.infoCards,
    steps: Array.isArray(data?.steps) ? data.steps : fallbackData.steps,
    results: Array.isArray(data?.results) ? data.results : fallbackData.results,
    formats: Array.isArray(data?.formats) ? data.formats : fallbackData.formats,
    reviews: Array.isArray(data?.reviews) ? data.reviews : fallbackData.reviews
  };
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function render(data) {
  byId("statsGrid").innerHTML = data.stats
    .map((item) => `<article class="stat-card reveal"><div><strong>${escapeHTML(item.value)}</strong><span>${escapeHTML(item.label)}</span></div></article>`)
    .join("");

  byId("authorityCards").innerHTML = data.authorityCards
    .map(
      (item) => `
      <article class="mini-card reveal">
        <span class="number">${escapeHTML(item.number)}</span>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.text)}</p>
        <a class="small-link" href="https://audit-centr.com.ua/webinars/" target="_blank" rel="noopener">Детальніше</a>
      </article>`
    )
    .join("");

  byId("stepsGrid").innerHTML = data.steps
    .map((item, index) => `<article class="step-card reveal"><span>${index + 1}</span>${escapeHTML(item)}</article>`)
    .join("");

  byId("benefitGrid").innerHTML = data.results
    .map((item, index) => `<article class="benefit-card reveal">${icons[index % icons.length]}<span>${escapeHTML(item)}</span></article>`)
    .join("");

  byId("infoAccordion").innerHTML = data.infoCards
    .map(
      (item, index) => `
      <article class="accordion-item ${index === 3 ? "is-open" : ""}">
        <button class="accordion-btn" type="button" aria-expanded="${index === 3 ? "true" : "false"}">
          <span class="accordion-num">${escapeHTML(item.number)}</span>
          <span>${escapeHTML(item.title)}</span>
          <span class="accordion-icon">⌄</span>
        </button>
        <div class="accordion-body"><p>${escapeHTML(item.answer)}</p></div>
      </article>`
    )
    .join("");

  byId("formatsGrid").innerHTML = data.formats
    .map(
      (item, index) => `
      <article class="format-card reveal ${index === 1 ? "featured" : ""}">
        <span class="format-label">${index === 0 ? "для 1 особи" : index === 1 ? "3 платежі" : "від 3 осіб"}</span>
        ${index === 2 ? '<span class="popular-badge">★ популярний</span>' : ""}
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.text)}</p>
        <div class="price ${index === 2 ? "price-word" : ""}">
          ${index === 1 ? "<span>від</span>" : ""}
          <strong>${escapeHTML(item.price)}</strong>
          ${item.suffix ? `<span>${escapeHTML(item.suffix)}</span>` : ""}
        </div>
        <button class="btn btn-primary js-open-form" type="button">Залишити заявку</button>
      </article>`
    )
    .join("");

  byId("reviewsGrid").innerHTML = data.reviews
    .map(
      (item) => `
      <article class="review-card reveal">
        <div class="stars">★★★★★</div>
        <p>«${escapeHTML(item.text)}»</p>
        <strong>${escapeHTML(item.name)}</strong>
      </article>`
    )
    .join("");

  setupAccordions();
  setupFormTriggers();
  setupReveal();
}

function setupAccordions() {
  document.querySelectorAll(".accordion-item").forEach((item) => {
    const body = item.querySelector(".accordion-body");
    if (item.classList.contains("is-open")) {
      body.style.maxHeight = `${body.scrollHeight}px`;
    }
  });

  document.querySelectorAll(".accordion-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const current = button.closest(".accordion-item");
      document.querySelectorAll(".accordion-item").forEach((item) => {
        const body = item.querySelector(".accordion-body");
        const isCurrent = item === current;
        item.classList.toggle("is-open", isCurrent);
        item.querySelector(".accordion-btn").setAttribute("aria-expanded", String(isCurrent));
        body.style.maxHeight = isCurrent ? `${body.scrollHeight}px` : "0px";
      });
    });
  });
}

function setupMenu() {
  const topbar = document.querySelector(".topbar");
  const toggle = document.querySelector(".menu-toggle");
  toggle.addEventListener("click", () => {
    const open = topbar.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".menu-panel a").forEach((link) => {
    link.addEventListener("click", () => {
      topbar.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupCertificate() {
  byId("flipCertificate").addEventListener("click", () => {
    byId("certificateCard").classList.toggle("is-flipped");
  });
}

function setupFormTriggers() {
  document.querySelectorAll(".js-open-form").forEach((button) => {
    if (button.dataset.formTriggerBound === "true") return;
    button.dataset.formTriggerBound = "true";
    button.addEventListener("click", openModal);
  });
}

function openModal(event) {
  const modal = byId("formModal");
  const form = byId("leadForm");
  const thanks = byId("thanksCard");
  currentFormSource = event?.currentTarget?.textContent?.trim() || "Форма сайту";
  lastFocusedElement = document.activeElement;
  clearFormErrors(form);
  setFormState(form, "default");
  form.hidden = false;
  form.classList.add("is-active");
  thanks.classList.remove("is-active");
  thanks.hidden = true;
  form.reset();
  form.querySelectorAll(".invalid").forEach((field) => field.classList.remove("invalid"));
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => form.elements.name.focus(), 80);
}

function closeModal() {
  const modal = byId("formModal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus({ preventScroll: true });
  }
}

function setupModal() {
  document.querySelectorAll("[data-close-modal]").forEach((control) => control.addEventListener("click", closeModal));

  document.addEventListener("keydown", (event) => {
    const modal = byId("formModal");
    if (!modal.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key === "Tab") {
      trapModalFocus(event, modal);
    }
  });

  byId("leadForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const isValid = validateLeadForm(form);

    if (!isValid) {
      setFormState(form, "validation-error");
      return;
    }

    setFormState(form, "submitting");

    try {
      await submitLeadForm(new FormData(form));
      showSuccessState(form);
    } catch {
      setFormState(form, "submission-error", "Не вдалося надіслати заявку. Спробуйте ще раз.");
    }
  });

  byId("leadForm").querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => clearFieldError(field));
    field.addEventListener("change", () => clearFieldError(field));
  });
}

function validateLeadForm(form) {
  clearFormErrors(form);
  const checks = [
    {
      field: form.elements.name,
      rules: [{ message: "Це поле обов'язкове", valid: (field) => field.value.trim().length > 0 }]
    },
    {
      field: form.elements.email,
      rules: [
        { message: "Це поле обов'язкове", valid: (field) => field.value.trim().length > 0 },
        { message: "Введіть коректний email", valid: (field) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim()) }
      ]
    },
    {
      field: form.elements.phone,
      rules: [
        { message: "Це поле обов'язкове", valid: (field) => field.value.trim().length > 0 },
        { message: "Введіть коректний номер телефону", valid: (field) => isValidPhone(field.value) }
      ]
    }
  ];

  let valid = true;
  let firstInvalidField = null;
  checks.forEach((check) => {
    for (const rule of check.rules) {
      if (!rule.valid(check.field)) {
        setFieldError(check.field, rule.message);
        if (!firstInvalidField) firstInvalidField = check.field;
        valid = false;
        break;
      }
    }
  });

  if (firstInvalidField) {
    firstInvalidField.focus({ preventScroll: false });
  }

  return valid;
}

function setFieldError(field, message) {
  field.classList.add("invalid");
  field.setAttribute("aria-invalid", "true");
  const messageNode = document.querySelector(`[data-error-for="${field.name}"]`);
  if (messageNode) messageNode.textContent = message;
}

function clearFieldError(field) {
  field.classList.remove("invalid");
  field.removeAttribute("aria-invalid");
  const messageNode = document.querySelector(`[data-error-for="${field.name}"]`);
  if (messageNode) messageNode.textContent = "";

  const form = field.form;
  if (form && !form.querySelector(".invalid") && form.dataset.state === "validation-error") {
    setFormState(form, "default");
  }
}

function clearFormErrors(form) {
  form.querySelectorAll(".invalid").forEach((field) => field.classList.remove("invalid"));
  form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
  form.querySelectorAll(".field-message").forEach((message) => {
    message.textContent = "";
  });
  const status = byId("formStatus");
  if (status) status.textContent = "";
}

function isValidPhone(value) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  return /^[+\d][\d\s().-]{8,}$/.test(trimmed) && digits.length >= 9 && digits.length <= 15;
}

function setFormState(form, state, message = "") {
  const submitButton = form.querySelector(".submit-btn");
  const status = byId("formStatus");

  form.dataset.state = state;
  form.setAttribute("aria-busy", String(state === "submitting"));

  if (submitButton) {
    submitButton.disabled = state === "submitting";
    submitButton.textContent = state === "submitting" ? "Надсилання..." : "Надіслати заявку";
  }

  if (status) {
    status.textContent = message;
  }
}

async function submitLeadForm(formData) {
  const payload = buildLeadPayload(formData);
  let lastError = new Error("Submission endpoint is unavailable");

  for (const endpoint of leadEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.ok !== false) {
        return result;
      }

      lastError = new Error(result.message || `Submission failed: ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function buildLeadPayload(formData) {
  return {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    comment: String(formData.get("comment") || "").trim(),
    consent: formData.get("consent") === "on",
    source: currentFormSource,
    page: window.location.href,
    submittedAt: new Date().toISOString()
  };
}

function showSuccessState(form) {
  const thanks = byId("thanksCard");

  setFormState(form, "success");
  form.classList.remove("is-active");
  window.setTimeout(() => {
    form.hidden = true;
    thanks.hidden = false;
    requestAnimationFrame(() => {
      thanks.classList.add("is-active");
      const successButton = thanks.querySelector("button");
      if (successButton) successButton.focus({ preventScroll: true });
    });
  }, 180);
}

function trapModalFocus(event, modal) {
  const focusable = Array.from(modal.querySelectorAll(focusableSelector)).filter((element) => element.offsetParent !== null);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function setupReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );
  elements.forEach((element) => observer.observe(element));
}

setupMenu();
setupCertificate();
setupModal();
loadData().then(render);
