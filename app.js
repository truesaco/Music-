/* Riff · AI Music Studio for SunoAPI (https://docs.sunoapi.org) */
"use strict";

/* =====================================================================
   Constants
   ===================================================================== */
const ENDPOINTS = {
  direct: { api: "https://api.sunoapi.org", upload: "https://sunoapiorg.redpandaai.co" },
  proxy: { api: "/suno", upload: "/suno-upload" },
};

const MODELS = [
  { id: "V6", name: "V6", tag: "Best", desc: "Most natural vocals, richest detail" },
  { id: "V6_WILD", name: "V6 Wild", desc: "Bolder, more experimental ideas" },
  { id: "V6_MINI", name: "V6 Mini", desc: "Lightweight and fast drafts" },
];
const LEGACY_MODELS = [
  { id: "V5_5", name: "V5.5", desc: "Voice-customized model" },
  { id: "V5", name: "V5", desc: "Superior expression, faster" },
  { id: "V4_5PLUS", name: "V4.5+", desc: "Richer tones, up to 8 min" },
  { id: "V4_5ALL", name: "V4.5 All", desc: "Better song structure" },
  { id: "V4_5", name: "V4.5", desc: "Smart prompts, up to 8 min" },
  { id: "V4", name: "V4", desc: "Improved vocals, up to 4 min" },
];
const ALL_MODELS = [...MODELS, ...LEGACY_MODELS];
const DURATION_MODELS = ["V6", "V6_WILD", "V6_MINI", "V5_5"];
const PERSONA_VOICE_MODELS = ["V6", "V6_WILD", "V6_MINI", "V5_5", "V5"];

const limits = (model) => ({
  lyrics: model === "V4" ? 3000 : 5000,
  style: model === "V4" ? 200 : 1000,
  title: 80,
  prompt: 3000,
});

const MODES = [
  { id: "quick", label: "Quick song", icon: "sparkle", group: "create",
    title: "Describe it. We'll write it.", sub: "One sentence is enough. Lyrics, melody and arrangement are generated for you.", cta: "Create song" },
  { id: "custom", label: "Custom", icon: "sliders", group: "create",
    title: "Your lyrics, your sound.", sub: "Write or generate lyrics, dial in the style, and fine-tune every control.", cta: "Create song" },
  { id: "sounds", label: "Sounds & loops", icon: "wave", group: "create",
    title: "Loops, beds and sound design.", sub: "Short loops and textures with tempo and key control. Great for games, videos and producers.", cta: "Generate sound" },
  { id: "cover", label: "Cover audio", icon: "refresh", group: "remix",
    title: "Reimagine any recording.", sub: "Upload audio and restyle it while keeping the core melody.", cta: "Create cover" },
  { id: "uextend", label: "Extend audio", icon: "extend", group: "remix",
    title: "Keep it going.", sub: "Upload a clip and continue it seamlessly in the same style.", cta: "Extend audio" },
  { id: "vocals", label: "Add vocals", icon: "mic", group: "remix",
    title: "Put a voice on your beat.", sub: "Upload an instrumental and layer AI vocals on top.", cta: "Add vocals" },
  { id: "instrumental", label: "Add backing", icon: "piano", group: "remix",
    title: "Hum it. Get a band.", sub: "Upload a vocal or melody and generate a full backing track around it.", cta: "Add instrumental" },
  { id: "mashup", label: "Mashup", icon: "merge", group: "remix",
    title: "Two tracks, one new song.", sub: "Blend two pieces of audio into a fresh mashup.", cta: "Create mashup" },
];

const IDEAS = [
  "🌅 An upbeat indie-pop anthem about a summer road trip with friends",
  "🌧️ A melancholic lo-fi hip-hop track for rainy late-night studying",
  "🚀 Epic cinematic orchestral score for a spaceship launch",
  "🐶 A funny country song about a dog who steals socks",
  "💔 Soulful R&B ballad about missing someone in a big city",
  "🎮 Energetic 8-bit chiptune boss battle theme",
  "☕ Cozy acoustic folk song about Sunday morning coffee",
  "🌃 Dreamy 80s synthwave drive through neon streets",
  "🏝️ Tropical reggaeton party track with catchy chorus",
  "🧘 Calm ambient piano for meditation and deep focus",
  "🎂 A joyful birthday song for my best friend Sam",
  "🔥 Hard-hitting trap beat with confident rap about chasing dreams",
  "🍂 Jazzy bossa nova about autumn leaves in Paris",
  "🏋️ High-energy EDM workout anthem with a massive drop",
  "🌌 Ethereal K-pop ballad about stars and second chances",
  "🤠 Western rock stomp about a desert outlaw",
];

const STYLE_CHIPS = {
  Genre: ["Pop", "Hip-hop", "Lo-fi", "R&B", "Rock", "Indie folk", "EDM", "House", "Jazz", "Synthwave", "Reggaeton", "Country", "K-pop", "Metal", "Afrobeats", "Cinematic"],
  Mood: ["Uplifting", "Melancholic", "Dreamy", "Energetic", "Chill", "Dark", "Romantic", "Epic", "Playful"],
  Sound: ["Piano", "Acoustic guitar", "808s", "Strings", "Synth pads", "Saxophone", "Female vocals", "Male vocals", "Choir", "Whispered vocals"],
};

const SOUND_KEYS = ["Any", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"];
const STEMS = ["Lead Vocal", "Backing Vocals", "Drum Kit", "Kick", "Snare", "Hi-Hat", "Bass", "808", "Piano", "Electric Guitar", "Acoustic Guitar", "Synth", "Synth Pad", "Synth Bass", "Strings", "String Section", "Brass Section", "Organ", "Percussion", "Choir", "Saxophone", "Violin", "Cello", "Flute", "Trumpet", "Sound Effects"];

const VARIETY = ["Off", "Normal", "High", "Extra", "Max"];

const BUSY_LINES = [
  "Tuning the guitars…", "Warming up the vocalist…", "Finding the hook…", "Laying down drums…",
  "Writing the bridge…", "Mixing the low end…", "Adding a little sparkle…", "Rehearsing the chorus…",
];

const MUSIC_STAGE = { PENDING: 12, TEXT_SUCCESS: 42, FIRST_SUCCESS: 78, SUCCESS: 100 };
const STAGE_LABEL = { PENDING: "Queued", TEXT_SUCCESS: "Lyrics ready", FIRST_SUCCESS: "First take ready", SUCCESS: "Done" };

/* =====================================================================
   Icons (Lucide-style strokes)
   ===================================================================== */
const ICONS = {
  play: '<path d="M7 4v16l13-8z"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  prev: '<path d="M19 20 9 12l10-8z"/><path d="M5 19V5"/>',
  next: '<path d="m5 4 10 8-10 8z"/><path d="M19 5v14"/>',
  heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
  dots: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  sparkle: '<path d="M12 3 10 9 4 11l6 2 2 6 2-6 6-2-6-2z"/><path d="M19 3v4M21 5h-4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  settings: '<path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.3a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.6a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.3a2 2 0 0 1 1 1.7v.2a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.6a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.3a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.2 3.2M6.6 6.6A17 17 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6"/><path d="m2 2 20 20"/><path d="M14.1 14.1a3 3 0 0 1-4.2-4.2"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  wave: '<path d="M2 12h2M6 8v8M10 4v16M14 7v10M18 10v4M22 12h0"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M8 16H3v5"/>',
  extend: '<path d="M3 12h13"/><path d="m12 7 5 5-5 5"/><path d="M21 5v14"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>',
  piano: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 3v11M16 3v11M12 14v7M8 14h1M15 14h1"/>',
  merge: '<path d="M8 6 12 2l4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.2 2.9L6 20"/><path d="m18 20-3.5-3.5"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  wand: '<path d="m15 4 5 5L9 20l-5-5z"/><path d="M14 5l5 5"/><path d="M4 4h.01M8 2v2M2 8h2"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  film: '<rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
  text: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  shuffle: '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  volume: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  mute: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  export: '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 21h14"/>',
  import: '<path d="M12 15V3M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
};
const icon = (n, cls = "") => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ""}</svg>`;

/* =====================================================================
   Utilities
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtTime = (s) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
};
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
const ago = (t) => {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return new Date(t).toLocaleDateString();
};
const modelName = (id) => (ALL_MODELS.find((m) => m.id === id) || { name: id || "" }).name;
const modelFromApi = (name = "") => {
  const m = String(name).toLowerCase();
  if (m.includes("v6")) return m.includes("wild") ? "V6 Wild" : m.includes("mini") ? "V6 Mini" : "V6";
  const map = { "chirp-v5-5": "V5.5", "chirp-v5": "V5", "chirp-bluejay": "V4.5+", "chirp-auk": "V4.5", "chirp-v4": "V4", "chirp-v3-5": "V3.5" };
  return map[m] || name;
};

const store = {
  get(k, d) { try { const v = localStorage.getItem("riff." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("riff." + k, JSON.stringify(v)); } catch { /* quota or private mode */ } },
  del(k) { try { localStorage.removeItem("riff." + k); } catch {} },
};

/* =====================================================================
   State
   ===================================================================== */
const state = {
  key: null,
  credits: null,
  view: "create",
  mode: store.get("mode", "quick"),
  model: store.get("model", "V6"),
  draft: Object.assign({ instrumental: false, personaModel: "style_persona", soundKey: "Any", soundLoop: false, refImages: [] }, store.get("draft", {})),
  tracks: store.get("tracks", []),
  tasks: store.get("tasks", []),
  personas: store.get("personas", []),
  theme: (() => { try { return localStorage.getItem("riff.theme") || "system"; } catch { return "system"; } })(),
  libFilter: "all",
  libQuery: "",
  current: null, // track id playing
  ideas: shuffle(IDEAS).slice(0, 3),
  conn: location.protocol === "file:" ? "direct" : store.get("conn", "proxy"),
  busy: false,
};
if (!ALL_MODELS.some((m) => m.id === state.model)) state.model = "V6";
if (!MODES.some((m) => m.id === state.mode)) state.mode = "quick";

const saveTracks = () => store.set("tracks", state.tracks);
const saveTasks = () => store.set("tasks", state.tasks.slice(0, 60));
let draftTimer;
const saveDraft = () => { clearTimeout(draftTimer); draftTimer = setTimeout(() => store.set("draft", state.draft), 300); };

/* =====================================================================
   API client
   ===================================================================== */
class ApiError extends Error {
  constructor(msg, code, data) { super(msg); this.code = code; this.data = data; }
}

const FRIENDLY = {
  400: "Some settings weren't accepted",
  401: "That API key wasn't accepted. Double-check it at sunoapi.org.",
  402: "You're out of credits. Top up at sunoapi.org to keep creating.",
  404: "That endpoint wasn't found.",
  405: "Rate limit reached. Give it a moment and try again.",
  409: "This already exists.",
  413: "Your prompt or lyrics are too long for this model.",
  422: "Some settings weren't accepted",
  429: "You're out of credits. Top up at sunoapi.org to keep creating.",
  430: "You're going a little fast. Wait a few seconds and try again.",
  451: "The source audio couldn't be fetched. Check that the link is public.",
  455: "SunoAPI is under maintenance. Please try again shortly.",
  500: "SunoAPI hit a server error. Please try again.",
};
function friendly(code, msg) {
  const base = FRIENDLY[code];
  if (!base) return msg || `Request failed (${code})`;
  if ((code === 400 || code === 422) && msg) return `${base}: ${msg}`;
  return base;
}

async function rawFetch(kind, path, opts, allowFallback = true) {
  const base = ENDPOINTS[state.conn][kind];
  let res;
  try {
    res = await fetch(base + path, opts);
  } catch (e) {
    if (state.conn === "proxy" && allowFallback) return switchToDirect(kind, path, opts);
    if (state.conn === "direct" && location.protocol !== "file:" && allowFallback) {
      state.conn = "proxy"; store.set("conn", "proxy");
      return rawFetch(kind, path, opts, false);
    }
    throw new ApiError("Couldn't reach SunoAPI. Check your connection and try again.", 0);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("json")) {
    // A proxy that isn't configured (e.g. static host without Netlify rewrites) returns HTML.
    if (state.conn === "proxy" && allowFallback) return switchToDirect(kind, path, opts);
    throw new ApiError(friendly(res.status) || `Unexpected response (${res.status})`, res.status);
  }
  const json = await res.json();
  return { res, json };
}
function switchToDirect(kind, path, opts) {
  state.conn = "direct"; store.set("conn", "direct");
  return rawFetch(kind, path, opts, false);
}

const cleanBody = (o) => {
  const out = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v) && !v.length) continue;
    out[k] = v;
  }
  return out;
};

async function api(path, { method = "GET", body, query, key } = {}) {
  const opts = { method, headers: { Authorization: "Bearer " + (key || state.key), Accept: "application/json" } };
  if (body) { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(cleanBody(body)); }
  const qs = query ? "?" + new URLSearchParams(query) : "";
  const { res, json } = await rawFetch("api", path + qs, opts);
  const code = json.code ?? res.status;
  if (code !== 200) throw new ApiError(friendly(code, json.msg), code, json.data);
  return json.data;
}

function callbackUrl() {
  if (/^https?:$/.test(location.protocol) && !/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname)) {
    return location.origin + "/.netlify/functions/suno-callback";
  }
  return "https://example.com/riff-callback";
}

async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("uploadPath", "riff");
  fd.append("fileName", `${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`);
  const opts = { method: "POST", headers: { Authorization: "Bearer " + state.key }, body: fd };
  let out;
  try {
    out = await rawFetch("upload", "/api/file-stream-upload", opts);
  } catch (e) {
    if (state.conn === "proxy") { // large bodies can exceed proxy limits; retry direct once
      const prev = state.conn; state.conn = "direct";
      try { out = await rawFetch("upload", "/api/file-stream-upload", opts, false); }
      finally { state.conn = prev; }
    } else throw e;
  }
  const { json } = out;
  if (!(json.success || json.code === 200) || !json.data) throw new ApiError(json.msg || "Upload failed", json.code);
  return json.data.fileUrl || json.data.downloadUrl;
}

/* =====================================================================
   Credits
   ===================================================================== */
async function refreshCredits() {
  const btn = $("#creditsBtn");
  btn.classList.add("loading");
  try {
    const c = await api("/api/v1/generate/credit");
    state.credits = typeof c === "number" ? c : Number(c) || 0;
    renderCredits();
  } catch (e) {
    if (e.code === 401) return signOut("Your API key is no longer valid. Please enter it again.");
  } finally { btn.classList.remove("loading"); }
}
function renderCredits() {
  const c = state.credits;
  $("#creditsVal").textContent = c == null ? "—" : Number(c).toLocaleString(undefined, { maximumFractionDigits: 1 });
  const btn = $("#creditsBtn");
  btn.classList.toggle("low", c != null && c > 0 && c < 20);
  btn.classList.toggle("empty", c != null && c <= 0);
}

/* =====================================================================
   Theme
   ===================================================================== */
const mq = window.matchMedia("(prefers-color-scheme: dark)");
function applyTheme() {
  const pref = state.theme;
  const dark = pref === "dark" || (pref === "system" && mq.matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  $$("#themeSeg button").forEach((b) => {
    b.classList.toggle("on", b.dataset.themeOpt === pref);
    b.setAttribute("aria-checked", b.dataset.themeOpt === pref);
  });
}
function setTheme(pref) {
  state.theme = pref;
  try { localStorage.setItem("riff.theme", pref); } catch {}
  applyTheme();
}
mq.addEventListener?.("change", () => state.theme === "system" && applyTheme());

/* =====================================================================
   Toasts & confetti
   ===================================================================== */
function toast(title, { body = "", type = "", action, actionLabel, timeout = 5000 } = {}) {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  const ic = type === "ok" ? "check" : type === "err" ? "alert" : "info";
  el.innerHTML = `<div class="ic">${icon(ic)}</div><div class="body"><b>${esc(title)}</b>${body ? `<span>${esc(body)}</span>` : ""}${action ? `<div><button class="btn btn-sm btn-soft">${esc(actionLabel)}</button></div>` : ""}</div><button class="icon-btn ghost" aria-label="Dismiss" style="width:28px;height:28px">${icon("x")}</button>`;
  const close = () => { el.classList.add("out"); setTimeout(() => el.remove(), 200); };
  el.querySelector(".icon-btn").onclick = close;
  if (action) el.querySelector(".btn").onclick = () => { action(); close(); };
  $("#toasts").appendChild(el);
  if (timeout) setTimeout(close, timeout);
}

function confetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = $("#confetti"), ctx = c.getContext("2d");
  const W = (c.width = innerWidth * devicePixelRatio), H = (c.height = innerHeight * devicePixelRatio);
  const colors = ["#8b5cf6", "#d946ef", "#ec4899", "#06b6d4", "#fbbf24"];
  const parts = Array.from({ length: 120 }, () => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.35, vx: (Math.random() - 0.5) * 18 * devicePixelRatio,
    vy: (-Math.random() * 16 - 6) * devicePixelRatio, r: (4 + Math.random() * 5) * devicePixelRatio, c: pick(colors), a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3,
  }));
  let t = 0;
  (function frame() {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.vy += 0.45 * devicePixelRatio; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.a += p.va;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
    }
    if (++t < 140) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
  })();
}

function notify(title, body) {
  if (!document.hidden || !("Notification" in window) || Notification.permission !== "granted") return;
  try { new Notification(title, { body, icon: "favicon.svg" }); } catch {}
}

/* =====================================================================
   Key gate
   ===================================================================== */
function loadKey() {
  try { return localStorage.getItem("riff.apiKey") || sessionStorage.getItem("riff.apiKey"); } catch { return null; }
}
function saveKey(key, remember) {
  try {
    localStorage.removeItem("riff.apiKey"); sessionStorage.removeItem("riff.apiKey");
    (remember ? localStorage : sessionStorage).setItem("riff.apiKey", key);
  } catch {}
}
function showGate(msg) {
  $("#app").hidden = true;
  $("#gate").hidden = false;
  const err = $("#gateError");
  err.hidden = !msg; err.textContent = msg || "";
  setTimeout(() => $("#gateKey").focus(), 50);
}
function signOut(msg) {
  try { localStorage.removeItem("riff.apiKey"); sessionStorage.removeItem("riff.apiKey"); } catch {}
  state.key = null;
  audio.pause();
  closeDrawer(); closeModal(); closeKaraoke();
  showGate(msg);
}
function initGate() {
  let shown = false;
  const reveal = $("#gateReveal");
  reveal.innerHTML = icon("eye");
  reveal.onclick = () => {
    shown = !shown;
    $("#gateKey").type = shown ? "text" : "password";
    reveal.innerHTML = icon(shown ? "eyeOff" : "eye");
  };
  $("#gateForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const key = $("#gateKey").value.trim();
    const btn = $("#gateSubmit");
    const err = $("#gateError");
    if (!key) return;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Checking your key…`;
    err.hidden = true;
    try {
      const credits = await api("/api/v1/generate/credit", { key });
      state.key = key;
      state.credits = Number(credits) || 0;
      saveKey(key, $("#gateRemember").checked);
      $("#gateKey").value = "";
      enterApp(true);
    } catch (ex) {
      err.textContent = ex.code === 401 ? "That key didn't work. Copy it again from sunoapi.org/api-key." : ex.message;
      err.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = "Unlock the studio";
    }
  });
}

