import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en');
  CREATE TYPE "public"."enum_guests_invitation_type" AS ENUM('personal', 'group');
  CREATE TYPE "public"."enum_guests_invitation_status" AS ENUM('draft', 'sent', 'opened');
  CREATE TYPE "public"."enum_rsvps_attendance" AS ENUM('attending', 'declined');
  CREATE TYPE "public"."enum_guest_messages_status" AS ENUM('pending', 'approved', 'hidden');
  CREATE TYPE "public"."enum_gallery_items_role" AS ENUM('cover', 'bride', 'groom', 'story', 'gallery');
  CREATE TYPE "public"."enum__gallery_items_v_version_role" AS ENUM('cover', 'bride', 'groom', 'story', 'gallery');
  CREATE TYPE "public"."enum_payload_llm_instructions_entity_type" AS ENUM('collection', 'global');
  CREATE TYPE "public"."enum_wedding_settings_bank_accounts_bank" AS ENUM('BNI', 'BSI', 'BCA', 'BRI');
  CREATE TYPE "public"."enum__wedding_settings_v_version_bank_accounts_bank" AS ENUM('BNI', 'BSI', 'BCA', 'BRI');
  CREATE TABLE "admins_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "admins" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "admins_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"_h_folders_id" integer,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"original_filename" varchar,
  	"original_url" varchar,
  	"original_mime_type" varchar,
  	"original_filesize" numeric,
  	"original_width" numeric,
  	"original_height" numeric,
  	"original_prefix" varchar,
  	"original__objectkey" varchar,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"admins_id" integer
  );
  
  CREATE TABLE "_media_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_alt" varchar NOT NULL,
  	"version__h_folders_id" integer,
  	"version_prefix" varchar DEFAULT '',
  	"version__objectkey" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_url" varchar,
  	"version_thumbnail_u_r_l" varchar,
  	"version_filename" varchar,
  	"version_mime_type" varchar,
  	"version_filesize" numeric,
  	"version_width" numeric,
  	"version_height" numeric,
  	"version_original_filename" varchar,
  	"version_original_url" varchar,
  	"version_original_mime_type" varchar,
  	"version_original_filesize" numeric,
  	"version_original_width" numeric,
  	"version_original_height" numeric,
  	"version_original_prefix" varchar,
  	"version_original__objectkey" varchar,
  	"version_focal_x" numeric,
  	"version_focal_y" numeric,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_media_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"admins_id" integer
  );
  
  CREATE TABLE "folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_h_folders_id" integer,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "folders_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "_folders_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__h_folders_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_folders_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_h_tags_id" integer,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "_tags_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__h_tags_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_tags_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "guests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"invitation_type" "enum_guests_invitation_type" DEFAULT 'personal' NOT NULL,
  	"name" varchar NOT NULL,
  	"partner_name" varchar,
  	"partner_label" varchar DEFAULT '& Partner',
  	"max_guests" numeric DEFAULT 2 NOT NULL,
  	"max_responses" numeric DEFAULT 300,
  	"slug" varchar,
  	"contact" varchar,
  	"guest_group" varchar,
  	"invitation_status" "enum_guests_invitation_status" DEFAULT 'sent' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "guests_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "rsvps" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"guest_id" integer NOT NULL,
  	"guest_name" varchar NOT NULL,
  	"attendance" "enum_rsvps_attendance" NOT NULL,
  	"guest_count" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rsvps_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "guest_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"guest_id" integer,
  	"guest_name" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"status" "enum_guest_messages_status" DEFAULT 'pending' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "guest_messages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "gallery_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar NOT NULL,
  	"role" "enum_gallery_items_role" NOT NULL,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gallery_items_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "_gallery_items_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_image_id" integer NOT NULL,
  	"version_caption" varchar NOT NULL,
  	"version_role" "enum__gallery_items_v_version_role" NOT NULL,
  	"version_order" numeric DEFAULT 0 NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_gallery_items_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "rate_limits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"count" numeric DEFAULT 0 NOT NULL,
  	"window_start" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rate_limits_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"media_id" integer,
  	"folders_id" integer,
  	"tags_id" integer,
  	"guests_id" integer,
  	"rsvps_id" integer,
  	"guest_messages_id" integer,
  	"gallery_items_id" integer,
  	"rate_limits_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_llm_instructions" (
  	"id" varchar PRIMARY KEY NOT NULL,
  	"entity_slug" varchar NOT NULL,
  	"entity_type" "enum_payload_llm_instructions_entity_type" NOT NULL,
  	"additional_instructions" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_llm_instructions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "wedding_settings_love_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "wedding_settings_bank_accounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"bank" "enum_wedding_settings_bank_accounts_bank" NOT NULL,
  	"account_number" varchar NOT NULL,
  	"account_name" varchar NOT NULL
  );
  
  CREATE TABLE "wedding_settings_section_order" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"enabled" boolean DEFAULT true
  );
  
  CREATE TABLE "wedding_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"bride_name" varchar NOT NULL,
  	"groom_name" varchar NOT NULL,
  	"hashtag" varchar NOT NULL,
  	"wedding_date" timestamp(3) with time zone NOT NULL,
  	"verse" varchar NOT NULL,
  	"venue_name" varchar NOT NULL,
  	"venue_address" varchar NOT NULL,
  	"venue_maps_url" varchar NOT NULL,
  	"people_bride_full_name" varchar NOT NULL,
  	"people_bride_parents" varchar NOT NULL,
  	"people_groom_full_name" varchar NOT NULL,
  	"people_groom_parents" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "wedding_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "_wedding_settings_v_version_love_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_wedding_settings_v_version_bank_accounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"bank" "enum__wedding_settings_v_version_bank_accounts_bank" NOT NULL,
  	"account_number" varchar NOT NULL,
  	"account_name" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_wedding_settings_v_version_section_order" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_wedding_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_bride_name" varchar NOT NULL,
  	"version_groom_name" varchar NOT NULL,
  	"version_hashtag" varchar NOT NULL,
  	"version_wedding_date" timestamp(3) with time zone NOT NULL,
  	"version_verse" varchar NOT NULL,
  	"version_venue_name" varchar NOT NULL,
  	"version_venue_address" varchar NOT NULL,
  	"version_venue_maps_url" varchar NOT NULL,
  	"version_people_bride_full_name" varchar NOT NULL,
  	"version_people_bride_parents" varchar NOT NULL,
  	"version_people_groom_full_name" varchar NOT NULL,
  	"version_people_groom_parents" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_wedding_settings_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  ALTER TABLE "admins_sessions" ADD CONSTRAINT "admins_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "admins_rels" ADD CONSTRAINT "admins_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "admins_rels" ADD CONSTRAINT "admins_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media__h_folders_id_folders_id_fk" FOREIGN KEY ("_h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_parent_id_media_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_version__h_folders_id_folders_id_fk" FOREIGN KEY ("version__h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_media_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "folders" ADD CONSTRAINT "folders__h_folders_id_folders_id_fk" FOREIGN KEY ("_h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "folders_rels" ADD CONSTRAINT "folders_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "folders_rels" ADD CONSTRAINT "folders_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_folders_v" ADD CONSTRAINT "_folders_v_parent_id_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_folders_v" ADD CONSTRAINT "_folders_v_version__h_folders_id_folders_id_fk" FOREIGN KEY ("version__h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_folders_v_rels" ADD CONSTRAINT "_folders_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_folders_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_folders_v_rels" ADD CONSTRAINT "_folders_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags" ADD CONSTRAINT "tags__h_tags_id_tags_id_fk" FOREIGN KEY ("_h_tags_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tags_rels" ADD CONSTRAINT "tags_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags_rels" ADD CONSTRAINT "tags_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tags_v" ADD CONSTRAINT "_tags_v_parent_id_tags_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tags_v" ADD CONSTRAINT "_tags_v_version__h_tags_id_tags_id_fk" FOREIGN KEY ("version__h_tags_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tags_v_rels" ADD CONSTRAINT "_tags_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_tags_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tags_v_rels" ADD CONSTRAINT "_tags_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guests_rels" ADD CONSTRAINT "guests_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guests_rels" ADD CONSTRAINT "guests_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rsvps_rels" ADD CONSTRAINT "rsvps_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rsvps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rsvps_rels" ADD CONSTRAINT "rsvps_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guest_messages" ADD CONSTRAINT "guest_messages_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guest_messages_rels" ADD CONSTRAINT "guest_messages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guest_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guest_messages_rels" ADD CONSTRAINT "guest_messages_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gallery_items_rels" ADD CONSTRAINT "gallery_items_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."gallery_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gallery_items_rels" ADD CONSTRAINT "gallery_items_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gallery_items_v" ADD CONSTRAINT "_gallery_items_v_parent_id_gallery_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."gallery_items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gallery_items_v" ADD CONSTRAINT "_gallery_items_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gallery_items_v_rels" ADD CONSTRAINT "_gallery_items_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_gallery_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gallery_items_v_rels" ADD CONSTRAINT "_gallery_items_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rate_limits_rels" ADD CONSTRAINT "rate_limits_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rate_limits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rate_limits_rels" ADD CONSTRAINT "rate_limits_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_folders_fk" FOREIGN KEY ("folders_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guests_fk" FOREIGN KEY ("guests_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rsvps_fk" FOREIGN KEY ("rsvps_id") REFERENCES "public"."rsvps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guest_messages_fk" FOREIGN KEY ("guest_messages_id") REFERENCES "public"."guest_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gallery_items_fk" FOREIGN KEY ("gallery_items_id") REFERENCES "public"."gallery_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rate_limits_fk" FOREIGN KEY ("rate_limits_id") REFERENCES "public"."rate_limits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_llm_instructions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wedding_settings_love_story" ADD CONSTRAINT "wedding_settings_love_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."wedding_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wedding_settings_bank_accounts" ADD CONSTRAINT "wedding_settings_bank_accounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."wedding_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wedding_settings_section_order" ADD CONSTRAINT "wedding_settings_section_order_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."wedding_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wedding_settings_rels" ADD CONSTRAINT "wedding_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."wedding_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wedding_settings_rels" ADD CONSTRAINT "wedding_settings_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wedding_settings_v_version_love_story" ADD CONSTRAINT "_wedding_settings_v_version_love_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_wedding_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wedding_settings_v_version_bank_accounts" ADD CONSTRAINT "_wedding_settings_v_version_bank_accounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_wedding_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wedding_settings_v_version_section_order" ADD CONSTRAINT "_wedding_settings_v_version_section_order_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_wedding_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wedding_settings_v_rels" ADD CONSTRAINT "_wedding_settings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_wedding_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wedding_settings_v_rels" ADD CONSTRAINT "_wedding_settings_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "admins_sessions_order_idx" ON "admins_sessions" USING btree ("_order");
  CREATE INDEX "admins_sessions_parent_id_idx" ON "admins_sessions" USING btree ("_parent_id");
  CREATE INDEX "admins_updated_at_idx" ON "admins" USING btree ("updated_at");
  CREATE INDEX "admins_created_at_idx" ON "admins" USING btree ("created_at");
  CREATE UNIQUE INDEX "admins_email_idx" ON "admins" USING btree ("email");
  CREATE INDEX "admins_rels_order_idx" ON "admins_rels" USING btree ("order");
  CREATE INDEX "admins_rels_parent_idx" ON "admins_rels" USING btree ("parent_id");
  CREATE INDEX "admins_rels_path_idx" ON "admins_rels" USING btree ("path");
  CREATE INDEX "admins_rels_admins_id_idx" ON "admins_rels" USING btree ("admins_id");
  CREATE INDEX "media__h_folders_idx" ON "media" USING btree ("_h_folders_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_original_original_filename_idx" ON "media" USING btree ("original_filename");
  CREATE INDEX "media_rels_order_idx" ON "media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "media_rels" USING btree ("path");
  CREATE INDEX "media_rels_tags_id_idx" ON "media_rels" USING btree ("tags_id");
  CREATE INDEX "media_rels_admins_id_idx" ON "media_rels" USING btree ("admins_id");
  CREATE INDEX "_media_v_parent_idx" ON "_media_v" USING btree ("parent_id");
  CREATE INDEX "_media_v_version_version__h_folders_idx" ON "_media_v" USING btree ("version__h_folders_id");
  CREATE INDEX "_media_v_version_version_updated_at_idx" ON "_media_v" USING btree ("version_updated_at");
  CREATE INDEX "_media_v_version_version_created_at_idx" ON "_media_v" USING btree ("version_created_at");
  CREATE INDEX "_media_v_version_version_filename_idx" ON "_media_v" USING btree ("version_filename");
  CREATE INDEX "_media_v_version_original_version_original_filename_idx" ON "_media_v" USING btree ("version_original_filename");
  CREATE INDEX "_media_v_created_at_idx" ON "_media_v" USING btree ("created_at");
  CREATE INDEX "_media_v_updated_at_idx" ON "_media_v" USING btree ("updated_at");
  CREATE INDEX "_media_v_rels_order_idx" ON "_media_v_rels" USING btree ("order");
  CREATE INDEX "_media_v_rels_parent_idx" ON "_media_v_rels" USING btree ("parent_id");
  CREATE INDEX "_media_v_rels_path_idx" ON "_media_v_rels" USING btree ("path");
  CREATE INDEX "_media_v_rels_tags_id_idx" ON "_media_v_rels" USING btree ("tags_id");
  CREATE INDEX "_media_v_rels_admins_id_idx" ON "_media_v_rels" USING btree ("admins_id");
  CREATE INDEX "folders__h_folders_idx" ON "folders" USING btree ("_h_folders_id");
  CREATE INDEX "folders_updated_at_idx" ON "folders" USING btree ("updated_at");
  CREATE INDEX "folders_created_at_idx" ON "folders" USING btree ("created_at");
  CREATE INDEX "folders_rels_order_idx" ON "folders_rels" USING btree ("order");
  CREATE INDEX "folders_rels_parent_idx" ON "folders_rels" USING btree ("parent_id");
  CREATE INDEX "folders_rels_path_idx" ON "folders_rels" USING btree ("path");
  CREATE INDEX "folders_rels_admins_id_idx" ON "folders_rels" USING btree ("admins_id");
  CREATE INDEX "_folders_v_parent_idx" ON "_folders_v" USING btree ("parent_id");
  CREATE INDEX "_folders_v_version_version__h_folders_idx" ON "_folders_v" USING btree ("version__h_folders_id");
  CREATE INDEX "_folders_v_version_version_updated_at_idx" ON "_folders_v" USING btree ("version_updated_at");
  CREATE INDEX "_folders_v_version_version_created_at_idx" ON "_folders_v" USING btree ("version_created_at");
  CREATE INDEX "_folders_v_created_at_idx" ON "_folders_v" USING btree ("created_at");
  CREATE INDEX "_folders_v_updated_at_idx" ON "_folders_v" USING btree ("updated_at");
  CREATE INDEX "_folders_v_rels_order_idx" ON "_folders_v_rels" USING btree ("order");
  CREATE INDEX "_folders_v_rels_parent_idx" ON "_folders_v_rels" USING btree ("parent_id");
  CREATE INDEX "_folders_v_rels_path_idx" ON "_folders_v_rels" USING btree ("path");
  CREATE INDEX "_folders_v_rels_admins_id_idx" ON "_folders_v_rels" USING btree ("admins_id");
  CREATE INDEX "tags__h_tags_idx" ON "tags" USING btree ("_h_tags_id");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "tags_rels_order_idx" ON "tags_rels" USING btree ("order");
  CREATE INDEX "tags_rels_parent_idx" ON "tags_rels" USING btree ("parent_id");
  CREATE INDEX "tags_rels_path_idx" ON "tags_rels" USING btree ("path");
  CREATE INDEX "tags_rels_admins_id_idx" ON "tags_rels" USING btree ("admins_id");
  CREATE INDEX "_tags_v_parent_idx" ON "_tags_v" USING btree ("parent_id");
  CREATE INDEX "_tags_v_version_version__h_tags_idx" ON "_tags_v" USING btree ("version__h_tags_id");
  CREATE INDEX "_tags_v_version_version_updated_at_idx" ON "_tags_v" USING btree ("version_updated_at");
  CREATE INDEX "_tags_v_version_version_created_at_idx" ON "_tags_v" USING btree ("version_created_at");
  CREATE INDEX "_tags_v_created_at_idx" ON "_tags_v" USING btree ("created_at");
  CREATE INDEX "_tags_v_updated_at_idx" ON "_tags_v" USING btree ("updated_at");
  CREATE INDEX "_tags_v_rels_order_idx" ON "_tags_v_rels" USING btree ("order");
  CREATE INDEX "_tags_v_rels_parent_idx" ON "_tags_v_rels" USING btree ("parent_id");
  CREATE INDEX "_tags_v_rels_path_idx" ON "_tags_v_rels" USING btree ("path");
  CREATE INDEX "_tags_v_rels_admins_id_idx" ON "_tags_v_rels" USING btree ("admins_id");
  CREATE UNIQUE INDEX "guests_slug_idx" ON "guests" USING btree ("slug");
  CREATE INDEX "guests_updated_at_idx" ON "guests" USING btree ("updated_at");
  CREATE INDEX "guests_created_at_idx" ON "guests" USING btree ("created_at");
  CREATE INDEX "guests_rels_order_idx" ON "guests_rels" USING btree ("order");
  CREATE INDEX "guests_rels_parent_idx" ON "guests_rels" USING btree ("parent_id");
  CREATE INDEX "guests_rels_path_idx" ON "guests_rels" USING btree ("path");
  CREATE INDEX "guests_rels_admins_id_idx" ON "guests_rels" USING btree ("admins_id");
  CREATE INDEX "rsvps_guest_idx" ON "rsvps" USING btree ("guest_id");
  CREATE INDEX "rsvps_updated_at_idx" ON "rsvps" USING btree ("updated_at");
  CREATE INDEX "rsvps_created_at_idx" ON "rsvps" USING btree ("created_at");
  CREATE INDEX "rsvps_rels_order_idx" ON "rsvps_rels" USING btree ("order");
  CREATE INDEX "rsvps_rels_parent_idx" ON "rsvps_rels" USING btree ("parent_id");
  CREATE INDEX "rsvps_rels_path_idx" ON "rsvps_rels" USING btree ("path");
  CREATE INDEX "rsvps_rels_admins_id_idx" ON "rsvps_rels" USING btree ("admins_id");
  CREATE INDEX "guest_messages_guest_idx" ON "guest_messages" USING btree ("guest_id");
  CREATE INDEX "guest_messages_status_idx" ON "guest_messages" USING btree ("status");
  CREATE INDEX "guest_messages_updated_at_idx" ON "guest_messages" USING btree ("updated_at");
  CREATE INDEX "guest_messages_created_at_idx" ON "guest_messages" USING btree ("created_at");
  CREATE INDEX "guest_messages_rels_order_idx" ON "guest_messages_rels" USING btree ("order");
  CREATE INDEX "guest_messages_rels_parent_idx" ON "guest_messages_rels" USING btree ("parent_id");
  CREATE INDEX "guest_messages_rels_path_idx" ON "guest_messages_rels" USING btree ("path");
  CREATE INDEX "guest_messages_rels_admins_id_idx" ON "guest_messages_rels" USING btree ("admins_id");
  CREATE INDEX "gallery_items_image_idx" ON "gallery_items" USING btree ("image_id");
  CREATE INDEX "gallery_items_updated_at_idx" ON "gallery_items" USING btree ("updated_at");
  CREATE INDEX "gallery_items_created_at_idx" ON "gallery_items" USING btree ("created_at");
  CREATE INDEX "gallery_items_rels_order_idx" ON "gallery_items_rels" USING btree ("order");
  CREATE INDEX "gallery_items_rels_parent_idx" ON "gallery_items_rels" USING btree ("parent_id");
  CREATE INDEX "gallery_items_rels_path_idx" ON "gallery_items_rels" USING btree ("path");
  CREATE INDEX "gallery_items_rels_admins_id_idx" ON "gallery_items_rels" USING btree ("admins_id");
  CREATE INDEX "_gallery_items_v_parent_idx" ON "_gallery_items_v" USING btree ("parent_id");
  CREATE INDEX "_gallery_items_v_version_version_image_idx" ON "_gallery_items_v" USING btree ("version_image_id");
  CREATE INDEX "_gallery_items_v_version_version_updated_at_idx" ON "_gallery_items_v" USING btree ("version_updated_at");
  CREATE INDEX "_gallery_items_v_version_version_created_at_idx" ON "_gallery_items_v" USING btree ("version_created_at");
  CREATE INDEX "_gallery_items_v_created_at_idx" ON "_gallery_items_v" USING btree ("created_at");
  CREATE INDEX "_gallery_items_v_updated_at_idx" ON "_gallery_items_v" USING btree ("updated_at");
  CREATE INDEX "_gallery_items_v_rels_order_idx" ON "_gallery_items_v_rels" USING btree ("order");
  CREATE INDEX "_gallery_items_v_rels_parent_idx" ON "_gallery_items_v_rels" USING btree ("parent_id");
  CREATE INDEX "_gallery_items_v_rels_path_idx" ON "_gallery_items_v_rels" USING btree ("path");
  CREATE INDEX "_gallery_items_v_rels_admins_id_idx" ON "_gallery_items_v_rels" USING btree ("admins_id");
  CREATE UNIQUE INDEX "rate_limits_key_idx" ON "rate_limits" USING btree ("key");
  CREATE INDEX "rate_limits_updated_at_idx" ON "rate_limits" USING btree ("updated_at");
  CREATE INDEX "rate_limits_created_at_idx" ON "rate_limits" USING btree ("created_at");
  CREATE INDEX "rate_limits_rels_order_idx" ON "rate_limits_rels" USING btree ("order");
  CREATE INDEX "rate_limits_rels_parent_idx" ON "rate_limits_rels" USING btree ("parent_id");
  CREATE INDEX "rate_limits_rels_path_idx" ON "rate_limits_rels" USING btree ("path");
  CREATE INDEX "rate_limits_rels_admins_id_idx" ON "rate_limits_rels" USING btree ("admins_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_admins_id_idx" ON "payload_locked_documents_rels" USING btree ("admins_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("folders_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_guests_id_idx" ON "payload_locked_documents_rels" USING btree ("guests_id");
  CREATE INDEX "payload_locked_documents_rels_rsvps_id_idx" ON "payload_locked_documents_rels" USING btree ("rsvps_id");
  CREATE INDEX "payload_locked_documents_rels_guest_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("guest_messages_id");
  CREATE INDEX "payload_locked_documents_rels_gallery_items_id_idx" ON "payload_locked_documents_rels" USING btree ("gallery_items_id");
  CREATE INDEX "payload_locked_documents_rels_rate_limits_id_idx" ON "payload_locked_documents_rels" USING btree ("rate_limits_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_admins_id_idx" ON "payload_preferences_rels" USING btree ("admins_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "payload_llm_instructions_entity_slug_idx" ON "payload_llm_instructions" USING btree ("entity_slug");
  CREATE INDEX "payload_llm_instructions_updated_at_idx" ON "payload_llm_instructions" USING btree ("updated_at");
  CREATE INDEX "payload_llm_instructions_created_at_idx" ON "payload_llm_instructions" USING btree ("created_at");
  CREATE INDEX "payload_llm_instructions_rels_order_idx" ON "payload_llm_instructions_rels" USING btree ("order");
  CREATE INDEX "payload_llm_instructions_rels_parent_idx" ON "payload_llm_instructions_rels" USING btree ("parent_id");
  CREATE INDEX "payload_llm_instructions_rels_path_idx" ON "payload_llm_instructions_rels" USING btree ("path");
  CREATE INDEX "payload_llm_instructions_rels_admins_id_idx" ON "payload_llm_instructions_rels" USING btree ("admins_id");
  CREATE INDEX "wedding_settings_love_story_order_idx" ON "wedding_settings_love_story" USING btree ("_order");
  CREATE INDEX "wedding_settings_love_story_parent_id_idx" ON "wedding_settings_love_story" USING btree ("_parent_id");
  CREATE INDEX "wedding_settings_bank_accounts_order_idx" ON "wedding_settings_bank_accounts" USING btree ("_order");
  CREATE INDEX "wedding_settings_bank_accounts_parent_id_idx" ON "wedding_settings_bank_accounts" USING btree ("_parent_id");
  CREATE INDEX "wedding_settings_section_order_order_idx" ON "wedding_settings_section_order" USING btree ("_order");
  CREATE INDEX "wedding_settings_section_order_parent_id_idx" ON "wedding_settings_section_order" USING btree ("_parent_id");
  CREATE INDEX "wedding_settings_rels_order_idx" ON "wedding_settings_rels" USING btree ("order");
  CREATE INDEX "wedding_settings_rels_parent_idx" ON "wedding_settings_rels" USING btree ("parent_id");
  CREATE INDEX "wedding_settings_rels_path_idx" ON "wedding_settings_rels" USING btree ("path");
  CREATE INDEX "wedding_settings_rels_admins_id_idx" ON "wedding_settings_rels" USING btree ("admins_id");
  CREATE INDEX "_wedding_settings_v_version_love_story_order_idx" ON "_wedding_settings_v_version_love_story" USING btree ("_order");
  CREATE INDEX "_wedding_settings_v_version_love_story_parent_id_idx" ON "_wedding_settings_v_version_love_story" USING btree ("_parent_id");
  CREATE INDEX "_wedding_settings_v_version_bank_accounts_order_idx" ON "_wedding_settings_v_version_bank_accounts" USING btree ("_order");
  CREATE INDEX "_wedding_settings_v_version_bank_accounts_parent_id_idx" ON "_wedding_settings_v_version_bank_accounts" USING btree ("_parent_id");
  CREATE INDEX "_wedding_settings_v_version_section_order_order_idx" ON "_wedding_settings_v_version_section_order" USING btree ("_order");
  CREATE INDEX "_wedding_settings_v_version_section_order_parent_id_idx" ON "_wedding_settings_v_version_section_order" USING btree ("_parent_id");
  CREATE INDEX "_wedding_settings_v_created_at_idx" ON "_wedding_settings_v" USING btree ("created_at");
  CREATE INDEX "_wedding_settings_v_updated_at_idx" ON "_wedding_settings_v" USING btree ("updated_at");
  CREATE INDEX "_wedding_settings_v_rels_order_idx" ON "_wedding_settings_v_rels" USING btree ("order");
  CREATE INDEX "_wedding_settings_v_rels_parent_idx" ON "_wedding_settings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_wedding_settings_v_rels_path_idx" ON "_wedding_settings_v_rels" USING btree ("path");
  CREATE INDEX "_wedding_settings_v_rels_admins_id_idx" ON "_wedding_settings_v_rels" USING btree ("admins_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "admins_sessions" CASCADE;
  DROP TABLE "admins" CASCADE;
  DROP TABLE "admins_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_rels" CASCADE;
  DROP TABLE "_media_v" CASCADE;
  DROP TABLE "_media_v_rels" CASCADE;
  DROP TABLE "folders" CASCADE;
  DROP TABLE "folders_rels" CASCADE;
  DROP TABLE "_folders_v" CASCADE;
  DROP TABLE "_folders_v_rels" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "tags_rels" CASCADE;
  DROP TABLE "_tags_v" CASCADE;
  DROP TABLE "_tags_v_rels" CASCADE;
  DROP TABLE "guests" CASCADE;
  DROP TABLE "guests_rels" CASCADE;
  DROP TABLE "rsvps" CASCADE;
  DROP TABLE "rsvps_rels" CASCADE;
  DROP TABLE "guest_messages" CASCADE;
  DROP TABLE "guest_messages_rels" CASCADE;
  DROP TABLE "gallery_items" CASCADE;
  DROP TABLE "gallery_items_rels" CASCADE;
  DROP TABLE "_gallery_items_v" CASCADE;
  DROP TABLE "_gallery_items_v_rels" CASCADE;
  DROP TABLE "rate_limits" CASCADE;
  DROP TABLE "rate_limits_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "payload_llm_instructions" CASCADE;
  DROP TABLE "payload_llm_instructions_rels" CASCADE;
  DROP TABLE "wedding_settings_love_story" CASCADE;
  DROP TABLE "wedding_settings_bank_accounts" CASCADE;
  DROP TABLE "wedding_settings_section_order" CASCADE;
  DROP TABLE "wedding_settings" CASCADE;
  DROP TABLE "wedding_settings_rels" CASCADE;
  DROP TABLE "_wedding_settings_v_version_love_story" CASCADE;
  DROP TABLE "_wedding_settings_v_version_bank_accounts" CASCADE;
  DROP TABLE "_wedding_settings_v_version_section_order" CASCADE;
  DROP TABLE "_wedding_settings_v" CASCADE;
  DROP TABLE "_wedding_settings_v_rels" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_guests_invitation_type";
  DROP TYPE "public"."enum_guests_invitation_status";
  DROP TYPE "public"."enum_rsvps_attendance";
  DROP TYPE "public"."enum_guest_messages_status";
  DROP TYPE "public"."enum_gallery_items_role";
  DROP TYPE "public"."enum__gallery_items_v_version_role";
  DROP TYPE "public"."enum_payload_llm_instructions_entity_type";
  DROP TYPE "public"."enum_wedding_settings_bank_accounts_bank";
  DROP TYPE "public"."enum__wedding_settings_v_version_bank_accounts_bank";`)
}
