CREATE TYPE "public"."job_status" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'DEAD');--> statement-breakpoint
CREATE TYPE "public"."occurrence_status" AS ENUM('SCHEDULED', 'CANCELLED', 'POSTPONED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."offer_availability" AS ENUM('AVAILABLE', 'SOLD_OUT', 'REGISTRATION_CLOSED', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."price_type" AS ENUM('FREE', 'PAID', 'RANGE', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."source_record_status" AS ENUM('ACTIVE', 'STALE', 'REMOVED', 'ERROR');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"parent_id" text,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"timezone" text NOT NULL,
	"country" varchar(2) DEFAULT 'IN' NOT NULL,
	"is_launch_city" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_categories" (
	"event_id" text NOT NULL,
	"category_id" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "event_categories_event_id_category_id_pk" PRIMARY KEY("event_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "event_occurrences" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"city_id" text NOT NULL,
	"venue_id" text,
	"slug" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"timezone" text NOT NULL,
	"status" "occurrence_status" DEFAULT 'SCHEDULED' NOT NULL,
	"venue_tba" boolean DEFAULT false NOT NULL,
	"neighborhood" text,
	"locked_fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor" text,
	"changes" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"source_type" text NOT NULL,
	"base_url" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"config" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"organizer_id" text,
	"publication" "publication_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp with time zone,
	"image_url" text,
	"image_attribution" text,
	"is_online" boolean DEFAULT false NOT NULL,
	"age_restriction" text,
	"family_friendly" boolean,
	"accessibility_notes" text,
	"indoor_outdoor" text,
	"locked_fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "job_status" DEFAULT 'PENDING' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"run_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" text PRIMARY KEY NOT NULL,
	"occurrence_id" text NOT NULL,
	"provider_name" text,
	"url" text NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"price_type" "price_type" DEFAULT 'UNKNOWN' NOT NULL,
	"price_min" numeric(12, 2),
	"price_max" numeric(12, 2),
	"availability" "offer_availability" DEFAULT 'UNKNOWN' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"website_url" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_listings" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"event_id" text,
	"provider_record_id" text NOT NULL,
	"source_url" text NOT NULL,
	"raw_payload" jsonb,
	"status" "source_record_status" DEFAULT 'ACTIVE' NOT NULL,
	"last_seen_at" timestamp with time zone,
	"last_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"city_id" text NOT NULL,
	"street_address" text,
	"locality" text,
	"region" text,
	"postal_code" text,
	"country" varchar(2) DEFAULT 'IN' NOT NULL,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"maps_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_occurrences" ADD CONSTRAINT "event_occurrences_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_occurrences" ADD CONSTRAINT "event_occurrences_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_occurrences" ADD CONSTRAINT "event_occurrences_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_revisions" ADD CONSTRAINT "event_revisions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_organizers_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_occurrence_id_event_occurrences_id_fk" FOREIGN KEY ("occurrence_id") REFERENCES "public"."event_occurrences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_listings" ADD CONSTRAINT "source_listings_source_id_event_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."event_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_listings" ADD CONSTRAINT "source_listings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venues" ADD CONSTRAINT "venues_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_uidx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cities_slug_uidx" ON "cities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "cities_country_name_idx" ON "cities" USING btree ("country","name");--> statement-breakpoint
CREATE INDEX "event_categories_category_event_idx" ON "event_categories" USING btree ("category_id","event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_occurrences_slug_uidx" ON "event_occurrences" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "event_occurrences_city_status_starts_idx" ON "event_occurrences" USING btree ("city_id","status","starts_at");--> statement-breakpoint
CREATE INDEX "event_occurrences_event_starts_idx" ON "event_occurrences" USING btree ("event_id","starts_at");--> statement-breakpoint
CREATE INDEX "event_occurrences_venue_starts_idx" ON "event_occurrences" USING btree ("venue_id","starts_at");--> statement-breakpoint
CREATE INDEX "event_revisions_event_changed_idx" ON "event_revisions" USING btree ("event_id","changed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_uidx" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "events_publication_published_idx" ON "events" USING btree ("publication","published_at");--> statement-breakpoint
CREATE INDEX "events_organizer_idx" ON "events" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "events_updated_idx" ON "events" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "jobs_status_run_at_idx" ON "jobs" USING btree ("status","run_at");--> statement-breakpoint
CREATE INDEX "jobs_type_idx" ON "jobs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "offers_occurrence_idx" ON "offers" USING btree ("occurrence_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizers_slug_uidx" ON "organizers" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "source_listings_source_provider_uidx" ON "source_listings" USING btree ("source_id","provider_record_id");--> statement-breakpoint
CREATE INDEX "source_listings_event_idx" ON "source_listings" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "source_listings_status_verified_idx" ON "source_listings" USING btree ("status","last_verified_at");--> statement-breakpoint
CREATE UNIQUE INDEX "venues_city_slug_uidx" ON "venues" USING btree ("city_id","slug");--> statement-breakpoint
CREATE INDEX "venues_city_name_idx" ON "venues" USING btree ("city_id","name");