function enterApp(fresh) {
  $("#gate").hidden = true;
  $("#app").hidden = false;
  renderCredits();
  renderAll();
  if (!fresh) refreshCredits();
  pollLoop();
  if (fresh) {
    const n = state.tracks.length;
    toast(n ? "Welcome back" : "You're in! 🎉", {
      body: n ? `${n} track${n > 1 ? "s" : ""} waiting in your library.` : "Pick an idea below or describe your own song.",
      type: "ok",
    });
  }
}

/* =====================================================================
   Navigation
   ===================================================================== */
function setView(v) {
  state.view = v;
  $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === v));
  $("#view-create").hidden = v !== "create";
  $("#view-library").hidden = v !== "library";
  if (v === "library") renderLibrary();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =====================================================================
   Composer
   ===================================================================== */
function setMode(m) {
  state.mode = m;
  store.set("mode", m);
  renderComposer();
}
function setModel(id) {
  state.model = id;
  store.set("model", id);
  renderModelRow();
  syncComposerFlags();
  updateCounters();
  renderFootMeta();
}

function renderModeTabs() {
  let html = "", lastGroup = null;
  for (const m of MODES) {
    if (lastGroup && m.group !== lastGroup) html += `<span class="mode-sep" aria-hidden="true"></span>`;
    lastGroup = m.group;
    html += `<button class="mode-tab ${m.id === state.mode ? "on" : ""}" data-mode="${m.id}" role="tab" aria-selected="${m.id === state.mode}">${icon(m.icon)}${esc(m.label)}</button>`;
  }
  $("#modeTabs").innerHTML = html;
}

function renderModelRow() {
  const legacy = LEGACY_MODELS.find((m) => m.id === state.model);
  $("#modelRow").innerHTML = `
    <div class="lbl"><span class="lbl-l">Model</span><em>${esc((ALL_MODELS.find((m) => m.id === state.model) || {}).desc || "")}</em></div>
    <div class="model-cards" role="radiogroup" aria-label="Model">
      ${MODELS.map((m) => `
        <button class="model-card ${m.id === state.model ? "on" : ""}" data-model="${m.id}" role="radio" aria-checked="${m.id === state.model}">
          <b>${esc(m.name)}${m.tag ? ` <i class="tag">${m.tag}</i>` : ""}</b><span>${esc(m.desc)}</span>
        </button>`).join("")}
      <label class="model-card legacy ${legacy ? "on" : ""}">
        <b>${legacy ? esc(legacy.name) : "Legacy"}</b>
        <select id="legacySelect" aria-label="Legacy models">
          <option value="">${legacy ? "Switch…" : "Older models…"}</option>
          ${LEGACY_MODELS.map((m) => `<option value="${m.id}" ${m.id === state.model ? "selected" : ""}>${m.name} · ${m.desc}</option>`).join("")}
        </select>
      </label>
    </div>`;
}

/* ----- field partials ----- */
const d = () => state.draft;
const val = (k) => esc(d()[k] ?? "");

function fTextarea(key, label, { ph = "", cls = "", max, opt = true, hint = "", extra = "", tools = "" } = {}) {
  return `<div class="field">
    <div class="lbl"><span class="lbl-l">${label} ${opt ? "<em>optional</em>" : ""}</span>${max ? `<span class="counter" data-count="${key}" data-max="${max}"></span>` : ""}</div>
    ${tools}
    <textarea data-f="${key}" class="${cls}" placeholder="${esc(ph)}" ${extra}>${val(key)}</textarea>
    ${hint ? `<p class="hint">${hint}</p>` : ""}
  </div>`;
}
function fInput(key, label, { ph = "", max, opt = true, type = "text", hint = "", cls = "" } = {}) {
  return `<label class="field ${cls}">
    <span class="lbl"><span class="lbl-l">${label} ${opt ? "<em>optional</em>" : ""}</span>${max ? `<span class="counter" data-count="${key}" data-max="${max}"></span>` : ""}</span>
    <input type="${type}" data-f="${key}" value="${val(key)}" placeholder="${esc(ph)}" ${max ? `maxlength="${max}"` : ""} />
    ${hint ? `<p class="hint">${hint}</p>` : ""}
  </label>`;
}
function fSwitch(key, title, sub) {
  return `<label class="switch"><span class="sw-txt"><b>${title}</b><span>${sub}</span></span><input type="checkbox" data-f="${key}" ${d()[key] ? "checked" : ""} /></label>`;
}
function fStyle(key = "style", { label = "Style of music", opt = true, boost = true, ph = "e.g. dreamy synth-pop, female vocals, 110 bpm" } = {}) {
  const cur = String(d()[key] || "").toLowerCase().split(",").map((s) => s.trim());
  const chips = Object.entries(STYLE_CHIPS).map(([g, arr]) => `
    <div class="chip-group"><span>${g}</span><div class="chips">
      ${arr.map((c) => `<button type="button" class="chip ${cur.includes(c.toLowerCase()) ? "on" : ""}" data-chip="${key}" data-val="${esc(c)}">${esc(c)}</button>`).join("")}
    </div></div>`).join("");
  return `<div class="field">
    <div class="lbl"><span class="lbl-l">${label} ${opt ? "<em>optional</em>" : ""}</span>
      <span style="display:flex;gap:8px;align-items:center"><span class="counter" data-count="${key}" data-max="style"></span>
      ${boost ? `<button type="button" class="btn btn-sm btn-soft" data-boost="${key}" title="Let AI expand your style into a richer description">${icon("wand")} Boost</button>` : ""}</span>
    </div>
    <textarea data-f="${key}" rows="2" style="min-height:64px" placeholder="${esc(ph)}">${val(key)}</textarea>
    <details class="adv" style="background:transparent;border-style:dashed"><summary>${icon("sparkle")} Browse styles<span class="chev">${icon("chevron")}</span></summary><div class="adv-body" style="gap:12px">${chips}</div></details>
  </div>`;
}
function fLyrics({ opt = true, label = "Lyrics" } = {}) {
  const tags = ["[Intro]", "[Verse]", "[Pre-Chorus]", "[Chorus]", "[Bridge]", "[Outro]", "[Instrumental]"];
  const tools = `<div class="lyric-tools">
      <button type="button" class="btn btn-sm btn-soft" data-action="write-lyrics">${icon("sparkle")} Write with AI</button>
      ${tags.map((t) => `<button type="button" class="tag-btn" data-insert="${t}">${t}</button>`).join("")}
    </div>`;
  return `<div class="needs-vocals">${fTextarea("lyrics", label, {
    ph: "[Verse]\nWrite your own lyrics here…\n\n[Chorus]\n…or tap “Write with AI”",
    cls: "lyrics", max: "lyrics", opt, tools,
  })}</div>`;
}
function fGender() {
  const g = d().vocalGender || "";
  return `<div class="field needs-vocals"><span class="lbl"><span class="lbl-l">Vocal gender <em>a preference, not a guarantee</em></span></span>
    <div class="seg" data-seg="vocalGender">
      <button type="button" data-v="" class="${!g ? "on" : ""}">Any</button>
      <button type="button" data-v="f" class="${g === "f" ? "on" : ""}">Female</button>
      <button type="button" data-v="m" class="${g === "m" ? "on" : ""}">Male</button>
    </div></div>`;
}
function fSlider(key, label, { min = 0, max = 1, step = 0.01, lo = "", hi = "", cls = "", def } = {}) {
  const v = d()[key];
  const has = v !== undefined && v !== null && v !== "";
  const shown = has ? v : def ?? (min + max) / 2;
  const pct = ((shown - min) / (max - min)) * 100;
  return `<div class="slider ${cls}">
    <span class="lbl"><span class="lbl-l">${label}</span><span>${has ? `<output>${fmtSlider(key, v)}</output> <button type="button" class="slider-reset" data-reset="${key}">reset</button>` : `<output class="auto">Auto</output>`}</span></span>
    <input type="range" data-f="${key}" data-num="1" min="${min}" max="${max}" step="${step}" value="${shown}" style="--p:${pct}%" />
    <div class="ends"><span>${lo}</span><span>${hi}</span></div>
  </div>`;
}
function fmtSlider(key, v) {
  if (key === "duration") return fmtTime(v);
  if (key === "variety") return VARIETY[v] || v;
  if (key === "soundTempo") return `${v} BPM`;
  if (key === "continueAt") return fmtTime(v);
  return Math.round(v * 100) + "%";
}
function fPersona() {
  const opts = state.personas.map((p) => `<option value="${esc(p.id)}" ${p.id === d().personaId ? "selected" : ""}>${esc(p.name)}</option>`).join("");
  return `<div class="row">
    <label class="field"><span class="lbl"><span class="lbl-l">Persona / Voice <em>optional</em></span></span>
      ${state.personas.length ? `<select data-persona-pick><option value="">Choose a saved persona…</option>${opts}</select>` : ""}
      <input type="text" data-f="personaId" value="${val("personaId")}" placeholder="Persona or voice ID" />
    </label>
    <div class="field needs-persona"><span class="lbl"><span class="lbl-l">Persona type</span></span>
      <div class="seg" data-seg="personaModel">
        <button type="button" data-v="style_persona" class="${d().personaModel !== "voice_persona" ? "on" : ""}">Style</button>
        <button type="button" data-v="voice_persona" class="${d().personaModel === "voice_persona" ? "on" : ""}">Voice</button>
      </div>
      <p class="hint">Use “Voice” for IDs from Suno Voice. Create style personas from any track in your library.</p>
    </div>
  </div>`;
}
function fAdvanced({ negative = true, gender = true, weights = true, variety = true, persona = true, duration = false, negReq = false } = {}) {
  return `<details class="adv" ${state.advOpen ? "open" : ""} data-adv>
    <summary>${icon("sliders")} Advanced controls<span class="muted small" style="font-weight:500">weights, variety, persona${duration ? ", length" : ""}</span><span class="chev">${icon("chevron")}</span></summary>
    <div class="adv-body">
      ${negative && !negReq ? fInput("negativeTags", "Avoid these styles", { ph: "e.g. heavy metal, autotune, screaming" }) : ""}
      ${gender ? fGender() : ""}
      ${duration ? `<div class="needs-duration" style="display:grid;gap:10px">${fSwitch("durationOn", "Set a target length", "Supported on V6-series and V5.5 models")}
        ${d().durationOn ? fSlider("duration", "Length", { min: 10, max: 360, step: 5, lo: "0:10", hi: "6:00", def: 120 }) : ""}</div>` : ""}
      ${weights ? `<div class="row">
        ${fSlider("styleWeight", "Style adherence", { lo: "Loose", hi: "Strict" })}
        ${fSlider("weirdnessConstraint", "Weirdness", { lo: "Safe", hi: "Wild" })}
      </div>
      <div class="row">
        <div class="needs-vocals">${fSlider("audioWeight", "Audio weight", { lo: "Low", hi: "High" })}</div>
        ${variety ? fSlider("variety", "Variety", { min: 0, max: 4, step: 1, lo: "Exact", hi: "Max", def: 1 }) : ""}
      </div>` : ""}
      ${persona ? fPersona() : ""}
    </div>
  </details>`;
}
function fAudio(key, label, { hint = "MP3, WAV, M4A · up to 8 minutes" } = {}) {
  const url = d()[key];
  const name = d()[key + "Name"] || (url ? url.split("/").pop().split("?")[0] : "");
  const libOpts = state.tracks.filter((t) => t.audio).map((t) => `<option value="${esc(t.id)}">${esc(t.title || "Untitled")}</option>`).join("");
  return `<div class="field"><span class="lbl"><span class="lbl-l">${label}</span></span>
    <div class="dropzone" data-drop="${key}" data-accept="audio">
      ${url ? `<div class="dz-file">${icon("music")}<span class="name" title="${esc(name)}">${esc(name)}</span><audio controls preload="none" src="${esc(url)}"></audio><button type="button" class="icon-btn ghost" data-clear="${key}" aria-label="Remove">${icon("x")}</button></div>` : `
      <div class="dz-main">
        <div class="dz-ic">${icon("upload")}</div>
        <div class="dz-txt"><b>Drop audio here or browse</b><span>${hint}</span></div>
        <label class="btn btn-sm">Browse<input type="file" accept="audio/*" hidden data-file="${key}" /></label>
      </div>
      <div class="dz-alt">
        <input type="url" placeholder="…or paste a public audio URL" data-urlfor="${key}" />
        ${libOpts ? `<select data-libfor="${key}"><option value="">…or pick from your library</option>${libOpts}</select>` : `<select disabled><option>Your library is empty</option></select>`}
      </div>`}
    </div></div>`;
}
function fRefs() {
  const imgs = d().refImages || [];
  return `<details class="adv" ${imgs.length || d().refAudio || d().refVideo ? "open" : ""}>
    <summary>${icon("image")} Reference media <span class="muted small" style="font-weight:500">inspire the song with images, audio or video</span><span class="chev">${icon("chevron")}</span></summary>
    <div class="adv-body">
      <div class="field"><span class="lbl"><span class="lbl-l">Images <em>up to 5 · JPG, PNG, WEBP</em></span></span>
        <div class="refs">
          ${imgs.map((u, i) => `<div class="ref"><img src="${esc(u)}" alt="" /><button type="button" class="x" data-rmimg="${i}" aria-label="Remove">×</button></div>`).join("")}
          ${imgs.length < 5 ? `<label class="btn btn-sm">${icon("image")} Add image<input type="file" accept="image/jpeg,image/png,image/webp,image/bmp" hidden data-imgfile multiple /></label>` : ""}
        </div>
      </div>
      <div class="row">
        ${fRefFile("refAudio", "Audio reference", "audio/*", "6s – 30min")}
        ${fRefFile("refVideo", "Video reference", "video/mp4,video/quicktime,video/webm", "≤ 241s · MP4, MOV, WEBM")}
      </div>
    </div>
  </details>`;
}
function fRefFile(key, label, accept, hint) {
  const url = d()[key];
  return `<div class="field"><span class="lbl"><span class="lbl-l">${label} <em>${hint}</em></span></span>
    ${url ? `<div class="dz-file">${icon(key === "refVideo" ? "film" : "music")}<span class="name">${esc(d()[key + "Name"] || "Uploaded")}</span><button type="button" class="icon-btn ghost" data-clear="${key}" aria-label="Remove">${icon("x")}</button></div>`
      : `<label class="btn btn-sm" style="justify-self:start">${icon("upload")} Upload<input type="file" accept="${accept}" hidden data-reffile="${key}" /></label>`}
  </div>`;
}

