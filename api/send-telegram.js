const requiredFields = ["name", "email", "phone"];

async function readLeadData(req) {
  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }

  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function validateLead(data) {
  const missing = requiredFields.filter((field) => !String(data[field] || "").trim());
  const email = String(data.email || "").trim();
  const phoneDigits = String(data.phone || "").replace(/\D/g, "");

  if (missing.length > 0) {
    return "Заповніть обов'язкові поля.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Введіть коректний email.";
  }

  if (phoneDigits.length < 9 || phoneDigits.length > 15) {
    return "Введіть коректний номер телефону.";
  }

  return "";
}

function clean(value) {
  return String(value || "").trim();
}

function buildTelegramMessage(data) {
  const lines = [
    "Нова заявка з сайту",
    "",
    `Ім'я: ${clean(data.name)}`,
    `Телефон: ${clean(data.phone)}`,
    `Email: ${clean(data.email)}`,
    `Коментар: ${clean(data.comment) || "Не вказано"}`,
    `Згода на обробку даних: ${data.consent ? "Так" : "Ні"}`,
    `Кнопка/джерело: ${clean(data.source) || "Форма сайту"}`,
    `Сторінка: ${clean(data.page)}`,
    `Час: ${clean(data.submittedAt) || new Date().toISOString()}`
  ];

  return lines.join("\n");
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    res.status(500).json({ ok: false, message: "Telegram is not configured" });
    return;
  }

  let data;
  try {
    data = await readLeadData(req);
  } catch {
    res.status(400).json({ ok: false, message: "Invalid JSON" });
    return;
  }

  const validationError = validateLead(data);
  if (validationError) {
    res.status(400).json({ ok: false, message: validationError });
    return;
  }

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildTelegramMessage(data),
      disable_web_page_preview: true
    })
  });

  if (!telegramResponse.ok) {
    res.status(502).json({ ok: false, message: "Telegram request failed" });
    return;
  }

  res.status(200).json({ ok: true });
};
