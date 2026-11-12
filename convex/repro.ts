import { paginationOptsValidator } from "convex/server";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    for (let i = 0; i < 3; i++) {
      await ctx.db.insert("posts", { i });
      await ctx.db.insert("comments", { i });
    }
  },
});

export const listPosts = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: (ctx, { paginationOpts }) =>
    ctx.db.query("posts").paginate(paginationOpts),
});

export const listComments = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: (ctx, { paginationOpts }) =>
    ctx.db.query("comments").paginate(paginationOpts),
});

// Fails with MultiplePaginatedDatabaseQueries on the first page.
// Expected: { posts: 2, comments: 2 }, since each called query paginates once.
export const feed = query({
  args: {},
  handler: async (ctx): Promise<{ posts: number; comments: number }> => {
    const first = { numItems: 2, cursor: null };
    const posts = await ctx.runQuery(api.repro.listPosts, {
      paginationOpts: first,
    });
    const comments = await ctx.runQuery(api.repro.listComments, {
      paginationOpts: first,
    });
    return { posts: posts.page.length, comments: comments.page.length };
  },
});
