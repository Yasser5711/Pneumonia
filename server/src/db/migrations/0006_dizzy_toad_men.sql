DO $$
BEGIN
	-- Drop old misspelled constraint if it exists
	IF EXISTS (
		SELECT 1 FROM pg_constraint c
		JOIN pg_class t ON c.conrelid = t.oid
		WHERE c.conname = 'apikeys_user_id_users_id_fk'
		  AND t.relname = 'api_keys'
	) THEN
		ALTER TABLE "api_keys" DROP CONSTRAINT "apikeys_user_id_users_id_fk";
	END IF;

	-- Add desired constraint only if missing
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint c
		JOIN pg_class t ON c.conrelid = t.oid
		WHERE c.conname = 'api_keys_user_id_users_id_fk'
		  AND t.relname = 'api_keys'
	) THEN
		ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END$$;
