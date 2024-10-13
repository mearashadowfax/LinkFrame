import ogImageSrc from "@images/social.png";

export const SITE = {
  title: "Banners",
  tagline: "",
  description: "",
  description_short: "",
  url: "https://banners.li",
  author: "Will Gordon",
};

export const SEO = {
  title: SITE.title,
  description: SITE.description,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: "en-US",
    "@id": SITE.url,
    url: SITE.url,
    name: SITE.title,
    description: SITE.description,
    isPartOf: {
      "@type": "WebSite",
      url: SITE.url,
      name: SITE.title,
      description: SITE.description,
    },
    author: {
      "@type": "Person",
      name: "Will Gordon",
      description: "Co-Founder at Tustin Recruiting",
      url: SITE.url,
    },
  },
};

export const OG = {
  locale: "en_US",
  type: "website",
  url: SITE.url,
  title: `${SITE.title} - ${SITE.tagline}`,
  description: SITE.description,
  image: ogImageSrc,
};