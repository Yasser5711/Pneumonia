ALTER TABLE "api_keys" RENAME TO "api_keys_deprecated";--> statement-breakpoint
ALTER TABLE "api_keys_deprecated" DROP CONSTRAINT "api_keys_hashed_key_unique";--> statement-breakpoint
ALTER TABLE "api_keys_deprecated" DROP CONSTRAINT "api_keys_key_prefix_unique";--> statement-breakpoint
ALTER TABLE "api_keys_deprecated" DROP CONSTRAINT "api_keys_user_id_users_deprecated_id_fk";
--> statement-breakpoint

ALTER TABLE "apikeys" RENAME TO "api_keys";--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "api_keys_deprecated" ADD CONSTRAINT "api_keys_deprecated_user_id_users_deprecated_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_deprecated"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys_deprecated" ADD CONSTRAINT "api_keys_deprecated_hashed_key_unique" UNIQUE("hashed_key");--> statement-breakpoint
ALTER TABLE "api_keys_deprecated" ADD CONSTRAINT "api_keys_deprecated_key_prefix_unique" UNIQUE("key_prefix");
