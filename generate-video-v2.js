/**
 * SteveBuildsAI — Video v2 generator
 * Step 1: Generate audio via ElevenLabs for both scripts
 * Step 2: Host audio on mission control server
 * Step 3: Submit multi-clip video to HeyGen with audio URLs
 */

const fs = require('fs');
const path = require('path');

const HEYGEN_KEY    = 'sk_V2_hgu_kj0C8bdsGSq_ziL0rp0bgWhiipYEtj2afHvB6d7vsaxV';
const ELEVEN_KEY    = 'sk_82c452601947f2724951bb7a05cbfc10f126f58ba6438a9d';

const STEVE_AVATAR_ID  = '21a27732730844a2b7a48ccc9dcbf0f4';
const STEVE_VOICE_ID   = 'CQycHeLGndgapd2aOc5P';   // Steve's ElevenLabs clone

const FEMALE_AVATAR_ID = 'Adriana_Business_Front_public';
const FEMALE_VOICE_ID  = 'fq1SdXsX6OokE10pJ4Xw';   // Roshni — British female (AI receptionists)

// Audio hosted on mission control
const AUDIO_BASE_URL = 'https://mission.brightstacklabs.co.uk/uploads';
const UPLOAD_DIR = '/home/ubuntu/mission-uploads';

const SCRIPT_STEVE = `I didn't write a single line of code. And in a few weeks, I've built a whole arsenal of AI-powered tools that run my businesses automatically. No BS. No developer. Just me, AI, and a laptop.

I'm Steve. By day, I'm a technology architect. By night, I'm building AI systems that run my businesses. I've built five real businesses in the last few months. Not prototypes. Live businesses with websites, AI receptionists, automated marketing, booking systems, the lot.

Let me walk you through what I've actually shipped.

Automated Cold Outreach — AI that finds potential customers, writes personalized emails, and follows up automatically. That's been generating leads on autopilot.

AI Receptionists — Voice AI that answers the phone, has real conversations, books appointments. One client's already live.

Mission Control Dashboard — My own command centre. I can see every campaign, every lead, every task in one place. All automated.

Facebook Automation — AI that writes and posts content to business pages. Scheduling, engagement, the lot.

Trading Bot — An algorithmic stock trader that buys and sells based on momentum. Running on paper money right now, learning the markets.

The Hybrid Approach — Here's the thing AI can't do everything. So I've got an offshore team member at a very cheap rate. My AI bot communicates directly with him — tells him exactly what to do, he does it, and the whole thing runs itself. I'll show you how I found and recruited him too.

Now here's the thing — I'm not keeping any of this to myself. That's why I'm building this course. Every step of the way, I'll show you how to set up AI agents that work while you sleep, how to build automation pipelines for your marketing, how to create AI phone receptionists that sound like you, how to build your own command centre dashboard, how to automate your social media, and how to build a hybrid AI plus human team that runs itself.

I'm building this course because I wish I'd had it six months ago. And the best part? You'll have access to everything I build — templates, scripts, automations — as I build them.

This course isn't finished yet. I'm still adding to it. But you can get early access. Drop your email on the site and I'll let you know the moment it's ready. And when it launches, you'll get first dibs at launch pricing.

Already on the site? Just enter your email below and I'll keep you posted.

Check it out at stevebuildsai dot co dot uk. I'll see you there.`;

const SCRIPT_FEMALE = `Ready to start building your own AI-powered business? Head over to stevebuildsai dot co dot uk and drop your email to get early access. I'll see you there.`;

async function generateElevenLabsAudio(text, voiceId, filename) {
  const filepath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filepath)) {
    console.log(`  Audio exists: ${filename}`);
    return `${AUDIO_BASE_URL}/${filename}`;
  }
  console.log(`  Generating audio: ${filename}...`);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVEN_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs error: ${res.status} ${await res.text()}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buf));
  console.log(`  ✓ Saved ${Math.round(buf.byteLength/1024)}KB → ${filename}`);
  return `${AUDIO_BASE_URL}/${filename}`;
}

async function submitToHeyGen(steveAudioUrl, femaleAudioUrl) {
  const payload = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: STEVE_AVATAR_ID,
          avatar_style: 'normal',
        },
        voice: {
          type: 'audio',
          audio_url: steveAudioUrl,
        },
        background: {
          type: 'color',
          value: '#1a1a2e',
        },
      },
      {
        character: {
          type: 'avatar',
          avatar_id: FEMALE_AVATAR_ID,
          avatar_style: 'normal',
        },
        voice: {
          type: 'audio',
          audio_url: femaleAudioUrl,
        },
        background: {
          type: 'color',
          value: '#1a1a2e',
        },
      },
    ],
    dimension: { width: 1920, height: 1080 },
    test: false,
    caption: false,
  };

  console.log('\nSubmitting to HeyGen...');
  const res = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: { 'X-Api-Key': HEYGEN_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  console.log('HeyGen response:', JSON.stringify(data, null, 2));
  return data;
}

async function pollStatus(videoId) {
  console.log(`\nPolling video status (ID: ${videoId})...`);
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 15000));
    const res = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      headers: { 'X-Api-Key': HEYGEN_KEY },
    });
    const data = await res.json();
    const status = data.data?.status;
    console.log(`  [${new Date().toISOString().slice(11,19)}] Status: ${status}`);
    if (status === 'completed') {
      console.log('\n✓ VIDEO READY!');
      console.log('  URL:', data.data.video_url);
      console.log('  Thumbnail:', data.data.thumbnail_url);
      return data.data;
    }
    if (status === 'failed') {
      console.error('✗ Video failed:', JSON.stringify(data, null, 2));
      return null;
    }
  }
  console.log('Timed out polling — check HeyGen dashboard');
  return null;
}

(async () => {
  try {
    // Step 1: Generate audio
    console.log('=== Step 1: Generating ElevenLabs audio ===');
    const steveAudioUrl  = await generateElevenLabsAudio(SCRIPT_STEVE,  STEVE_VOICE_ID,  'sba-video2-steve.mp3');
    const femaleAudioUrl = await generateElevenLabsAudio(SCRIPT_FEMALE, FEMALE_VOICE_ID, 'sba-video2-female.mp3');
    console.log('  Steve audio:', steveAudioUrl);
    console.log('  Female audio:', femaleAudioUrl);

    // Step 2: Submit to HeyGen
    console.log('\n=== Step 2: Submitting to HeyGen ===');
    const heygenRes = await submitToHeyGen(steveAudioUrl, femaleAudioUrl);

    if (!heygenRes?.data?.video_id) {
      console.error('No video_id returned');
      process.exit(1);
    }

    const videoId = heygenRes.data.video_id;
    console.log('Video ID:', videoId);

    // Step 3: Poll for completion
    console.log('\n=== Step 3: Waiting for render (may take 5-10 mins) ===');
    const result = await pollStatus(videoId);
    if (result) {
      console.log('\n=== DONE ===');
      console.log('Video URL:', result.video_url);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
