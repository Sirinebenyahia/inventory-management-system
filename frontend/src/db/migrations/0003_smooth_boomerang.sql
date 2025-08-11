CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"desc" text,
	"metadata" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now(),
	"created_by" uuid NOT NULL,
	"updated_at" timestamp,
	"updated_by" uuid,
	"deleted_at" timestamp,
	"deleted_by" uuid
);
