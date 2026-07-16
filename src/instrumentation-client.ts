import * as Sentry from "@sentry/nextjs";
import { getSentryClientOptions } from "@/lib/sentry-config";

Sentry.init(getSentryClientOptions());
