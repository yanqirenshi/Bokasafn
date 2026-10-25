// ほかのサイトから、ブラウザ経由で API を呼ばれないようにする。
// - Host: localhost・127.0.0.1・[::1] だけを受け付ける。(DNS リバインディング対策)
// - Origin: 付いているときは、localhost などのものだけを受け付ける。
// - 本文のある要求は、Content-Type: application/json だけを受け付ける。(フォームなどからの送信を防ぐ)
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

function isLocal (url) {
    try {
        return LOCAL_HOSTNAMES.has(new URL(url).hostname);
    } catch (e) {
        return false;
    }
}

export default async function guard (c, next) {
    const host = c.req.header('host');

    if (!host || !isLocal(`http://${host}`))
        return c.json({ message: 'この API は、このパソコンの中からだけ使えます。' }, 403);

    const origin = c.req.header('origin');

    if (origin && !isLocal(origin))
        return c.json({ message: 'ほかのサイトからは、この API を使えません。' }, 403);

    const content_type = c.req.header('content-type') || '';

    if (['POST', 'PUT', 'PATCH'].includes(c.req.method) && !content_type.startsWith('application/json'))
        return c.json({ message: '本文は JSON で送り、Content-Type: application/json を指定してください。' }, 415);

    await next();
}
