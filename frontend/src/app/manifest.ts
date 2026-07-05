import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Elijay's POS",
        short_name: "Elijay's POS",
        description: "Point of Sale system for Elijay's Men's Wear",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#1A1A1A",
        theme_color: "#1A1A1A",
        icons: [
            {
                src: "/icons/icon.svg",
                sizes: "any",
                type: "image/svg+xml",
                purpose: "any",
            },
            {
                src: "/icons/icon-maskable.svg",
                sizes: "any",
                type: "image/svg+xml",
                purpose: "maskable",
            },
        ],
    };
}
