# WorkReady Finance

WorkReady Finance is a local-first React + Vite learning app for scenario-based financial education. It currently runs without any API keys or backend services. All learning flows, topic briefings, and assessments are generated from local TypeScript data.

This README is intended for developers who need to maintain or extend the app.

## Contents

1. Project overview
2. Stack and dependencies
3. Run and build
4. Application flow and "routes"
5. Data model
6. File and folder guide
7. Component guide
8. How content is generated
9. How to make common changes
10. State management notes
11. Known limitations and cleanup opportunities

## Project Overview

The application provides:

- A landing page with role selection
- A dashboard listing finance modules
- A module page listing topic cards
- A topic detail page with:
  - a local mission briefing
  - key learning points
  - a local practice bank
  - lecturer-side test bank editing
- An assessment page that steps through local questions

There is no URL-based routing library in use. The app uses a view-state pattern inside [`App.tsx`](./App.tsx) to switch screens.

## Stack And Dependencies

### Runtime

- `react`
- `react-dom`
- `lucide-react`
- `clsx`

### Dev / build

- `vite`
- `@vitejs/plugin-react`
- `typescript`
- `@types/node`

### Styling

- Tailwind is loaded from `cdn.tailwindcss.com` in [`index.html`](./index.html)
- Global animations and font rules live in [`styles.css`](./styles.css)
- Google Fonts is imported from `styles.css`

### What is not used anymore

The project no longer uses:

- Gemini
- any API keys
- `react-markdown`
- chat or voice features
- server-side data fetching

If you see references to those in old build artifacts under `dist/`, they are stale generated output and not part of the source implementation.

## Run And Build

### Requirements

- Node.js
- npm

### Install

```bash
npm install
```

### Start dev server

```bash
npm run dev
```

Default local URL:

```text
http://127.0.0.1:3000/
```

Vite is configured in [`vite.config.ts`](./vite.config.ts) to run on port `3000` and host `0.0.0.0`.

### Production build

```bash
npm run build
```

### Preview built output

```bash
npm run preview
```

### Optional helper script

[`scripts/start-dev-server.cjs`](./scripts/start-dev-server.cjs) is a local helper that starts Vite in the background and writes logs to `.codex-logs/`. It is not required for normal development.

## Application Flow And "Routes"

The app uses internal view state rather than React Router.

Defined view states in [`App.tsx`](./App.tsx):

- `login`
- `dashboard`
- `module`
- `topic`
- `assessment`

### View flow

1. `login`
   - user chooses `student` or `lecturer`
2. `dashboard`
   - shows all modules from [`constants.ts`](./constants.ts)
3. `module`
   - shows all topics for the selected module
4. `topic`
   - shows topic briefing and practice/test bank
5. `assessment`
   - presents one question at a time from the current topic's local test bank

### Navigation callbacks

Navigation is controlled by local handlers in [`App.tsx`](./App.tsx):

- `handleLogin`
- `handleSelectModule`
- `handleSelectTopic`
- `handleStartAssessment`
- `handleBackToDashboard`
- `handleBackToModule`
- `handleLogout`

There are no URL routes like `/dashboard` or `/topic/:id`. If you want bookmarkable routes later, you would need to introduce a routing layer and move view state into route params.

## Data Model

Core types live in [`types.ts`](./types.ts).

### Main types

- `Role`
  - `'student' | 'lecturer'`
- `ModuleId`
  - `'accounting' | 'investment' | 'management' | 'fintech'`
- `Topic`
  - `id`, `title`, `moduleId`
- `Module`
  - `id`, `title`, `description`, `icon`, `lead`, `topics`
- `Question`
  - `id`, `text`, `options`, `correctAnswerIndex`, `explanation`, `difficulty`, `type`, `isCustom?`
- `AssessmentState`
  - local assessment UI state
- `MissionDossier`
  - local topic briefing content

### Legacy types / fields

Some fields exist for compatibility with the older version of the app:

- `Question.type` still allows `'new' | 'remedial' | 'bank'`
- `TestBank` interface still exists

In the current implementation, questions are effectively local test-bank questions, and the app does not use release/lock states or generated question modes anymore.

## File And Folder Guide

### Root files

- [`App.tsx`](./App.tsx)
  - app shell, view state, navigation, role state, selected module/topic state, test bank state
- [`index.tsx`](./index.tsx)
  - React entry point
- [`index.html`](./index.html)
  - document shell, favicon, Tailwind CDN script
