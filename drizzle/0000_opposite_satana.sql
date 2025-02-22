CREATE TABLE IF NOT EXISTS "brainrot_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"fal_request_id" text NOT NULL,
	"status" text NOT NULL
);
