/**
 * Shape and helpers for the cookie list. The list itself belongs to the host site:
 * vendors differ per site, and a shared list would claim cookies a site never writes.
 *
 * The point of the module is that one array feeds three consumers that used to be
 * written out separately, and drifted: the banner's autoClear patterns, the
 * preferences dialog's table, and the policy page's table in every language.
 */

export type DurationUnit = "minute" | "hour" | "day" | "year";

export interface CookieDuration {
  amount: number;
  unit: DurationUnit;
}

/** Why the cookie exists. The host site maps these keys to its own wording. */
export type CookiePurpose = "pageviewStats" | "linkVisitor" | "joinSession" | "identifySession";

export interface MeasurementCookie {
  /** Name as the visitor sees it in devtools. */
  name: string;
  /** Matches the name so consent withdrawal can clear it. */
  pattern: RegExp;
  vendor: string;
  domain: string;
  duration: CookieDuration;
  purpose: CookiePurpose;
}

/** Patterns for vanilla-cookieconsent's autoClear, so withdrawal clears every listed cookie. */
export const measurementAutoClear = (cookies: MeasurementCookie[]): { name: RegExp }[] =>
  cookies.map((cookie) => ({ name: cookie.pattern }));

const SHORT_UNIT: Record<DurationUnit, string> = {
  minute: "m",
  hour: "h",
  day: "d",
  year: "y",
};

/** Compact form for the preferences table, where the column is narrow. */
export const shortDuration = ({ amount, unit }: CookieDuration): string =>
  `${amount}${SHORT_UNIT[unit]}`;

/** [singular, plural] per unit. Supply one entry per language the site renders. */
export type DurationLabels = Record<DurationUnit, [string, string]>;

export const formatDuration = (
  { amount, unit }: CookieDuration,
  labels: DurationLabels,
): string => {
  const [singular, plural] = labels[unit];
  return `${amount} ${amount === 1 ? singular : plural}`;
};
