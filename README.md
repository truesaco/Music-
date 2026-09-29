# Riff · AI Music Studio

A one-page studio for [SunoAPI](https://docs.sunoapi.org). Paste your API key, describe a song, and listen back in about 30 seconds. After that you can remix, extend, split stems, make a music video, or sing along with synced lyrics.

It's plain HTML, CSS and JS with no build step, ready to deploy on Netlify.

## Features

**Create**
- **Quick song:** describe the song in one sentence. Includes idea prompts, a "surprise me" shuffle, an instrumental toggle, a style hint and optional reference images, audio or video.
- **Custom:** set the title, style (with a genre/mood/sound chip picker and AI **Boost**), and lyrics. Lyrics support section-tag shortcuts and an AI **Write with AI** option that returns two variants to pick from.
- **Advanced controls:** negative tags, vocal gender, style weight, weirdness, audio weight, variety (0–4), target length (10s–6min on V6/V5.5), and a persona or voice ID.
- **Sounds & loops:** seamless loop, BPM, musical key and lyric-subtitle capture.

**Remix (upload audio, paste a URL, or pick from your library)**
- Cover audio, extend audio, add vocals, add instrumental and mashup (two tracks).

**Model selection**
- V6 (recommended), V6 Wild and V6 Mini, plus legacy V5.5, V5, V4.5+, V4.5 All, V4.5 and V4. Character limits adapt to the selected model.

**Per-track tools** (open any track in the library)
- Extend from any timestamp
- Cover or restyle in a new genre
- Replace a section (10s minimum, up to half the song)
- Sing-along karaoke with word-by-word timestamped lyrics and a waveform
- Split stems: vocals and instrumental, a full 12-stem split, or a single instrument
- Studio WAV export
- MP4 music video
- AI cover art options
- Create a reusable persona
- Recover expired audio links

**Experience**
- Onboarding checks your key: it's validated against your credit balance before the studio unlocks.
- A live **Activity** feed shows each stage of a task (queued, lyrics ready, first take streaming, done). You can play the first take while the second one is still rendering.
- A persistent player bar with media-session controls and keyboard shortcuts (Space to play/pause, Esc to close panels).
- The library supports search, filters and favorites, and can be exported or imported as JSON.
- Light, dark and **system** themes, with no flash on load.
- Toasts, confetti and browser notifications when a track finishes in the background.
- The layout is responsive down to phone width.

## Privacy

Your API key is stored only in your browser: in localStorage if you choose "remember", otherwise in sessionStorage. It's sent to SunoAPI only in the `Authorization` header of your own requests. Your library also lives in localStorage on your device.

## Deploy on Netlify

1. Connect this repo in Netlify. There's no build command; the publish directory is the repo root.
2. `netlify.toml` sets up two things:
   - Same-origin proxies (`/suno/*` → `api.sunoapi.org`, `/suno-upload/*` → the SunoAPI file-upload host), so the browser never runs into CORS.
   - A tiny function, `/.netlify/functions/suno-callback`, used as the required `callBackUrl`. The app polls for results, so the callback just acknowledges.

## Run locally

```bash
npx netlify dev        # full experience, including the proxy
# or any static server; the app falls back to calling SunoAPI directly
python3 -m http.server 8080
```

## Files

| File | Purpose |
| --- | --- |
| `index.html` | App shell: key gate, studio, library, player |
| `styles.css` | Design tokens, light/dark themes, components |
| `app.js` | API client, task polling, composer, library, player, karaoke |
| `netlify.toml` | Proxies, headers, functions config |
| `netlify/functions/suno-callback.mjs` | Callback sink for SunoAPI tasks |
