# Quartets of You puzzle pack template

A starting point for writing and hosting your own puzzles for [Quartets of You](https://areflectionofyou.github.io/QuartetsOfYouGame/), the word-grouping game from [A Reflection of You](https://areflectionofyou.github.io/). Players sort sixteen words into four hidden groups of four.

This repo holds only puzzle data, documentation and a check. There's no game code to copy: everyone plays the same game at its home address, pointed at your pack with a link like this:

```
https://areflectionofyou.github.io/QuartetsOfYouGame/?pack=https://<your-name>.github.io/<repo>/packs/starter.json
```

## Make your own pack

These steps assume you have a GitHub account and know your way around a repo.

1. **Click "Use this template"** at the top of this page and create a repo in your own account or organization. **Make it public.** It doesn't need to be promoted: anyone with the link can read it, but nobody else will find it unless you share it. Don't put anything sensitive in your puzzles.
2. **Turn on GitHub Pages:** Settings, then Pages, then "Deploy from a branch", choose `main` and `/ (root)`, and save. After a minute or two your packs have stable web addresses.
3. **Edit or add pack files under [`packs/`](packs).** Start from one of the samples:
   - [`starter.json`](packs/starter.json): one puzzle, the bare minimum.
   - [`example-full.json`](packs/example-full.json): three puzzles using every field: `formatVersion`, the pack's `title`, `author`, `description` and `license`, all four voices from `bass` (easiest) to `soprano` (hardest), backstories, and a custom number of allowed mistakes.

   The [format guide](docs/PUZZLE_FORMAT.md) explains every field and rule. You can also build puzzles in the game's [Compose form](https://areflectionofyou.github.io/QuartetsOfYouGame/?compose=form) and export the JSON, or brainstorm a pack with an AI assistant by giving it the format guide.
4. **Commit the change.** The [check](.github/workflows/validate.yml) runs automatically. A green check means every pack is valid. A red cross means the game would reject something; open the run (or the file's annotations) to see which file, puzzle and field, in plain words.
5. **Open the game's [link builder](https://areflectionofyou.github.io/QuartetsOfYouGame/?compose)** and paste your pack's web address. It will look like `https://<your-name>.github.io/<repo>/packs/starter.json`. The builder test-loads the pack and tells you if anything is wrong.
6. **Copy the share link** it gives you and send it to your players.

**Why the repo must stay public:** the game loads your pack straight from your players' browsers, which can't sign in to GitHub, and GitHub Pages on free accounts only serves public repos. **Packs are live:** when you edit a pack, everyone with the link sees the new version the next time they open it.

## What's in here

| Path | What it is |
|------|------------|
| `packs/` | Your puzzle packs, one JSON file each. Add as many as you like; each gets its own link. |
| `docs/PUZZLE_FORMAT.md` | The format guide: every field, the rules, and tips for good puzzles. |
| `schema/quartets-pack.schema.json` | The formal JSON Schema for the format. |
| `scripts/pack-rules.js` | The game's own pack rules, so the check here matches what the game accepts. |
| `scripts/validate-packs.js` | The check. Run it yourself with `npm ci` and then `npm run validate` (needs [Node.js](https://nodejs.org/) 18 or later). |
| `.github/workflows/validate.yml` | Runs the check on every push and pull request. |

## When the format changes

This template follows **format version 1**. The format guide, schema and rules here are copies of the originals in the [game's repository](https://github.com/AReflectionOfYou/QuartetsOfYouGame): [`docs/PUZZLE_FORMAT.md`](https://github.com/AReflectionOfYou/QuartetsOfYouGame/blob/main/docs/PUZZLE_FORMAT.md), [`schema/quartets-pack.schema.json`](https://github.com/AReflectionOfYou/QuartetsOfYouGame/blob/main/schema/quartets-pack.schema.json) and [`pack-rules.js`](https://github.com/AReflectionOfYou/QuartetsOfYouGame/blob/main/pack-rules.js). If the game announces a new format version, copy the new files over these. Packs written for version 1 keep working: the game treats a pack without `formatVersion` as version 1.

## Your puzzles are yours

The puzzles you write belong to you, and you choose how others may use them. The optional `license` field in a pack is a good place to say so. Please write your own puzzles rather than copying them from published puzzle games, and keep photos and likenesses of real people out of your packs.

---

<sub>© 2026 Michael A. Heroux. Code and scripts are under the [MIT License](https://opensource.org/license/mit) ([LICENSE](LICENSE)); documents are under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) ([LICENSE-CONTENT](LICENSE-CONTENT)). Puzzle content in a pack belongs to its author, who can pick their own license.</sub>
