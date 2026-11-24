#!/usr/bin/env node
// Checks every .json file under packs/ the way the Quartets of You game does
// when it loads a pack:
//   1. the game's own rules (scripts/pack-rules.js, a copy of the game's file),
//      which explain each problem in plain words, and
//   2. the JSON Schema (schema/quartets-pack.schema.json), as a second check.
//
// Usage: node scripts/validate-packs.js [folder]   (default: packs)
// Exits with 1 if any pack has a problem. On GitHub Actions, each problem is
// also shown as an annotation on the file.
//
// MIT licensed. (c) 2026 Michael A. Heroux.

"use strict";

const fs = require("fs");
const path = require("path");
const { checkPack, FORMAT_VERSION } = require("./pack-rules.js");

const root = path.resolve(__dirname, "..");
const folder = path.resolve(root, process.argv[2] || "packs");
const onGitHub = process.env.GITHUB_ACTIONS === "true";

function loadSchemaValidator() {
  let Ajv2020;
  try {
    Ajv2020 = require("ajv/dist/2020").default;
  } catch (_) {
    console.log("Note: the schema check was skipped because Ajv isn't installed. Run `npm ci` to include it.\n");
    return null;
  }
  const schema = JSON.parse(fs.readFileSync(path.join(root, "schema", "quartets-pack.schema.json"), "utf8"));
  return new Ajv2020({ allErrors: true }).compile(schema);
}

function findJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return findJsonFiles(full);
    return entry.name.toLowerCase().endsWith(".json") ? [full] : [];
  }).sort();
}

// Finds where JSON first goes wrong and says what was expected there. Newer
// versions of Node don't include a position in JSON.parse's message, and a
// line number is what someone editing a pack by hand needs most.
function findJsonError(s) {
  let i = 0;
  const fail = what => { throw { pos: i, what }; };
  const ws = () => { while (i < s.length && " \t\r\n".includes(s[i])) i++; };
  const describe = () => i >= s.length ? "the end of the file" : s[i] === "\"" ? "a quote mark" : `"${s[i]}"`;
  function value() {
    ws();
    const ch = s[i];
    if (ch === "{") return object();
    if (ch === "[") return array();
    if (ch === "\"") return string();
    if (ch === "-" || (ch >= "0" && ch <= "9")) {
      const m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(s.slice(i));
      if (!m) fail("a number");
      i += m[0].length;
      return;
    }
    for (const word of ["true", "false", "null"]) {
      if (s.startsWith(word, i)) { i += word.length; return; }
    }
    fail(`a value (text in "double quotes", a number, a list [ ] or an object { }) but found ${describe()}`);
  }
  function string() {
    i++;
    while (i < s.length && s[i] !== "\"") {
      if (s[i] === "\n") fail("a closing \" before the end of the line");
      if (s[i] === "\\") i++;
      i++;
    }
    if (i >= s.length) fail("a closing \"");
    i++;
  }
  function object() {
    i++; ws();
    if (s[i] === "}") { i++; return; }
    for (;;) {
      ws();
      if (s[i] === "}") fail("another \"field\": value, but found } (remove the comma before it)");
      if (s[i] !== "\"") fail(`a field name in "double quotes" but found ${describe()}`);
      string(); ws();
      if (s[i] !== ":") fail(`a : after the field name but found ${describe()}`);
      i++; value(); ws();
      if (s[i] === ",") { i++; continue; }
      if (s[i] === "}") { i++; return; }
      fail(`a comma or } but found ${describe()}`);
    }
  }
  function array() {
    i++; ws();
    if (s[i] === "]") { i++; return; }
    for (;;) {
      ws();
      if (s[i] === "]") fail("another item, but found ] (remove the comma before it)");
      value(); ws();
      if (s[i] === ",") { i++; continue; }
      if (s[i] === "]") { i++; return; }
      fail(`a comma or ] but found ${describe()}`);
    }
  }
  try {
    value(); ws();
    if (i < s.length) fail(`the end of the file but found ${describe()}`);
    return null;
  } catch (e) {
    if (!e || e.pos === undefined) return null;
    const before = s.slice(0, e.pos);
    return { line: before.split("\n").length, col: e.pos - before.lastIndexOf("\n"), what: e.what };
  }
}

function jsonProblem(error, source) {
  const found = findJsonError(source);
  if (found) return { message: `expected ${found.what}`, line: found.line, col: found.col };
  return { message: error.message.replace(/\s+/g, " ") };
}

// Keeps annotations on one line, as GitHub requires.
function annotate(kind, file, message, line, col) {
  if (!onGitHub) return;
  const where = `file=${file}` + (line ? `,line=${line}` : "") + (col ? `,col=${col}` : "");
  const text = message.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
  console.log(`::${kind} ${where}::${text}`);
}

function schemaErrorText(err) {
  const where = err.instancePath ? err.instancePath.replace(/^\//, "").replace(/\//g, " > ") : "the top level";
  return `${where}: ${err.message}`;
}

const validateSchema = loadSchemaValidator();
const files = findJsonFiles(folder);
if (!files.length) {
  console.log(`No .json files found in ${path.relative(root, folder) || "."}/. Add a pack there, starting from the samples.`);
  annotate("error", path.relative(root, folder), "No pack files found.");
  process.exit(1);
}

let failed = 0;
for (const file of files) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  const source = fs.readFileSync(file, "utf8").replace(/^﻿/, "");
  let data;
  try {
    data = JSON.parse(source);
  } catch (error) {
    failed++;
    const p = jsonProblem(error, source);
    const where = p.line ? ` (line ${p.line}, column ${p.col})` : "";
    console.log(`✗ ${rel}: this isn't valid JSON${where}: ${p.message}.\n    Look for a missing comma or quote, or an extra comma before } or ].\n`);
    annotate("error", rel, `This isn't valid JSON${where}: ${p.message}.`, p.line, p.col);
    continue;
  }

  const { pack, errors, warnings } = checkPack(data);
  let schemaErrors = [];
  if (validateSchema && !validateSchema(data)) schemaErrors = validateSchema.errors || [];

  warnings.forEach(w => annotate("warning", rel, w));
  if (!errors.length && !schemaErrors.length) {
    const n = pack.puzzles.length;
    console.log(`✓ ${rel}: valid, ${n} ${n === 1 ? "puzzle" : "puzzles"}.`);
    warnings.forEach(w => console.log(`    Warning: ${w}`));
    continue;
  }

  failed++;
  if (errors.length) {
    console.log(`✗ ${rel}: ${errors.length} ${errors.length === 1 ? "problem" : "problems"} the game would reject:`);
    errors.forEach(e => { console.log(`    - ${e}`); annotate("error", rel, e); });
  } else {
    // The game's rules passed but the schema didn't. This shouldn't happen;
    // it usually means the copied rules or schema are out of date.
    console.log(`✗ ${rel}: doesn't match the schema:`);
    schemaErrors.forEach(e => { const t = schemaErrorText(e); console.log(`    - ${t}`); annotate("error", rel, `Schema: ${t}`); });
    console.log("    The game's own rules accepted this file, so scripts/pack-rules.js or schema/ may be out of date.");
  }
  warnings.forEach(w => console.log(`    Warning: ${w}`));
  console.log("");
}

const ok = files.length - failed;
console.log(`\n${ok} of ${files.length} ${files.length === 1 ? "pack" : "packs"} valid (format version ${FORMAT_VERSION}).`);
if (failed) {
  console.log("See docs/PUZZLE_FORMAT.md for every field and rule.");
  process.exit(1);
}
