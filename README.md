# @ceaksan/consent-kit

Google Consent Mode v2 for Astro sites. Consent defaults land before the tag manager,
one cookie list feeds the banner and the policy page, and the theme is driven by the
host site's own tokens.

Built on [vanilla-cookieconsent](https://github.com/orestbida/cookieconsent) by Orest
Bida (MIT). This package is the wiring around it, not a fork: the banner, the
preferences dialog and the cookie table are all its work.

Extracted from ceaksan.com, where it runs in production. The decisions behind it,
including the alternatives that were rejected, are written up in that repo's
`docs/adr/ADR-038-consent-mode-v2-banner.md`.

## What it does

- Denies `ad_storage`, `ad_user_data`, `ad_personalization` and `analytics_storage`
  before the tag manager loads, and replays a returning visitor's stored decision
  synchronously so the first pageview of a consented session is not dropped.
- Renders a banner whose accept and reject buttons are identical in every state.
- Derives the `autoClear` patterns and the preferences cookie table from one array, so
  a vendor is added in one place instead of several that drift.
- Reports decisions to the dataLayer under stable event names.

## What it does not do

- **It does not gate vendors that ignore Consent Mode.** Microsoft Clarity and Hotjar
  keep writing cookies whatever the consent state says, so they must carry a consent
  condition inside the tag manager. Nothing in this package can enforce that; test it
  from the outside by asserting no measurement cookie exists before consent.
- It does not store consent server-side. The decision lives in the `cc_cookie` cookie.
  A site that needs durable, auditable records needs a backend this does not provide.
- It does not supply copy or a policy page. Wording is not portable.

## Install

```bash
npm install github:ceaksan/consent-kit vanilla-cookieconsent
```

## Use

```astro
---
import ConsentInit from '@ceaksan/consent-kit/ConsentInit.astro';
import GtmHead from '@ceaksan/consent-kit/GtmHead.astro';
import GtmNoscript from '@ceaksan/consent-kit/GtmNoscript.astro';
import ConsentBanner from '@ceaksan/consent-kit/ConsentBanner.astro';
import '@ceaksan/consent-kit/theme.css';
import { COOKIES, COPY } from '../config/consent';
---
<html lang="tr">
  <head>
    <ConsentInit />
    <GtmHead containerId="GTM-XXXXXXX" />
  </head>
  <body>
    <GtmNoscript containerId="GTM-XXXXXXX" />
    <slot />
    <ConsentBanner
      lang="tr"
      copy={COPY}
      policyUrl="/tr/cerez-politikasi"
      policyLabel="Çerez Politikası"
      cookies={COOKIES}
    />
  </body>
</html>
```

`ConsentInit` must precede `GtmHead`. Everything else is placement-free.

### The cookie list

```ts
import type { MeasurementCookie } from '@ceaksan/consent-kit/cookie-inventory';

export const COOKIES: MeasurementCookie[] = [
  {
    name: '_ga',
    pattern: /^_ga$/,
    vendor: 'Google Analytics 4',
    domain: '.example.com',
    duration: { amount: 2, unit: 'year' },
    purpose: 'pageviewStats',
  },
];
```

`purpose` is a key, not a sentence: the policy page looks up its own wording per
language. `formatDuration` and `shortDuration` render `duration` for prose and for the
narrow table column.

### Theme

`theme.css` reads a `--consent-*` contract with fallbacks for every value. Alias it to
the site's tokens:

```css
:root {
  --consent-font: "JetBrains Mono", ui-monospace, monospace;
  --consent-surface: var(--v2-surface-card);
  --consent-text: var(--v2-on-surface);
  --consent-accent: var(--v2-primary);
  --consent-border: var(--v2-border);
}
```

The banner mirrors the `dark` class on `<html>` onto the library's `cc--darkmode`.
Pass `darkClass` if the site names it something else.

## Events

| Event | When |
|---|---|
| `consent_banner_shown` | banner shown, once per session |
| `consent_preferences_opened` | preferences dialog opened |
| `consent_accepted` | analytics granted |
| `consent_rejected` | first decision was a refusal |
| `consent_revoked` | previously granted, now denied |

Forward these to a **cookieless** analytics tool. Analytics that consent switches off
cannot report the visitor who switched it off, so a refusal measured there reads as
zero rather than as a refusal. The tag that forwards them must not carry a consent
condition, for the same reason.

Two further events, `consent_restored` and `consent_update`, are plumbing for the gtag
contract and should not be forwarded: `consent_restored` fires on every pageview of a
consented session and would swamp the decisions it sits next to.

`consent_banner_shown` is deduplicated per session with a `sessionStorage` flag,
because the banner reappears on every pageview until a decision is made. Counting it
raw makes undecided browsing inflate the denominator, and the acceptance rate reads far
worse than it is.

## License

MIT
