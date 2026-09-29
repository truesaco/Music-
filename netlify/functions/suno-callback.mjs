// SunoAPI requires a callBackUrl on every task. The app polls for results instead,
// so this endpoint simply acknowledges the callback.
export default async () =>
  new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
