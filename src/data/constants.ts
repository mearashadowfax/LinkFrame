import ogImageSrc from "@images/social.png";

export const SITE = {
  title: "LinkFrame Maker — Create Custom LinkedIn-Ready Profile Frames in Seconds",
  tagline: "Personalize Your LinkedIn Profile with Custom Frames",
  description: "Stand out on LinkedIn with our easy-to-use tool for creating personalized profile image frames. Customize your frames with text, colors, and symbols to showcase your skills, support causes, and make your profile truly unique.",
  description_short: "Easily create personalized LinkedIn profile frames with text, colors, and symbols using our real-time editor.",
  url: "https://link-frame.vercel.app/",
  author: "Emil Gulamov",
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
      name: "Emil Gulamov",
      description: "Founder at sobstvennoAI",
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