- [`styles.css`](./styles.css)
  - global font and animation classes
- [`constants.ts`](./constants.ts)
  - module and topic catalog
- [`content.ts`](./content.ts)
  - local content generation for topic dossiers and local question sets
- [`types.ts`](./types.ts)
  - shared TypeScript types
- [`vite.config.ts`](./vite.config.ts)
  - Vite config
- [`package.json`](./package.json)
  - scripts and dependencies
- [`metadata.json`](./metadata.json)
  - project metadata from earlier setup; currently informational only

### Components

- [`components/Dashboard.tsx`](./components/Dashboard.tsx)
- [`components/TopicDetail.tsx`](./components/TopicDetail.tsx)
- [`components/Assessment.tsx`](./components/Assessment.tsx)
- [`components/TestBankManager.tsx`](./components/TestBankManager.tsx)
- [`components/Button.tsx`](./components/Button.tsx)

### Other folders

- [`scripts`](./scripts)
  - helper utilities, currently only `start-dev-server.cjs`
- [`services`](./services)
  - currently empty after removal of Gemini integration
- [`dist`](./dist)
  - generated build output, should not be edited manually
- [`.codex-logs`](./.codex-logs)
  - local runtime logs generated by helper scripts

## Component Guide

### `App`

File: [`App.tsx`](./App.tsx)

Responsibilities:

- stores current `userRole`
- stores selected `currentModule`
- stores selected `currentTopic`
- stores current `view`
- stores assessment `difficulty`
- stores editable per-topic question banks in `testBanks`
- renders the sidebar and main content switch

Important note:

- The initial test bank state is built from `MODULES` via `buildInitialTestBanks(MODULES)`
- This means topic questions are generated locally at app startup

### `Dashboard`

File: [`components/Dashboard.tsx`](./components/Dashboard.tsx)

Responsibilities:

- renders all modules as cards
- maps module icon names to Lucide icons
- delegates module selection upward with `onSelectModule`

Developer notes:

- module card styles use `gradientMap` and `bgMap`
- if you add a new module ID, update those maps as well

### `TopicDetail`

File: [`components/TopicDetail.tsx`](./components/TopicDetail.tsx)

Responsibilities:

- derives topic content from `getTopicContent(topic, module)`
- renders the local mission briefing
- renders expandable learning points
- shows student practice-bank preview
- shows lecturer editing UI through `TestBankManager`
- launches assessments at chosen difficulty

Developer notes:

- `questions` prefers edited `testBankQuestions` from app state; otherwise it falls back to generated local defaults
- the right sidebar controls assessment difficulty

### `Assessment`

File: [`components/Assessment.tsx`](./components/Assessment.tsx)

Responsibilities:

- consumes a topic-specific `testBank`
- chooses questions in sequence while avoiding repeats
- prefers same-difficulty questions, then falls back to any remaining questions
- adapts difficulty upward on correct answers
- softens from `hard` back to `medium` after incorrect answers
- tracks score and history

Developer notes:

- question selection logic is in `selectNextQuestion`
- used question indices are tracked in a `useRef(Set<number>)`
- loading is simulated with a short timeout for UX pacing

### `TestBankManager`

File: [`components/TestBankManager.tsx`](./components/TestBankManager.tsx)

Responsibilities:

- lecturer-only editor for local question sets
- add, edit, save, and delete questions
- allows setting:
  - question text
  - difficulty
  - options
  - correct answer
  - explanation

Developer notes:

- edits are local/in-memory only
- there is no persistence layer
- reloading the page resets edits back to generated defaults

### `Button`

File: [`components/Button.tsx`](./components/Button.tsx)

Responsibilities:

- shared button styling
- variants: `primary`, `secondary`, `danger`, `ghost`
- sizes: `sm`, `md`, `lg`
- optional loading state

## How Content Is Generated

Topic content is not stored as one large hardcoded object per topic anymore.

Instead, [`content.ts`](./content.ts) uses:

- one `ModuleTemplate` per module category
- the selected topic title to fill in dossier and question text

This gives each topic:

- a `MissionDossier`
- 3 local questions:
  - one `easy`
  - one `medium`
  - one `hard`

### Key functions

- `getTopicContent(topic, module)`
  - returns dossier + questions for one topic
- `buildInitialTestBanks(modules)`
  - builds the startup question-bank record for all topics

### Why this matters

If you change a template in `content.ts`, you change every topic inside that module family.

Examples:

- editing the `accounting` template affects `acc_1` through `acc_4`
- editing the `fintech` template affects `fin_1` through `fin_4`

