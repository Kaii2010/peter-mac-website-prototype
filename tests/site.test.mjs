import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const files = [
  "index.html",
  "about-us/locations/melbourne-campus/index.html",
  "styles.css",
  "script.js",
  "assets/images/peter-mac-logo.png",
  "assets/images/home-hero.jpg",
  "assets/images/melbourne-campus.jpg",
  "assets/images/peter-mac-arrival-signage-plan.jpg",
  "assets/images/Precinct_map.jpeg"
];

for (const file of files) await access(new URL(file, root), constants.R_OK);

const home = await readFile(new URL("index.html", root), "utf8");
const campus = await readFile(new URL("about-us/locations/melbourne-campus/index.html", root), "utf8");
const script = await readFile(new URL("script.js", root), "utf8");
const styles = await readFile(new URL("styles.css", root), "utf8");

for (const [name, html] of [["Home", home], ["Campus", campus]]) {
  assert.match(html, /<meta name="robots" content="noindex, nofollow, noarchive">/, `${name} must be noindex/nofollow`);
  assert.match(html, /Design Factory student prototype/, `${name} must show prototype disclaimer`);
  assert.match(html, /Not an official Peter Mac website - The Outsiders/, `${name} must credit the student team`);
  assert.match(html, /data-accessibility="text-size"/, `${name} must include text-size control`);
  assert.match(html, /data-accessibility="contrast"/, `${name} must include contrast control`);
  assert.match(html, /data-accessibility="read-aloud"/, `${name} must include read-aloud control`);
  assert.match(html, /<header class="site-header">[\s\S]*class="accessibility-bar"[\s\S]*<\/header>/, `${name} accessibility controls must be inside the site header`);
  assert.match(html, /Design Factory student prototype — not an official Peter Mac website — The Outsiders\./, `${name} must include the required footer disclaimer`);
  assert.doesNotMatch(html, /(?:api[_-]?key|token|password)\s*[:=]\s*["'][^"']+/i, `${name} must not contain obvious credentials`);
}

assert.match(home, />Locations<\/a>/, "Locations must be top-level navigation");
assert.match(home, /href="about-us\/locations\/melbourne-campus\//, "Home must link to the local Melbourne Campus page");
assert.match(campus, /href="\.\/" aria-current="page">Locations<\/a>/, "Campus Locations navigation must remain local");
assert.match(home, />Careers<\/a>[\s\S]*?>Locations<\/a>[\s\S]*?>About us<\/a>/, "Locations must appear between Careers and About us");
assert.match(home, />Peter Mac Foundation [\s\S]*?<\/a>/, "Utility navigation must match the official Peter Mac header");
const aboutMenu = home.match(/id="about-submenu-home"[\s\S]*?<\/div>/)?.[0] || "";
assert.ok(aboutMenu, "Home must include an About us submenu");
assert.doesNotMatch(aboutMenu, />Locations</, "Locations must be removed from the About us submenu");
assert.match(campus, /First[\s\S]*30[\s\S]*minutes[\s\S]*FREE/i, "Campus page must prominently state the free 30-minute period");
assert.match(campus, /peter-mac-arrival-signage-plan\.jpg/, "Campus page must use the supplied arrival and signage plan");
assert.match(campus, /google\.com\/maps\/search\/\?api=1&amp;query=Peter\+MacCallum\+Cancer\+Centre/, "Campus page must link to Peter Mac in Google Maps");
assert.match(campus, /Precinct_map\.jpeg/, "Public transport section must include the official Parkville precinct map");
assert.doesNotMatch(campus, /Before you arrive|before-you-arrive|Prototype content placeholder/, "The Before you arrive section must be removed");
assert.doesNotMatch(campus, /Prototype asset placeholders|Arrival wayfinding and parking signs|Pre-arrival communication|SMS concept|Admissions letter concept/, "Removed placeholder concept sections must not remain");
assert.match(campus, /class="content-section dropoff-section"[\s\S]*class="arrival-priority"/, "The free 30-minute message must enhance the existing drop-off section");
const campusOrder = ["Find the Melbourne campus", "Getting to Peter Mac Melbourne", "Getting dropped off", "Parking", "Wheelchair access"].map((heading) => campus.indexOf(`>${heading}<`));
assert.ok(campusOrder.every((index) => index >= 0), "Campus page must retain every core official section");
assert.deepEqual(campusOrder, [...campusOrder].sort((a, b) => a - b), "Campus page must retain the official section order");
assert.match(script, /localStorage/, "Accessibility preferences must use localStorage");
assert.match(script, /document\.documentElement\.dataset\.textSize/, "Text-size control must update the root element");
assert.match(styles, /html\[data-text-size="large"\]/, "Root text-size states must change the rem scale");
assert.match(styles, /body\.high-contrast\s*\{[\s\S]*?background:\s*#080808/, "High contrast mode must use a dark page background");
assert.match(styles, /body\.high-contrast \.audience-card[\s\S]*?background:\s*#111/, "High contrast mode must darken content cards");
assert.match(script, /speechSynthesis/, "Read-aloud control must use browser speech synthesis");

console.log(`Validated ${files.length} required files and both prototype pages.`);
