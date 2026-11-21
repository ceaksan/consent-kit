---
name: "@ceaksan/consent-kit" # package.json name; README.md title agrees
company: ceaksan # decided by Ceair 2026-11-21
brand: none # decided by Ceair 2026-11-21; internal tool for own needs, not a brand or product
design_version: 1.0.0
product_version: 0.2.1 # package.json version; CHANGELOG.md top entry 0.2.1 (2026-11-11)
source_commit: bec5dfe
updated: 2026-11-21
template: design/template.fig
status: implemented
schemes: [light, dark] # dark via the host's darkClass mirrored to cc--darkmode (src/banner-runtime.ts:97-107); dark colors come from the host's --consent-* values, theme.css fallbacks are light only
source: src/theme.css
colors: # --consent-* contract token: fallback in src/theme.css (library variable it feeds)
  surface: "#ffffff" # --cc-bg
  surface-low: "#f4f4f4" # category block bg, expanded block hover bg, readonly toggle bg
  surface-lowest: "#fafafa" # expanded category bg, footer bg, toggle-on knob
  surface-high: "#e6e6e6" # category block hover bg, toggle-off bg
  text: "#111111" # primary text, button text, toggle-off knob, show-preferences link hover
  text-muted: "#444444" # secondary text, footer text, readonly knob, show-preferences link
  accent: "#005ded" # links, title rule, button hover fill and border, toggle-on bg
  accent-text: "#ffffff" # button text on hover
  border: "#d0d0d0" # dialog border, separators, category borders, footer border
  button-surface: "#ececec" # resting fill of both choice buttons
  button-border: "#8c8c8c" # resting border of both choice buttons
  overlay: "rgb(0 0 0 / 0.7)" # --cc-overlay-bg behind the preferences dialog
typography:
  font: "ui-monospace, SFMono-Regular, Menlo, monospace" # --consent-font fallback
  title: { size: 0.95rem, weight: 700, letter-spacing: 0.02em }
  title-rule: '"//\00a0"' # --consent-title-rule fallback, CSS content value, accent colored
  banner-description: { size: 0.8125rem, line-height: 1.55 }
  button: { weight: 600, letter-spacing: 0.01em }
  show-preferences-link: { size: 0.8125rem, weight: 400 }
  library-base: { size: 16px, line-height: 1.15 } # vanilla-cookieconsent 3.1.0 #cc-main default
rounded:
  dialog: 0 # --consent-radius fallback -> --cc-modal-border-radius
  button: 0 # --consent-radius fallback -> --cc-btn-border-radius
  preferences-toggle: 0 # --consent-radius fallback -> --cc-pm-toggle-border-radius
spacing:
  show-preferences-padding: "0.35rem 0"
  link-underline-offset: 0.2em
  link-underline-thickness: 1px
  modal-margin: { default: 1rem, below-640px: 0.5em } # vanilla-cookieconsent 3.1.0 default
components:
  dialog-border: { width: 1px, style: solid, color: border, shadow: none }
  choice-button: { border: "1px solid", equal-weight: true }
  banner: { layout: "box inline", position: "bottom left", max-width: 24rem } # max-width is the library default for .cm
  preferences: { layout: box, max-width: 43em, max-height: 37.5em } # sizes are library defaults for .pm--box
  stacking: { z-index: 2147483647 } # library --cc-z-index default
motion:
  link-underline-color: "text-decoration-color 0.15s ease"
  modal-transition: 0.25s # library --cc-modal-transition-duration default
  reduced-motion: 0s # library sets --cc-modal-transition-duration to 0s under prefers-reduced-motion
---

# @ceaksan/consent-kit design

This document describes the UI that `@ceaksan/consent-kit` 0.2.1 puts on a host site: a consent banner and a preferences dialog. The source files are the source of truth: [theme](src/theme.css), [options handed to the library](src/run-options.ts), [runtime](src/banner-runtime.ts), [Astro component](src/ConsentBanner.astro), [copy and config types](src/types.ts). When this file and a source file disagree, the source wins and this file is out of date.

## Overview

The package is Google Consent Mode v2 wiring for Astro sites and plain HTML sites. Its users are developers of host sites, and through them the site's visitors, who see the banner. It was extracted from ceaksan.com (README.md).

