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
