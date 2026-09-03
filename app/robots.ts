import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://scholarship.idigitalstudies.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/test", "/thank-you", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/test", "/thank-you", "/api/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/test", "/thank-you", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
