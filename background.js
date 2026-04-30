/**
 * FocusBoard — background.js  (Manifest V3 Service Worker)
 * Phase 3: Focus Mode blocking via declarativeNetRequest
 * Tasks 3.2, 3.3, 3.4
 */

/* =============================================
   STORAGE KEYS  (mirrored from script.js)
   ============================================= */
const KEYS = {
  focusModeEnabled: 'fb_focusModeEnabled',
  blockedDomains:   'fb_blockedDomains',
};

/* =============================================
   DEFAULT BLOCK LIST  (Task 3.2)
   ============================================= */
const DEFAULT_BLOCKED_DOMAINS = [
  'instagram.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'youtube.com',
  'reddit.com',
  'tiktok.com',
  'linkedin.com',
  'snapchat.com',
  'pinterest.com',
  'twitch.tv',
  'netflix.com',
  'primevideo.com',
  'disneyplus.com',
  'discord.com',
  '9gag.com',
  'quora.com',
  'tumblr.com',
];

/* =============================================
   ON INSTALL — seed defaults  (Task 3.2)
   ============================================= */
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  const existing = await chrome.storage.local.get([
    KEYS.focusModeEnabled,
    KEYS.blockedDomains,
  ]);

  // Only seed values that don't already exist
  const defaults = {};
  if (existing[KEYS.focusModeEnabled] === undefined) {
    defaults[KEYS.focusModeEnabled] = false;
  }
  if (!Array.isArray(existing[KEYS.blockedDomains])) {
    defaults[KEYS.blockedDomains] = DEFAULT_BLOCKED_DOMAINS;
  }
  if (Object.keys(defaults).length > 0) {
    await chrome.storage.local.set(defaults);
  }

  // Re-apply blocking rules (handles extension updates too)
  const data = await chrome.storage.local.get([
    KEYS.focusModeEnabled,
    KEYS.blockedDomains,
  ]);
  await updateBlockingRules(
    data[KEYS.focusModeEnabled] || false,
    data[KEYS.blockedDomains]  || DEFAULT_BLOCKED_DOMAINS
  );
});

/* =============================================
   STORAGE CHANGE LISTENER  (Task 3.3)
   Keeps DNR rules in sync with storage changes
   ============================================= */
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== 'local') return;

  const relevantChange =
    KEYS.focusModeEnabled in changes ||
    KEYS.blockedDomains   in changes;

  if (!relevantChange) return;

  const data = await chrome.storage.local.get([
    KEYS.focusModeEnabled,
    KEYS.blockedDomains,
  ]);
  await updateBlockingRules(
    data[KEYS.focusModeEnabled] || false,
    data[KEYS.blockedDomains]   || []
  );
});

/* =============================================
   BLOCKING RULES ENGINE  (Task 3.4)
   Uses declarativeNetRequest dynamic rules.
   Each domain gets one redirect rule that
   sends main_frame requests → blocked.html
   ============================================= */
async function updateBlockingRules(enabled, domains) {
  // Remove all current dynamic rules first
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingIds   = existingRules.map((r) => r.id);

  if (!enabled || domains.length === 0) {
    if (existingIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingIds,
        addRules: [],
      });
    }
    return;
  }

  // Build one rule per domain
  const addRules = domains.map((domain, idx) => ({
    id:       idx + 1,
    priority: 1,
    action: {
      type:     'redirect',
      redirect: { extensionPath: '/blocked.html' },
    },
    condition: {
      // matches domain and all subdomains
      urlFilter:     `||${domain.replace(/^www\./, '')}`,
      resourceTypes: ['main_frame'],
    },
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingIds,
    addRules,
  });
}
