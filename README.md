# Nested pagination repro for Convex

A query that calls two paginated queries with `ctx.runQuery` fails with `MultiplePaginatedDatabaseQueries`, even on the first page. The outer query does not paginate itself.

## Run

```sh
npm install
export CONVEX_AGENT_MODE=anonymous
npx convex dev --once
npx convex run repro:seed
npx convex run repro:feed
```

`CONVEX_AGENT_MODE=anonymous` starts a local backend without a Convex account.

## Expected

`repro:feed` returns `{ "comments": 2, "posts": 2 }`. [`listPosts`](convex/repro.ts#L15-L19) and [`listComments`](convex/repro.ts#L21-L25) each paginate once.

## Actual

`repro:feed` throws at the [second `ctx.runQuery`](convex/repro.ts#L36) in `feed`:

> Uncaught Error: This query function ran multiple paginated queries. Convex only supports a single paginated query in each query function.

## Versions

Tested with [`convex` 1.49.0](https://www.npmjs.com/package/convex/v/1.49.0) and three local backends:

- [2026-10-10, `72ce13c`](https://github.com/convex/convex-backend/releases/tag/precompiled-2026-10-10-72ce13c): passes.
- [2026-10-22, `1447815`](https://github.com/convex/convex-backend/releases/tag/precompiled-2026-10-22-1447815): fails.
- [2026-11-11, `2ad4bf9`](https://github.com/convex/convex-backend/releases/tag/precompiled-2026-11-11-2ad4bf9): fails.

To run the older backend, use this in a fresh clone:

```sh
npx convex dev --once \
  --local-backend-version \
  precompiled-2026-10-10-72ce13c
```

## Likely cause

Commit [`d7402d6`](https://github.com/convex/convex-backend/commit/d7402d6a5829891fc9d6f810592da7bd6df1b340), "support reactive pagination in component queries", landed between the passing and failing backends. It passes the caller's query journal to nested queries, so one query can paginate only once across all queries it calls.

## Related

- The [paginated queries docs](https://docs.convex.dev/database/pagination) don't mention this limit.
- The [component authoring docs](https://docs.convex.dev/components/authoring#pagination) describe it for component queries.
- [Original report on X](https://x.com/sticker_daniel/status/2120366285133680784).
