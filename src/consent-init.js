/**
 * Google Consent Mode v2 defaults, as a classic script. MUST run before the tag
 * manager loader. Options come from the script tag's own data attributes:
 * data-ad-signals-always-denied="true|false" (default true) and
 * data-wait-for-update="<ms>" (default 500).
 */
(function () {
  var script = document.currentScript;
  var data = (script && script.dataset) || {};
  var adSignalsAlwaysDenied = data.adSignalsAlwaysDenied !== 'false';
  var waitForUpdate = parseInt(data.waitForUpdate, 10);
  if (isNaN(waitForUpdate)) waitForUpdate = 500;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: waitForUpdate,
  });
  if (adSignalsAlwaysDenied) {
    gtag('set', 'ads_data_redaction', true);
  }
  gtag('set', 'url_passthrough', true);

  // Returning visitor: replay the stored decision synchronously so the first
  // pageview of the session is measured instead of being dropped by the wait.
  try {
    var raw = document.cookie.match(/(?:^|;\s*)cc_cookie=([^;]*)/);
    if (raw) {
      var saved = JSON.parse(decodeURIComponent(raw[1]));
      var accepted = (saved && saved.categories) || [];
      if (accepted.indexOf('analytics') !== -1) {
        gtag('consent', 'update', { analytics_storage: 'granted' });
        window.dataLayer.push({ event: 'consent_restored', consent_analytics: 'granted' });
      }
    }
  } catch (e) {
    // Malformed or blocked cookie: stay denied. The banner will ask again.
  }
})();