/* ----- mode bodies ----- */
function modeBody(mode) {
  switch (mode) {
    case "quick":
      return `
        ${fTextarea("prompt", "Describe your song", { ph: "A feel-good summer anthem about road trips, with handclaps and a big singalong chorus", cls: "big", max: "prompt", opt: false })}
        <div class="idea-row">
          <span class="muted small">Need a spark?</span>
          ${state.ideas.map((i) => `<button type="button" class="idea" data-idea="${esc(i)}">${esc(i)}</button>`).join("")}
          <button type="button" class="icon-btn ghost" data-action="shuffle-ideas" title="More ideas" aria-label="More ideas">${icon("shuffle")}</button>
        </div>
        ${fSwitch("instrumental", "Instrumental", "No vocals, just the music")}
        ${fStyle("style", { label: "Style hint", ph: "Optional: steer the genre, e.g. synthwave, female vocals" })}
        ${fRefs()}`;
    case "custom":
      return `
        <div class="row">${fInput("title", "Title", { ph: "Name your track", max: 80 })}<div>${fSwitch("instrumental", "Instrumental", "Skip vocals and lyrics")}</div></div>
        ${fStyle("style")}
        ${fLyrics({ opt: false })}
        ${fAdvanced({ duration: true })}`;
    case "sounds":
      return `
        ${fTextarea("soundPrompt", "Describe the sound", { ph: "Warm lo-fi drum loop with vinyl crackle and soft rhodes chords", cls: "big", max: 500, opt: false })}
        <div class="row">
          ${fSwitch("soundLoop", "Seamless loop", "Make it loop cleanly")}
          ${fSwitch("grabLyrics", "Capture lyric subtitles", "If the sound has vocals")}
        </div>
        <div class="row">
          ${fSlider("soundTempo", "Tempo", { min: 50, max: 200, step: 1, lo: "50", hi: "200", def: 110 })}
          <label class="field"><span class="lbl"><span class="lbl-l">Key</span></span>
            <select data-f="soundKey">${SOUND_KEYS.map((k) => `<option ${k === (d().soundKey || "Any") ? "selected" : ""}>${k}</option>`).join("")}</select>
          </label>
        </div>`;
    case "cover":
      return `
        ${fAudio("uploadUrl", "Source audio")}
        <div class="row">${fInput("title", "Title", { ph: "Name your cover", max: 80 })}<div>${fSwitch("instrumental", "Instrumental", "Drop the vocals")}</div></div>
        ${fStyle("style", { label: "New style", ph: "e.g. acoustic jazz trio, smoky female vocals" })}
        ${fLyrics({ label: "Lyrics (to replace the original)" })}
        ${fAdvanced({ duration: true })}`;
    case "uextend":
      return `
        ${fAudio("uploadUrl", "Audio to extend")}
        <div class="row">
          ${fInput("continueAtTxt", "Continue from (seconds)", { ph: "End of clip", type: "number", hint: "Leave empty to continue from the end." })}
          <div>${fSwitch("instrumental", "Instrumental", "Continue without vocals")}</div>
        </div>
        <div class="row">${fInput("title", "Title", { ph: "Name the extended track", max: 100 })}<div></div></div>
        ${fStyle("style")}
        ${fLyrics({ label: "Lyrics for the new part" })}
        ${fAdvanced()}`;
    case "vocals":
      return `
        ${fAudio("uploadUrl", "Instrumental track")}
        <div class="row">${fInput("title", "Title", { ph: "Name your song", max: 80, opt: false })}${fInput("negativeTags", "Avoid", { ph: "e.g. screaming, autotune", opt: false })}</div>
        ${fStyle("style", { label: "Vocal & music style", opt: false, ph: "e.g. soulful female R&B vocals, warm and breathy" })}
        ${fLyrics({ label: "Lyrics to sing" })}
        ${fAdvanced({ negative: false, persona: false })}`;
    case "instrumental":
      return `
        ${fAudio("uploadUrl", "Vocal or melody track")}
        <div class="row">${fInput("title", "Title", { ph: "Name your song", max: 80, opt: false })}${fInput("negativeTags", "Avoid", { ph: "e.g. heavy drums, distortion", opt: false })}</div>
        ${fStyle("style", { label: "Backing style", opt: false, ph: "e.g. lush acoustic guitar, soft strings, brushed drums" })}
        ${fAdvanced({ negative: false, persona: false, gender: false })}`;
    case "mashup":
      return `
        <div class="row">${fAudio("uploadUrl", "Track A")}${fAudio("uploadUrl2", "Track B")}</div>
        <div class="row">${fInput("title", "Title", { ph: "Name your mashup", max: 80 })}<div></div></div>
        ${fStyle("style", { label: "Mashup style" })}
        ${fLyrics({ label: "Lyrics" })}
        ${fAdvanced({ negative: false, duration: true })}`;
  }
  return "";
}

function renderComposer() {
  const m = MODES.find((x) => x.id === state.mode);
  renderModeTabs();
  $("#modeIntro").innerHTML = `<h2>${esc(m.title)}</h2><p>${esc(m.sub)}</p>`;
  renderModelRow();
  $("#modeBody").innerHTML = modeBody(state.mode);
  $("#generateBtn").innerHTML = `${icon("sparkle")} ${esc(m.cta)}`;
  syncComposerFlags();
  updateCounters();
  renderFootMeta();
}

function syncComposerFlags() {
  const c = $("#composer");
  const instrOk = ["quick", "custom", "cover", "uextend"].includes(state.mode);
  c.dataset.instr = instrOk && d().instrumental ? "1" : "0";
  c.dataset.dur = DURATION_MODELS.includes(state.model) ? "1" : "0";
  c.dataset.persona = d().personaId ? "1" : "0";
}

function updateCounters() {
  const L = limits(state.model);
  $$("[data-count]").forEach((el) => {
    const key = el.dataset.count;
    const max = isNaN(el.dataset.max) ? L[el.dataset.max] : Number(el.dataset.max);
    const len = String(d()[key] || "").length;
    el.textContent = `${len.toLocaleString()} / ${max.toLocaleString()}`;
    el.classList.toggle("over", len > max);
  });
}

function renderFootMeta() {
  const bits = [`${icon("music")} <b>${esc(modelName(state.model))}</b>`];
  if (["quick", "custom", "cover", "uextend", "vocals", "instrumental", "mashup"].includes(state.mode)) bits.push("· 2 variations");
  if (d().instrumental && ["quick", "custom", "cover", "uextend"].includes(state.mode)) bits.push("· instrumental");
  $("#footMeta").innerHTML = bits.join(" ");
}

/* ----- composer events ----- */
function bindComposer() {
  const root = $("#composer");

  root.addEventListener("input", (e) => {
    const el = e.target;
    const k = el.dataset.f;
    if (!k) return;
    if (el.type === "checkbox") d()[k] = el.checked;
    else if (el.dataset.num) {
      d()[k] = Number(el.value);
      const min = Number(el.min), max = Number(el.max);
      el.style.setProperty("--p", ((el.value - min) / (max - min)) * 100 + "%");
      const out = el.closest(".slider").querySelector("output");
      if (out) { out.textContent = fmtSlider(k, Number(el.value)); out.classList.remove("auto"); }
      if (!el.closest(".slider").querySelector(".slider-reset")) {
        out.insertAdjacentHTML("afterend", ` <button type="button" class="slider-reset" data-reset="${k}">reset</button>`);
      }
    } else d()[k] = el.value;
    if (k === "instrumental" || k === "personaId") syncComposerFlags();
    if (k === "instrumental") renderFootMeta();
    if (k === "durationOn") { if (el.checked && d().duration == null) d().duration = 120; renderComposerKeepScroll(); }
    if (k === "style") syncChips(k);
    updateCounters();
    saveDraft();
  });

  root.addEventListener("change", async (e) => {
    const el = e.target;
    if (el.id === "legacySelect" && el.value) return setModel(el.value);
    if (el.matches("[data-persona-pick]")) {
      d().personaId = el.value;
      const p = state.personas.find((x) => x.id === el.value);
      if (p) d().personaModel = p.type || "style_persona";
      saveDraft(); renderComposerKeepScroll(); return;
    }
    if (el.matches("[data-file]")) return handleAudioFile(el.dataset.file, el.files[0]);
    if (el.matches("[data-reffile]")) return handleRefFile(el.dataset.reffile, el.files[0]);
    if (el.matches("[data-imgfile]")) return handleImageFiles([...el.files]);
    if (el.matches("[data-libfor]")) {
      const t = state.tracks.find((x) => x.id === el.value);
      if (t) { d()[el.dataset.libfor] = t.audio; d()[el.dataset.libfor + "Name"] = t.title || "Library track"; saveDraft(); renderComposerKeepScroll(); }
      return;
    }
    if (el.matches("[data-urlfor]")) {
      const v = el.value.trim();
      if (/^https?:\/\//i.test(v)) { d()[el.dataset.urlfor] = v; d()[el.dataset.urlfor + "Name"] = ""; saveDraft(); renderComposerKeepScroll(); }
      else if (v) toast("That doesn't look like a link", { type: "err", body: "Paste a full URL starting with https://" });
    }
  });

  root.addEventListener("toggle", (e) => {
    if (e.target.matches("[data-adv]")) state.advOpen = e.target.open;
  }, true);

  root.addEventListener("click", async (e) => {
    const b = e.target.closest("button, [data-chip]");
    if (!b) return;
    if (b.dataset.mode) return setMode(b.dataset.mode);
    if (b.dataset.model) return setModel(b.dataset.model);
    if (b.dataset.idea) {
      d().prompt = b.dataset.idea.replace(/^\S+\s/, "");
      saveDraft(); renderComposerKeepScroll();
      const ta = $('[data-f="prompt"]'); ta?.focus(); ta?.setSelectionRange(ta.value.length, ta.value.length);
      return;
    }
    if (b.dataset.action === "shuffle-ideas") { state.ideas = shuffle(IDEAS).slice(0, 3); return renderComposerKeepScroll(); }
    if (b.dataset.chip) return toggleChip(b.dataset.chip, b.dataset.val);
    if (b.dataset.boost) return boostStyle(b.dataset.boost, b);
    if (b.dataset.insert) return insertAtCursor($('[data-f="lyrics"]'), b.dataset.insert + "\n");
    if (b.dataset.action === "write-lyrics") return openLyricsWriter((text, title) => {
      d().lyrics = text;
      if (title && !d().title) d().title = title;
      saveDraft(); renderComposerKeepScroll();
    });
    if (b.dataset.reset) { delete d()[b.dataset.reset]; saveDraft(); return renderComposerKeepScroll(); }
    if (b.dataset.clear) { delete d()[b.dataset.clear]; delete d()[b.dataset.clear + "Name"]; saveDraft(); return renderComposerKeepScroll(); }
    if (b.dataset.rmimg) { d().refImages.splice(Number(b.dataset.rmimg), 1); saveDraft(); return renderComposerKeepScroll(); }
    const seg = b.closest("[data-seg]");
    if (seg) {
      d()[seg.dataset.seg] = b.dataset.v;
      $$("button", seg).forEach((x) => x.classList.toggle("on", x === b));
      saveDraft();
    }
  });

  // drag & drop
  root.addEventListener("dragover", (e) => {
    const z = e.target.closest("[data-drop]"); if (!z) return;
    e.preventDefault(); z.classList.add("drag");
  });
  root.addEventListener("dragleave", (e) => e.target.closest("[data-drop]")?.classList.remove("drag"));
  root.addEventListener("drop", (e) => {
    const z = e.target.closest("[data-drop]"); if (!z) return;
    e.preventDefault(); z.classList.remove("drag");
    const f = e.dataTransfer.files[0];
    if (f) handleAudioFile(z.dataset.drop, f);
  });

  $("#generateBtn").addEventListener("click", submitComposer);
}

function renderComposerKeepScroll() {
  const y = window.scrollY;
  $("#modeBody").innerHTML = modeBody(state.mode);
  syncComposerFlags(); updateCounters(); renderFootMeta();
  window.scrollTo(0, y);
}

function syncChips(key) {
  const cur = String(d()[key] || "").toLowerCase().split(",").map((s) => s.trim());
  $$(`[data-chip="${key}"]`).forEach((c) => c.classList.toggle("on", cur.includes(c.dataset.val.toLowerCase())));
}
function toggleChip(key, v) {
  let parts = String(d()[key] || "").split(",").map((s) => s.trim()).filter(Boolean);
  const i = parts.findIndex((p) => p.toLowerCase() === v.toLowerCase());
  if (i >= 0) parts.splice(i, 1); else parts.push(v);
  d()[key] = parts.join(", ");
  const ta = $(`[data-f="${key}"]`);
  if (ta) ta.value = d()[key];
  syncChips(key); updateCounters(); saveDraft();
}
function insertAtCursor(ta, text) {
  if (!ta) return;
  const s = ta.selectionStart ?? ta.value.length, e = ta.selectionEnd ?? s;
  const before = ta.value.slice(0, s);
  const pre = before && !before.endsWith("\n") ? "\n\n" : "";
  ta.value = before + pre + text + ta.value.slice(e);
  const pos = s + pre.length + text.length;
  ta.focus(); ta.setSelectionRange(pos, pos);
  ta.dispatchEvent(new Event("input", { bubbles: true }));
}

async function handleAudioFile(key, file) {
  if (!file) return;
  if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|aac|ogg|flac|webm)$/i.test(file.name)) {
    return toast("Please choose an audio file", { type: "err" });
  }
  const zone = $(`[data-drop="${key}"]`);
  if (zone) zone.innerHTML = `<div class="dz-main"><div class="dz-ic"><span class="spinner"></span></div><div class="dz-txt"><b>Uploading ${esc(file.name)}…</b><span>Files are stored for 3 days</span></div></div>`;
  try {
    const url = await uploadFile(file);
    d()[key] = url; d()[key + "Name"] = file.name;
    saveDraft();
    toast("Upload complete", { type: "ok", body: file.name, timeout: 2500 });
  } catch (e) {
    toast("Upload failed", { type: "err", body: e.message });
  }
  renderComposerKeepScroll();
}
async function handleRefFile(key, file) {
  if (!file) return;
  toast("Uploading reference…", { timeout: 2000 });
  try {
    d()[key] = await uploadFile(file); d()[key + "Name"] = file.name; saveDraft();
  } catch (e) { toast("Upload failed", { type: "err", body: e.message }); }
  renderComposerKeepScroll();
}
async function handleImageFiles(files) {
  const room = 5 - (d().refImages || []).length;
  files = files.slice(0, room);
  if (!files.length) return;
  toast(`Uploading ${files.length} image${files.length > 1 ? "s" : ""}…`, { timeout: 2000 });
  for (const f of files) {
    if (f.size > 10 * 1024 * 1024) { toast(`${f.name} is over 10 MB`, { type: "err" }); continue; }
    try { d().refImages.push(await uploadFile(f)); } catch (e) { toast("Upload failed", { type: "err", body: e.message }); }
  }
  saveDraft(); renderComposerKeepScroll();
}