If you need unique content for one topic only, you currently have two options:

1. Extend `content.ts` to support per-topic overrides
2. Edit the question bank at runtime in lecturer mode

Option 1 is the maintainable approach if topic-specific content should ship in source control.

## How To Make Common Changes

### Add a new module

1. Add the module to [`constants.ts`](./constants.ts)
2. Add its topics there
3. Extend `ModuleId` in [`types.ts`](./types.ts)
4. Add icon/color mappings in [`components/Dashboard.tsx`](./components/Dashboard.tsx)
5. Add a matching template in [`content.ts`](./content.ts)

If you skip step 4 or 5, the app may still compile but the UI or content generation will be incomplete.

### Add a new topic to an existing module

1. Add the topic entry to that module in [`constants.ts`](./constants.ts)
2. The app will automatically generate local dossier and question content for it through `content.ts`

No router changes are needed because the app is state-driven.

### Change the landing page copy

Edit the login view inside [`App.tsx`](./App.tsx).

### Change the module catalog

Edit [`constants.ts`](./constants.ts).

This file defines:

- module titles
- descriptions
- leads
- topic titles
- topic IDs

### Change the question-generation pattern

Edit [`content.ts`](./content.ts).

Typical changes:

- update the `keyPoints`
- change question wording
- change answer strategy
- add more than three questions per topic

If you add more questions per topic, ensure the assessment UI still gives the experience you want.

### Change assessment progression

Edit [`components/Assessment.tsx`](./components/Assessment.tsx).

Places to look:

- `selectNextQuestion`
- `loadQuestion`
- `handleNext`

### Persist lecturer edits

This is not implemented yet.

Current state:

- edits live only in React state inside [`App.tsx`](./App.tsx)
- refresh resets everything

To add persistence, common options would be:

1. `localStorage`
2. indexed DB
3. a backend API
4. file-based storage in an Electron/Tauri wrapper

If you add persistence, the main integration point is the `testBanks` state in [`App.tsx`](./App.tsx).

## State Management Notes

There is no Redux, Zustand, or context store.

State is managed with React `useState` in `App` and passed down through props.

### App-level state

- `userRole`
- `currentModule`
- `currentTopic`
- `view`
- `difficulty`
- `testBanks`

### Local component state

- `TopicDetail`
  - selected difficulty
  - expanded learning point
- `Assessment`
  - assessment state
  - used question tracking
- `TestBankManager`
  - edit form state
  - current editing question

This is simple and workable for the current scale. If the app grows significantly, consider moving to:

- route-based navigation
- a shared store
- persisted content editing

## Known Limitations And Cleanup Opportunities

### 1. No persistent content editing

Lecturer edits disappear on refresh.

### 2. No real routing

The app uses internal state, which means:

- no deep links
- no browser-history support between pages
- no direct reload into a topic/assessment view

### 3. Tailwind via CDN

`cdn.tailwindcss.com` is fine for lightweight local use, but it is not ideal for a production-grade frontend workflow.

If you want a more standard setup:

- install Tailwind as a dev dependency
- move config to a local Tailwind config
- remove the CDN script from [`index.html`](./index.html)

### 4. `services/` is now empty

This folder used to hold Gemini-related code. It can be deleted if you want the repo structure to reflect the current implementation more strictly.

### 5. Some types are legacy

Examples:

- `Question.type` values beyond `bank`
- `TestBank` interface

These do not currently break anything, but they reflect the earlier AI-generated design.

### 6. Generated `dist/` output may contain old code until rebuilt

Do not trust `dist/` as source documentation. Always inspect source files first.

## Suggested Developer Workflow

1. Update source files, not `dist/`
2. Run:

```bash
npm run build
```

3. Smoke-test the main flow:
   - login
   - dashboard
   - module
   - topic
   - assessment
4. If you changed lecturer editing, also test:
   - lecturer login
   - topic editing
   - add/edit/delete question

## Current Source Of Truth

For most work, these are the highest-value files:

- [`App.tsx`](./App.tsx)
- [`constants.ts`](./constants.ts)
- [`content.ts`](./content.ts)
- [`components/TopicDetail.tsx`](./components/TopicDetail.tsx)
- [`components/Assessment.tsx`](./components/Assessment.tsx)
- [`components/TestBankManager.tsx`](./components/TestBankManager.tsx)
- [`types.ts`](./types.ts)

If you understand those files, you understand almost all of the app.
