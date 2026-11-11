import * as CookieConsent from 'vanilla-cookieconsent';
import { runOptions } from './run-options';
import type { ConsentConfig } from './types';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag: (...args: unknown[]) => void;
    consentKitConfig?: ConsentConfig;
  }
}

/**
 * Plain HTML sites set window.consentKitConfig; the Astro component renders the
 * #cc-config JSON element instead. The global wins when both exist.
 */
export function readConfig(doc: Document, win: Window): ConsentConfig | null {
  if (win.consentKitConfig) return win.consentKitConfig;
  const raw = doc.getElementById('cc-config')?.textContent;
  return raw ? (JSON.parse(raw) as ConsentConfig) : null;
}

window.dataLayer ??= [];

const cfg = readConfig(document, window);
if (cfg) {
  // ConsentInit publishes this shim before the tag manager loads precisely so the
  // rest of the page shares one dataLayer contract. A second local copy would drift
  // the moment either side changed how it pushes.
  const gtag = window.gtag;

  // Decisions go to a cookieless tool, not to the analytics consent switches off:
  // a tool that consent disables cannot report the visitor who disabled it. These
  // push onto the dataLayer; the tag that forwards them must NOT carry a consent
  // condition, or consent_rejected disappears.
  let firstDecisionSent = false;

  // Channel context rides on every consent push, computed from this page's URL
  // and held nowhere: carrying it to a later page would need device storage,
  // which needs the very consent being measured. GTM keeps a key for the whole
  // page, so every push sets all five, null when not applicable. "Landing" is
  // the page that showed the banner first in this session.
  let shownHere = false;
  let decidedHere = false;
  let leftSent = false;
  // Closed by the landing page's first terminal push (first decision or the
  // undecided exit), so one impression yields exactly one landing outcome; a
  // later change or a decision after a bfcache restore reports as not landing.
  let landingClosed = false;

  const CLICK_IDS: [string, string][] = [
    ['gclid', 'google_ads'],
    ['gbraid', 'google_ads'],
    ['wbraid', 'google_ads'],
    ['fbclid', 'meta'],
    ['msclkid', 'microsoft_ads'],
  ];

  const cleanUtm = (value: string | null) => {
    const v = value?.trim().toLowerCase();
    return v && v.length <= 100 && !v.includes('@') ? v : null;
  };

  const landingContext = () => {
    if (!shownHere || landingClosed) {
      return { is_landing: false, click_source: 'unknown', utm_source: null, utm_medium: null, utm_campaign: null };
    }
    const q = new URLSearchParams(location.search);
    const hit = CLICK_IDS.find(([key]) => q.has(key));
    return {
      is_landing: true,
      click_source: hit ? hit[1] : 'none',
      utm_source: cleanUtm(q.get('utm_source')),
      utm_medium: cleanUtm(q.get('utm_medium')),
      utm_campaign: cleanUtm(q.get('utm_campaign')),
    };
  };

  const track = (event: string, terminal = false) => {
    window.dataLayer.push({ event, ...landingContext() });
    if (terminal) landingClosed = true;
  };

  // The banner reappears on every pageview until a decision is made, so the raw
  // impression count is per pageview, not per visitor. Undecided browsing would
  // inflate the denominator and make the acceptance rate look far worse than it is.
  const oncePerSession = (key: string) => {
    try {
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, '1');
      return true;
    } catch {
      // Storage blocked: over-count rather than lose the signal entirely.
      return true;
    }
  };

  const syncConsent = () => {
    const granted = CookieConsent.acceptedCategory('analytics');
    gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
    window.dataLayer.push({
      event: 'consent_update',
      consent_analytics: granted ? 'granted' : 'denied',
    });
  };

  const syncTheme = () => {
    document.documentElement.classList.toggle(
      'cc--darkmode',
      document.documentElement.classList.contains(cfg.darkClass),
    );
  };
  syncTheme();
  new MutationObserver(syncTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  CookieConsent.run(runOptions(cfg, {
    onModalShow: ({ modalName }) => {
      if (modalName === 'preferencesModal') {
        track('consent_preferences_opened');
      } else if (oncePerSession('cc_shown')) {
        shownHere = true;
        track('consent_banner_shown');
      }
    },
    onFirstConsent: () => {
      decidedHere = true;
      syncConsent();
      // Guard in case a version fires onChange in the same call as onFirstConsent; the
      // first decision must not be counted twice. Cleared on the next microtask: 3.1.0
      // never fires that onChange, and a flag left set would swallow the next real change.
      firstDecisionSent = true;
      queueMicrotask(() => {
        firstDecisionSent = false;
      });
      track(CookieConsent.acceptedCategory('analytics') ? 'consent_accepted' : 'consent_rejected', true);
    },
    onChange: () => {
      syncConsent();
      if (firstDecisionSent) return;
      track(CookieConsent.acceptedCategory('analytics') ? 'consent_accepted' : 'consent_revoked');
    },
  }));

  // The undecided exit is only counted on the page that counted the impression,
  // so shown = decided on that page + left undecided, up to unload loss.
  window.addEventListener('pagehide', () => {
    if (!shownHere || decidedHere || leftSent) return;
    leftSent = true;
    track('consent_banner_left_undecided', true);
  });

  // Lets a footer or a policy page reveal its "change preferences" control only
  // where the banner actually runs.
  document.documentElement.dataset.cc = 'ready';

  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement | null)?.closest('[data-cc="show-preferences"]');
    if (el) {
      e.preventDefault();
      CookieConsent.showPreferences();
    }
  });
}
