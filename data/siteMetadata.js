/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: "KTM Test Preparation Centre",
  author: "KTM Test Preparation Centre",
  headerTitle: "KTM Test Prep",
  description:
    "KTM Test Preparation Centre offers live online computer-based IELTS and PTE classes, demo lessons, exam booking support, Alfa mock-test practice, and student follow-up from Kathmandu, Nepal.",
  intro:
    "Live online computer-based IELTS and PTE preparation for students in Nepal and abroad.",
  jobTitle: "IELTS and PTE Test Preparation Centre",
  language: "en-np",
  theme: "light",
  siteUrl: "https://ktmtestprep.ktmeducational.edu.np",
  siteRepo: "https://www.ktmeducational.edu.np",
  siteLogo: `${process.env.BASE_PATH || ""}/ktm-logo.jpg`,
  socialBanner: `${process.env.BASE_PATH || ""}/students-hero.svg`,
  email: "ktmtestprep@ktmeducational.edu.np",
  facebook: "https://www.facebook.com/KTMIMMIGRATION",
  Instgram: "https://www.instagram.com/ktmeducational/",
  instagram: "https://www.instagram.com/ktmeducational/",
  TikTok: "https://www.tiktok.com/@ktm.test.prep?_r=1&_t=ZS-95wtMYSXlaf",
  youtube: "https://www.youtube.com/@ktmeducationalconsultancy",
  locale: "en_NP",
  stickyNav: true,
  analytics: {
    googleAnalytics: {
      googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
    },
    metaPixel: {
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
    },
  },
  newsletter: {
    provider: undefined,
  },
  comments: {
    provider: undefined,
  },
  search: {
    provider: "kbar",
    kbarConfig: {
      searchDocumentsPath: `${process.env.BASE_PATH || ""}/search.json`,
    },
  },
};

module.exports = siteMetadata;
