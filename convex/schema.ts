import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  authStates: defineTable({
    key: v.string(),
    state: v.any(), // 'any' because it's json we don't know the shape of
  }).index("by_key", ["key"]),

  sessions: defineTable({
    did: v.string(),
    session: v.any(), // 'any' because it's JSON we don't know the shape of
  }).index("by_did", ["did"]),
});