async function boostStyle(key, btn) {
  const content = String(d()[key] || "").trim();
  if (!content) return toast("Add a few style words first", { body: "e.g. “pop, mysterious” — Boost will expand it.", type: "err" });
  const old = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Boosting`;
  try {
    const data = await api("/api/v1/style/generate", { method: "POST", body: { content } });
    const result = data?.result || (typeof data === "string" ? data : "");
    if (!result) throw new ApiError("No style came back. Try again.");
    d()[key] = result.slice(0, limits(state.model).style);
    saveDraft(); renderComposerKeepScroll();
    toast("Style boosted ✨", { type: "ok", body: "Tweak it or keep it as is.", timeout: 3000 });
    refreshCredits();
  } catch (e) {
    toast("Couldn't boost style", { type: "err", body: e.message });
    btn.disabled = false; btn.innerHTML = old;
  }
}

/* ----- build & submit ----- */
function commonExtras(body, { gender = true, weights = true, variety = true, persona = true, duration = false } = {}) {
  const x = d();
  const vocal = !body.instrumental;
  if (gender && vocal && x.vocalGender) body.vocalGender = x.vocalGender;
  if (weights) {
    if (x.styleWeight != null) body.styleWeight = round2(x.styleWeight);
    if (x.weirdnessConstraint != null) body.weirdnessConstraint = round2(x.weirdnessConstraint);
    if (vocal && x.audioWeight != null) body.audioWeight = round2(x.audioWeight);
  }
  if (variety && x.variety != null) body.variety = x.variety;
  if (persona && x.personaId) {
    body.personaId = x.personaId.trim();
    if (x.personaModel === "voice_persona" && PERSONA_VOICE_MODELS.includes(state.model)) body.personaModel = "voice_persona";
  }
  if (duration && x.durationOn && x.duration && DURATION_MODELS.includes(state.model)) body.duration = x.duration;
  return body;
}
const round2 = (n) => Math.round(n * 100) / 100;

function buildRequest() {
  const x = d(), model = state.model, L = limits(model), cb = callbackUrl();
  const need = (cond, msg) => { if (!cond) throw new ApiError(msg); };
  const tooLong = (k, max, label) => need(String(x[k] || "").length <= max, `${label} is over the ${max.toLocaleString()} character limit for ${modelName(model)}.`);
  const instr = !!x.instrumental;
  const lyr = instr ? undefined : (x.lyrics || "").trim() || undefined;

  switch (state.mode) {
    case "quick": {
      const prompt = (x.prompt || "").trim();
      need(prompt || x.style || x.refImages?.length || x.refAudio || x.refVideo, "Describe your song first — even one sentence works.");
      tooLong("prompt", L.prompt, "Your description");
      return {
        path: "/api/v1/generate", label: prompt.slice(0, 60) || "Quick song",
        body: {
          customMode: false, instrumental: instr, model, callBackUrl: cb, prompt, style: (x.style || "").trim(),
          imageUrls: x.refImages, audioUrls: x.refAudio ? [x.refAudio] : undefined, videoUrls: x.refVideo ? [x.refVideo] : undefined,
        },
      };
    }
    case "custom": {
      need(x.style || lyr || x.negativeTags || instr, "Add a style or some lyrics to get started.");
      need(instr || lyr, "Add lyrics (or tap “Write with AI”), or switch on Instrumental.");
      need((x.style || "").trim() || instr === false, "Instrumental tracks need a style — tell us what it should sound like.");
      tooLong("lyrics", L.lyrics, "Lyrics"); tooLong("style", L.style, "Style"); tooLong("title", 80, "Title");
      const body = { customMode: true, instrumental: instr, model, callBackUrl: cb, title: x.title, style: x.style, lyrics: lyr, negativeTags: x.negativeTags };
      return { path: "/api/v1/generate", label: x.title || "Custom song", body: commonExtras(body, { duration: true }) };
    }
    case "sounds": {
      const prompt = (x.soundPrompt || "").trim();
      need(prompt, "Describe the sound you want.");
      tooLong("soundPrompt", 500, "Description");
      return {
        path: "/api/v1/generate/sounds", label: prompt.slice(0, 60),
        body: { prompt, model, soundLoop: !!x.soundLoop, soundTempo: x.soundTempo, soundKey: x.soundKey || "Any", grabLyrics: !!x.grabLyrics, callBackUrl: cb },
      };
    }
    case "cover": {
      need(x.uploadUrl, "Add the audio you want to cover.");
      tooLong("lyrics", L.lyrics, "Lyrics"); tooLong("style", L.style, "Style");
      const body = { uploadUrl: x.uploadUrl, model, callBackUrl: cb, title: x.title, style: x.style, lyrics: lyr, instrumental: instr, negativeTags: x.negativeTags };
      return { path: "/api/v1/generate/upload-cover", label: x.title || `Cover of ${x.uploadUrlName || "upload"}`, body: commonExtras(body, { duration: true }) };
    }
    case "uextend": {
      need(x.uploadUrl, "Add the audio you want to extend.");
      const at = x.continueAtTxt ? Number(x.continueAtTxt) : undefined;
      need(at === undefined || at > 0, "“Continue from” must be greater than 0 seconds.");
      const body = { uploadUrl: x.uploadUrl, model, callBackUrl: cb, title: x.title, style: x.style, lyrics: lyr, instrumental: instr, negativeTags: x.negativeTags, continueAt: at };
      return { path: "/api/v1/generate/upload-extend", label: x.title || `Extension of ${x.uploadUrlName || "upload"}`, body: commonExtras(body) };
    }
    case "vocals": {
      need(x.uploadUrl, "Add the instrumental you want vocals on.");
      need(x.title, "Give your song a title."); need(x.style, "Describe the vocal style."); need(x.negativeTags, "Add at least one thing to avoid (e.g. “screaming”).");
      const body = { uploadUrl: x.uploadUrl, model, callBackUrl: cb, title: x.title, style: x.style, negativeTags: x.negativeTags, lyrics: (x.lyrics || "").trim() };
      return { path: "/api/v1/generate/add-vocals", label: x.title, body: commonExtras(body, { persona: false }) };
    }
    case "instrumental": {
      need(x.uploadUrl, "Add the vocal or melody track.");
      need(x.title, "Give your song a title."); need(x.style, "Describe the backing style."); need(x.negativeTags, "Add at least one thing to avoid (e.g. “distortion”).");
      const body = { uploadUrl: x.uploadUrl, model, callBackUrl: cb, title: x.title, tags: x.style, negativeTags: x.negativeTags };
      return { path: "/api/v1/generate/add-instrumental", label: x.title, body: commonExtras(body, { persona: false, gender: false }) };
    }
    case "mashup": {
      need(x.uploadUrl && x.uploadUrl2, "Add two tracks to mash up.");
      const body = { uploadUrlList: [x.uploadUrl, x.uploadUrl2], model, callBackUrl: cb, title: x.title, style: x.style, lyrics: (x.lyrics || "").trim() };
      return { path: "/api/v1/generate/mashup", label: x.title || "Mashup", body: commonExtras(body, { duration: true }) };
    }
  }
}

async function submitComposer() {
  if (state.busy) return;
  let req;
  try { req = buildRequest(); } catch (e) { return toast("Almost there", { body: e.message, type: "err" }); }
  const btn = $("#generateBtn");
  const old = btn.innerHTML;
  state.busy = true; btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Sending to the studio…`;
  try {
    await startMusicTask(req.path, req.body, { label: req.label, mode: state.mode });
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().catch(() => {});
  } catch (e) {
    toast("Couldn't start", { body: e.message, type: "err", timeout: 8000 });
  } finally {
    state.busy = false; btn.disabled = false; btn.innerHTML = old;
  }
}

/* =====================================================================
   Tasks
   ===================================================================== */
const TASK_KINDS = {
  music: { path: "/api/v1/generate/record-info", icon: "music" },
  lyrics: { path: "/api/v1/lyrics/record-info", icon: "pen" },
  wav: { path: "/api/v1/wav/record-info", icon: "download" },
  stems: { path: "/api/v1/vocal-removal/record-info", icon: "layers" },
  video: { path: "/api/v1/mp4/record-info", icon: "film" },
  art: { path: "/api/v1/suno/cover/record-info", icon: "image" },
};

function addTask(t) {
  const task = Object.assign({ id: uid(), status: "running", stage: "PENDING", created: Date.now(), polls: 0 }, t);
  state.tasks.unshift(task);
  saveTasks(); renderActivity();
  pollSoon();
  return task;
}

async function startMusicTask(path, body, { label, mode, parent } = {}) {
  const data = await api(path, { method: "POST", body });
  if (!data?.taskId) throw new ApiError("No task ID came back from SunoAPI.");
  addTask({ kind: "music", taskId: data.taskId, label: label || "New track", mode, model: body.model, parent, instrumental: !!body.instrumental });
  toast("Your track is in the studio 🎧", { body: "Usually ready in 30–90 seconds. You'll hear the first take as soon as it streams.", timeout: 4500 });
  refreshCredits();
}

function flagState(flag, kind) {
  if (flag == null) return "running";
  const s = String(flag).toUpperCase();
  if (s === "SUCCESS" || s === "1") return "done";
  if (/FAIL|ERROR|EXCEPTION/.test(s)) return "failed";
  if (kind === "art") return s === "3" ? "failed" : "running";
  if (s === "2" || s === "3") return "failed";
  return "running";
}

let pollTimer = null, polling = false;
function pollSoon(ms = 2500) { clearTimeout(pollTimer); pollTimer = setTimeout(pollLoop, ms); }
async function pollLoop() {
  if (polling || !state.key) return;
  polling = true;
  try {
    const running = state.tasks.filter((t) => t.status === "running");
    for (const t of running) {
      try { await pollTask(t); } catch (e) {
        if (e.code === 401) { polling = false; return signOut("Your API key is no longer valid."); }
        t.errors = (t.errors || 0) + 1;
        if (t.errors > 6) failTask(t, e.message);
      }
      await sleep(250);
    }
  } finally {
    polling = false;
    saveTasks(); renderActivity();
    if (state.tasks.some((t) => t.status === "running")) pollSoon(4000);
  }
}

async function pollTask(t) {
  const kind = TASK_KINDS[t.kind];
  const data = await api(kind.path, { query: { taskId: t.taskId } });
  t.polls++;
  if (Date.now() - t.created > 25 * 60 * 1000) return failTask(t, "Timed out. SunoAPI may still finish it later.");
  if (!data) return;

  if (t.kind === "music") {
    const status = data.status || "PENDING";
    const items = data.response?.sunoData || [];
    if (items.length) ingestTracks(t, items, status === "SUCCESS");
    if (MUSIC_STAGE[status] != null) {
      const prev = t.stage;
      t.stage = status;
      if (status === "FIRST_SUCCESS" && prev !== "FIRST_SUCCESS" && prev !== "SUCCESS" && items.some((i) => i.stream_audio_url || i.audio_url)) {
        toast("First take is streaming 🎶", { body: t.label, action: () => playTrack(items[0].id), actionLabel: "Listen now" });
      }
      if (status === "SUCCESS") completeTask(t, `${items.length || 2} track${items.length === 1 ? "" : "s"} ready`);
    } else if (/FAIL|ERROR|EXCEPTION/.test(status)) {
      failTask(t, status === "SENSITIVE_WORD_ERROR" ? "Blocked by the content filter. Try rewording your prompt or lyrics." : data.errorMessage || humanStatus(status));
    }
    return;
  }

  if (t.kind === "lyrics") {
    const status = data.status;
    if (status === "SUCCESS") {
      t.result = (data.response?.data || []).filter((v) => v.status !== "failed" && v.text);
      completeTask(t, "Lyrics ready");
      t.onDone?.(t.result);
      if (!t.onDone && t.result.length) showLyricsVariants(t.result);
    } else if (/FAIL|ERROR|EXCEPTION/.test(status || "")) failTask(t, data.errorMessage || humanStatus(status));
    return;
  }

  const st = flagState(data.successFlag, t.kind);
  if (st === "failed") return failTask(t, data.errorMessage || "Processing failed.");
  if (st !== "done") { t.stage = "PROCESSING"; return; }
  const track = state.tracks.find((x) => x.id === t.trackId);
  const r = data.response || {};
  if (t.kind === "wav" && r.audioWavUrl) { if (track) track.wav = r.audioWavUrl; completeTask(t, "WAV ready"); }
  else if (t.kind === "video" && r.videoUrl) { if (track) track.video = r.videoUrl; completeTask(t, "Video ready"); }
  else if (t.kind === "art" && r.images?.length) { if (track) track.artOptions = r.images; completeTask(t, "Cover art ready"); }
  else if (t.kind === "stems") { if (track) track.stems = normalizeStems(r); completeTask(t, "Stems ready"); }
  else return; // done flag but no payload yet
  saveTracks();
  if (drawerTrackId === t.trackId) renderDrawer();
}

