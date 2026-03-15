import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAccountStatus = query({
  args: { did: v.string() },
  handler: async (ctx, args) => {
    const statuses = await ctx.db
      .query("statuses")
      .withIndex("by_author_recent", (q) => q.eq("authorDid", args.did))
      .order("desc")
      .collect();
    return statuses.sort()[0];
  },
});

export const setStatus = mutation({
  args: {
    uri: v.string(),
    authorDid: v.string(),
    status: v.string(),
    createdAt: v.string(),
    indexedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("statuses")
      .withIndex("by_uri", (q) => q.eq("uri", args.uri))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args });
    } else {
      await ctx.db.insert("statuses", { ...args });
    }
  },
});

export const getRecentStatuses = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    const statuses = await ctx.db
      .query("statuses")
      .withIndex("by_created_at")
      .order("desc")
      .take(limit);

    const statusesWithAccounts = await Promise.all(
      statuses.map(async (status) => {
        const account = await ctx.db
          .query("accounts")
          .withIndex("by_did", (q) => q.eq("did", status.authorDid))
          .unique();
        return { ...status, account };
      }),
    );

    return statusesWithAccounts;
  },
});
export const deleteStatus = mutation({
  args: { uri: v.string() },
  handler: async (ctx, args) => {
    const doomed = await ctx.db
      .query("statuses")
      .withIndex("by_uri", (q) => q.eq("uri", args.uri))
      .unique();
    if (doomed) {
      await ctx.db.delete(doomed._id);
    }
  },
});

export const getTopStatuses = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_did")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    const latestStatuses = await Promise.all(
      accounts.map((account) =>
        ctx.db
          .query("statuses")
          .withIndex("by_author_recent", (q) => q.eq("authorDid", account.did))
          .order("desc")
          .first(),
      ),
    );

    const countMap = new Map<string, number>();
    for (const status of latestStatuses) {
      if (!status) continue;
      countMap.set(status.status, (countMap.get(status.status) ?? 0) + 1);
    }

    return Array.from(countMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },
});

export const setAccount = mutation({
  args: { did: v.string(), handle: v.string(), active: v.boolean() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_did", (q) => q.eq("did", args.did))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args });
    } else {
      await ctx.db.insert("accounts", { ...args });
    }
  },
});

export const deleteAccount = mutation({
  args: { did: v.string() },
  handler: async (ctx, args) => {
    const doomedAccount = await ctx.db
      .query("accounts")
      .withIndex("by_did", (q) => q.eq("did", args.did))
      .unique();
    if (!doomedAccount) {
      return;
    }
    const doomedStatuses = await ctx.db
      .query("statuses")
      .withIndex("by_author_recent", (q) => q.eq("authorDid", args.did))
      .collect();
    await Promise.all(doomedStatuses.map((s) => ctx.db.delete(s._id)));
    await ctx.db.delete(doomedAccount._id);
  },
});
