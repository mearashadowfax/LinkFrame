# Project Notes

## Assets

- We are using default system-ui fonts for better performance and fast loading times.
- Icons have been added to the `favicon` folder, along with a maskable icon and a social share image in the `img` directory.
- Scripts and styles are located in the `scripts` and `styles` directories, respectively.

## Components

- `Footer`: You can make all changes in the frontmatter; the same applies to the `Hero` component.

## Data

- `constants.ts`: Contains SEO-related data, which you can adjust as needed.
- Frame Text: The frame text is currently set to `#ONTHEHUNT`. You may want to change this in the following locations:
  - In `ImageCustomizer.astro` on line 83: `placeholder="#ONTHEHUNT"`
  - In `src/scripts/main.ts` on line 73: `let textInput = "#ONTHEHUNT";`

## Root Directory

- `astro.config.mjs`: Update the site URL if it changes, it is currently set to https://banners.li.