const humanStatus = (s) => ({
  CREATE_TASK_FAILED: "SunoAPI couldn't create the task.",
  GENERATE_AUDIO_FAILED: "Audio generation failed. Try again or tweak your prompt.",
  GENERATE_LYRICS_FAILED: "Lyrics generation failed. Try a different idea.",
  CALLBACK_EXCEPTION: "Generation finished with a callback error.",
  SENSITIVE_WORD_ERROR: "Blocked by the content filter. Try rewording.",
}[s] || "Something went wrong.");

function completeTask(t, msg) {
  if (t.status === "done") return;
  t.status = "done"; t.stage = "SUCCESS"; t.msg = msg; t.finished = Date.now();
  saveTasks(); renderActivity();
  if (t.kind === "music") {
    confetti();
    const first = state.tracks.find((x) => x.taskId === t.taskId);
    toast("Your track is ready! 🎉", { type: "ok", body: t.label, action: () => first && playTrack(first.id), actionLabel: "Play it", timeout: 8000 });
    notify("Your track is ready 🎉", t.label);
    refreshCredits();
    if (!state.current && first) playTrack(first.id, { autoplay: false });
  } else if (t.kind !== "lyrics") {
    toast(msg, { type: "ok", body: t.label, action: () => openDrawer(t.trackId), actionLabel: "Open", timeout: 6000 });
    notify(msg, t.label);
    refreshCredits();
  }
}
function failTask(t, msg) {
  t.status = "failed"; t.msg = msg; t.finished = Date.now();
  saveTasks(); renderActivity(); renderLibraryIfVisible();
  toast("Generation failed", { type: "err", body: msg, timeout: 9000 });
}

function ingestTracks(task, items, final) {
  let changed = false;
  for (const it of items) {
    if (!it.id) continue;
    let tr = state.tracks.find((x) => x.id === it.id);
    const fresh = !tr;
    if (!tr) { tr = { id: it.id, created: Date.now(), fav: false }; state.tracks.unshift(tr); }
    Object.assign(tr, {
      taskId: task.taskId,
      title: it.title || tr.title || task.label,
      tags: it.tags ?? tr.tags ?? "",
      lyrics: it.prompt ?? tr.lyrics ?? "",
      image: tr.customImage || it.image_url || it.source_image_url || tr.image || "",
      audio: it.audio_url || it.source_audio_url || tr.audio || "",
      stream: it.stream_audio_url || it.source_stream_audio_url || tr.stream || "",
      duration: it.duration || tr.duration || 0,
      model: it.model_name ? modelFromApi(it.model_name) : tr.model || modelName(task.model),
      mode: task.mode || tr.mode,
      instrumental: task.instrumental ?? tr.instrumental,
      parent: task.parent || tr.parent,
      pending: !final && !it.audio_url,
    });
    changed = changed || fresh || final;
  }
  saveTracks();
  renderLatest(); renderLibCount();
  if (changed) renderLibraryIfVisible();
  if (state.current && items.some((i) => i.id === state.current)) updatePlayerMeta();
  if (drawerTrackId && items.some((i) => i.id === drawerTrackId)) renderDrawer();
}

function normalizeStems(r) {
  const out = [];
  const seen = new Set();
  const named = { vocalUrl: "Vocals", instrumentalUrl: "Instrumental", backingVocalsUrl: "Backing vocals", drumsUrl: "Drums", bassUrl: "Bass", guitarUrl: "Guitar", keyboardUrl: "Keyboard", percussionUrl: "Percussion", stringsUrl: "Strings", synthUrl: "Synth", fxUrl: "FX", brassUrl: "Brass", woodwindsUrl: "Woodwinds" };
  for (const [k, name] of Object.entries(named)) if (r[k] && !seen.has(r[k])) { seen.add(r[k]); out.push({ name, url: r[k] }); }
  for (const o of r.originData || []) if (o.audio_url && !seen.has(o.audio_url)) { seen.add(o.audio_url); out.push({ name: o.stem_type_group_name || "Stem", url: o.audio_url }); }
  return out;
}

/* ----- activity ----- */
function renderActivity() {
  const el = $("#activity");
  if (!el) return;
  const list = state.tasks.slice(0, 12);
  const running = state.tasks.filter((t) => t.status === "running").length;
  $("#activityHint").textContent = running ? `${running} in progress` : "";
  if (!list.length) {
    el.innerHTML = `<div class="empty"><div class="big">🎛️</div>Nothing cooking yet.<br/>Your generations will show up here.</div>`;
    return;
  }
  el.innerHTML = list.map((t) => {
    const k = TASK_KINDS[t.kind] || TASK_KINDS.music;
    const pct = t.status === "done" ? 100 : t.status === "failed" ? 100 : t.kind === "music" ? MUSIC_STAGE[t.stage] || 12 : Math.min(90, 15 + t.polls * 6);
    const stateTxt = t.status === "done" ? "Done" : t.status === "failed" ? "Failed" : t.kind === "music" ? STAGE_LABEL[t.stage] || "Working" : "Working";
    const msg = t.status === "running" ? BUSY_LINES[(t.polls + t.id.charCodeAt(0)) % BUSY_LINES.length] : t.msg || "";
    const tracks = t.kind === "music" ? state.tracks.filter((x) => x.taskId === t.taskId) : [];
    const playable = tracks.filter((x) => x.audio || x.stream);
    return `<div class="act ${t.status}">
      <div class="act-top"><span class="act-ic">${icon(k.icon)}</span><span class="act-title" title="${esc(t.label)}">${esc(t.label)}</span><span class="act-state">${stateTxt}</span></div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="act-msg">${esc(msg)} <span class="muted">· ${ago(t.created)}</span></div>
      ${playable.length ? `<div class="act-actions">${playable.map((x, i) => `<button class="btn btn-sm ${i ? "" : "btn-soft"}" data-play="${esc(x.id)}">${icon(state.current === x.id && !audio.paused ? "pause" : "play")} Take ${i + 1}</button>`).join("")}</div>` : ""}
      ${t.kind === "lyrics" && t.status === "done" && t.result?.length ? `<div class="act-actions"><button class="btn btn-sm btn-soft" data-lyrics-task="${t.id}">${icon("text")} View lyrics</button></div>` : ""}
      ${t.trackId && t.status === "done" ? `<div class="act-actions"><button class="btn btn-sm btn-soft" data-open="${esc(t.trackId)}">Open track</button></div>` : ""}
    </div>`;
  }).join("");
}

/* =====================================================================
   Lyrics writer
   ===================================================================== */
function openLyricsWriter(onPick) {
  const seed = (d().prompt || d().title || "").slice(0, 200);
  openModal(`
    <div class="modal-head"><span class="act-ic">${icon("pen")}</span><div><h3>Write lyrics with AI</h3><p>Describe the theme, mood and story. You'll get a couple of versions to choose from.</p></div><button class="icon-btn ghost" data-close aria-label="Close">${icon("x")}</button></div>
    <div class="modal-body">
      <div class="field"><div class="lbl"><span>What's the song about?</span><span class="counter" id="lwCount">0 / 200</span></div>
        <textarea id="lwPrompt" maxlength="200" class="big" placeholder="A hopeful song about moving to a new city and finding yourself">${esc(seed)}</textarea></div>
      <div class="chips">${["heartbreak turned into strength", "late-night drive with an old friend", "celebrating a small win", "a love letter to the ocean", "chasing dreams against all odds"].map((s) => `<button type="button" class="chip" data-seed="${esc(s)}">${esc(s)}</button>`).join("")}</div>
      <div id="lwOut"></div>
    </div>
    <div class="modal-foot"><button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="lwGo">${icon("sparkle")} Write lyrics</button></div>`);
  const ta = $("#lwPrompt");
  const count = () => ($("#lwCount").textContent = `${ta.value.length} / 200`);
  ta.addEventListener("input", count); count();
  $$("[data-seed]").forEach((c) => (c.onclick = () => { ta.value = c.dataset.seed; count(); }));
  $("#lwGo").onclick = async () => {
    const prompt = ta.value.trim();
    if (!prompt) return ta.focus();
    const go = $("#lwGo");
    go.disabled = true; go.innerHTML = `<span class="spinner"></span> Writing…`;
    $("#lwOut").innerHTML = `<div class="empty"><div class="big">✍️</div>Finding the right words… this takes about 10–30 seconds.</div>`;
    try {
      const data = await api("/api/v1/lyrics", { method: "POST", body: { prompt, callBackUrl: callbackUrl() } });
      const task = addTask({ kind: "lyrics", taskId: data.taskId, label: `Lyrics: ${prompt.slice(0, 40)}` });
      task.onDone = (variants) => {
        if (!$("#lwOut")) { showLyricsVariants(variants, onPick); return; }
        renderVariants($("#lwOut"), variants, onPick);
        go.disabled = false; go.innerHTML = `${icon("refresh")} Try again`;
      };
    } catch (e) {
      $("#lwOut").innerHTML = `<p class="form-error">${esc(e.message)}</p>`;
      go.disabled = false; go.innerHTML = `${icon("sparkle")} Write lyrics`;
    }
  };
}
function renderVariants(el, variants, onPick) {
  if (!variants?.length) { el.innerHTML = `<p class="form-error">No lyrics came back. Try a different idea.</p>`; return; }
  el.innerHTML = `<div style="display:grid;gap:10px">${variants.map((v, i) => `
    <div class="variant"><div style="display:flex;align-items:center;gap:8px"><h4 style="flex:1">${esc(v.title || `Version ${i + 1}`)}</h4>
    <button class="btn btn-sm btn-primary" data-use="${i}">${icon("check")} Use these</button></div><pre>${esc(v.text)}</pre></div>`).join("")}</div>`;
  $$("[data-use]", el).forEach((b) => (b.onclick = () => {
    const v = variants[Number(b.dataset.use)];
    if (onPick) onPick(v.text, v.title);
    else { d().lyrics = v.text; if (v.title && !d().title) d().title = v.title; saveDraft(); setView("create"); setMode("custom"); }
    closeModal();
    toast("Lyrics added", { type: "ok", body: "Pick a style and hit Create.", timeout: 3000 });
  }));
}
function showLyricsVariants(variants, onPick) {
  openModal(`<div class="modal-head"><span class="act-ic">${icon("pen")}</span><div><h3>Your lyrics are ready</h3><p>Choose a version to use in Custom mode.</p></div><button class="icon-btn ghost" data-close aria-label="Close">${icon("x")}</button></div>
    <div class="modal-body" id="lvOut"></div>`);
  renderVariants($("#lvOut"), variants, onPick);
}

/* =====================================================================
   Library
   ===================================================================== */
function filteredTracks() {
  const q = state.libQuery.toLowerCase();
  return state.tracks.filter((t) => {
    if (state.libFilter === "fav" && !t.fav) return false;
    if (state.libFilter === "instr" && !t.instrumental) return false;
    if (state.libFilter === "vocal" && t.instrumental) return false;
    if (q && ![t.title, t.tags, t.lyrics].some((s) => String(s || "").toLowerCase().includes(q))) return false;
    return true;
  });
}
function renderLibCount() { $("#libCount").textContent = state.tracks.length; }
function renderLibraryIfVisible() { if (state.view === "library") renderLibrary(); }
function artHtml(t, cls = "") {
  return t.image ? `<img src="${esc(t.image)}" alt="" loading="lazy" class="${cls}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph ${cls}',innerHTML:'${icon("music").replace(/"/g, "&quot;")}'}))" />` : `<div class="ph ${cls}">${icon("music")}</div>`;
}
function renderLibrary() {
  renderLibCount();
  const grid = $("#libGrid");
  const pending = state.tasks.filter((t) => t.kind === "music" && t.status === "running" && !state.tracks.some((x) => x.taskId === t.taskId));
  const list = filteredTracks();
  if (!list.length && !pending.length) {
    grid.innerHTML = state.tracks.length
      ? `<div class="hero-empty" style="grid-column:1/-1"><div style="font-size:2rem">🔎</div><h3>No matches</h3><p>Try a different search or filter.</p></div>`
      : `<div class="hero-empty" style="grid-column:1/-1"><div style="font-size:2.4rem">🎵</div><h3>Your first song is one sentence away</h3><p>Describe a vibe, a story, or a feeling. Riff writes the lyrics, composes the music and hands you two takes.</p><button class="btn btn-primary btn-lg" data-goto="create">${icon("sparkle")} Make a song</button></div>`;
    return;
  }
  grid.innerHTML = pending.map((t) => `
    <div class="card skeleton"><div class="card-art"><span class="eq" style="color:var(--accent);height:28px"><i></i><i></i><i></i></span></div>
      <div class="card-body"><div class="card-title">${esc(t.label)}</div><div class="card-sub">${STAGE_LABEL[t.stage] || "Composing"}… ${BUSY_LINES[t.polls % BUSY_LINES.length]}</div></div><div class="card-foot"><span class="dur">${esc(modelName(t.model))}</span></div></div>`).join("")
    + list.map(cardHtml).join("");
}
function cardHtml(t) {
  const playing = state.current === t.id;
  return `<div class="card ${playing ? "playing" : ""} ${playing && audio.paused ? "paused" : ""}" data-card="${esc(t.id)}">
    <div class="card-art">
      ${artHtml(t)}
      <div class="card-badges">${t.pending ? `<span class="badge live">Streaming</span>` : ""}${t.model ? `<span class="badge">${esc(t.model)}</span>` : ""}</div>
      <button class="card-play" data-play="${esc(t.id)}" aria-label="${playing && !audio.paused ? "Pause" : "Play"} ${esc(t.title)}">${icon(playing && !audio.paused ? "pause" : "play")}</button>
    </div>
    <div class="card-body" data-open="${esc(t.id)}" style="cursor:pointer">
      <div class="card-title">${playing ? `<span class="eq" style="color:var(--accent);margin-right:6px"><i></i><i></i><i></i></span>` : ""}${esc(t.title || "Untitled")}</div>
      <div class="card-sub">${esc(t.tags || (t.instrumental ? "Instrumental" : ""))}</div>
    </div>
    <div class="card-foot">
      <span class="dur">${t.duration ? fmtTime(t.duration) : t.pending ? "…" : ""}</span>
      <button class="icon-btn ghost ${t.fav ? "on" : ""}" data-fav="${esc(t.id)}" aria-label="Favorite" title="Favorite">${t.fav ? icon("heart").replace('class="i ', 'class="i filled ') : icon("heart")}</button>
      <button class="icon-btn ghost" data-dl="${esc(t.id)}" aria-label="Download MP3" title="Download MP3" ${t.audio ? "" : "disabled"}>${icon("download")}</button>
      <button class="icon-btn ghost" data-open="${esc(t.id)}" aria-label="More" title="Details & tools">${icon("dots")}</button>
    </div>
  </div>`;
}
function renderLatest() {
  const el = $("#latest");
  const list = state.tracks.slice(0, 5);
  el.innerHTML = list.length ? list.map((t) => `
    <button class="mini ${state.current === t.id ? "playing" : ""}" data-play="${esc(t.id)}">
      ${artHtml(t)}
      <span class="txt"><div class="t">${esc(t.title || "Untitled")}</div><div class="s">${t.pending ? "Streaming…" : esc(t.tags || "")}</div></span>
      ${icon(state.current === t.id && !audio.paused ? "pause" : "play")}
    </button>`).join("") : `<div class="empty"><div class="big">🎶</div>Your songs will appear here.</div>`;
}

