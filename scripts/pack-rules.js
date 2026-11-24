// Quartets of You: the puzzle pack rules.
//
// This file is shared. The game loads it in the browser, and the puzzle pack
// template repo runs the same file in Node to check packs before they are
// published, so both apply exactly the same rules. The original lives at
//   https://github.com/AReflectionOfYou/QuartetsOfYouGame/blob/main/pack-rules.js
// If you are reading a copy, check there for updates.
//
// checkPack() mirrors schema/quartets-pack.schema.json and adds the rules a
// schema can't express (unique words, unique quartet names). It never throws:
// it returns every problem it finds, worded for people, so a pack author (or
// an AI) can fix them all in one pass. Unknown extra fields are ignored.
//
// Code is MIT licensed. (c) 2026 Michael A. Heroux.

// Voices, from easiest to hardest. A group's voice sets its color and label.
const VOICES = ["bass", "tenor", "alto", "soprano"];
const VOICE_LABELS = { bass: "Bass", tenor: "Tenor", alto: "Alto", soprano: "Soprano" };

// The newest pack format this game understands.
const FORMAT_VERSION = 1;
const MAX_MISTAKES_LIMIT = 10;

function normalize(word) {
  return String(word).trim().toLowerCase();
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function quoted(value) {
  return isText(value) ? ` ("${value.trim().slice(0, 40)}")` : "";
}

const VOICE_LIST_TEXT = "bass, tenor, alto or soprano";

function checkGroup(group, where) {
  const errors = [];
  if (!isObject(group)) return [`${where} must be an object: { "name": ..., "words": [...] }.`];
  if (!("name" in group)) errors.push(`${where} is missing "name", the category the four words share.`);
  else if (!isText(group.name)) errors.push(`${where}: "name" must be non-empty text.`);
  if (!("words" in group)) errors.push(`${where} is missing "words", its list of four words.`);
  else if (!Array.isArray(group.words)) errors.push(`${where}: "words" must be a list of four words: ["...", "...", "...", "..."].`);
  else {
    if (group.words.length !== 4) {
      errors.push(`${where}: "words" has ${group.words.length} ${group.words.length === 1 ? "word" : "words"}; it needs exactly 4.`);
    }
    group.words.forEach((w, wi) => {
      if (!isText(w)) errors.push(`${where}: word ${wi + 1} must be non-empty text.`);
    });
  }
  if (group.voice !== undefined) {
    if (typeof group.voice !== "string" || !VOICES.includes(group.voice.toLowerCase())) {
      errors.push(`${where}: "voice" is ${JSON.stringify(group.voice)}; use ${VOICE_LIST_TEXT}.`);
    }
  }
  if (group.details !== undefined && typeof group.details !== "string") {
    errors.push(`${where}: "details" must be text.`);
  }
  return errors;
}

function checkPuzzle(p, where) {
  if (!isObject(p)) return [`${where} must be an object: { "title": ..., "groups": [...] }.`];
  const errors = [];
  ["title", "subtitle", "winMessage", "backgroundImage"].forEach(key => {
    if (p[key] !== undefined && typeof p[key] !== "string") errors.push(`${where}: "${key}" must be text.`);
  });
  if (p.maxMistakes !== undefined &&
      !(Number.isInteger(p.maxMistakes) && p.maxMistakes >= 1 && p.maxMistakes <= MAX_MISTAKES_LIMIT)) {
    errors.push(`${where}: "maxMistakes" must be a whole number from 1 to ${MAX_MISTAKES_LIMIT}.`);
  }
  if (!("groups" in p)) return [...errors, `${where} is missing "groups", its list of four quartets.`];
  if (!Array.isArray(p.groups)) return [...errors, `${where}: "groups" must be a list of four quartets.`];
  if (p.groups.length !== 4) {
    errors.push(`${where}: "groups" has ${p.groups.length} ${p.groups.length === 1 ? "quartet" : "quartets"}; it needs exactly 4.`);
  }

  const groupWhere = (g, gi) => `${where}, quartet ${gi + 1}${isObject(g) ? quoted(g.name) : ""}`;
  p.groups.forEach((g, gi) => errors.push(...checkGroup(g, groupWhere(g, gi))));
  const groups = p.groups.filter(isObject);

  // Voices: all or none, each used once.
  const named = groups.filter(g => g.voice !== undefined);
  if (named.length && named.length !== p.groups.length) {
    errors.push(`${where}: some quartets name a "voice" and some don't. Give all four a voice (${VOICE_LIST_TEXT}, each once), or leave it out of all four.`);
  } else if (named.length) {
    const counts = {};
    named.forEach(g => {
      const v = String(g.voice).toLowerCase();
      if (VOICES.includes(v)) counts[v] = (counts[v] || 0) + 1;
    });
    const repeated = VOICES.filter(v => counts[v] > 1);
    if (repeated.length) {
      const missing = VOICES.filter(v => !counts[v]);
      errors.push(`${where}: each voice is used once. ${repeated.map(v => VOICE_LABELS[v]).join(" and ")} ${repeated.length === 1 ? "is" : "are"} used more than once` +
        (missing.length ? `; ${missing.map(v => VOICE_LABELS[v]).join(" and ")} ${missing.length === 1 ? "is" : "are"} missing.` : "."));
    }
  }

  // Unique words across the whole puzzle, ignoring case and spaces.
  const seen = new Map();
  p.groups.forEach((g, gi) => {
    if (!isObject(g) || !Array.isArray(g.words)) return;
    g.words.forEach(w => {
      if (!isText(w)) return;
      const k = normalize(w);
      if (!seen.has(k)) seen.set(k, { word: w.trim(), quartets: [] });
      seen.get(k).quartets.push(gi + 1);
    });
  });
  seen.forEach(({ word, quartets }) => {
    if (quartets.length < 2) return;
    const whereList = new Set(quartets).size === 1 ? `twice in quartet ${quartets[0]}` : `in quartets ${quartets.join(" and ")}`;
    errors.push(`${where}: "${word}" appears ${whereList}. All sixteen words must be different (upper and lower case count as the same).`);
  });

  // Unique quartet names: the game tells quartets apart by name.
  const names = new Map();
  groups.forEach(g => {
    if (!isText(g.name)) return;
    const k = normalize(g.name);
    if (!names.has(k)) names.set(k, { name: g.name.trim(), count: 0 });
    names.get(k).count += 1;
  });
  names.forEach(({ name, count }) => {
    if (count > 1) errors.push(`${where}: ${count} quartets are named "${name}". Each quartet needs its own name.`);
  });
  return errors;
}

// Accepts a pack ({ puzzles: [...] }) or a single puzzle ({ groups: [...] }).
// Returns { pack, errors, warnings }. pack is null when the file can't be read
// as either shape; otherwise it is a normalized pack (always with "puzzles").
function checkPack(data) {
  const errors = [];
  const warnings = [];
  if (!isObject(data)) {
    return { pack: null, errors: ["The file must hold one JSON object, starting with { and ending with }."], warnings };
  }
  let version = 1;
  if (data.formatVersion !== undefined) {
    if (!Number.isInteger(data.formatVersion) || data.formatVersion < 1) {
      errors.push(`"formatVersion" must be a whole number such as 1.`);
    } else {
      version = data.formatVersion;
      if (version > FORMAT_VERSION) {
        warnings.push(`This pack uses format version ${version}, and this game understands version ${FORMAT_VERSION}. It may not play exactly as its author intended.`);
      }
    }
  }
  const hasPuzzles = "puzzles" in data;
  const hasGroups = "groups" in data;
  if (hasPuzzles && hasGroups) {
    errors.push(`The file has both "puzzles" and "groups" at the top. A pack lists its puzzles under "puzzles"; a single puzzle has "groups". Use one or the other.`);
    return { pack: null, errors, warnings };
  }
  if (!hasPuzzles && !hasGroups) {
    errors.push(`The file needs a "puzzles" list (for a pack) or a "groups" list (for a single puzzle).`);
    return { pack: null, errors, warnings };
  }

  let pack;
  if (hasPuzzles) {
    ["title", "author", "description", "license"].forEach(key => {
      if (data[key] !== undefined && typeof data[key] !== "string") errors.push(`The pack's "${key}" must be text.`);
    });
    if (!Array.isArray(data.puzzles)) {
      errors.push(`"puzzles" must be a list of puzzles: [ { ... }, { ... } ].`);
      return { pack: null, errors, warnings };
    }
    if (!data.puzzles.length) errors.push(`"puzzles" is empty. A pack needs at least one puzzle.`);
    data.puzzles.forEach((p, i) => {
      errors.push(...checkPuzzle(p, `Puzzle ${i + 1}${isObject(p) ? quoted(p.title) : ""}`));
    });
    pack = { ...data, formatVersion: version };
  } else {
    errors.push(...checkPuzzle(data, `The puzzle${quoted(data.title)}`));
    pack = { formatVersion: version, title: data.title, puzzles: [data] };
  }
  return { pack, errors, warnings };
}

// In Node (the template repo's check), export the rules.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { checkPack, checkPuzzle, FORMAT_VERSION, VOICES };
}
