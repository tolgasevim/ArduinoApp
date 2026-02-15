export interface Env {}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/health") {
      return new Response("Not Found", { status: 404 });
    }

    const payload = {
      status: "ok",
      service: "arduino-quest-worker",
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }
};

