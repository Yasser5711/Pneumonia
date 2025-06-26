ALTER TABLE "api_keys" RENAME COLUMN "last_updated_at" TO "updated_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "guest_last_request" TO "updated_at";