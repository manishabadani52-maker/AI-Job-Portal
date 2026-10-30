// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node"
//const Sentry = require("@sentry/node");
import {nodeProfilingIntegration } from '@sentry/profiling-node'

Sentry.init({
  dsn: "https://46354e76cfd5cd45e468179f85bf1f61@o4511884863668224.ingest.us.sentry.io/4511884869500928",
  integrations:[
    nodeProfilingIntegration(),
    Sentry.mongooseIntegration(),

  ],
  //tracesSampleRate: 1.0,
});
//Sentry.profile.startProfiler();