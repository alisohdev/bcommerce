import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const foundationProbe = pgTable("foundation_probe", {
  id: integer("id").primaryKey(),
  value: text("value").notNull(),
});
