import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "wedding_settings_music_tracks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"audio_id" integer NOT NULL
  );
  
  CREATE TABLE "_wedding_settings_v_version_music_tracks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"audio_id" integer NOT NULL,
  	"_uuid" varchar
  );
  
  ALTER TABLE "wedding_settings" ADD COLUMN "music_enabled" boolean DEFAULT true;
  ALTER TABLE "_wedding_settings_v" ADD COLUMN "version_music_enabled" boolean DEFAULT true;
  ALTER TABLE "wedding_settings_music_tracks" ADD CONSTRAINT "wedding_settings_music_tracks_audio_id_media_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wedding_settings_music_tracks" ADD CONSTRAINT "wedding_settings_music_tracks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."wedding_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wedding_settings_v_version_music_tracks" ADD CONSTRAINT "_wedding_settings_v_version_music_tracks_audio_id_media_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_wedding_settings_v_version_music_tracks" ADD CONSTRAINT "_wedding_settings_v_version_music_tracks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_wedding_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "wedding_settings_music_tracks_order_idx" ON "wedding_settings_music_tracks" USING btree ("_order");
  CREATE INDEX "wedding_settings_music_tracks_parent_id_idx" ON "wedding_settings_music_tracks" USING btree ("_parent_id");
  CREATE INDEX "wedding_settings_music_tracks_audio_idx" ON "wedding_settings_music_tracks" USING btree ("audio_id");
  CREATE INDEX "_wedding_settings_v_version_music_tracks_order_idx" ON "_wedding_settings_v_version_music_tracks" USING btree ("_order");
  CREATE INDEX "_wedding_settings_v_version_music_tracks_parent_id_idx" ON "_wedding_settings_v_version_music_tracks" USING btree ("_parent_id");
  CREATE INDEX "_wedding_settings_v_version_music_tracks_audio_idx" ON "_wedding_settings_v_version_music_tracks" USING btree ("audio_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "wedding_settings_music_tracks" CASCADE;
  DROP TABLE "_wedding_settings_v_version_music_tracks" CASCADE;
  ALTER TABLE "wedding_settings" DROP COLUMN "music_enabled";
  ALTER TABLE "_wedding_settings_v" DROP COLUMN "version_music_enabled";`)
}
