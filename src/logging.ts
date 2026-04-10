const DEBUG = import.meta.env.VITE_DEBUG === 'true';

// Session ID generated once per page load, kept in memory only
export const SESSION_ID = crypto.randomUUID();

export const logToServer = (endpoint: string, payload: Record<string, any>) => {
  const enriched = {...payload, sessionId: SESSION_ID};
  if (DEBUG) {
    console.log(`[DEBUG] ${endpoint}`, enriched);
    return;
  }
  fetch(`${import.meta.env.VITE_LOG_FUNCTION_URL}${endpoint}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(enriched),
  }).catch((error) => {
    console.log(error);
  });
};
