import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Digital Marketing Scholarship Test (DMST) - iDigital Studies",
    short_name: "IDS Scholarship",
    description:
      "Official 5-Minute Digital Marketing Scholarship Assessment by Institute of Digital Studies. Qualify for Up to 70% Merit Scholarship.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#EA2525",
    icons: [
      {
        src: "/IDS_LOGO.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
