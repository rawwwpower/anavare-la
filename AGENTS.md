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

## Closing: merged is not live

- **End with a PR to `main`** whenever you pushed work, and tell Ana it's
  waiting for her "Merge". Work isn't saved until it's in `main`.
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
