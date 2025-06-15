CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hashed_key" text NOT NULL,
	"key_prefix" varchar(12) NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true,
	"free_requests_quota" integer DEFAULT 10 NOT NULL,
	"free_requests_used" integer DEFAULT 0 NOT NULL,
	"free_quota_reset_at" timestamp,
	"description" text,
	"last_used_at" timestamp,
	"last_used_ip" text,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"last_updated_at" timestamp DEFAULT now(),
	CONSTRAINT "api_keys_hashed_key_unique" UNIQUE("hashed_key"),
	CONSTRAINT "api_keys_key_prefix_unique" UNIQUE("key_prefix")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"age" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "key_prefix_idx" ON "api_keys" USING btree ("key_prefix");