# LinkFrame

A free web tool that turns your profile photo into a LinkedIn-ready picture with a colored circular frame and curved text, like `#OPENTOWORK` or `#HIRING`, in your own colors and wording. Everything runs in your browser, so your photo never leaves your machine, and you get an 800×800 PNG ready to upload to LinkedIn.

**Try it:** [link-frame.vercel.app](https://link-frame.vercel.app/)

- **Private.** The image is rendered on an HTML canvas in the browser. No upload, no server, no account.
- **Your own text.** Up to 32 characters curved along the frame, with adjustable color, font size, letter spacing, and placement.
- **Full control of the frame.** Pick the color, thickness, and where the arc starts and ends — a full ring or a partial accent with soft fading edges.
- **Position the photo precisely.** Drag it inside the preview, rotate it from −180° to 180°, and scale it from 0.1× to 1.9×, with a background color behind it.
- **Live preview.** Every change re-renders instantly. Reset to the defaults with one click.
- **Ready for LinkedIn.** Accepts JPG, PNG, or WebP up to 15 MB and exports an 800×800 PNG.

## How to use it

1. Open [link-frame.vercel.app](https://link-frame.vercel.app/).
2. Drop your profile photo onto the preview (or click to choose a file).
3. Drag the photo to position it, then adjust the frame and text in the panels on the left.
4. Click **Download** to save `linkedin-profile-frame.png` and upload it to LinkedIn.

---

## Running it locally

You need [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/). The project pins `pnpm@11.5.3`, so `corepack enable` will pick the right version automatically.

```bash
git clone https://github.com/mearashadowfax/LinkFrame.git
cd LinkFrame
pnpm install
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

| Command             | Description                                     |
| ------------------- | ----------------------------------------------- |
| `pnpm dev`          | Start the dev server with hot reload            |
| `pnpm build`        | Type-check with `astro check` and build `dist/` |
| `pnpm preview`      | Serve the production build locally              |
| `pnpm format:fix`   | Format the codebase with Prettier               |
| `pnpm format:check` | Check formatting without writing changes        |

## Deploying

LinkFrame is a static site, so it can be hosted anywhere that serves the `dist/` folder. The live version runs on Vercel; `vercel.json` sets security headers (CSP, HSTS, and friends), so if you deploy elsewhere, port those headers to your host.

Set your own domain in `site` in `astro.config.mjs` and `SITE.url` in `src/data/constants.ts` so the sitemap, canonical URLs, and social previews point to it.

## How it works

- **[Astro](https://astro.build/)** renders the static page; the editor is a **[React](https://react.dev/)** island (`src/components/customizer/`).
- `canvas.ts` draws the photo, the frame arc, and the per-character curved text onto an 800×800 `<canvas>` and exports it with `canvas.toBlob()`.
- UI is built with **[Tailwind CSS](https://tailwindcss.com/)**, [shadcn/ui](https://ui.shadcn.com/), and [Base UI](https://base-ui.com/).

## License

MIT — see [LICENSE](LICENSE).
