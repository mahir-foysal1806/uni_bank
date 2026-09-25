import { useEffect } from "react";

const Seo = ({ title, description, path = "", noindex = false }) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);

      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", content);
    };

    setMeta("description", description || "");

    setMeta(
      "robots",
      noindex ? "noindex, nofollow" : "index, follow"
    );

    const canonicalUrl = `https://uni-bank-1.onrender.com${path}`;

    let canonical = document.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", canonicalUrl);
  }, [title, description, path, noindex]);

  return null;
};

export default Seo;
