/** Every string the banner renders. The host site owns this: wording is not portable. */
export interface ConsentCopy {
  banner: {
    title: string;
    description: string;
    acceptAll: string;
    acceptNecessary: string;
    showPreferences: string;
  };
  preferences: {
    title: string;
    acceptAll: string;
    acceptNecessary: string;
    savePreferences: string;
    close: string;
    /** vanilla-cookieconsent's "1 Service|2 Services" pluralisation string. */
    serviceCounterLabel: string;
    intro: { title: string; description: string };
    necessary: { title: string; description: string };
    analytics: { title: string; description: string };
    table: { name: string; domain: string; expiration: string; description: string };
  };
}

/** One cookie as it crosses to the browser runtime: RegExp does not survive JSON. */
export interface CookieEntry {
  name: string;
  pattern: { source: string; flags: string };
  vendor: string;
  domain: string;
  duration: { amount: number; unit: "minute" | "hour" | "day" | "year" };
}

/** What the banner runtime reads from window.consentKitConfig or the #cc-config element. */
export interface ConsentConfig {
  lang: string;
  policyUrl: string;
  policyLabel: string;
  darkClass: string;
  /**
   * Domain for the consent cookie. Sites that share a parent domain set it to that
   * parent so one decision covers all of them. Unset, the library uses the hostname.
   */
  cookieDomain?: string;
  banner: ConsentCopy["banner"];
  preferences: ConsentCopy["preferences"];
  cookies: CookieEntry[];
}

/**
 * Names pushed to the dataLayer.
 *
 * The first five are decisions and belong in a cookieless analytics tool: a tool that
 * consent switches off cannot report the visitor who switched it off. Forward them from
 * the tag manager, and do not put a consent condition on that forwarding tag, or the
 * refusals disappear.
 *
 * The last two are plumbing for the gtag contract and should not be forwarded.
 */
export type ConsentEvent =
  | "consent_banner_shown"
  | "consent_preferences_opened"
  | "consent_accepted"
  | "consent_rejected"
  | "consent_revoked"
  | "consent_restored"
  | "consent_update";
