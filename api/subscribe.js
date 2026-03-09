export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const r = await fetch('https://api.systeme.io/api/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': '2raw81qdmtw82sjexva4vcydes7bqv6pkaqwb4bjx599vm6xsqa2p0611psuzm3o'
    },
    body: JSON.stringify({ email, fields: [], tags: ['stevebuildsai'] })
  });

  if (r.ok || r.status === 409 || r.status === 422) {
    res.status(200).json({ ok: true });
  } else {
    res.status(500).json({ error: 'Failed' });
  }
}
