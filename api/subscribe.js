export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': '2raw81qdmtw82sjexva4vcydes7bqv6pkaqwb4bjx599vm6xsqa2p0611psuzm3o'
  };

  // Create or find contact
  const r = await fetch('https://api.systeme.io/api/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, fields: [] })
  });

  if (!r.ok && r.status !== 422) {
    return res.status(500).json({ error: 'Failed to create contact' });
  }

  // Get contact ID
  let contactId;
  if (r.ok) {
    const data = await r.json();
    contactId = data.id;
  } else {
    // 422 = already exists, look them up
    const lookup = await fetch(`https://api.systeme.io/api/contacts?filters[0][field]=email&filters[0][operator]=equals&filters[0][value]=${encodeURIComponent(email)}`, { headers });
    const data = await lookup.json();
    contactId = data.items?.[0]?.id;
  }

  if (!contactId) return res.status(500).json({ error: 'Could not resolve contact' });

  // Add tag
  await fetch(`https://api.systeme.io/api/contacts/${contactId}/tags`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tag_id: 1910557 })
  });

  res.status(200).json({ ok: true });
}
