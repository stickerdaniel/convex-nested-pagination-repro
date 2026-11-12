import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({ i: v.number() }),
  comments: defineTable({ i: v.number() }),
});
