import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = __dirname;
const baseUrl = "https://www.angular.courses/caniuse";
const versions = [22, 21, 20, 19, 18, 17, 16, 15, 14];
const columns = [
  "section",
  "name",
  "package",
  "description",
  "status",
  "introduced_in",
  "removed_in",
  "v22",
  "v21",
  "v20",
  "v19",
  "v18",
  "v17",
  "v16",
  "v15",
  "v14",
  "angular_courses_url",
  "angular_dev_url",
  "notes",
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });

await page.goto(`${baseUrl}?tab=features`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const scripts = await page.evaluate(() =>
  Array.from(document.scripts)
    .map((script) => script.src)
    .filter(Boolean),
);

const chunks = [];
for (const scriptUrl of scripts) {
  const text = await fetchText(scriptUrl);
  if (
    text.includes('id:"standalone-api"') ||
    text.includes("computed-must-return")
  ) {
    chunks.push({ url: scriptUrl, text });
  }
}

const dataChunk = chunks.find((chunk) => chunk.text.includes('id:"standalone-api"'));
if (!dataChunk) {
  throw new Error("Could not locate Angular Can I Use static data chunk.");
}

fs.mkdirSync(path.join(outputDir, "chunks"), { recursive: true });
fs.writeFileSync(path.join(outputDir, "chunks", "caniuse-data-chunk.js"), dataChunk.text, "utf8");

const apiCompatibility = extractJsonParseArray(dataChunk.text);
const curatedFeatures = extractJsArray(
  dataChunk.text,
  'let a=[{id:"standalone-api"',
  '];s.s(["LinkType"',
  "let a=".length,
);

const deprecatedFeatureSet = new Set(
  ["disabled", "hidden", "readonly", "WithField", "WithOptionalField", "WithoutField"].map(
    (name) => `@angular/forms/signals::${name}`,
  ),
);
const deprecatedNameExclusions = new Set([
  "NgForOfContext",
  "NgIf",
  "NgIfContext",
  "NgSwitch",
  "NgSwitchCase",
  "NgSwitchDefault",
]);

const deprecatedFeatures = apiCompatibility
  .filter((item) => !deprecatedFeatureSet.has(`${item.package}::${item.name}`))
  .filter((item) => !deprecatedNameExclusions.has(item.name))
  .filter((item) => item.versions?.some((version) => version.status === "deprecated"));

const seen = new Set();
const featureSource = [...curatedFeatures, ...deprecatedFeatures].filter((item) => {
  if (seen.has(item.name)) return false;
  seen.add(item.name);
  return true;
});

const features = featureSource.map((item) => normalizeVersionedItem("Features", item));
const diff = featureSource.map((item) =>
  normalizeVersionedItem("Diff", item, "Derived from the Angular Courses diff/feature compatibility source."),
);

const migrations = await scrapeTable(page, "migrations", 13);
const update = await scrapeTable(page, "update", 112);
const mcp = await scrapeTable(page, "mcp", 14);

const eslintRules = extractJsArray(
  dataChunk.text,
  'let v=[{name:"contextual-lifecycle"',
  '];s.s(["getFilteredEslintCaniuseList"',
  "let v=".length,
).map((rule) => ({
  section: "ESLint",
  name: rule.name,
  package: `angular-eslint/${rule.type}`,
  description: rule.description ?? "",
  status: "",
  introduced_in: rule.version ?? "",
  removed_in: "",
  ...versionColumnsForIntroduced(rule.version),
  angular_courses_url: `${baseUrl}?tab=eslint`,
  angular_dev_url: rule.url ?? "",
  notes: "",
  raw: rule,
}));

await browser.close();

const sections = [
  sectionPayload("Features", `${baseUrl}?tab=features`, 220, features),
  sectionPayload("Diff", `${baseUrl}?tab=diff`, 220, diff),
  sectionPayload("Migrations", `${baseUrl}?tab=migrations`, 13, migrations),
  sectionPayload("Update", `${baseUrl}?tab=update`, 112, update),
  sectionPayload("MCP", `${baseUrl}?tab=mcp`, 14, mcp),
  sectionPayload("ESLint", `${baseUrl}?tab=eslint`, 88, eslintRules),
];

for (const section of sections) {
  fs.writeFileSync(
    path.join(outputDir, `${section.section.toLowerCase()}.raw.json`),
    `${JSON.stringify(section, null, 2)}\n`,
    "utf8",
  );
}

const allItems = sections.flatMap((section) => section.items);
writeJson("angular-caniuse.normalized.json", {
  extracted_at: new Date().toISOString(),
  count: allItems.length,
  columns,
  items: allItems,
});
writeCsv("angular-caniuse.normalized.csv", allItems, columns);
writeJson("manifest.json", {
  generated_at: new Date().toISOString(),
  total_count: allItems.length,
  sections: sections.map(({ section, source, expected_count, actual_count, extracted_at, headers }) => ({
    section,
    source,
    expected_count,
    actual_count,
    extracted_at,
    headers,
  })),
});
writeReport(sections);

console.log(`Extracted ${allItems.length} rows.`);
for (const section of sections) {
  console.log(`${section.section}: ${section.actual_count}/${section.expected_count}`);
}

function normalizeVersionedItem(section, item, extraNote = "") {
  const byVersion = Object.fromEntries(
    versions.map((version) => {
      const exact = item.versions?.find((entry) => Number(entry.version) === version);
      return [`v${version}`, exact?.status ?? "not_available"];
    }),
  );
  const available = item.versions?.filter((entry) => entry.status) ?? [];
  const introduced = available.length
    ? available.map((entry) => Number(entry.version)).sort((left, right) => left - right)[0]
    : "";
  const removed = item.versions?.find((entry) => entry.status === "removed")?.version ?? "";
  const links = collectLinks(item);

  return {
    section,
    name: item.name,
    package: item.package,
    description: item.metadata?.description ?? "",
    status: byVersion.v22,
    introduced_in: introduced ? String(introduced) : "",
    removed_in: removed ? String(removed) : "",
    ...byVersion,
    angular_courses_url: `${baseUrl}?tab=${section.toLowerCase()}`,
    angular_dev_url: item.metadata?.documentationUrl ?? links.find((url) => url.includes("angular.dev")) ?? "",
    notes: [item.metadata?.migrationScript ? `migration: ${item.metadata.migrationScript}` : "", extraNote]
      .filter(Boolean)
      .join(" "),
    raw: item,
  };
}

async function scrapeTable(activePage, tab, expectedCount) {
  await activePage.goto(`${baseUrl}?tab=${tab}`, { waitUntil: "networkidle" });
  await activePage.waitForTimeout(1000);
  const rows = await activePage.evaluate((currentTab) => {
    const norm = (value) => (value ?? "").replace(/\s+/g, " ").trim();
    const tableRows = Array.from(document.querySelectorAll("tr"));
    const headers = Array.from(tableRows[0]?.children ?? []).map((cell) => norm(cell.innerText));

    return {
      headers,
      rows: tableRows.slice(1).map((row) => {
        const cells = Array.from(row.children);
        const links = Array.from(row.querySelectorAll("a")).map((anchor) => ({
          text: norm(anchor.innerText || anchor.textContent),
          href: anchor.href,
        }));
        return {
          cells: cells.map((cell) => norm(cell.innerText)),
          links,
          aria: cells.map((cell) =>
            Array.from(cell.querySelectorAll("[aria-label]")).map((node) => node.getAttribute("aria-label")),
          ),
          tab: currentTab,
        };
      }),
    };
  }, tab);

  return rows.rows.map((row) => normalizeTableRow(tab, row));
}

function normalizeTableRow(tab, row) {
  const [a, b, c, d, e] = row.cells;
  if (tab === "migrations") {
    return {
      section: "Migrations",
      name: a,
      package: "@angular/core",
      description: b,
      status: "",
      introduced_in: c,
      removed_in: "",
      ...emptyVersionColumns(),
      angular_courses_url: `${baseUrl}?tab=migrations`,
      angular_dev_url: row.links.find((link) => link.href.includes("angular.dev"))?.href ?? "",
      notes: d ? `command: ${d}` : "",
      raw: row,
    };
  }
  if (tab === "update") {
    return {
      section: "Update",
      name: a,
      package: b,
      description: c,
      status: e ? "optional" : "",
      introduced_in: d,
      removed_in: "",
      ...versionColumnsForIntroduced(d, e ? "optional" : "available"),
      angular_courses_url: row.links[0]?.href ?? `${baseUrl}?tab=update`,
      angular_dev_url: "",
      notes: e ? "optional migration" : "",
      raw: row,
    };
  }
  if (tab === "mcp") {
    return {
      section: "MCP",
      name: a,
      package: b,
      description: c,
      status: statusFromAria(row.aria[3]?.[0]),
      introduced_in: firstAvailableVersionFromAria(row.aria.slice(3), [22, 21, 20]),
      removed_in: "",
      v22: statusFromAria(row.aria[3]?.[0]),
      v21: statusFromAria(row.aria[4]?.[0]),
      v20: statusFromAria(row.aria[5]?.[0]),
      v19: "",
      v18: "",
      v17: "",
      v16: "",
      v15: "",
      v14: "",
      angular_courses_url: `${baseUrl}?tab=mcp`,
      angular_dev_url: "",
      notes: "",
      raw: row,
    };
  }
  throw new Error(`Unsupported table tab: ${tab}`);
}

function sectionPayload(section, source, expectedCount, items) {
  return {
    section,
    source,
    extracted_at: new Date().toISOString(),
    expected_count: expectedCount,
    actual_count: items.length,
    headers: columns,
    items,
  };
}

function emptyVersionColumns() {
  return Object.fromEntries(versions.map((version) => [`v${version}`, ""]));
}

function versionColumnsForIntroduced(version, value = "available") {
  const cols = emptyVersionColumns();
  const major = String(version ?? "").split(".")[0];
  if (cols[`v${major}`] !== undefined) cols[`v${major}`] = value;
  return cols;
}

function firstAvailableVersionFromAria(ariaColumns, versionList) {
  for (let index = ariaColumns.length - 1; index >= 0; index -= 1) {
    const status = statusFromAria(ariaColumns[index]?.[0]);
    if (status && status !== "not_available") return String(versionList[index]);
  }
  return "";
}

function statusFromAria(aria = "") {
  const value = aria.toLowerCase();
  if (!value) return "";
  if (value.includes("not available")) return "not_available";
  if (value.includes("developer preview")) return "developer_preview";
  for (const status of ["experimental", "stable", "deprecated", "removed"]) {
    if (value.includes(status)) return status;
  }
  return value;
}

function extractJsonParseArray(source) {
  const match = source.match(/JSON\.parse\('((?:\\.|[^\\'])*)'\)/);
  if (!match) throw new Error("Could not find JSON.parse array in data chunk.");
  return JSON.parse(Buffer.from(match[1], "utf8").toString().replace(/\\'/g, "'"));
}

function extractJsArray(source, startNeedle, endNeedle, prefixLength) {
  const start = source.indexOf(startNeedle);
  if (start < 0) throw new Error(`Could not find start needle: ${startNeedle}`);
  const end = source.indexOf(endNeedle, start);
  if (end < 0) throw new Error(`Could not find end needle: ${endNeedle}`);
  const expression = source.slice(start + prefixLength, end + 1);
  return Function(`"use strict"; return (${expression});`)();
}

function collectLinks(item) {
  const links = [];
  if (item.metadata?.documentationUrl) links.push(item.metadata.documentationUrl);
  if (item.metadata?.rfcUrl) links.push(item.metadata.rfcUrl);
  if (item.metadata?.referenceUrl) links.push(item.metadata.referenceUrl);
  if (item.metadata?.replacementUrl) links.push(item.metadata.replacementUrl);
  for (const version of item.versions ?? []) {
    for (const link of version.metadata?.links ?? []) {
      if (link.url) links.push(link.url);
    }
    if (version.metadata?.commitUrl) links.push(version.metadata.commitUrl);
  }
  return [...new Set(links)];
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

function writeJson(name, data) {
  fs.writeFileSync(path.join(outputDir, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function writeCsv(name, rows, headers) {
  const escape = (value) => {
    const text = String(value ?? "");
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => escape(row[header])).join(","));
  }
  fs.writeFileSync(path.join(outputDir, name), `${lines.join("\n")}\n`, "utf8");
}

function writeReport(sections) {
  const lines = [
    "# Angular Can I Use Extraction Report",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## Counts",
    "",
    "| Section | Expected | Actual | Source |",
    "| --- | ---: | ---: | --- |",
    ...sections.map(
      (section) =>
        `| ${section.section} | ${section.expected_count} | ${section.actual_count} | ${section.source} |`,
    ),
    "",
    "## Artifacts",
    "",
    "- `angular-caniuse.normalized.csv` — flat table with the requested columns.",
    "- `angular-caniuse.normalized.json` — same data with raw per-row extraction metadata.",
    "- `*.raw.json` — raw section snapshots.",
    "- `manifest.json` — extraction counts, timestamps, and source URLs.",
    "- `scrape-angular-caniuse.mjs` — reproducible Playwright extractor.",
    "",
    "## Known extraction limits",
    "",
    "- Features and Diff are extracted from the client-side Angular Courses data chunk because the rendered table exposes only part of the 220-row dataset at once.",
    "- Update migrations expose item URLs and those are captured in `angular_courses_url`.",
    "- CLI migrations expose Angular documentation links where present and those are captured in `angular_dev_url`.",
    "- MCP rows do not expose stable per-item anchors in the rendered table, so the tab URL is recorded.",
    "",
  ];
  fs.writeFileSync(path.join(outputDir, "README.md"), lines.join("\n"), "utf8");
}
