// Web output is SPA-only (`"output": "single"` in app.json) — there is no server-rendered
// HTML to hydrate against, so the client value can be used immediately.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  return client;
}
