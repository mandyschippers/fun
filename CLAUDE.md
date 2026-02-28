# fun

## Project Overview
This is to be a personal website in the style of the best 90s personal websites. That means it's over the top, pixelated, interactive, fun. It's okay to use all of modern web technology but that's the look and feel I'd like to go for. What is it about? That doesn't matter too much, we can just put 'Welcome to the Realm'. It'll have a greenish background and you can navigate it with arrows to reach fun little objects that you can interact with, like in the original Zelda. I like the following movies and shows: Lord of the rings, star wars, star trek, mythic quest, silicon valley, dead pixels. I like absurdist comedy. I'd like it to have a fantasy theme but also scifi elements, and I want it to be very funny. What can people do on this website? Well it mostly feels like a game though this is very much not yet decided. For now it can just be a landing page that feels like a game. A game where you watch from sort of a top view, like the original zelda and move a character around. 

## Tech Stack
- It's just a front end so html/css/javascript. feel free to thrown in typescript and a framework. in fact that is probably a good idea.

## Common Commands
# Add your build/run commands here

## Session Startup Protocol
On every session start:
1. Run `pwd` to confirm working directory
2. Run `/claude-harness:start` to compile working context
3. Read `.claude-harness/sessions/{session-id}/context.json` for computed context
4. Check `.claude-harness/features/active.json` for current priorities

## Development Rules
- Work on ONE feature at a time
- Always run /claude-harness:checkpoint after completing work
- Run tests before marking features complete
- Commit with descriptive messages
- Leave codebase in clean, working state

## Testing Requirements
<!-- Add your test commands -->
- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm test`
- Typecheck: `npx tsc --noEmit`

## Progress Tracking
See: `.claude-harness/sessions/{session-id}/context.json` and `.claude-harness/features/active.json`

## Memory Architecture (v3.0)
- `sessions/{session-id}/` - Current session context (per-session, gitignored)
- `memory/episodic/` - Recent decisions (rolling window)
- `memory/semantic/` - Project knowledge (persistent)
- `memory/procedural/` - Success/failure patterns (append-only)
- `memory/learned/` - Rules from user corrections (append-only)

