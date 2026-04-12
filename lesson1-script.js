// Lesson 1: The AI Business Stack — HeyGen video generation
const fs = require('fs');
const https = require('https');

// Load .env
fs.readFileSync('/home/ubuntu/.openclaw/workspace/.env', 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([^#=]+)=(.*)/);
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

const AVATAR_ID = '21a27732730844a2b7a48ccc9dcbf0f4';
const VOICE_ID = 'e8cceaffe263415595631cfcc3ed66b5'; // Steve Most Accurate
const API_KEY = process.env.HEYGEN_API_KEY;

const segments = [
  `Welcome to Steve Builds AI. I'm Steve, and in this first lesson I'm going to walk you through the AI business stack — what it is, how it works, and why getting this right changes everything about how you run a business. I'm not teaching theory here. Everything in this course is stuff I use right now to run real businesses. Let's get into it.`,

  `So what actually is the AI business stack? Simply put, it's the combination of tools and automations that replace what would normally take a whole team of people. Lead generation, outreach, content, invoicing, client onboarding — all of it, running on its own while you focus on the things that actually need you. Think of it as building a business with a very small but incredibly capable team. Except most of that team is software.`,

  `At the top of the stack, you've got your AI assistant. This is your brain — the thing that connects everything, makes decisions, and executes tasks on your behalf. In my setup that's an AI called Clawbot, running on a platform called OpenClaw. It reads emails, manages campaigns, builds websites, and writes code. All from a single chat interface. One tool, doing the work of several people.`,

  `Below that is your automation layer. Tools like QuickMail for cold outreach, Systeme dot io for email funnels, and workflow tools that connect everything together. This is where the repetitive stuff gets handled automatically — follow-ups, lead nurturing, routing enquiries to the right place. Set it up once, and it runs.`,

  `Then you've got your product layer — the actual things you sell. In my world that's websites for local businesses, AI receptionists that answer phones for clients twenty-four seven, and SaaS tools like CampBook and InvoiceWizard. These are your revenue-generating assets. The rest of the stack exists to sell them and support them.`,

  `Here's the thing most people miss about AI. They think it's about flashy demos or replacing jobs. But for a solo founder or a small business owner, AI is about leverage. One person with the right stack can do what a team of five was doing two years ago. I know, because I'm doing it right now.`,

  `I'm running cold email campaigns to hundreds of businesses across the UK. I'm building personalised demo websites for each one before I've even spoken to them. I'm monitoring replies, flagging warm leads, and managing the whole pipeline. All of that used to take hours every day. Now it runs while I sleep.`,

  `Let me break the stack down into five simple layers. Layer one: your AI brain. Decision-making, writing, research, code. Layer two: outreach and marketing automation — this fills your pipeline without manual effort. Layer three: your website and content — your shop window, it needs to convert. Layer four: your product or service — what you actually sell. And layer five: financial automation — invoicing, payments, contracts, all handled without chasing anyone.`,

  `Now you might be thinking — that sounds complex to build. And yes, a full stack takes time. But you don't start with all of it. You start with two things: an AI assistant, and one automation that saves you time this week. For most people, that's using AI to write your emails and automating your follow-ups. That alone will save you hours every week and start building the right habits.`,

  `The AI business stack isn't built overnight. It grows as your business grows. You add a layer, automate something new, connect one more tool. But the mindset shift — that happens immediately. Once you see how much you can delegate to software, everything changes. That's what this course is about. See you in Lesson 2, where we set up your AI assistant properly — not just a chat window, but something that actually knows your business and takes action for you.`,
];

const videoInputs = segments.map(text => ({
  character: {
    type: 'avatar',
    avatar_id: AVATAR_ID,
    avatar_style: 'normal'
  },
  voice: {
    type: 'text',
    input_text: text,
    voice_id: VOICE_ID,
    speed: 1.0
  },
  background: {
    type: 'color',
    value: '#0f172a'
  }
}));

const payload = JSON.stringify({
  video_inputs: videoInputs,
  dimension: { width: 1920, height: 1080 },
  aspect_ratio: '16:9',
  test: false
});

const options = {
  hostname: 'api.heygen.com',
  path: '/v2/video/generate',
  method: 'POST',
  headers: {
    'X-Api-Key': API_KEY,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.data?.video_id) {
      console.log('✓ Video submitted. ID:', result.data.video_id);
    } else {
      console.log('Error:', JSON.stringify(result, null, 2));
    }
  });
});

req.on('error', e => console.error('Request error:', e.message));
req.write(payload);
req.end();