The UI itself is rendered by [vanilla-cookieconsent](https://github.com/orestbida/cookieconsent) 3.1.0 (version from package-lock.json; peer range `^3` in package.json). README.md states that the banner, the preferences dialog and the cookie table are the library's work. This package decides:

- which surfaces and layouts the library renders (`guiOptions`, src/run-options.ts:19-24),
- the categories and the cookie table content (src/run-options.ts:25-38, 72-85),
- every rendered string, all of which the host passes in (src/types.ts:1-23),
- the skin, through `src/theme.css`, which maps the library's `--cc-*` variables onto a `--consent-*` contract the host fills from its own tokens,
- dark mode switching, by mirroring a host class onto the library's `cc--darkmode`.

Surfaces: the consent banner (library name `consentModal`) and the preferences dialog (`preferencesModal`). The package renders no floating button and no "change preferences" control; a host renders its own and wires it with `data-cc="show-preferences"` (see Behavior rules).

Platforms: any browser page. Two delivery routes behave identically according to README.md: Astro components (`ConsentInit.astro`, `ConsentBanner.astro`, plus `GtmHead.astro` and `GtmNoscript.astro`, which render no visible UI) and the plain HTML bundle in `dist/` (`consent-init.js`, `consent-banner.js`, `consent-banner.css`).

Shipped vs demo: everything in `src/` and `dist/` is shipped (package.json `files`). There is no demo page, example site, fixture page or screenshot in the repository. Copy is not shipped: the only concrete strings in the repo are README examples, such as `policyLabel="Çerez Politikası"` and `policyUrl="/tr/cerez-politikasi"`, and the placeholder strings in tests.

### Principles

These are stated in source comments, not inferred.

1. Accept and reject are equally weighted in every state. The accent is spent on the title rule and the policy link, never on one of the two choices (src/theme.css:10-11, src/run-options.ts:20-23).
2. "Show preferences" is a third path, not a third choice, so it is demoted to a link (src/theme.css:128-129).
3. The banner looks like part of the host site, not a vendor widget: border-defined, zero radius, no shadow (src/theme.css:1-8).
4. Wording belongs to the host site; the package ships no copy (src/types.ts:1, src/ConsentBanner.astro:6-7).

## Colors

All colors are `--consent-*` custom properties the host may define; every one has a fallback in `src/theme.css`, so the file works before the host defines any. The fallbacks are a light palette only. There is no `prefers-color-scheme` handling in this package.

| Token | Fallback | Use (library variable) |
| --- | --- | --- |
| `--consent-surface` | `#ffffff` | Dialog background (`--cc-bg`). |
| `--consent-surface-low` | `#f4f4f4` | Category block background, expanded block hover, read-only toggle track. |
| `--consent-surface-lowest` | `#fafafa` | Expanded category block, footer background, knob of a toggle that is on. |
| `--consent-surface-high` | `#e6e6e6` | Category block hover, track of a toggle that is off. |
| `--consent-text` | `#111111` | Primary text, button text at rest, knob of a toggle that is off, show-preferences link on hover. |
| `--consent-text-muted` | `#444444` | Secondary text, footer text, read-only knob, show-preferences link at rest. |
| `--consent-accent` | `#005ded` | Links, `//` title rule, hover fill and border of both choice buttons, track of a toggle that is on. |
| `--consent-accent-text` | `#ffffff` | Button text on hover. |
| `--consent-border` | `#d0d0d0` | 1 px dialog border, separators, category borders, footer border. |
| `--consent-button-surface` | `#ececec` | Resting fill of the primary and secondary buttons (both the same). |
| `--consent-button-border` | `#8c8c8c` | Resting border of both buttons. |
| `--consent-overlay` | `rgb(0 0 0 / 0.7)` | Overlay behind the preferences dialog. |

Resting link underline color is `color-mix(in srgb, accent 35%, transparent)`; on hover it is the full accent (src/theme.css:112, 117). The resting button fill is deliberately strong so the two choices still read as buttons against the panel (src/theme.css:34-36).

Dark mode: `theme.css` sets the `--cc-*` variables on `#cc-main` itself, while the library's dark palette sets them on the `.cc--darkmode` element (`<html>`) and reaches `#cc-main` only by inheritance. The element's own declaration wins, so in dark mode the banner uses whatever the host's `--consent-*` tokens resolve to under its dark class, and with no host tokens it stays on the light fallbacks. Only variables `theme.css` does not map (toggle icon colors, scrollbar colors, `color-scheme: dark`) keep the library's dark values. This follows from the CSS cascade and the bundled library CSS; it has not been checked in a browser (see Known gaps).

## Typography

Font is `--consent-font`, falling back to `ui-monospace, SFMono-Regular, Menlo, monospace` (src/theme.css:22). README's theme example aliases it to `"JetBrains Mono", ui-monospace, monospace`.

| Element | Rule | Source |
| --- | --- | --- |
| Banner and preferences title | 0.95rem, weight 700, letter-spacing 0.02em, prefixed by `--consent-title-rule` (fallback `"//\00a0"`, a `//` plus a non-breaking space) in accent | src/theme.css:80-92 |
| Banner description | 0.8125rem, line-height 1.55 | src/theme.css:94-97 |
| Buttons (banner and preferences) | weight 600, letter-spacing 0.01em | src/theme.css:120-126 |
| Show-preferences link | 0.8125rem, weight 400, underlined, offset 0.2em | src/theme.css:130-139 |
| Base (library) | 16px, line-height 1.15 on `#cc-main` | vanilla-cookieconsent 3.1.0 CSS |

The non-breaking space in the title rule is load-bearing: the preferences title is a flex row that would collapse a plain trailing space (src/theme.css:88-89).

## Layout

- Banner: `layout: 'box inline'`, `position: 'bottom left'` (src/run-options.ts:22). Library defaults for this layout: max width 24rem, 1rem from the bottom and left edges, buttons side by side with 0.375rem between them and a 10em minimum width.
- Preferences dialog: `layout: 'box'` (src/run-options.ts:23). Library defaults: centered, max width 43em, max height 37.5em, overlay behind.
- Breakpoint: 640px, from the library. At 640px and below the banner goes full width with a 0.5em margin, its buttons stack in a column under a top separator, and the preferences dialog fills the viewport with no radius.
- `disablePageInteraction: false` (src/run-options.ts:17): the page behind the banner stays usable.
- Stacking: library `--cc-z-index` 2147483647.
- Banner content order: title, description, buttons (accept all, accept necessary, show preferences), footer with the policy link (src/run-options.ts:43-50).
- Preferences content order: title and close icon, intro section with the policy link appended, Necessary section, Analytics section with the cookie table, then accept all, accept necessary and save preferences buttons (src/run-options.ts:51-88).

## Elevation & Depth

None. Both dialogs carry a 1px solid `--consent-border` border and `box-shadow: none`, replacing the library's `0 .625em 1.875em rgba(0,0,2,.3)` shadow. The class is doubled (`.cm.cm`, `.pm.pm`) because the library's stylesheet is injected later at the same specificity (src/theme.css:71-78). The only depth cue is the preferences overlay (`--consent-overlay`).

## Shapes

Zero radius everywhere by default: `--consent-radius` (fallback `0`) feeds the dialog radius, the button radius and the preferences toggle radius (src/theme.css:23-25). A host can set one radius for all three; there is no separate token per element. Library defaults it replaces: 0.5rem, 0.4rem and 4em.

## Motion

- Links: the library's animated gradient underline is removed; only the underline color transitions, `text-decoration-color 0.15s ease` (src/theme.css:99-113).
- Dialog show and hide: library transition, `--cc-modal-transition-duration` 0.25s.
- Reduced motion: the library sets the dialog transition to 0s under `prefers-reduced-motion`. The 0.15s link color transition in `theme.css` is not disabled under reduced motion.

## Components

All markup is generated by vanilla-cookieconsent; the classes below are the library's, the rules are from `src/theme.css`.

- **Banner** (`#cc-main .cm`): box, border-defined, no shadow, no radius. Title with the accent `//` rule, description, buttons, policy link footer.
- **Choice buttons** (`.cm__btn`, `.pm__btn`, primary and secondary): identical styling. Rest: `button-surface` fill, `text` color, `button-border` 1px solid border, weight 600. Hover: `accent` fill and border, `accent-text` color. Both variants get the same values (src/theme.css:37-49), and `equalWeightButtons: true` is set on both dialogs (src/run-options.ts:22-23).
- **Show-preferences link** (`.cm__btn[data-role="show"]`): no background, transparent border, padding 0.35rem 0, 0.8125rem, weight 400, `text-muted`, underlined. Hover: `text` color, still no fill (src/theme.css:130-144).
- **Links** (`#cc-main a[href]`): accent, 1px underline at 0.2em offset, underline at 35% accent at rest and full accent on hover. The attribute selector is load-bearing against the library's later `#cc-main a` rule (src/theme.css:103-118).
- **Preferences dialog** (`#cc-main .pm`): box with header (title, close icon labelled by `preferences.close`), body sections and footer on `surface-lowest`.
- **Category block**: `surface-low` background, `border` border, `surface-high` on hover; expanded state on `surface-lowest`, hover `surface-low` (src/theme.css:51-57).
- **Category toggle**: on `accent` track with `surface-lowest` knob; off `surface-high` track with `text` knob; read-only `surface-low` track with `text-muted` knob (src/theme.css:59-64). Necessary is read-only and on; Analytics starts off (src/run-options.ts:26-28).
- **Cookie table** (Analytics section): four columns with host-supplied headers `table.name`, `table.domain`, `table.expiration`, `table.description`. One row per cookie: name, domain, `shortDuration` (for example `2y`), and the vendor in the description column (src/run-options.ts:72-85, src/cookie-inventory.ts:35-44).
- **Policy link**: `<a href="{policyUrl}">{policyLabel}</a>`, in the banner footer and appended to the preferences intro description (src/run-options.ts:49, 61).

## Behavior rules

- The banner shows automatically when the visitor has no stored decision (`autoShow: true`, src/run-options.ts:16). The library decides when a stored decision is valid.
- The runtime does nothing without config: no banner, no theme sync, no `data-cc` attribute (src/banner-runtime.ts:15-16; test/banner-config.test.mjs:106-110). Config comes from `window.consentKitConfig` first, then the `#cc-config` JSON element (src/run-options.ts:100-104; test/banner-config.test.mjs:90-104, 117-126).
- Accept all grants Analytics, accept necessary refuses it, save preferences applies the toggles. Every decision and change updates `analytics_storage` through `gtag('consent', 'update', ...)` and pushes `consent_update` (src/banner-runtime.ts:88-95). Only `analytics_storage` is ever updated by the banner; the three ad signals stay denied unless the host grants them itself (src/ConsentInit.astro:12-17).
- Consent defaults are set before any tag manager: ad_storage, ad_user_data, ad_personalization and analytics_storage denied; functionality, personalization and security storage granted; `wait_for_update` 500 ms; `ads_data_redaction` on unless `adSignalsAlwaysDenied` is false; `url_passthrough` on (src/consent-init.js:18-31; test/consent-init.test.mjs:20-42).
- Persistence: the decision lives in the library's `cc_cookie` cookie. A returning visitor who accepted Analytics gets `analytics_storage: granted` replayed synchronously before the tag manager loads, plus a `consent_restored` push; a refusal or a malformed cookie stays denied (src/consent-init.js:33-47; test/consent-init.test.mjs:44-65). `cookieDomain` sets the `cc_cookie` domain; unset, the library default applies (src/run-options.ts:18; test/run-options.test.mjs:40-48).
- Withdrawal clears every listed cookie, each on its own `domain` (src/run-options.ts:29-36; test/run-options.test.mjs:50-55).
- Dark mode follows the host, not the system: the runtime toggles `cc--darkmode` on `<html>` whenever the host's `darkClass` (default `dark`, src/ConsentBanner.astro:33) is present, and re-checks on every class change through a MutationObserver (src/banner-runtime.ts:97-107; test/banner-config.test.mjs:90-104).
- A host's own "change preferences" control: any element with `data-cc="show-preferences"` opens the preferences dialog on click, with the default action prevented (src/banner-runtime.ts:149-155). The runtime sets `data-cc="ready"` on `<html>` so a host can reveal that control only where the banner runs (src/banner-runtime.ts:145-147).
- Events pushed to the dataLayer: `consent_banner_shown` once per session through a `sessionStorage` key `cc_shown` (over-counts when storage is blocked), `consent_preferences_opened` on every preferences open, `consent_accepted` or `consent_rejected` on the first decision, `consent_accepted` or `consent_revoked` on later changes, `consent_banner_left_undecided` on `pagehide` of the page that counted the impression (src/banner-runtime.ts:69-143). Each carries the five landing keys described in README.md.
- No confirmation dialogs: every choice applies immediately; nothing in the package is destructive beyond the library's cookie clearing on withdrawal.
- Focus and keyboard are the library's: the bundled library adds `role="dialog"` and `aria-modal` to both dialogs, a Tab keydown handler that keeps focus inside the open dialog, and Escape (keyCode 27) closing the preferences dialog. None of this is pinned by this repository's tests (see Known gaps).
- Errors and empty states: the package defines none in the UI. An empty `cookies` array is accepted by the config (test/banner-config.test.mjs:34-36), but how the library renders an empty cookie table has not been verified.

## Screen inventory

There are no captures and no demo page. The states below are the ones the source configures; the template should capture each on a neutral host page, in light (fallback tokens) and dark (host tokens under `darkClass`).

| Surface | Source | States |
| --- | --- | --- |
| Consent banner | src/run-options.ts:22, 43-50; src/theme.css | shown (first visit, no decision); button hover (accept all, accept necessary share one look); show-preferences link hover; policy link hover; at 640px and below (stacked buttons); dark via `cc--darkmode`; hidden (decision stored) |
| Preferences dialog | src/run-options.ts:23, 51-88; src/theme.css | open from the banner link or a `data-cc="show-preferences"` control; Necessary read-only on; Analytics off (default) and on; category expanded with the cookie table; category block hover; at 640px and below (full viewport); dark |
| No config | src/banner-runtime.ts:15-16 | nothing rendered |

Non-visual components: `ConsentInit.astro` (inline consent defaults script), `GtmHead.astro` (GTM loader), `GtmNoscript.astro` (noscript iframe). They have no screens.

## Files and regeneration

| What | Where |
| --- | --- |
| Theme contract and skin | `src/theme.css` (exported as `@ceaksan/consent-kit/theme.css`) |
| Library options, layouts, categories, cookie table | `src/run-options.ts` |
| Runtime: theme sync, events, preferences trigger | `src/banner-runtime.ts` |
| Astro banner component (renders `#cc-config` JSON and imports the library CSS plus the runtime) | `src/ConsentBanner.astro` |
| Consent defaults (classic script) and its Astro wrapper | `src/consent-init.js`, `src/ConsentInit.astro` |
| Copy and config shapes | `src/types.ts` |
| Cookie list shape and duration helpers | `src/cookie-inventory.ts` |
| Plain HTML bundle (build output) | `dist/consent-banner.js`, `dist/consent-banner.css` (library CSS followed by `theme.css`), `dist/consent-init.js`, `dist/source-hash.txt` |

Documented commands (README.md, package.json; not run for this document):

```sh
npm run build   # regenerates dist/ from src/ with esbuild
npm test        # node --test test/*.test.mjs
```

There is no dev server or demo. To see the UI a host page is needed: an Astro layout as in README "Use", or a static page with `window.consentKitConfig` as in README "Plain HTML".

`design/template.fig` will hold the banner and the preferences dialog in every state of the Screen inventory, at a desktop width and at 640px or below, in light (fallback tokens) and dark (example host tokens), plus the `--consent-*` token collection and the button, link, toggle and category block components. It does not exist yet.

## Anti-patterns

From the source comments:

- Giving accept and reject different fills, borders or weights, or spending the accent on one of them.
- Turning show preferences back into a third button.
- Rounded corners or shadows by default.
- Hardcoding colors instead of aliasing `--consent-*` to host tokens.
- Detecting dark mode from `prefers-color-scheme` instead of the host's class (src/ConsentBanner.astro:21-24).
- Shipping copy or a shared cookie list in the package.

## Known gaps

- Brand: no file states a brand. `ceaksan` is inferred from the npm scope `@ceaksan` and README's "Extracted from ceaksan.com"; LICENSE names Ceyhun Aksan. Owner should confirm.
- Name: `@ceaksan/consent-kit` is the package name; there is no separate display name. README title and package.json agree.
- Dark mode colors: `theme.css` has no dark fallbacks. With no host tokens defined under the dark class, the banner stays light in dark mode except for library-only variables and `color-scheme: dark`. This is derived from the cascade, not verified in a browser.
- Library-rendered details (exact markup, close icon on the banner, service counter rendering, expandable categories, focus trap scope, Escape behavior, empty cookie table, `cc_cookie` lifetime) come from vanilla-cookieconsent 3.1.0, read only from the minified bundle in `dist/`. The library's `expiresAfterDays` default of 182 appears in the bundle; the package does not set it. No test here pins keyboard or focus behavior.
- `serviceCounterLabel` is passed through, but no category defines services, so whether the counter ever renders is unverified.
- Library layout values (24rem, 43em, 37.5em, 1rem and 0.5em margins, 640px breakpoint, 0.25s transition, z-index) are version-dependent library defaults, not package tokens.
- Reduced motion does not cover the 0.15s link color transition in `theme.css`.
- No demo page, no captures, no Turkish or English copy in the repository; template states will need placeholder or host copy.
- `ConsentEvent` in src/types.ts:60-67 does not list `consent_banner_left_undecided`, which the runtime pushes (src/banner-runtime.ts:142) and README documents. Its doc comment still says "the first five are decisions".
- `measurementAutoClear` in src/cookie-inventory.ts:32-33 returns patterns without `domain`, unlike the runtime's autoClear (src/run-options.ts:32-35). It is not used by the runtime; whether hosts rely on it is unknown.
