// Same-origin proxy to SunoAPI. The browser sends its own key in the Authorization
// header; it is forwarded as-is and never stored or logged.
const UPSTREAM = "https://api.sunoapi.org";

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/suno/, "");
  if (!path.startsWith("/api/")) return json(404, { code: 404, msg: "Unknown API path" });

  const auth = req.headers.get("authorization");
  if (!auth) return json(401, { code: 401, msg: "Missing API key" });

  const init = {
    method: req.method,
    headers: {
      Authorization: auth,
      Accept: "application/json",
      "User-Agent": "Riff/1.0 (+netlify)",
    },
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.headers["Content-Type"] = req.headers.get("content-type") || "application/json";
    init.body = await req.text();
  }

  let upstream;
  try {
    upstream = await fetch(UPSTREAM + path + url.search, init);
  } catch (e) {
    return json(502, { code: 502, msg: `Couldn't reach SunoAPI (${e.message})` });
  }

  const text = await upstream.text();
  try {
    JSON.parse(text);
    return new Response(text, { status: upstream.status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch {
    return json(upstream.status || 502, {
      code: upstream.status || 502,
      msg: `SunoAPI returned a non-JSON response (HTTP ${upstream.status}): ${text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)}`,
    });
  }
};

export const config = { path: "/suno/*" };
