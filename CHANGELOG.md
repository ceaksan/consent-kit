# Changelog

## 0.2.1 (2026-11-11)

- `cookieDomain` sets the domain of the `cc_cookie` consent cookie, so sites on one
  parent domain can share a single decision.
- Withdrawal clears each measurement cookie on its own `domain` from the cookie list,
  not only on the current hostname.
- `dist/source-hash.txt` records a hash of every bundled source, and a test fails when
  `dist/` is out of sync with `src/`.

## 0.2.0 (2026-11-11)

- Plain HTML route: `dist/consent-init.js`, `dist/consent-banner.js` and
  `dist/consent-banner.css`, built by `npm run build`. Config comes from
  `window.consentKitConfig` or a `<script type="application/json" id="cc-config">`
  element.
- Consent events carry landing context (`is_landing`, `click_source`, `utm_source`,
  `utm_medium`, `utm_campaign`), and `consent_banner_left_undecided` reports a landing
  page left without a decision. Each impression yields one landing outcome.

### Breaking for host tests

- The banner logic moved out of `ConsentBanner.astro` into `src/banner-runtime.ts`.
  The component's `<script>` block now only imports the library CSS and
  `./banner-runtime`. A host test that cut the client script out of the component by
  matching its old first line (`import * as CookieConsent`) finds nothing and fails.
  Run `dist/consent-banner.js` instead, see "Testing from a host site" in the README.

## 0.1.1 (2026-10-01)

- Fix: the first consent change after a decision was swallowed and never reported.
- `astro` peer range widened to `^5 || ^6 || ^7`.

## 0.1.0 (2026-08-25)

- Initial release, extracted from ceaksan.com.
