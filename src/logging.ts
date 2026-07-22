const DEBUG = import.meta.env.VITE_DEBUG === 'true';

// Session ID generated once per page load, kept in memory only
export const SESSION_ID = crypto.randomUUID();

type OSFamily = 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Other';

// Broad OS family only — never the full user agent. Matches what the privacy
// policy says we collect. Kept as a string constant per page load so every
// log call sees the same value without re-parsing.
export const OS_FAMILY: OSFamily = detectOSFamily();

function detectOSFamily(): OSFamily {
  // Prefer navigator.userAgentData when available (client hints, less spoof-prone
  // in modern Chromium). Cast because TS lib.dom doesn't include it yet.
  const uaData = (navigator as any).userAgentData as {platform?: string} | undefined;
  const platform = (uaData?.platform || '').toLowerCase();
  if (platform) {
    if (platform.includes('android')) return 'Android';
    if (platform === 'ios' || platform === 'ipados') return 'iOS';
    if (platform.includes('mac')) return 'macOS';
    if (platform.includes('windows')) return 'Windows';
    if (platform.includes('linux') || platform.includes('chrome os')) return 'Linux';
  }

  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'Android';
  // iOS check before macOS: iPad Safari now sets "Macintosh" in UA. Use a
  // touch-based heuristic to catch iPadOS masquerading as macOS.
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/macintosh/i.test(ua)) {
    // iPadOS 13+ sends Macintosh UA but still exposes touch points.
    if ((navigator as any).maxTouchPoints > 1) return 'iOS';
    return 'macOS';
  }
  if (/windows/i.test(ua)) return 'Windows';
  if (/linux|cros/i.test(ua)) return 'Linux';
  return 'Other';
}

// Staging Cloud Functions are named `-staging` (e.g. `log-geocode-staging`)
// while prod keeps the bare names. Append the suffix when building in
// staging mode so `--mode staging` builds hit the staging functions.
const FUNCTION_SUFFIX = import.meta.env.MODE === 'staging' ? '-staging' : '';

export const logToServer = (endpoint: string, payload: Record<string, any>) => {
  const enriched = {...payload, sessionId: SESSION_ID, osFamily: OS_FAMILY};
  if (DEBUG) {
    console.log(`[DEBUG] ${endpoint}`, enriched);
    return;
  }
  fetch(`${import.meta.env.VITE_LOG_FUNCTION_URL}${endpoint}${FUNCTION_SUFFIX}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(enriched),
  }).catch((error) => {
    console.log(error);
  });
};
