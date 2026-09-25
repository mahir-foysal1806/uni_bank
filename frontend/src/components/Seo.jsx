import { useEffect } from "react";

// Single source of truth for the production origin used in canonical /
// Open Graph URLs. When a custom domain is connected, update this constant
// (see README "Custom domain" notes) — nothing else in this file needs to change.
const SITE_URL = "https://uni-bank-1.onrender.com";

function upsertMetaByName(name, content) {
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertMetaByProperty(property, content) {
  let el = document.head.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Seo — updates document.title and key <head> tags for the current route.
 * Renders nothing. Safe to drop into any route's element tree.
 *
 * @param {string} title - full page title (no auto-suffixing)
 * @param {string} description - meta description for this page
 * @param {string} [path] - route path used to build the canonical/OG URL,
 *   e.g. "/questions". Omit to leave the existing canonical tag untouched
 *   (used for the 404 page).
 * @param {boolean} [noindex] - when true, sets robots to "noindex, follow"
 *   instead of "index, follow"
 */
export default function Seo({ title, description, path, noindex = false }) {
  useEffect(() => {
    if (title) {
      document.title = title;
      upsertMetaByProperty("og:title", title);
      upsertMetaByName("twitter:title", title);
    }

    if (description) {
      upsertMetaByName("description", description);
      upsertMetaByProperty("og:description", description);
      upsertMetaByName("twitter:description", description);
    }

    if (path) {
      const canonicalUrl = `${SITE_URL}${path}`;
      upsertCanonical(canonicalUrl);
      upsertMetaByProperty("og:url", canonicalUrl);
    }

    upsertMetaByName("robots", noindex ? "noindex, follow" : "index, follow");
  }, [title, description, path, noindex]);

  return null;
}
