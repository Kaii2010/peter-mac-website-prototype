# Peter Mac Melbourne Campus university prototype

This repository contains a two-page educational prototype based on the public Peter MacCallum Cancer Centre website:

- Home page
- Melbourne Campus page with improved visibility of arrival, parking, drop-off and pre-arrival information

It is not an official Peter Mac website and is intentionally marked `noindex, nofollow`.

## Run locally

Serve the repository root with any static web server, then open `/`.

## Validate

```text
node tests/site.test.mjs
```

## Deployment

The GitHub Actions workflow in `.github/workflows/pages.yml` validates and deploys the repository root to GitHub Pages whenever `main` is updated.

## Remaining placeholders

- Final accessible-parking operational information
- Approved pre-arrival and peak-period advice
- Final parking signage artwork
- Final wayfinding artwork
- Approved SMS copy and destination URL
- Approved admissions-letter copy

These areas are visibly labelled in the prototype so they cannot be mistaken for confirmed Peter Mac information.
