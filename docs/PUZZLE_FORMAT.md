# The Quartets of You puzzle format

This guide explains how to write a **puzzle pack** for Quartets of You by hand, or how to ask an AI assistant to write one for you. A pack is one plain text file in JSON format that holds one or more puzzles. Put it online and anyone can play it with a link; you don't need to change the game.

This guide describes **format version 1**. The original lives in the [game's repository](https://github.com/AReflectionOfYou/QuartetsOfYouGame/blob/main/docs/PUZZLE_FORMAT.md); if you're reading a copy, check there for updates.

The formal definition is the JSON Schema in [schema/quartets-pack.schema.json](../schema/quartets-pack.schema.json). This guide says the same thing in plain language.

## What a puzzle is

Each puzzle has sixteen words that hide **four quartets** of four words each. Each quartet has a category (what its four words share) and a **voice**, which sets its difficulty and color:

| Voice     | Difficulty |
|-----------|------------|
| `bass`    | easiest    |
| `tenor`   |            |
| `alto`    |            |
| `soprano` | hardest    |

Players tap four words they think belong together. A wrong guess is a "bum note", and four bum notes end the game.

## A complete example

Copy this and change the words. It's also in [example-pack.json](https://github.com/AReflectionOfYou/QuartetsOfYouGame/blob/main/docs/example-pack.json), and you can [play it in the game](https://areflectionofyou.github.io/QuartetsOfYouGame/?pack=docs/example-pack.json).

```json
{
  "formatVersion": 1,
  "title": "Sunday Afternoons",
  "author": "The Quartets of You project",
  "description": "Two small puzzles to show how a pack works. Copy this file and make it your own.",
  "license": "CC BY 4.0",
  "puzzles": [
    {
      "title": "Weekend Picnic",
      "subtitle": "Spread the blanket and sort the basket.",
      "winMessage": "Not an ant in sight. Well played!",
      "groups": [
        {
          "name": "Picnic food",
          "voice": "bass",
          "words": ["Sandwich", "Lemonade", "Watermelon", "Potato salad"]
        },
        {
          "name": "Kinds of blanket",
          "voice": "tenor",
          "words": ["Wool", "Fleece", "Security", "Electric"],
          "details": "A security blanket is the one a small child won't let go of."
        },
        {
          "name": "___ball",
          "voice": "alto",
          "words": ["Basket", "Foot", "Meat", "Snow"],
          "details": "Basketball, football, meatball and snowball. Basket was the decoy for the picnic."
        },
        {
          "name": "Starts with a bird",
          "voice": "soprano",
          "words": ["Crowbar", "Henna", "Owlish", "Wrenching"],
          "details": "CROWbar, HENna, OWLish and WRENching."
        }
      ]
    },
    {
      "title": "Rainy Day",
      "subtitle": "Stuck indoors? Sort these while you wait for the sun.",
      "groups": [
        {
          "name": "Card games",
          "voice": "bass",
          "words": ["Snap", "Rummy", "Solitaire", "Poker"]
        },
        {
          "name": "Things you pour from",
          "voice": "tenor",
          "words": ["Teapot", "Pitcher", "Jug", "Kettle"]
        },
        {
          "name": "___drop",
          "voice": "alto",
          "words": ["Rain", "Dew", "Back", "Tear"],
          "details": "Raindrop, dewdrop, backdrop and teardrop."
        },
        {
          "name": "Umbrella ___",
          "voice": "soprano",
          "words": ["Stand", "Term", "Policy", "Organization"],
          "details": "An umbrella stand, an umbrella term, an umbrella policy and an umbrella organization."
        }
      ]
    }
  ]
}
```

## The pack

The file is one JSON object, `{ ... }`, with these fields:

| Field           | Required | What it is |
|-----------------|----------|------------|
| `formatVersion` | no       | The version of this format. Use `1`. If it's missing, the game assumes 1. |
| `title`         | no       | The pack's name, shown above its list of puzzles. |
| `author`        | no       | Who made the pack. |
| `description`   | no       | A sentence or two about the pack, shown under the title. |
| `license`       | no       | How others may use your puzzles, for example `"CC BY 4.0"` or `"All rights reserved"`. |
| `puzzles`       | **yes**  | A list of one or more puzzles: `[ { ... }, { ... } ]`. |

A pack with only one puzzle opens straight into that puzzle. A pack with several shows a list to pick from.

## Each puzzle

| Field             | Required | What it is |
|-------------------|----------|------------|
| `title`           | no, but recommended | The puzzle's name. Without one, the game calls it "Puzzle 1", "Puzzle 2" and so on. Compose requires it. |
| `subtitle`        | no       | A line shown under the title while playing. |
| `winMessage`      | no       | Shown when the player finds every quartet. |
| `maxMistakes`     | no       | How many wrong guesses the player gets, a whole number from 1 to 10. If it's missing, the game allows 4. |
| `backgroundImage` | no       | The web address of a faint background image. A relative path, like `images/garden.jpg`, is read relative to the pack file's own address. |
| `groups`          | **yes**  | Exactly four quartets. |

## Each quartet (group)

| Field     | Required | What it is |
|-----------|----------|------------|
| `name`    | **yes**  | The category: what the four words have in common. Players see it once they solve the quartet. |
| `words`   | **yes**  | Exactly four words or short phrases: `["...", "...", "...", "..."]`. |
| `voice`   | no       | `"bass"`, `"tenor"`, `"alto"` or `"soprano"`. Upper or lower case both work. |
| `details` | no       | A backstory that pops up when the quartet is solved: why the answer works, or a family joke behind it. |

## The rules

The game checks these when it loads a pack, and tells you exactly which puzzle and quartet breaks one:

1. A pack has at least one puzzle.
2. Every puzzle has **exactly four** quartets.
3. Every quartet has a `name` and **exactly four** `words`. Names and words can't be blank.
4. All **sixteen words in a puzzle are different**. Upper and lower case count as the same, so `"Lime"` and `"lime"` clash. The same word can appear in two *different* puzzles.
5. The four quartet **names in a puzzle are different**, also ignoring case.
6. **Voices: all or none.** Either give every quartet a `voice` and use each of the four voices exactly once, or leave `voice` out of all four. Without voices, the quartets take their voices from their order in the file: the first is Bass, then Tenor, Alto and Soprano.
7. Text fields must be text (in quotes), and `maxMistakes` must be a whole number from 1 to 10.

The game ignores fields it doesn't know, so you can add your own notes (for example `"notes": "for Grandma's 90th"`) without breaking anything. If a pack says it uses a newer `formatVersion` than the game understands, the game warns the player and plays it as best it can.

### A single puzzle on its own

A file can also hold just one puzzle, with `groups` at the top level instead of a `puzzles` list. This is how the built-in puzzles in the game's [puzzles](https://github.com/AReflectionOfYou/QuartetsOfYouGame/tree/main/puzzles) folder are written, and it still works anywhere a pack does:

```json
{
  "title": "Opening Night",
  "groups": [ { "name": "...", "voice": "bass", "words": ["...", "...", "...", "..."] }, "... three more ..." ]
}
```

A file can't have both `puzzles` and `groups` at the top.

## Tips for good puzzles

- Make the Bass quartet a gentle start and save the trickiest connection for Soprano.
- The fun is in the **decoys**: words that seem to fit two quartets. In the example, "Basket" looks like picnic gear but belongs to `___ball`.
- Fill-in-the-blank categories (`___ball`, `Umbrella ___`) and hidden words (`CROWbar`) make good Alto and Soprano quartets.
- Keep words short enough to fit on a tile: one or two words, about 15 characters at most.
- Write your own puzzles. Don't copy categories or word sets from other published puzzle games.

## Sharing a pack

1. Save the pack as a `.json` file.
2. Put it online somewhere that allows **cross-origin access**, which lets the game read the file from another website. Two free options that work:
   - **GitHub Pages**: add the file to a repository with Pages turned on. Its address looks like `https://yourname.github.io/my-puzzles/reunion.json`.
   - **A GitHub gist**: create a gist, then press **Raw** and use that address (it starts with `https://gist.githubusercontent.com/`). Not the gist's normal web page.
   Many file-sharing sites (Dropbox, Google Drive) don't allow cross-origin access, so the game can't read packs from them.
3. Share the game's address followed by `?pack=` and your pack's address:
   `https://areflectionofyou.github.io/QuartetsOfYouGame/?pack=https://yourname.github.io/my-puzzles/reunion.json`

The game's [Compose page](https://areflectionofyou.github.io/QuartetsOfYouGame/?compose) has a helper that tests your pack's address and builds this link for you, so you know it works before you send it.

**The easy way to host packs:** the [puzzle pack template](https://github.com/AReflectionOfYou/quartets-puzzle-pack-template) is a ready-made GitHub repository for your packs. Press **Use this template**, turn on GitHub Pages, and edit the sample packs. A check runs on every commit and tells you, in plain words, about anything the game would reject.

## Asking an AI assistant to write a pack

Give the assistant this whole guide and ask for what you want, for example:

> Using the Quartets of You format below, write a pack of three puzzles about our family's camping trips. Use these people and places: ... Reply with only the JSON.

Then open the game's [Compose form](https://areflectionofyou.github.io/QuartetsOfYouGame/?compose=form), choose **Open a pack**, and paste the answer in. Compose checks it against the rules above, points out anything to fix, and lets you try each puzzle before you share it. Check the puzzles yourself, too: AI assistants make mistakes, especially with hidden words and fill-in-the-blank categories.

## Who owns a pack

You do. The game's code is MIT licensed and its own documents and images are CC BY 4.0, but a puzzle pack you write belongs to you, and you choose how others may use it. The optional `license` field is a good place to say so. The game only reads packs; it never stores or uploads them.
