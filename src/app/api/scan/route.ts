import { NextResponse } from 'next/server';

// Keep the scanner local: the browser only talks to this Next.js route,
// which proxies the image to the Python YOLO service.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SCANNER_URL = process.env.SCANNER_URL || 'http://127.0.0.1:8000';
const MAX_FILE_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
  }

  const looksLikeImage =
    file.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif|tiff?)$/i.test(file.name);

  if (!looksLikeImage) {
    return NextResponse.json(
      { error: 'Only image files can be scanned. Upload a JPG, PNG, or WebP.' },
      { status: 415 }
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'Image is too large (max 15 MB)' }, { status: 413 });
  }

  const confRaw = Number(form.get('conf'));
  const conf = Number.isFinite(confRaw) && confRaw > 0 && confRaw < 1 ? confRaw : 0.25;

  const imageBase64 = Buffer.from(await file.arrayBuffer()).toString('base64');

  try {
    const response = await fetch(`${SCANNER_URL}/scan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ imageBase64, conf, filename: file.name }),
      signal: AbortSignal.timeout(45_000),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            (payload && (payload.detail || payload.error)) ||
            `Scanner returned ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Garbage scanner service is offline.',
        hint: 'Start it in another terminal with: npm run scan:server',
        detail,
      },
      { status: 503 }
    );
  }
}
