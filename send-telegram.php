<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method not allowed']);
    exit;
}

$token = getenv('TELEGRAM_BOT_TOKEN');
$chatId = getenv('TELEGRAM_CHAT_ID');

if (!$token || !$chatId) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Telegram is not configured']);
    exit;
}

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Invalid JSON']);
    exit;
}

function lead_value($data, $key) {
    return trim((string)($data[$key] ?? ''));
}

function validate_lead($data) {
    foreach (['name', 'email', 'phone'] as $field) {
        if (lead_value($data, $field) === '') {
            return "Заповніть обов'язкові поля.";
        }
    }

    if (!filter_var(lead_value($data, 'email'), FILTER_VALIDATE_EMAIL)) {
        return 'Введіть коректний email.';
    }

    $phoneDigits = preg_replace('/\D+/', '', lead_value($data, 'phone'));
    if (strlen($phoneDigits) < 9 || strlen($phoneDigits) > 15) {
        return 'Введіть коректний номер телефону.';
    }

    return '';
}

$validationError = validate_lead($data);
if ($validationError !== '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => $validationError]);
    exit;
}

$messageLines = [
    'Нова заявка з сайту',
    '',
    "Ім'я: " . lead_value($data, 'name'),
    'Телефон: ' . lead_value($data, 'phone'),
    'Email: ' . lead_value($data, 'email'),
    'Коментар: ' . (lead_value($data, 'comment') !== '' ? lead_value($data, 'comment') : 'Не вказано'),
    'Згода на обробку даних: ' . (!empty($data['consent']) ? 'Так' : 'Ні'),
    'Кнопка/джерело: ' . (lead_value($data, 'source') !== '' ? lead_value($data, 'source') : 'Форма сайту'),
    'Сторінка: ' . lead_value($data, 'page'),
    'Час: ' . (lead_value($data, 'submittedAt') !== '' ? lead_value($data, 'submittedAt') : gmdate('c')),
];

$payload = json_encode([
    'chat_id' => $chatId,
    'text' => implode("\n", $messageLines),
    'disable_web_page_preview' => true,
]);

$url = "https://api.telegram.org/bot{$token}/sendMessage";
$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $payload,
        'timeout' => 10,
    ],
]);

$result = @file_get_contents($url, false, $context);

if ($result === false) {
    http_response_code(502);
    echo json_encode(['ok' => false, 'message' => 'Telegram request failed']);
    exit;
}

echo json_encode(['ok' => true]);
?>
