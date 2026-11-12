# Nested pagination repro for Convex

A query that calls two paginated queries with `ctx.runQuery` fails with `MultiplePaginatedDatabaseQueries`, even on the first page. The outer query does not paginate itself.

## Run

```sh
npm install
CONVEX_AGENT_MODE=anonymous npx convex dev --once
npx convex run repro:seed
npx convex run repro:feed
```

`CONVEX_AGENT_MODE=anonymous` starts a local backend without a Convex account.

## Expected

```json
{ "comments": 2, "posts": 2 }
```

`listPosts` and `listComments` each paginate once.

## Actual

```
Uncaught Error: This query function ran multiple paginated queries. Convex only supports a single paginated query in each query function.
    at async handler (../convex/repro.ts:36:6)
```

Line 36 is the second `ctx.runQuery` in `feed`.

## Versions

`convex` 1.49.0 with these local backends:

| Backend | `repro:feed` |
| --- | --- |
| `precompiled-2026-10-10-72ce13c` | `{ comments: 2, posts: 2 }` |
| `precompiled-2026-10-22-1447815` | `MultiplePaginatedDatabaseQueries` |
| `precompiled-2026-11-11-2ad4bf9` | `MultiplePaginatedDatabaseQueries` |

To run an older backend, add `--local-backend-version precompiled-2026-10-10-72ce13c` to `npx convex dev --once` in a fresh clone.

The change between those backends is likely get-convex/convex-backend@d7402d6 (#59649), which passes the caller's query journal to nested queries.
