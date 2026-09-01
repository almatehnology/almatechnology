import { NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/validations';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = contactFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 },
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'Telegram notifications are not configured' },
        { status: 503 },
      );
    }

    const { name, email, phone, message, budget } = result.data;
    const telegramMessage = [
      '<b>Новая заявка с сайта alma.technology</b>',
      '',
      `<b>Имя:</b> ${escapeHtml(name)}`,
      `<b>Email:</b> ${escapeHtml(email)}`,
      `<b>Телефон:</b> ${escapeHtml(phone || 'не указан')}`,
      `<b>Бюджет:</b> ${escapeHtml(budget || 'не указан')}`,
      '',
      '<b>Сообщение:</b>',
      escapeHtml(message),
    ].join('\n');

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      },
    );

    if (!telegramResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to send Telegram notification' },
        { status: 502 },
      );
    }

    // TODO: Add reCAPTCHA verification

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
