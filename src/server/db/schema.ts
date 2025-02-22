import {
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";


const createdAtField = timestamp("created_at", { withTimezone: true })
  .defaultNow()
  .notNull();

const updatedAtField = timestamp("updated_at", { withTimezone: true })
  .defaultNow()
  .notNull()
  .$onUpdate(() => new Date());


export const brainrotJobTable = pgTable("brainrot_job", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: createdAtField,
  updatedAt: updatedAtField,

  falRequestId: text("fal_request_id").notNull(),
  status: text("status", { enum: ["in_progress", "completed", "failed"] }).notNull(),

  videoUrl: text("video_url"),
});
