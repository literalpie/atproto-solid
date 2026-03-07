import { ConvexHttpClient } from "convex/browser";

export const convexHttpClient = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);