function toggleFav(id) {
  const t = state.tracks.find((x) => x.id === id);
  if (!t) return;
  t.fav = !t.fav; saveTracks();
  renderLibraryIfVisible();
  if (drawerTrackId === id) renderDrawer();
}

async function download(url, name) {
  if (!url) return;
  toast("Preparing download…", { timeout: 1800 });
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}
const fileName = (t, ext) => `${(t.title || "riff-track").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "riff-track"}.${ext}`;

/* =====================================================================
   Player
   ===================================================================== */
const audio = $("#audio");
let queue = [];
function playTrack(id, { autoplay = true } = {}) {
  const t = state.tracks.find((x) => x.id === id);
  if (!t) return;
  const src = t.audio || t.stream;
  if (!src) return toast("Still composing…", { body: "This take isn't streamable yet. Hang tight!" });
  if (state.current === id && audio.src) {
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
    return;
  }
  state.current = id;
  queue = (state.view === "library" ? filteredTracks() : state.tracks).map((x) => x.id);
  audio.src = src;
  $("#player").hidden = false;
  updatePlayerMeta();
  if (autoplay) audio.play().catch(() => {});
  refreshPlayingUI();
}
function updatePlayerMeta() {
  const t = state.tracks.find((x) => x.id === state.current);
  if (!t) return;
  $("#plCover").src = t.image || "favicon.svg";
  $("#plTitle").textContent = t.title || "Untitled";
  $("#plSub").textContent = t.pending ? "Streaming live take…" : t.tags || t.model || "";
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: t.title || "Untitled", artist: "Riff", album: t.tags || "", artwork: t.image ? [{ src: t.image, sizes: "512x512" }] : [] });
  }
  // upgrade stream → final audio once available
  if (t.audio && audio.src !== t.audio && audio.src === t.stream && audio.paused) audio.src = t.audio;
}
function step(dir) {
  if (!queue.length) queue = state.tracks.map((x) => x.id);
  const i = queue.indexOf(state.current);
  for (let n = 1; n <= queue.length; n++) {
    const id = queue[(i + dir * n + queue.length * 2) % queue.length];
    const t = state.tracks.find((x) => x.id === id);
    if (t && (t.audio || t.stream)) { state.current = null; return playTrack(id); }
  }
}
function refreshPlayingUI() {
  const playing = !audio.paused;
  const ic = icon(playing ? "pause" : "play");
  $("#plPlay").innerHTML = ic; $("#plPlay").setAttribute("aria-label", playing ? "Pause" : "Play");
  const mp = $("#plPlay2"); if (mp) mp.innerHTML = ic;
  const kp = $("#karPlay"); if (kp) kp.innerHTML = ic;
  renderLatest(); renderActivity(); renderLibraryIfVisible();
}
function bindPlayer() {
  $("#plPrev").innerHTML = icon("prev");
  $("#plNext").innerHTML = icon("next");
  $("#plLyrics").innerHTML = icon("text");
  $("#plInfo").innerHTML = icon("info");
  $("#plVolIc").innerHTML = icon("volume");
  $(".pl-right").insertAdjacentHTML("afterbegin", `<button class="play-btn mobile-play" id="plPlay2" aria-label="Play/Pause">${icon("play")}</button>`);
  const toggle = () => (audio.paused ? audio.play().catch(() => {}) : audio.pause());
  $("#plPlay").onclick = toggle; $("#plPlay2").onclick = toggle;
  $("#plPrev").onclick = () => (audio.currentTime > 3 ? (audio.currentTime = 0) : step(-1));
  $("#plNext").onclick = () => step(1);
  $("#plInfo").onclick = () => state.current && openDrawer(state.current);
  $(".pl-track").onclick = () => state.current && openDrawer(state.current);
  $("#plLyrics").onclick = () => state.current && openKaraoke(state.current);
  const seek = $("#plSeek");
  let seeking = false;
  seek.addEventListener("input", () => { seeking = true; seek.style.setProperty("--p", seek.value / 10 + "%"); $("#plCur").textContent = fmtTime((seek.value / 1000) * (audio.duration || 0)); });
  seek.addEventListener("change", () => { if (isFinite(audio.duration)) audio.currentTime = (seek.value / 1000) * audio.duration; seeking = false; });
  const vol = $("#plVol");
  vol.value = store.get("vol", 0.9); audio.volume = vol.value; vol.style.setProperty("--p", vol.value * 100 + "%");
  vol.addEventListener("input", () => { audio.volume = vol.value; vol.style.setProperty("--p", vol.value * 100 + "%"); store.set("vol", Number(vol.value)); $("#plVolIc").innerHTML = icon(vol.value == 0 ? "mute" : "volume"); });
  audio.addEventListener("timeupdate", () => {
    const dur = audio.duration;
    if (!seeking && isFinite(dur) && dur > 0) { const p = (audio.currentTime / dur) * 1000; seek.value = p; seek.style.setProperty("--p", p / 10 + "%"); }
    $("#plCur").textContent = fmtTime(audio.currentTime);
    $("#plDur").textContent = isFinite(dur) ? fmtTime(dur) : "live";
  });
  audio.addEventListener("play", refreshPlayingUI);
  audio.addEventListener("pause", refreshPlayingUI);
  audio.addEventListener("ended", () => step(1));
  audio.addEventListener("error", () => {
    const t = state.tracks.find((x) => x.id === state.current);
    if (t && t.stream && audio.src !== t.stream && !t.pending) { audio.src = t.stream; audio.play().catch(() => {}); return; }
    if (t && state.tracks.some((x) => x.id === state.current)) toast("Couldn't play this track", { type: "err", body: "The audio link may have expired. Try “Recover audio” in the track details." });
  });
  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("previoustrack", () => step(-1));
    navigator.mediaSession.setActionHandler("nexttrack", () => step(1));
  }
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select, [contenteditable]")) return;
    if (e.code === "Space" && state.current) { e.preventDefault(); toggle(); }
    if (e.key === "Escape") { closeModal(); closeDrawer(); closeKaraoke(); }
  });
}

/* =====================================================================
   Drawer (track details & tools)
   ===================================================================== */
let drawerTrackId = null;
function openDrawer(id) {
  drawerTrackId = id;
  renderDrawer();
  $("#scrim").hidden = false;
  $("#drawer").classList.add("open");
  $("#drawer").setAttribute("aria-hidden", "false");
}
function closeDrawer() {
  drawerTrackId = null;
  $("#scrim").hidden = true;
  $("#drawer").classList.remove("open");
  $("#drawer").setAttribute("aria-hidden", "true");
}
const TOOLS = [
  { id: "extend", icon: "extend", t: "Extend", s: "Continue the song from any point" },
  { id: "restyle", icon: "refresh", t: "Cover / restyle", s: "Same melody, new genre" },
  { id: "replace", icon: "scissors", t: "Replace section", s: "Rewrite 10s+ of the song" },
  { id: "karaoke", icon: "text", t: "Sing-along lyrics", s: "Word-by-word synced lyrics" },
  { id: "stems", icon: "layers", t: "Split stems", s: "Vocals, drums, bass & more" },
  { id: "wav", icon: "download", t: "Studio WAV", s: "Lossless for your DAW" },
  { id: "video", icon: "film", t: "Music video", s: "MP4 with visualizer" },
  { id: "art", icon: "image", t: "New cover art", s: "AI artwork for this song" },
  { id: "persona", icon: "user", t: "Create persona", s: "Reuse this voice & style" },
  { id: "recover", icon: "link", t: "Recover audio", s: "Refresh expired links" },
];
function renderDrawer() {
  const t = state.tracks.find((x) => x.id === drawerTrackId);
  const dr = $("#drawer");
  if (!t) { closeDrawer(); return; }
  const playing = state.current === t.id && !audio.paused;
  const runningFor = (kind) => state.tasks.some((k) => k.trackId === t.id && k.kind === kind && k.status === "running");
  dr.innerHTML = `
    <div class="dr-hero">${artHtml(t)}<button class="icon-btn dr-close" data-close-drawer aria-label="Close">${icon("x")}</button></div>
    <div class="dr-head">
      <h2 class="dr-title">${esc(t.title || "Untitled")}</h2>
      <div class="dr-tags">${esc(t.tags || "")}</div>
      <div class="dr-meta">
        ${t.model ? `<span class="pill">${esc(t.model)}</span>` : ""}
        ${t.duration ? `<span class="pill">${fmtTime(t.duration)}</span>` : ""}
        ${t.instrumental ? `<span class="pill">Instrumental</span>` : ""}
        ${t.pending ? `<span class="pill" style="color:var(--accent-2)">Streaming</span>` : ""}
        <span class="pill">${ago(t.created)}</span>
      </div>
    </div>
    <div class="dr-main-actions">
      <button class="btn btn-primary" data-play="${esc(t.id)}">${icon(playing ? "pause" : "play")} ${playing ? "Pause" : "Play"}</button>
      <button class="btn" data-dl="${esc(t.id)}" ${t.audio ? "" : "disabled"}>${icon("download")} MP3</button>
      <button class="btn ${t.fav ? "btn-soft" : ""}" data-fav="${esc(t.id)}">${icon("heart")} ${t.fav ? "Loved" : "Love"}</button>
      <button class="btn" data-rename="${esc(t.id)}">${icon("pen")} Rename</button>
    </div>

    <div class="dr-section"><h4>Create more from this</h4>
      <div class="act-grid">
        ${TOOLS.map((x) => `<button class="act-card" data-tool="${x.id}" ${t.pending && x.id !== "karaoke" ? "disabled style='opacity:.5'" : ""}>
          <span class="act-ic">${runningFor(x.id) ? `<span class="spinner"></span>` : icon(x.icon)}</span><span><b>${x.t}</b><span>${x.s}</span></span></button>`).join("")}
      </div>
      ${t.pending ? `<p class="hint" style="margin-top:8px">Tools unlock when the final audio is ready.</p>` : ""}
    </div>

    ${t.video ? `<div class="dr-section"><h4>Music video</h4><video class="dr-video" controls preload="metadata" src="${esc(t.video)}" poster="${esc(t.image || "")}"></video>
      <div style="margin-top:8px"><button class="btn btn-sm" data-dlurl="${esc(t.video)}" data-name="${esc(fileName(t, "mp4"))}">${icon("download")} Download MP4</button></div></div>` : ""}

    ${t.wav ? `<div class="dr-section"><h4>Studio WAV</h4><div class="asset"><span class="act-ic">${icon("download")}</span><span class="name">${esc(fileName(t, "wav"))}</span><button class="btn btn-sm btn-soft" data-dlurl="${esc(t.wav)}" data-name="${esc(fileName(t, "wav"))}">Download</button></div></div>` : ""}

    ${t.stems?.length ? `<div class="dr-section"><h4>Stems</h4>${t.stems.map((s) => `
      <div class="asset"><div class="asset-col"><div style="display:flex;align-items:center;gap:8px"><span class="name">${esc(s.name)}</span>
        <button class="icon-btn ghost" data-dlurl="${esc(s.url)}" data-name="${esc(fileName(t, "").slice(0, -1) + "-" + s.name.replace(/\s+/g, "-") + ".mp3")}" aria-label="Download ${esc(s.name)}">${icon("download")}</button></div>
        <audio controls preload="none" src="${esc(s.url)}"></audio></div></div>`).join("")}</div>` : ""}

    ${t.artOptions?.length ? `<div class="dr-section"><h4>Cover art options</h4><div class="cover-opts">${t.artOptions.map((u) => `<button data-setart="${esc(u)}" title="Use this cover"><img src="${esc(u)}" alt="Cover option" loading="lazy" /></button>`).join("")}</div><p class="hint" style="margin-top:6px">Tap one to make it this track's cover.</p></div>` : ""}

    ${t.lyrics && !t.instrumental ? `<div class="dr-section"><h4 style="display:flex;justify-content:space-between;align-items:center">Lyrics <button class="link-btn" data-copy="${esc(t.lyrics)}">Copy</button></h4><pre class="lyrics-pre">${esc(t.lyrics)}</pre></div>` : ""}

    <div class="dr-section"><h4>Track IDs</h4>
      <div class="id-row">Task <code>${esc(t.taskId || "")}</code><button class="icon-btn ghost" data-copy="${esc(t.taskId || "")}" aria-label="Copy task ID">${icon("copy")}</button></div>
      <div class="id-row">Audio <code>${esc(t.id)}</code><button class="icon-btn ghost" data-copy="${esc(t.id)}" aria-label="Copy audio ID">${icon("copy")}</button></div>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-sm" data-useref="${esc(t.id)}">${icon("refresh")} Use as source audio</button>
        <button class="btn btn-sm btn-danger" data-delete="${esc(t.id)}">${icon("trash")} Remove from library</button>
      </div>
    </div>`;
}
function bindDrawer() {
  $("#scrim").onclick = closeDrawer;
  $("#drawer").addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const t = state.tracks.find((x) => x.id === drawerTrackId);
    if (b.hasAttribute("data-close-drawer")) return closeDrawer();
    if (!t) return;
    if (b.dataset.tool) return runTool(b.dataset.tool, t);
    if (b.dataset.rename) {
      const name = prompt("Rename track", t.title || "");
      if (name != null && name.trim()) { t.title = name.trim().slice(0, 100); saveTracks(); renderDrawer(); renderLatest(); renderLibraryIfVisible(); if (state.current === t.id) updatePlayerMeta(); }
      return;
    }
    if (b.dataset.setart) { t.image = t.customImage = b.dataset.setart; saveTracks(); renderDrawer(); renderLatest(); renderLibraryIfVisible(); if (state.current === t.id) updatePlayerMeta(); return toast("Cover updated", { type: "ok", timeout: 2000 }); }
    if (b.dataset.useref) {
      d().uploadUrl = t.audio; d().uploadUrlName = t.title || "Library track";
      if (!["cover", "uextend", "vocals", "instrumental", "mashup"].includes(state.mode)) state.mode = "cover";
      saveDraft(); closeDrawer(); setView("create"); setMode(state.mode);
      return toast("Loaded as source audio", { type: "ok", body: "Pick a remix mode and go.", timeout: 3000 });
    }
    if (b.dataset.delete) {
      if (!confirm(`Remove “${t.title || "this track"}” from your library? This can't be undone.`)) return;
      state.tracks = state.tracks.filter((x) => x.id !== t.id); saveTracks();
      if (state.current === t.id) { audio.pause(); state.current = null; $("#player").hidden = true; }
      closeDrawer(); renderLatest(); renderLibraryIfVisible(); renderLibCount();
      return toast("Removed from library", { timeout: 2500 });
    }
  });
}

