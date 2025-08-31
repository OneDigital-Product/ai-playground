import { defineApp } from "convex/server";

// Example later:
// import shardedCounter from "@convex-dev/sharded-counter/convex.config";
// const app: ReturnType<typeof defineApp> = defineApp().use(shardedCounter);
// export default app;

const app: ReturnType<typeof defineApp> = defineApp();
export default app;
