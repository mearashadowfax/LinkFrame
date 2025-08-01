import type { APIRoute, ImageMetadata } from "astro";
import { getImage } from "astro:assets";
import icon from "@favicon/icon.png";
import maskableIcon from "@images/maskable_icon.png";

interface Favicon {
  purpose: "any" | "maskable" | "monochrome";
  src: ImageMetadata;
  sizes: number[];
}

const sizes = [192, 512];
const favicons: Favicon[] = [
  {
    purpose: "any",
    src: icon,
    sizes,
  },
  {
    purpose: "maskable",
    src: maskableIcon,
    sizes,
  },
];

export const GET: APIRoute = async () => {
  const icons = await Promise.all(
    favicons.flatMap((favicon) =>
      favicon.sizes.map(async (size) => {
        const image = await getImage({
          src: favicon.src,
          width: size,
          height: size,
          format: "png",
        });
        return {
          src: image.src,
          sizes: `${image.options.width}x${image.options.height}`,
          type: `image/${image.options.format}`,
          purpose: favicon.purpose,
        };
      })
    )
  );

  const manifest = {
    name: "banners",
    icons,
    display: "minimal-ui",
    id: "/",
    start_url: "/",
    theme_color: "#f0f9ff",
    background_color: "#f2f9fd",
  };

  return new Response(JSON.stringify(manifest));
};