/* ----- tools ----- */
function runTool(id, t) {
  switch (id) {
    case "extend": return toolExtend(t);
    case "restyle": return toolRestyle(t);
    case "replace": return toolReplace(t);
    case "karaoke": return openKaraoke(t.id);
    case "stems": return toolStems(t);
    case "wav": return toolSimple(t, "wav", "/api/v1/wav/generate", "Studio WAV", "Convert this track to lossless WAV for mixing and mastering.");
    case "video": return toolVideo(t);
    case "art": return toolArt(t);
    case "persona": return toolPersona(t);
    case "recover": return toolRecover(t);
  }
}
function modelSelect(id = "tModel") {
  return `<label class="field"><span class="lbl"><span>Model</span></span><select id="${id}">${ALL_MODELS.map((m) => `<option value="${m.id}" ${m.id === state.model ? "selected" : ""}>${m.name}${LEGACY_MODELS.includes(m) ? " (legacy)" : ""} · ${m.desc}</option>`).join("")}</select></label>`;
}
function modalHead(ic, title, sub) {
  return `<div class="modal-head"><span class="act-ic">${icon(ic)}</span><div><h3>${esc(title)}</h3><p>${esc(sub)}</p></div><button class="icon-btn ghost" data-close aria-label="Close">${icon("x")}</button></div>`;
}
function modalFoot(cta, ic = "sparkle") {
  return `<div class="modal-foot"><button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="mGo">${icon(ic)} ${esc(cta)}</button></div>`;
}
function wireGo(fn) {
  const go = $("#mGo");
  go.onclick = async () => {
    const old = go.innerHTML;
    go.disabled = true; go.innerHTML = `<span class="spinner"></span> Working…`;
    try { await fn(); closeModal(); }
    catch (e) { toast("Couldn't start", { type: "err", body: e.message, timeout: 8000 }); go.disabled = false; go.innerHTML = old; }
  };
}
const mv = (id) => ($("#" + id)?.value ?? "").trim();

function toolExtend(t) {
  const dur = Math.floor(t.duration || 120);
  openModal(`${modalHead("extend", "Extend this track", "Continue from any moment. The new part keeps the vibe going.")}
    <div class="modal-body">
      <div class="slider"><span class="lbl"><span>Continue from</span><output id="eAtOut">${fmtTime(dur)}</output></span>
        <input type="range" id="eAt" min="1" max="${Math.max(1, dur - 1)}" step="1" value="${Math.max(1, dur - 1)}" style="--p:100%" />
        <div class="ends"><span>0:00</span><span>${fmtTime(dur)}</span></div></div>
      <div class="row"><label class="field"><span class="lbl">Title</span><input id="eTitle" value="${esc((t.title || "") + " (Extended)")}" maxlength="100" /></label>${modelSelect()}</div>
      <label class="field"><span class="lbl">Style</span><textarea id="eStyle" rows="2" style="min-height:60px">${esc(t.tags || "")}</textarea></label>
      <label class="switch"><span class="sw-txt"><b>Instrumental</b><span>Continue without vocals</span></span><input type="checkbox" id="eInstr" ${t.instrumental ? "checked" : ""} /></label>
      <label class="field" id="eLyrWrap"><span class="lbl">Lyrics for the new part <em>optional</em></span><textarea id="eLyrics" class="lyrics" style="min-height:140px" placeholder="[Verse 3]\n…"></textarea></label>
      <label class="field"><span class="lbl">Avoid <em>optional</em></span><input id="eNeg" placeholder="e.g. heavy metal" /></label>
    </div>${modalFoot("Extend track", "extend")}`);
  const at = $("#eAt");
  at.oninput = () => { $("#eAtOut").textContent = fmtTime(at.value); at.style.setProperty("--p", ((at.value - 1) / Math.max(1, at.max - 1)) * 100 + "%"); };
  const sync = () => ($("#eLyrWrap").hidden = $("#eInstr").checked); $("#eInstr").onchange = sync; sync();
  wireGo(() => {
    const instr = $("#eInstr").checked;
    return startMusicTask("/api/v1/generate/extend", {
      audioId: t.id, taskId: t.taskId, model: mv("tModel"), continueAt: Number(at.value), title: mv("eTitle"), style: mv("eStyle"),
      instrumental: instr, lyrics: instr ? undefined : mv("eLyrics"), negativeTags: mv("eNeg"), callBackUrl: callbackUrl(),
    }, { label: mv("eTitle") || "Extension", mode: "extend", parent: t.id });
  });
}
function toolRestyle(t) {
  openModal(`${modalHead("refresh", "Cover / restyle", "Keep the melody, change everything else. Try a totally different genre!")}
    <div class="modal-body">
      <div class="chips">${["Acoustic unplugged", "80s synthwave", "Orchestral cinematic", "Lo-fi hip-hop", "Jazz lounge", "Punk rock", "Bossa nova", "Gospel choir"].map((s) => `<button type="button" class="chip" data-rs="${esc(s)}">${esc(s)}</button>`).join("")}</div>
      <label class="field"><span class="lbl">New style</span><textarea id="rStyle" rows="2" style="min-height:60px" placeholder="e.g. acoustic jazz trio, smoky vocals"></textarea></label>
      <div class="row"><label class="field"><span class="lbl">Title</span><input id="rTitle" value="${esc((t.title || "") + " (Cover)")}" maxlength="80" /></label>${modelSelect()}</div>
      <label class="switch"><span class="sw-txt"><b>Instrumental</b><span>Drop the vocals</span></span><input type="checkbox" id="rInstr" /></label>
      <label class="field" id="rLyrWrap"><span class="lbl">Lyrics <em>edit to change the words</em></span><textarea id="rLyrics" class="lyrics" style="min-height:140px">${esc(t.lyrics || "")}</textarea></label>
    </div>${modalFoot("Create cover", "refresh")}`);
  $$("[data-rs]").forEach((c) => (c.onclick = () => { $("#rStyle").value = c.dataset.rs; }));
  const sync = () => ($("#rLyrWrap").hidden = $("#rInstr").checked); $("#rInstr").onchange = sync;
  wireGo(() => {
    if (!mv("rStyle")) throw new ApiError("Pick or describe a new style.");
    const instr = $("#rInstr").checked;
    return startMusicTask("/api/v1/generate/upload-cover", {
      uploadUrl: t.audio, model: mv("tModel"), title: mv("rTitle"), style: mv("rStyle"), instrumental: instr,
      lyrics: instr ? undefined : mv("rLyrics"), callBackUrl: callbackUrl(),
    }, { label: mv("rTitle") || "Cover", mode: "cover", parent: t.id });
  });
}
function toolReplace(t) {
  const dur = t.duration || 120;
  const maxLen = Math.floor(dur * 0.5);
  const s0 = Math.min(Math.max(0, Math.floor(dur * 0.3)), Math.max(0, dur - 10));
  const e0 = Math.min(dur, s0 + Math.min(20, Math.max(10, maxLen)));
  openModal(`${modalHead("scissors", "Replace a section", "Regenerate part of the song. It blends back in with what comes before and after.")}
    <div class="modal-body">
      <div class="row">
        <label class="field"><span class="lbl">Start (sec)</span><input type="number" id="pS" step="0.5" min="0" max="${dur}" value="${s0}" /></label>
        <label class="field"><span class="lbl">End (sec)</span><input type="number" id="pE" step="0.5" min="0" max="${dur}" value="${e0}" /></label>
      </div>
      <p class="hint" id="pHint">Between 10s and ${maxLen}s (half the song). Track length: ${fmtTime(dur)}.</p>
      <label class="field"><span class="lbl">New lyrics for this section</span><textarea id="pLyr" class="lyrics" style="min-height:100px" placeholder="[Chorus]\nThe new words for just this part…"></textarea></label>
      <label class="field"><span class="lbl">Full song lyrics after the change</span><textarea id="pFull" class="lyrics" style="min-height:140px">${esc(t.lyrics || "")}</textarea></label>
      <div class="row"><label class="field"><span class="lbl">Style</span><input id="pTags" value="${esc(t.tags || "")}" /></label><label class="field"><span class="lbl">Title</span><input id="pTitle" value="${esc(t.title || "")}" /></label></div>
      <label class="field"><span class="lbl">Avoid <em>optional</em></span><input id="pNeg" /></label>
    </div>${modalFoot("Replace section", "scissors")}`);
  wireGo(() => {
    const s = Number($("#pS").value), e = Number($("#pE").value);
    if (!(e > s)) throw new ApiError("End must be after start.");
    if (e - s < 10) throw new ApiError("The section must be at least 10 seconds.");
    if (e - s > dur * 0.5) throw new ApiError(`The section can be at most half the song (${maxLen}s).`);
    if (!mv("pLyr")) throw new ApiError("Add lyrics for the new section.");
    if (!mv("pTags")) throw new ApiError("Add a style.");
    if (!mv("pFull")) throw new ApiError("Add the full lyrics for the song.");
    return startMusicTask("/api/v1/generate/replace-section", {
      taskId: t.taskId, audioId: t.id, prompt: mv("pLyr"), tags: mv("pTags"), title: mv("pTitle") || t.title || "Untitled",
      infillStartS: round2(s), infillEndS: round2(e), fullLyrics: mv("pFull"), negativeTags: mv("pNeg"), callBackUrl: callbackUrl(),
    }, { label: `${t.title || "Track"} (new section)`, mode: "replace", parent: t.id });
  });
}
function toolStems(t) {
  openModal(`${modalHead("layers", "Split into stems", "Separate the mix for remixing, karaoke or practice.")}
    <div class="modal-body">
      <label class="switch"><span class="sw-txt"><b>Vocals + instrumental</b><span>Two clean tracks. Fastest, great for karaoke.</span></span><input type="radio" name="stype" value="separate_vocal" checked /></label>
      <label class="switch"><span class="sw-txt"><b>Full stem split</b><span>Up to 12 stems: drums, bass, guitar, keys, strings and more.</span></span><input type="radio" name="stype" value="split_stem" /></label>
      <label class="switch"><span class="sw-txt"><b>Single instrument</b><span>Pull out one specific instrument.</span></span><input type="radio" name="stype" value="split_stem_advanced" /></label>
      <label class="field" id="stemPick" hidden><span class="lbl">Instrument</span><select id="stemName">${STEMS.map((s) => `<option>${s}</option>`).join("")}</select></label>
      <p class="hint">Stem separation uses credits. Full splits cost more than vocal separation.</p>
    </div>${modalFoot("Split stems", "layers")}`);
  $$('[name="stype"]').forEach((r) => (r.onchange = () => ($("#stemPick").hidden = $('[name="stype"]:checked').value !== "split_stem_advanced")));
  wireGo(async () => {
    const type = $('[name="stype"]:checked').value;
    const data = await api("/api/v1/vocal-removal/generate", { method: "POST", body: { taskId: t.taskId, audioId: t.id, type, stemName: type === "split_stem_advanced" ? mv("stemName") : undefined, callBackUrl: callbackUrl() } });
    addTask({ kind: "stems", taskId: data.taskId, trackId: t.id, label: `Stems · ${t.title || "Track"}` });
    toast("Splitting stems…", { body: "This usually takes a minute or two." });
    refreshCredits(); renderDrawer();
  });
}
function toolSimple(t, kind, path, label, sub) {
  openModal(`${modalHead(kind === "wav" ? "download" : "film", label, sub)}<div class="modal-body"><p class="muted" style="margin:0">We'll let you know when it's ready. You can keep creating in the meantime.</p></div>${modalFoot("Start", "sparkle")}`);
  wireGo(async () => {
    try {
      const data = await api(path, { method: "POST", body: { taskId: t.taskId, audioId: t.id, callBackUrl: callbackUrl() } });
      addTask({ kind, taskId: data.taskId, trackId: t.id, label: `${label} · ${t.title || "Track"}` });
    } catch (e) {
      if (e.code === 409 && e.data?.taskId) addTask({ kind, taskId: e.data.taskId, trackId: t.id, label: `${label} · ${t.title || "Track"}` });
      else throw e;
    }
    refreshCredits(); renderDrawer();
  });
}
function toolVideo(t) {
  openModal(`${modalHead("film", "Make a music video", "An MP4 with an animated visualizer and your cover art. Perfect for socials.")}
    <div class="modal-body">
      <div class="row">
        <label class="field"><span class="lbl">Artist name <em>optional</em></span><input id="vAuthor" maxlength="50" value="${esc(store.get("artist", ""))}" placeholder="Shown on the video" /></label>
        <label class="field"><span class="lbl">Watermark <em>optional</em></span><input id="vDomain" maxlength="50" placeholder="e.g. yoursite.com" /></label>
      </div>
    </div>${modalFoot("Make video", "film")}`);
  wireGo(async () => {
    if (mv("vAuthor")) store.set("artist", mv("vAuthor"));
    const data = await api("/api/v1/mp4/generate", { method: "POST", body: { taskId: t.taskId, audioId: t.id, author: mv("vAuthor"), domainName: mv("vDomain"), callBackUrl: callbackUrl() } });
    addTask({ kind: "video", taskId: data.taskId, trackId: t.id, label: `Video · ${t.title || "Track"}` });
    toast("Rendering your video…", { body: "Usually ready in a minute or two." });
    refreshCredits(); renderDrawer();
  });
}
async function toolArt(t) {
  if (t.artOptions?.length) return toast("Cover options are below", { body: "Scroll down in the details panel and tap one to apply." });
  try {
    let taskId;
    try { taskId = (await api("/api/v1/suno/cover/generate", { method: "POST", body: { taskId: t.taskId, callBackUrl: callbackUrl() } })).taskId; }
    catch (e) { if (e.data?.taskId) taskId = e.data.taskId; else throw e; }
    addTask({ kind: "art", taskId, trackId: t.id, label: `Cover art · ${t.title || "Track"}` });
    toast("Painting new cover art 🎨", { body: "You'll get a couple of options to pick from." });
    refreshCredits(); renderDrawer();
  } catch (e) { toast("Couldn't create cover art", { type: "err", body: e.message }); }
}
function toolPersona(t) {
  const dur = Math.floor(t.duration || 60);
  openModal(`${modalHead("user", "Create a persona", "Capture this track's voice and style, then reuse it on new songs.")}
    <div class="modal-body">
      <label class="field"><span class="lbl">Persona name</span><input id="psName" maxlength="60" placeholder="e.g. Midnight Soul Singer" /></label>
      <label class="field"><span class="lbl">Describe the voice & style</span><textarea id="psDesc" placeholder="Warm, breathy female vocals over lush neo-soul keys, laid back and intimate">${esc(t.tags || "")}</textarea></label>
      <div class="row">
        <label class="field"><span class="lbl">Analyze from (sec)</span><input type="number" id="psStart" min="0" max="${dur}" value="0" /></label>
        <label class="field"><span class="lbl">to (sec)</span><input type="number" id="psEnd" min="1" max="${dur}" value="${Math.min(30, dur)}" /></label>
      </div>
      <p class="hint">Pick a stretch where the vocals are clear. Works best on V5 and newer tracks.</p>
    </div>${modalFoot("Create persona", "user")}`);
  wireGo(async () => {
    const name = mv("psName"), description = mv("psDesc");
    if (!name) throw new ApiError("Give your persona a name.");
    if (!description) throw new ApiError("Describe the persona's voice and style.");
    const s = Number($("#psStart").value), e = Number($("#psEnd").value);
    if (!(e > s)) throw new ApiError("The end time must be after the start.");
    const data = await api("/api/v1/generate/generate-persona", { method: "POST", body: { taskId: t.taskId, audioId: t.id, name, description, vocalStart: s, vocalEnd: e, style: t.tags } });
    const id = data?.personaId;
    if (!id) throw new ApiError("No persona ID came back.");
    state.personas.unshift({ id, name, type: "style_persona", from: t.id, created: Date.now() });
    store.set("personas", state.personas);
    t.persona = id; saveTracks();
    toast(`Persona “${name}” saved`, { type: "ok", body: "Find it under Advanced controls → Persona.", action: () => { d().personaId = id; d().personaModel = "style_persona"; state.advOpen = true; saveDraft(); closeDrawer(); setView("create"); setMode("custom"); }, actionLabel: "Use it now", timeout: 9000 });
    refreshCredits();
    if (drawerTrackId === t.id) renderDrawer();
  });
}
async function toolRecover(t) {
  toast("Recovering audio links…", { timeout: 2500 });
  try {
    const data = await api("/api/v1/suno/recovery", { method: "POST", body: { sunoTaskId: t.taskId, callBackUrl: callbackUrl() } });
    const rid = data?.taskId || data?.task_id || data;
    for (let i = 0; i < 40; i++) {
      await sleep(2500);
      const { res, json } = await rawFetch("api", `/api/v1/suno/recovery/record-info?task_id=${encodeURIComponent(rid)}`, { headers: { Authorization: "Bearer " + state.key } });
      const code = json.code ?? res.status;
      if (code === 201) continue;
      if (code !== 200) throw new ApiError(json.msg || "Recovery failed.");
      const rows = Array.isArray(json.data) ? json.data : json.data?.sunoData || json.data?.data || [];
      let n = 0;
      for (const r of rows) {
        const tr = state.tracks.find((x) => x.id === (r.id || r.audioId || r.audio_id));
        const url = r.audio_url || r.audioUrl;
        if (tr && url) { tr.audio = url; if (r.image_url || r.imageUrl) tr.image = tr.customImage || r.image_url || r.imageUrl; n++; }
      }
      saveTracks(); renderDrawer(); renderLibraryIfVisible(); renderLatest();
      return toast(n ? "Audio links refreshed" : "Recovery finished", { type: "ok", body: n ? `${n} track${n > 1 ? "s" : ""} updated.` : "Nothing needed updating." });
    }
    throw new ApiError("Recovery is taking longer than expected. Try again later.");
  } catch (e) { toast("Couldn't recover audio", { type: "err", body: e.message }); }
}

