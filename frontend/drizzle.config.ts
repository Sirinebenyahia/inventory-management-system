import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  dialect: "postgresql", // <<<<< C'est OBLIGATOIRE !
  schema: "./src/db/schema.ts", // Chemin de ton fichier de schéma
  out: "./src/db/migrations",   // Où enregistrer les migrations
  dbCredentials: {
        // url: process.env.;
    host: process.env.PG_HOST!,
    port: Number(process.env.PG_PORT!),
    user: process.env.PG_USER!,
    password: process.env.PG_PASSWORD!,
    database: process.env.PG_DATABASE!,
    ssl: false
  },
});
