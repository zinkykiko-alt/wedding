import path from "node:path";
import { defineConfig } from "@prisma/config";

// Prisma 7 keeps the database connection URL out of schema.prisma.
// The CLI commands that touch the database (e.g. `prisma db push`) read it
// from here. We use the direct (non-pooled) connection for schema changes.
//
// On Vercel, POSTGRES_URL_NON_POOLING is injected automatically by the
// connected Postgres database. Locally it can be passed inline or via .env.
//
// We read it as a plain (possibly empty) string instead of the `env()` helper
// so that offline commands like `prisma generate` don't fail when the variable
// is absent (e.g. during `npm install` postinstall without a database).
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.POSTGRES_URL_NON_POOLING ?? "",
  },
});
