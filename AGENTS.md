<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Working on this repo (Ana's rules)

Ana is the only person who merges, and she reads the live site, not the
repo. Several Claude sessions can be open on it at once — in October 2026
one session kept describing the "be thankful" note while another had
already reworked it three times through its own PRs (#2–#4), and Ana went
looking for a version that no longer existed. These rules exist so that
can't happen again. Talk to Ana in Rioplatense Spanish.

## `main` is the only source of truth

- **Start from `main`.** Before changing anything, fetch `origin/main` and
  bring it into the session branch. If the branch's PR was already merged,
  restart the branch from `origin/main` instead of stacking on it.
- **Look at what changed since you last looked.** Run
  `git log --oneline -10 origin/main` and, if the files you're about to
  touch changed recently (another session, Ana herself), say so to Ana in
  one line before working on top of them. Never describe a page from memory
  of what you built: describe what `main` holds now.
- **One note, one session.** If Ana keeps iterating the same note, it should
  happen in the same conversation. If you find another session's open PR or
  recent merges on the same files, tell her instead of building a parallel
  version.

## Design first, and the smallest change that serves it

- **The design leads; technique serves it.** Don't trim a design to dodge a
  technical limit without first exhausting the technical options — then show
  Ana and let her decide.
- **Fix the note before the system.** Every /rndm note shares one sheet
  (`note-sheet.tsx`, `use-swipe-dismiss.ts`). If one note misbehaves and the
  others don't, find what's different about that note (in October 2026 it
  was the only one taller than a phone's sheet) before touching the shared
  code — and never rewrite shared infrastructure, or swap it for a library,
  without asking. When the shared code does change, check every note, opened
  from the index and by its own URL, on a small phone (375x667) and a common
  one (390x664, Safari's bars showing).
- **Don't hand-roll what has a proven answer.** Ana's `design-system` repo and
  Emil Kowalski's skills (github.com/emilkowalski/skill) are the reference for
  motion, sheets and mobile behaviour.

## Closing: merged is not live

- **End with a PR to `main`** whenever you pushed work. Work isn't saved
  until it's in `main`.
- **When Ana wants to see a change, merge it** and send her the anavare.la
  link once the deploy is live: Vercel's preview links are harder for her to
  open on the phone than production. Anything she hasn't asked to see yet
  still waits on her "Merge".
- **Vercel deploys `main` to production on every merge**, and it takes a
  minute or two. Until then anavare.la still shows the previous version.
  Tell Ana to wait for the green ✓ next to the latest commit on GitHub
  (a yellow dot means it's still building).
- **After she merges, confirm the deploy yourself** before saying it's live.
  The repo is public, so the GitHub API works without auth:

  ```
  # "success" + "Deployment has completed" = live in production
  curl -s https://api.github.com/repos/rawwwpower/anavare-la/commits/main/status \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['state'], [s['description'] for s in d['statuses']])"
  ```

  `pending` means still building: say so, don't call it done. The cloud
  sandbox's proxy blocks anavare.la itself, so this status is the check —
  don't claim to have seen the live page.
