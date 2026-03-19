const { put, list } = require('@vercel/blob');

const NOTES_PATH = 'note-kamar/shared-notes.json';

function createResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(payload)
  };
}

async function getStoredNotes() {
  const { blobs } = await list({ prefix: NOTES_PATH, limit: 5 });

  const target = blobs.find((blob) => blob.pathname === NOTES_PATH) || blobs[0];
  if (!target) {
    return {};
  }

  const response = await fetch(target.url, {
    method: 'GET',
    cache: 'no-store'
  });

  if (!response.ok) {
    return {};
  }

  const json = await response.json();
  return json && typeof json === 'object' ? json : {};
}

function sanitizeNotes(input) {
  const validKeys = [
    'M01', 'M01-rattrapage',
    'M02', 'M02-rattrapage',
    'M03', 'M03-rattrapage',
    'M04', 'M04-rattrapage',
    'M05', 'M05-rattrapage',
    'M06', 'M06-rattrapage',
    'M07', 'M07-rattrapage'
  ];

  const output = {};

  validKeys.forEach((key) => {
    const value = input[key];

    if (value === undefined || value === null || value === '') {
      output[key] = '';
      return;
    }

    const numberValue = Number.parseFloat(String(value));
    if (Number.isNaN(numberValue)) {
      output[key] = '';
      return;
    }

    const clamped = Math.min(20, Math.max(0, numberValue));
    output[key] = Number.isInteger(clamped) ? String(clamped) : clamped.toFixed(2);
  });

  return output;
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const notes = await getStoredNotes();
      res.status(200).setHeader('Cache-Control', 'no-store').json({ notes });
      return;
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const notes = sanitizeNotes(body.notes || {});

      await put(NOTES_PATH, JSON.stringify(notes), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: 0
      });

      res.status(200).setHeader('Cache-Control', 'no-store').json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: 'Storage error', details: String(error.message || error) });
  }
};
