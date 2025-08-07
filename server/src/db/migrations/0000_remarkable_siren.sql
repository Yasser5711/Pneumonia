DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'provider') THEN
		CREATE TYPE "public"."provider" AS ENUM('github', 'google', 'guest');
	END IF;
END$$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hashed_key" text NOT NULL,
	"key_prefix" varchar(12) NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid,
	"active" boolean DEFAULT true,
	"free_requests_quota" integer DEFAULT 10 NOT NULL,
	"free_requests_used" integer DEFAULT 0 NOT NULL,
	"free_quota_reset_at" timestamp,
	"description" text,
	"last_used_at" timestamp,
	"last_used_ip" text,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "api_keys_hashed_key_unique" UNIQUE("hashed_key"),
	CONSTRAINT "api_keys_key_prefix_unique" UNIQUE("key_prefix")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"provider" "provider" NOT NULL,
	"provider_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"last_login" timestamp,
	"updated_at" timestamp,
	"avatar_url" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint c
		JOIN pg_class t ON c.conrelid = t.oid
		WHERE c.conname = 'api_keys_user_id_users_id_fk'
		  AND t.relname = 'api_keys'
	) THEN
		ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
	END IF;
END$$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "key_prefix_idx" ON "api_keys" USING btree ("key_prefix");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "emailUniqueIndex" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "providerProviderIdUniqueIndex" ON "users" USING btree ("provider",lower("provider_id"));
