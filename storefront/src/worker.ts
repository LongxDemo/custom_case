/* Cloudflare Worker behind the storefront: receives "Send to Casey"
 * submissions and forwards them to customer support on Telegram.
 * Secrets (set via `wrangler secret put`): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
 */

type Env = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

async function telegram(env: Env, method: string, form: FormData): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Telegram ${method} failed (${res.status}): ${detail.slice(0, 200)}`);
  }
}

const field = (form: FormData, name: string) => {
  const v = form.get(name);
  return typeof v === 'string' ? v.trim() : '';
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== '/api/send') return json({ error: 'not found' }, 404);
    if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405);
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return json({ error: 'sending is not configured yet' }, 503);
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return json({ error: 'bad request' }, 400);
    }

    const name = field(form, 'name');
    const email = field(form, 'email');
    if (!name || !email.includes('@')) return json({ error: 'name and email are required' }, 400);
    const phone = field(form, 'phone');
    const note = field(form, 'note');
    const model = field(form, 'model');

    // Plain text on purpose — no parse_mode, so user input can't break formatting.
    const caption = [
      '🐰 New Casey case design!',
      '',
      `Phone: ${model || 'unknown model'}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone number: ${phone || '—'}`,
      note ? `Note: ${note}` : null,
    ].filter((l) => l !== null).join('\n');

    try {
      const preview = form.get('preview');
      if (preview instanceof File && preview.size > 0) {
        const tg = new FormData();
        tg.append('chat_id', env.TELEGRAM_CHAT_ID);
        tg.append('caption', caption);
        tg.append('photo', preview, 'design.png');
        await telegram(env, 'sendPhoto', tg);
      } else {
        const tg = new FormData();
        tg.append('chat_id', env.TELEGRAM_CHAT_ID);
        tg.append('text', caption);
        await telegram(env, 'sendMessage', tg);
      }

      // Customer's original photos at full quality, for printing.
      for (const [key, value] of form.entries()) {
        if (key.startsWith('photo_') && value instanceof File && value.size > 0) {
          const tg = new FormData();
          tg.append('chat_id', env.TELEGRAM_CHAT_ID);
          tg.append('document', value, value.name || `${key}.png`);
          tg.append('caption', `Original photo from ${name}'s design (print quality)`);
          await telegram(env, 'sendDocument', tg);
        }
      }
    } catch (e) {
      console.error('send failed:', e instanceof Error ? e.message : e);
      return json({ error: 'could not deliver the design' }, 502);
    }

    return json({ ok: true });
  },
};
