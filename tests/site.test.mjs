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
  "assets/images/melbourne-map.png"
];

for (const file of files) await access(new URL(file, root), constants.R_OK);

const home = await readFile(new URL("index.html", root), "utf8");
const campus = await readFile(new URL("about-us/locations/melbourne-campus/index.html", root), "utf8");
const script = await readFile(new URL("script.js", root), "utf8");

for (const [name, html] of [["Home", home], ["Campus", campus]]) {
  assert.match(html, /<meta name="robots" content="noindex, nofollow, noarchive">/, `${name} must be noindex/nofollow`);
  assert.match(html, /University prototype/, `${name} must show prototype disclaimer`);
  assert.match(html, /data-accessibility="text-size"/, `${name} must include text-size control`);
  assert.match(html, /data-accessibility="contrast"/, `${name} must include contrast control`);
  assert.match(html, /data-accessibility="read-aloud"/, `${name} must include read-aloud control`);
  assert.match(html, /<header class="site-header">[\s\S]*class="accessibility-bar"[\s\S]*<\/header>/, `${name} accessibility controls must be inside the site header`);
  assert.match(html, /University design prototype — not an official Peter MacCallum Cancer Centre website\./, `${name} must include the required footer disclaimer`);
  assert.doesNotMatch(html, /(?:api[_-]?key|token|password)\s*[:=]\s*["'][^"']+/i, `${name} must not contain obvious credentials`);
}

assert.match(home, />Locations<\/a>/, "Locations must be top-level navigation");
assert.match(home, /href="about-us\/locations\/melbourne-campus\//, "Home must link to the local Melbourne Campus page");
assert.match(campus, /class="nav-local" href="\.\/"/, "Campus Locations navigation must remain local");
const aboutMenu = home.match(/id="about-submenu-home"[\s\S]*?<\/div>/)?.[0] || "";
assert.ok(aboutMenu, "Home must include an About us submenu");
assert.doesNotMatch(aboutMenu, />Locations</, "Locations must be removed from the About us submenu");
assert.match(campus, /First[\s\S]*30[\s\S]*minutes[\s\S]*FREE/i, "Campus page must prominently state the free 30-minute period");
assert.match(campus, /Prototype content placeholder/, "Unconfirmed campus content must remain explicitly marked");
assert.match(campus, /class="content-section dropoff-section"[\s\S]*class="arrival-priority"/, "The free 30-minute message must enhance the existing drop-off section");
const campusOrder = ["Find the Melbourne campus", "Getting to Peter Mac Melbourne", "Getting dropped off", "Melbourne parking", "Wheelchair access"].map((heading) => campus.indexOf(`>${heading}<`));
assert.ok(campusOrder.every((index) => index >= 0), "Campus page must retain every core official section");
assert.deepEqual(campusOrder, [...campusOrder].sort((a, b) => a - b), "Campus page must retain the official section order");
assert.match(script, /localStorage/, "Accessibility preferences must use localStorage");
assert.match(script, /speechSynthesis/, "Read-aloud control must use browser speech synthesis");

console.log(`Validated ${files.length} required files and both prototype pages.`);
