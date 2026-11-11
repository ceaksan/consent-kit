import type * as CookieConsent from 'vanilla-cookieconsent';
import { shortDuration } from './cookie-inventory';
import type { ConsentConfig } from './types';

type Callbacks = Pick<CookieConsent.CookieConsentConfig, 'onModalShow' | 'onFirstConsent' | 'onChange'>;

/**
 * The options handed to CookieConsent.run, kept free of side effects so the exact
 * object the library receives can be tested without a browser.
 */
export function runOptions(cfg: ConsentConfig, callbacks: Callbacks): CookieConsent.CookieConsentConfig {
  const p = cfg.preferences;
  const cookies = cfg.cookies;

  return {
    autoShow: true,
    disablePageInteraction: false,
    ...(cfg.cookieDomain ? { cookie: { domain: cfg.cookieDomain } } : {}),
    guiOptions: {
      // Accept and reject stay equally weighted. Refusal has to be as easy as
      // acceptance, and a banner that leans is not worth the measurement it buys.
      consentModal: { layout: 'box inline', position: 'bottom left', equalWeightButtons: true },
      preferencesModal: { layout: 'box', equalWeightButtons: true },
    },
    categories: {
      necessary: { enabled: true, readOnly: true },
      analytics: {
        enabled: false,
        autoClear: {
          // Without a domain the library clears on the current hostname only, which
          // misses cookies a subdomain inherits from the parent.
          cookies: cookies.map((cookie) => ({
            name: new RegExp(cookie.pattern.source, cookie.pattern.flags),
            domain: cookie.domain,
          })),
        },
      },
    },
    language: {
      default: cfg.lang,
      translations: {
        [cfg.lang]: {
          consentModal: {
            title: cfg.banner.title,
            description: cfg.banner.description,
            acceptAllBtn: cfg.banner.acceptAll,
            acceptNecessaryBtn: cfg.banner.acceptNecessary,
            showPreferencesBtn: cfg.banner.showPreferences,
            footer: `<a href="${cfg.policyUrl}">${cfg.policyLabel}</a>`,
          },
          preferencesModal: {
            title: p.title,
            acceptAllBtn: p.acceptAll,
            acceptNecessaryBtn: p.acceptNecessary,
            savePreferencesBtn: p.savePreferences,
            closeIconLabel: p.close,
            serviceCounterLabel: p.serviceCounterLabel,
            sections: [
              {
                title: p.intro.title,
                description: `${p.intro.description} <a href="${cfg.policyUrl}">${cfg.policyLabel}</a>`,
              },
              {
                title: p.necessary.title,
                description: p.necessary.description,
                linkedCategory: 'necessary',
              },
              {
                title: p.analytics.title,
                description: p.analytics.description,
                linkedCategory: 'analytics',
                cookieTable: {
                  headers: {
                    name: p.table.name,
                    domain: p.table.domain,
                    expiration: p.table.expiration,
                    desc: p.table.description,
                  },
                  body: cookies.map((cookie) => ({
                    name: cookie.name,
                    domain: cookie.domain,
                    expiration: shortDuration(cookie.duration),
                    desc: cookie.vendor,
                  })),
                },
              },
            ],
          },
        },
      },
    },
    ...callbacks,
  };
}
