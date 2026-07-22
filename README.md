# FamilyTrails

A travel companion Progressive Web App that lets parents attach their own photos, videos, and notes to tourist points of interest — turning a generic map of attractions into a personal family travel diary.

**Live demo (Bahrain):** https://w22045113.nuwebspace.co.uk/bh_app/

<!-- Add 2-3 screenshots here once ready, e.g.:
![Home screen](./screenshots/home.png)
![POI with attached memory](./screenshots/poi-memory.png)
-->

## Why I built this

Most travel apps treat every user the same — a list of attractions with generic reviews. Parents traveling with kids need something different: a way to remember *their* trip, not just log where they went. FamilyTrails lets you pin a photo of your kid feeding the ducks at a specific park, or a voice note about a restaurant your family loved, directly onto the map location where it happened.

It started as my final year dissertation project at Northumbria University, grounded in published UX and tourism research (Nielsen Norman Group guidelines, peer-reviewed tourism literature) rather than guesswork.

## Features

- Attach photos, videos, and text notes to named points of interest on a map
- Works as an installable PWA — no app store required
- Deployed as two localized versions (UK and Bahrain) with region-specific location data
- Built mobile-first for use on the go while actually visiting a location

## Tech stack

- **React** + **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- Progressive Web App (installable, offline-capable)

## Research and validation

This wasn't just built and shipped blind. I ran a field-based usability study with 8 parents across two countries using think-aloud protocols, then analyzed the results using Braun & Clarke thematic analysis. Every design decision has a traceable rationale back to either published research or direct user feedback.

Result: unanimous positive usability ratings, with all participants confirming they'd actually use the app on a real trip.

## Running it locally

```bash
git clone https://github.com/AhmedWaleedAlsarraj/FamilyTrails.git
cd FamilyTrails
npm install
npm run dev
```

## Notes

FamilyTrails was built and deployed in two versions — UK and Bahrain — sharing the same codebase with region-specific point-of-interest data. The Bahrain version remains live; the UK version was deployed for dissertation evaluation.
