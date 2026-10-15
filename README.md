# Peter Mac Melbourne Campus university prototype

This repository contains a two-page educational prototype based on the public Peter MacCallum Cancer Centre website. It demonstrates small changes to arrival information, parking communication, wayfinding and accessibility while preserving Peter Mac’s existing visual structure.

The prototype includes:

- a reproduction of the current Peter Mac home page;
- a Melbourne Campus page with more visible parking, pickup and drop-off information;
- a top-level local `Locations` navigation item; and
- text-size, high-contrast and read-aloud controls.

This is not an official Peter Mac website. Both pages use `noindex, nofollow` metadata and display an academic-prototype disclaimer.

## Requirements and installation

The project has no third-party runtime dependencies. It requires Node.js 22 or newer for local validation, building and preview.

Clone the repository and enter its directory. No package installation step is required.

## Run locally

Start the included static server:

```text
node scripts/serve.mjs
```

Open `http://127.0.0.1:4173/` in a browser.

## Validate and build

Run the structural and safety checks:

```text
node tests/site.test.mjs
```

Create the clean deployment artifact:

```text
node scripts/build.mjs
```

The output is written to `dist/`. Only public site files are copied there.

## GitHub Pages deployment

The workflow at `.github/workflows/pages.yml` runs the checks, builds `dist/`, uploads the Pages artifact and deploys it. A push to `main` triggers deployment automatically. All CSS, JavaScript, image and internal navigation paths are relative so the site works at a repository subpath such as:

```text
https://USERNAME.github.io/REPOSITORY-NAME/
```

## File structure

```text
/
  index.html                                  Home page
  about-us/locations/melbourne-campus/
    index.html                                Melbourne Campus page
  assets/images/                              Reference imagery and future project artwork
  assets/ASSET_SOURCES.md                     Image provenance
  styles.css                                  Shared Peter Mac visual system and responsive styles
  script.js                                   Navigation and accessibility behavior
  scripts/build.mjs                           Deployment-artifact builder
  scripts/serve.mjs                           Local static preview server
  tests/site.test.mjs                         Automated structural checks
  .github/workflows/pages.yml                 GitHub Pages workflow
```

## Replacing placeholder content

Search the Melbourne Campus HTML for `data-placeholder` or `[PLACEHOLDER:`. Replace only the marked copy after the project team has approved the operational information. Current placeholders cover:

- accessible parking details;
- approved pre-arrival and peak-period advice;
- arrival accessibility information;
- SMS copy and destination URL; and
- admissions-letter copy.

Do not replace placeholders with unverified hospital policies, prices, rules or procedures.

## Replacing map and signage assets

The current campus map is the public map from the official Peter Mac page. The proposed project map and signage have reserved panels under “Arrival wayfinding and parking signs.” When final artwork is supplied:

1. add optimized files to `assets/images/`;
2. replace the matching placeholder panel in the campus HTML with an `<img>` element;
3. provide meaningful alt text describing the information conveyed by the image;
4. add the asset’s source and rights information to `assets/ASSET_SOURCES.md`; and
5. rebuild and test at desktop, tablet and mobile widths.

Suggested filenames are `arrival-map-placeholder.png`, `parking-signage-placeholder.png` and `accessible-parking-indicator-placeholder.png` until final names are confirmed.

## Accessibility controls

- **Text size** cycles through Default, Large and Largest without browser zoom. The selected size is stored in `localStorage`.
- **High contrast** increases contrast, strengthens borders and preserves the visible focus indicator. Its state is stored in `localStorage`.
- **Read aloud** uses the browser SpeechSynthesis API to read `<main>` content and stops on a second press or when the page is left. Unsupported browsers disable the control gracefully.

The controls supplement semantic HTML, logical headings, descriptive alt text, keyboard navigation, visible focus styles and the skip link; they do not replace screen-reader support.