/* =====================================================================
   Karaoke (timestamped lyrics)
   ===================================================================== */
let karRaf = null, karWords = [];
async function openKaraoke(id) {
  const t = state.tracks.find((x) => x.id === id);
  if (!t) return;
  if (state.current !== id) playTrack(id);
  const k = $("#karaoke");
  k.hidden = false;
  document.body.style.overflow = "hidden";
  k.innerHTML = `
    <div class="kar-bg" style="background-image:url('${esc(t.image || "")}')"></div>
    <div class="kar-top">${t.image ? `<img src="${esc(t.image)}" alt="" />` : ""}<div><div class="t">${esc(t.title || "Untitled")}</div><div class="s">${esc(t.tags || "")}</div></div>
      <button class="icon-btn" id="karClose" aria-label="Close">${icon("x")}</button></div>
    <div class="kar-lines" id="karLines"><div class="kar-plain" style="text-align:center;opacity:.7"><span class="spinner" style="display:inline-block"></span><br/>Syncing lyrics…</div></div>
    <div class="kar-wave" id="karWave"></div>
    <div class="kar-bot"><button class="play-btn" id="karPlay" aria-label="Play/Pause">${icon(audio.paused ? "play" : "pause")}</button><span id="karCur">0:00</span><input type="range" id="karSeek" min="0" max="1000" value="0" aria-label="Seek" /><span id="karDur">${fmtTime(t.duration)}</span></div>`;
  $("#karClose").onclick = closeKaraoke;
  $("#karPlay").onclick = () => (audio.paused ? audio.play().catch(() => {}) : audio.pause());
  $("#karSeek").oninput = (e) => { if (isFinite(audio.duration)) audio.currentTime = (e.target.value / 1000) * audio.duration; };

  if (t.instrumental) {
    $("#karLines").innerHTML = `<div class="kar-plain" style="text-align:center">🎹 This one's instrumental. Just vibe.</div>`;
  } else if (!t.aligned && !t.pending) {
    try {
      const data = await api("/api/v1/generate/get-timestamped-lyrics", { method: "POST", body: { taskId: t.taskId, audioId: t.id } });
      t.aligned = (data?.alignedWords || []).map((w) => ({ w: w.word, s: w.startS, e: w.endS }));
      t.waveform = (data?.waveformData || []).slice(0, 4000);
      saveTracks();
    } catch (e) {
      t.aligned = null;
    }
  }
  if ($("#karaoke").hidden) return;
  if (!t.instrumental) renderKaraokeLines(t);
  renderWave(t);
  cancelAnimationFrame(karRaf);
  karTick();
}
function renderKaraokeLines(t) {
  const el = $("#karLines");
  if (!t.aligned?.length) {
    el.innerHTML = t.lyrics ? `<div class="kar-plain">${esc(t.lyrics)}</div>` : `<div class="kar-plain" style="text-align:center">No lyrics available for this track.</div>`;
    karWords = [];
    return;
  }
  // Build lines: words carry "\n" and [Section] markers.
  const lines = [];
  let cur = { words: [], section: null };
  const push = () => { if (cur.words.length || cur.section) lines.push(cur); cur = { words: [], section: null }; };
  t.aligned.forEach((w, idx) => {
    const parts = String(w.w).split("\n");
    parts.forEach((p, pi) => {
      if (pi > 0) push();
      const sec = p.match(/\[([^\]]+)\]/);
      let text = p.replace(/\[[^\]]*\]/g, "").trim();
      if (sec) { push(); cur.section = sec[1]; if (text) { /* keep */ } }
      if (text) cur.words.push({ text, s: w.s, e: w.e, idx });
    });
  });
  push();
  karWords = [];
  el.innerHTML = lines.map((l, li) => `${l.section ? `<div class="kar-sec">${esc(l.section)}</div>` : ""}${l.words.length ? `<p class="kar-line" data-line="${li}">${l.words.map((w) => { karWords.push({ ...w, line: li }); return `<span class="kar-w" data-s="${w.s}" data-k="${karWords.length - 1}">${esc(w.text)}</span>`; }).join(" ")}</p>` : ""}`).join("");
  el.onclick = (e) => { const w = e.target.closest(".kar-w"); if (w) { audio.currentTime = Number(w.dataset.s); if (audio.paused) audio.play().catch(() => {}); } };
}
function renderWave(t) {
  const el = $("#karWave");
  const data = t.waveform || [];
  if (!data.length) { el.innerHTML = ""; return; }
  const n = Math.min(120, Math.max(40, Math.floor(innerWidth / 8)));
  const bars = Array.from({ length: n }, (_, i) => {
    const a = Math.floor((i / n) * data.length), b = Math.max(a + 1, Math.floor(((i + 1) / n) * data.length));
    let m = 0; for (let j = a; j < b; j++) m = Math.max(m, Math.abs(data[j] || 0));
    return m;
  });
  const max = Math.max(...bars, 0.001);
  el.innerHTML = bars.map((v) => `<i style="height:${Math.max(6, (v / max) * 100)}%"></i>`).join("");
}
let lastLine = -1, lastWord = -1;
function karTick() {
  if ($("#karaoke").hidden) return;
  const tNow = audio.currentTime, dur = audio.duration;
  if (isFinite(dur) && dur > 0) {
    const s = $("#karSeek"); if (s) { s.value = (tNow / dur) * 1000; s.style.setProperty("--p", (tNow / dur) * 100 + "%"); }
    $("#karCur").textContent = fmtTime(tNow); $("#karDur").textContent = fmtTime(dur);
    const bars = $$("#karWave i"); const on = Math.floor((tNow / dur) * bars.length);
    bars.forEach((b, i) => b.classList.toggle("on", i < on));
  }
  if (karWords.length) {
    let k = -1;
    for (let i = 0; i < karWords.length; i++) { if (karWords[i].s <= tNow + 0.05) k = i; else break; }
    if (k !== lastWord) {
      lastWord = k;
      $$(".kar-w").forEach((w, i) => w.classList.toggle("on", i <= k));
      const line = k >= 0 ? karWords[k].line : -1;
      if (line !== lastLine) {
        lastLine = line;
        $$(".kar-line").forEach((l) => {
          const li = Number(l.dataset.line);
          l.classList.toggle("cur", li === line); l.classList.toggle("past", li < line);
        });
        const cur = $(`.kar-line[data-line="${line}"]`);
        if (cur) { const box = $("#karLines"); box.scrollTop = cur.offsetTop - box.clientHeight / 2 + cur.clientHeight / 2; }
      }
    }
  }
  karRaf = requestAnimationFrame(karTick);
}
function closeKaraoke() {
  const k = $("#karaoke");
  if (k.hidden) return;
  k.hidden = true; k.innerHTML = "";
  document.body.style.overflow = "";
  cancelAnimationFrame(karRaf); lastLine = lastWord = -1;
}

/* =====================================================================
   Modal
   ===================================================================== */
function openModal(html) {
  $("#modal").innerHTML = html;
  $("#modalWrap").hidden = false;
  setTimeout(() => $("#modal").querySelector("input, textarea, select")?.focus(), 60);
}
function closeModal() { $("#modalWrap").hidden = true; $("#modal").innerHTML = ""; }
function bindModal() {
  $("#modalWrap").addEventListener("click", (e) => {
    if (e.target.id === "modalWrap" || e.target.closest("[data-close]")) closeModal();
  });
}

/* =====================================================================
   Settings
   ===================================================================== */
function openSettings() {
  const masked = state.key ? state.key.slice(0, 4) + "••••••••" + state.key.slice(-4) : "";
  openModal(`${modalHead("settings", "Settings", "Your key, library and preferences.")}
    <div class="modal-body settings-list">
      <div class="set-row"><div><b>API key</b><span>${esc(masked)}</span></div><button class="btn btn-sm" id="sSignOut">${icon("logout")} Change key</button></div>
      <div class="set-row"><div><b>Credits</b><span>${state.credits == null ? "—" : Number(state.credits).toLocaleString()} remaining</span></div><a class="btn btn-sm" href="https://sunoapi.org" target="_blank" rel="noopener">Top up</a></div>
      <div class="set-row"><div><b>Theme</b><span>Light, dark, or follow your system</span></div>
        <div class="seg" id="sTheme">${["light", "dark", "system"].map((th) => `<button data-th="${th}" class="${state.theme === th ? "on" : ""}">${th[0].toUpperCase() + th.slice(1)}</button>`).join("")}</div></div>
      <div class="set-row"><div><b>Connection</b><span>${state.conn === "proxy" ? "Via this site's secure proxy" : "Direct to api.sunoapi.org"}</span></div>
        <select id="sConn"><option value="proxy" ${state.conn === "proxy" ? "selected" : ""}>Proxy (recommended)</option><option value="direct" ${state.conn === "direct" ? "selected" : ""}>Direct</option></select></div>
      <div class="set-row"><div><b>Library</b><span>${state.tracks.length} tracks · ${state.personas.length} personas · stored on this device</span></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
          <button class="btn btn-sm" id="sExport">${icon("export")} Export</button>
          <label class="btn btn-sm">${icon("import")} Import<input type="file" accept="application/json" id="sImport" hidden /></label>
        </div></div>
      <div class="set-row"><div><b>Clear activity</b><span>Remove finished tasks from the activity feed</span></div><button class="btn btn-sm" id="sClearAct">Clear</button></div>
      <p class="hint">Generated files are hosted by SunoAPI for a limited time (about 14 days). Download anything you want to keep.</p>
    </div>`);
  $("#sSignOut").onclick = () => { closeModal(); signOut(); };
  $$("#sTheme button").forEach((b) => (b.onclick = () => { setTheme(b.dataset.th); $$("#sTheme button").forEach((x) => x.classList.toggle("on", x === b)); }));
  $("#sConn").onchange = (e) => { state.conn = e.target.value; store.set("conn", state.conn); toast("Connection updated", { type: "ok", timeout: 2000 }); };
  $("#sExport").onclick = () => {
    const blob = new Blob([JSON.stringify({ app: "riff", version: 1, exported: new Date().toISOString(), tracks: state.tracks, personas: state.personas }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `riff-library-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  };
  $("#sImport").onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      let n = 0;
      for (const t of j.tracks || []) if (t.id && !state.tracks.some((x) => x.id === t.id)) { state.tracks.push(t); n++; }
      for (const p of j.personas || []) if (p.id && !state.personas.some((x) => x.id === p.id)) state.personas.push(p);
      state.tracks.sort((a, b) => (b.created || 0) - (a.created || 0));
      saveTracks(); store.set("personas", state.personas);
      renderAll(); closeModal();
      toast(`Imported ${n} track${n === 1 ? "" : "s"}`, { type: "ok" });
    } catch { toast("That file couldn't be imported", { type: "err" }); }
  };
  $("#sClearAct").onclick = () => { state.tasks = state.tasks.filter((t) => t.status === "running"); saveTasks(); renderActivity(); toast("Activity cleared", { timeout: 1500 }); };
}

/* =====================================================================
   Global wiring
   ===================================================================== */
function renderAll() {
  renderComposer();
  renderActivity();
  renderLatest();
  renderLibCount();
  renderLibraryIfVisible();
}

function bindGlobal() {
  $$(".tab").forEach((t) => (t.onclick = () => setView(t.dataset.view)));
  $$("#themeSeg button").forEach((b) => (b.innerHTML = icon(b.dataset.themeOpt === "light" ? "sun" : b.dataset.themeOpt === "dark" ? "moon" : "monitor")));
  $$("#themeSeg button").forEach((b) => (b.onclick = () => setTheme(b.dataset.themeOpt)));
  $("#settingsBtn").innerHTML = icon("settings");
  $("#settingsBtn").onclick = openSettings;
  $("#creditsBtn").onclick = refreshCredits;
  $(".search-ic").innerHTML = icon("search");

  $("#libSearch").addEventListener("input", (e) => { state.libQuery = e.target.value; renderLibrary(); });
  $$("#libFilter button").forEach((b) => (b.onclick = () => {
    state.libFilter = b.dataset.filter;
    $$("#libFilter button").forEach((x) => x.classList.toggle("on", x === b));
    renderLibrary();
  }));

  // Delegated actions shared by library, latest, activity, drawer.
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-play],[data-open],[data-fav],[data-dl],[data-dlurl],[data-goto],[data-copy],[data-lyrics-task]");
    if (!b || b.closest("#composer")) return;
    if (b.dataset.play) return playTrack(b.dataset.play);
    if (b.dataset.open) return openDrawer(b.dataset.open);
    if (b.dataset.fav) return toggleFav(b.dataset.fav);
    if (b.dataset.goto) { closeDrawer(); return setView(b.dataset.goto); }
    if (b.dataset.dl) { const t = state.tracks.find((x) => x.id === b.dataset.dl); return t && download(t.audio, fileName(t, "mp3")); }
    if (b.dataset.dlurl) return download(b.dataset.dlurl, b.dataset.name || "download");
    if (b.dataset.copy != null) {
      navigator.clipboard?.writeText(b.dataset.copy).then(() => toast("Copied", { type: "ok", timeout: 1500 }), () => {});
      return;
    }
    if (b.dataset.lyricsTask) { const t = state.tasks.find((x) => x.id === b.dataset.lyricsTask); if (t?.result) showLyricsVariants(t.result); }
  });

  document.addEventListener("visibilitychange", () => { if (!document.hidden && state.key) pollSoon(300); });
}

function init() {
  applyTheme();
  initGate();
  bindGlobal();
  bindComposer();
  bindPlayer();
  bindDrawer();
  bindModal();
  // Tasks that were running when the page closed resume polling.
  const key = loadKey();
  if (key) { state.key = key; enterApp(false); }
  else showGate();
}

init();
