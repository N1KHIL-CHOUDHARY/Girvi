import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GRIVI",
    short_name: "GRIVI",
    description:
      "GRIVI is a modern pawn and pledge management platform for managing customers, pledges, payments, assets, interest and daily business operations.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#14181F",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
