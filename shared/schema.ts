import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We store cached weather snapshots in the DB
export const weatherSnapshots = sqliteTable("weather_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gamePk: integer("game_pk").notNull(),
  fetchedAt: text("fetched_at").notNull(),
  tempF: real("temp_f"),
  windMph: real("wind_mph"),
  windDirDeg: real("wind_dir_deg"),
  windDirRelative: text("wind_dir_relative"),
  humidityPct: real("humidity_pct"),
  precipPct: real("precip_pct"),
  conditions: text("conditions"),
  isDomeClosed: integer("is_dome_closed").notNull().default(0),
});

export const insertWeatherSnapshotSchema = createInsertSchema(weatherSnapshots).omit({ id: true });
export type InsertWeatherSnapshot = z.infer<typeof insertWeatherSnapshotSchema>;
export type WeatherSnapshot = typeof weatherSnapshots.$inferSelect;
