/**
 * Threshold analytics configuration.
 *
 * Both features remain disabled until their account-specific values are supplied.
 * The Cloudflare Web Analytics token is designed to be visible in client-side code.
 */
export const ANALYTICS_CONFIG=Object.freeze({
  appVersion:"v31",

  // Copy only the token value from Cloudflare's Web Analytics snippet.
  cloudflareWebAnalyticsToken:"560cdae680184b58a8fb7da59b990fb0",

  // Example: https://threshold-events.YOUR-SUBDOMAIN.workers.dev/events
  eventEndpoint:"https://threshold-events.jasonrprickett.workers.dev/events"
});
