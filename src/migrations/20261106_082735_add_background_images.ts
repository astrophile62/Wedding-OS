import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "wedding_settings" ADD COLUMN "background_images_verse_id" integer;
  ALTER TABLE "wedding_settings" ADD COLUMN "background_images_bride_id" integer;
  ALTER TABLE "wedding_settings" ADD COLUMN "background_images_groom_id" integer;
  ALTER TABLE "wedding_settings" ADD COLUMN "background_images_love_story_id" integer;
  ALTER TABLE "wedding_settings" ADD COLUMN "background_images_save_the_date_id" integer;
  ALTER TABLE "wedding_settings" ADD COLUMN "background_images_rsvp_id" integer;
  ALTER TABLE "_wedding_settings_v" ADD COLUMN "version_background_images_verse_id" integer;
  ALTER TABLE "_wedding_settings_v" ADD COLUMN "version_background_images_bride_id" integer;
  ALTER TABLE "_wedding_settings_v" ADD COLUMN "version_background_images_groom_id" integer;
  ALTER TABLE "_wedding_settings_v" ADD COLUMN "version_background_images_love_story_id" integer;
  ALTER TABLE "_wedding_settings_v" ADD COLUMN "version_background_images_save_the_date_id" integer;
  ALTER TABLE "_wedding_settings_v" ADD COLUMN "version_background_images_rsvp_id" integer;
  ALTER TABLE "wedding_settings" ADD CONSTRAINT "wedding_settings_background_images_verse_id_media_id_fk" FOREIGN KEY ("background_images_verse_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wedding_settings" ADD CONSTRAINT "wedding_settings_background_images_bride_id_media_id_fk" FOREIGN KEY ("background_images_bride_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wedding_settings" ADD CONSTRAINT "wedding_settings_background_images_groom_id_media_id_fk" FOREIGN KEY ("background_images_groom_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wedding_settings" ADD CONSTRAINT "wedding_settings_background_images_love_story_id_media_id_fk" FOREIGN KEY ("background_images_love_story_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wedding_settings" ADD CONSTRAINT "wedding_settings_background_images_save_the_date_id_media_id_fk" FOREIGN KEY ("background_images_save_the_date_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wedding_settings" ADD CONSTRAINT "wedding_settings_background_images_rsvp_id_media_id_fk" FOREIGN KEY ("background_images_rsvp_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_wedding_settings_v" ADD CONSTRAINT "_wedding_settings_v_version_background_images_verse_id_media_id_fk" FOREIGN KEY ("version_background_images_verse_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_wedding_settings_v" ADD CONSTRAINT "_wedding_settings_v_version_background_images_bride_id_media_id_fk" FOREIGN KEY ("version_background_images_bride_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_wedding_settings_v" ADD CONSTRAINT "_wedding_settings_v_version_background_images_groom_id_media_id_fk" FOREIGN KEY ("version_background_images_groom_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_wedding_settings_v" ADD CONSTRAINT "_wedding_settings_v_version_background_images_love_story_id_media_id_fk" FOREIGN KEY ("version_background_images_love_story_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_wedding_settings_v" ADD CONSTRAINT "_wedding_settings_v_version_background_images_save_the_date_id_media_id_fk" FOREIGN KEY ("version_background_images_save_the_date_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_wedding_settings_v" ADD CONSTRAINT "_wedding_settings_v_version_background_images_rsvp_id_media_id_fk" FOREIGN KEY ("version_background_images_rsvp_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "wedding_settings_background_images_background_images_ver_idx" ON "wedding_settings" USING btree ("background_images_verse_id");
  CREATE INDEX "wedding_settings_background_images_background_images_bri_idx" ON "wedding_settings" USING btree ("background_images_bride_id");
  CREATE INDEX "wedding_settings_background_images_background_images_gro_idx" ON "wedding_settings" USING btree ("background_images_groom_id");
  CREATE INDEX "wedding_settings_background_images_background_images_lov_idx" ON "wedding_settings" USING btree ("background_images_love_story_id");
  CREATE INDEX "wedding_settings_background_images_background_images_sav_idx" ON "wedding_settings" USING btree ("background_images_save_the_date_id");
  CREATE INDEX "wedding_settings_background_images_background_images_rsv_idx" ON "wedding_settings" USING btree ("background_images_rsvp_id");
  CREATE INDEX "_wedding_settings_v_version_background_images_version_ba_idx" ON "_wedding_settings_v" USING btree ("version_background_images_verse_id");
  CREATE INDEX "_wedding_settings_v_version_background_images_version__1_idx" ON "_wedding_settings_v" USING btree ("version_background_images_bride_id");
  CREATE INDEX "_wedding_settings_v_version_background_images_version__2_idx" ON "_wedding_settings_v" USING btree ("version_background_images_groom_id");
  CREATE INDEX "_wedding_settings_v_version_background_images_version__3_idx" ON "_wedding_settings_v" USING btree ("version_background_images_love_story_id");
  CREATE INDEX "_wedding_settings_v_version_background_images_version__4_idx" ON "_wedding_settings_v" USING btree ("version_background_images_save_the_date_id");
  CREATE INDEX "_wedding_settings_v_version_background_images_version__5_idx" ON "_wedding_settings_v" USING btree ("version_background_images_rsvp_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "wedding_settings" DROP CONSTRAINT "wedding_settings_background_images_verse_id_media_id_fk";
  
  ALTER TABLE "wedding_settings" DROP CONSTRAINT "wedding_settings_background_images_bride_id_media_id_fk";
  
  ALTER TABLE "wedding_settings" DROP CONSTRAINT "wedding_settings_background_images_groom_id_media_id_fk";
  
  ALTER TABLE "wedding_settings" DROP CONSTRAINT "wedding_settings_background_images_love_story_id_media_id_fk";
  
  ALTER TABLE "wedding_settings" DROP CONSTRAINT "wedding_settings_background_images_save_the_date_id_media_id_fk";
  
  ALTER TABLE "wedding_settings" DROP CONSTRAINT "wedding_settings_background_images_rsvp_id_media_id_fk";
  
  ALTER TABLE "_wedding_settings_v" DROP CONSTRAINT "_wedding_settings_v_version_background_images_verse_id_media_id_fk";
  
  ALTER TABLE "_wedding_settings_v" DROP CONSTRAINT "_wedding_settings_v_version_background_images_bride_id_media_id_fk";
  
  ALTER TABLE "_wedding_settings_v" DROP CONSTRAINT "_wedding_settings_v_version_background_images_groom_id_media_id_fk";
  
  ALTER TABLE "_wedding_settings_v" DROP CONSTRAINT "_wedding_settings_v_version_background_images_love_story_id_media_id_fk";
  
  ALTER TABLE "_wedding_settings_v" DROP CONSTRAINT "_wedding_settings_v_version_background_images_save_the_date_id_media_id_fk";
  
  ALTER TABLE "_wedding_settings_v" DROP CONSTRAINT "_wedding_settings_v_version_background_images_rsvp_id_media_id_fk";
  
  DROP INDEX "wedding_settings_background_images_background_images_ver_idx";
  DROP INDEX "wedding_settings_background_images_background_images_bri_idx";
  DROP INDEX "wedding_settings_background_images_background_images_gro_idx";
  DROP INDEX "wedding_settings_background_images_background_images_lov_idx";
  DROP INDEX "wedding_settings_background_images_background_images_sav_idx";
  DROP INDEX "wedding_settings_background_images_background_images_rsv_idx";
  DROP INDEX "_wedding_settings_v_version_background_images_version_ba_idx";
  DROP INDEX "_wedding_settings_v_version_background_images_version__1_idx";
  DROP INDEX "_wedding_settings_v_version_background_images_version__2_idx";
  DROP INDEX "_wedding_settings_v_version_background_images_version__3_idx";
  DROP INDEX "_wedding_settings_v_version_background_images_version__4_idx";
  DROP INDEX "_wedding_settings_v_version_background_images_version__5_idx";
  ALTER TABLE "wedding_settings" DROP COLUMN "background_images_verse_id";
  ALTER TABLE "wedding_settings" DROP COLUMN "background_images_bride_id";
  ALTER TABLE "wedding_settings" DROP COLUMN "background_images_groom_id";
  ALTER TABLE "wedding_settings" DROP COLUMN "background_images_love_story_id";
  ALTER TABLE "wedding_settings" DROP COLUMN "background_images_save_the_date_id";
  ALTER TABLE "wedding_settings" DROP COLUMN "background_images_rsvp_id";
  ALTER TABLE "_wedding_settings_v" DROP COLUMN "version_background_images_verse_id";
  ALTER TABLE "_wedding_settings_v" DROP COLUMN "version_background_images_bride_id";
  ALTER TABLE "_wedding_settings_v" DROP COLUMN "version_background_images_groom_id";
  ALTER TABLE "_wedding_settings_v" DROP COLUMN "version_background_images_love_story_id";
  ALTER TABLE "_wedding_settings_v" DROP COLUMN "version_background_images_save_the_date_id";
  ALTER TABLE "_wedding_settings_v" DROP COLUMN "version_background_images_rsvp_id";`)
}
