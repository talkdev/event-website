import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const publicationStatusEnum = pgEnum("publication_status", [
  "DRAFT",
  "REVIEW",
  "PUBLISHED",
  "ARCHIVED",
]);

export const occurrenceStatusEnum = pgEnum("occurrence_status", [
  "SCHEDULED",
  "CANCELLED",
  "POSTPONED",
  "COMPLETED",
]);

export const sourceRecordStatusEnum = pgEnum("source_record_status", [
  "ACTIVE",
  "STALE",
  "REMOVED",
  "ERROR",
]);

export const priceTypeEnum = pgEnum("price_type", [
  "FREE",
  "PAID",
  "RANGE",
  "UNKNOWN",
]);

export const offerAvailabilityEnum = pgEnum("offer_availability", [
  "AVAILABLE",
  "SOLD_OUT",
  "REGISTRATION_CLOSED",
  "UNKNOWN",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "DEAD",
]);

export const cities = pgTable(
  "cities",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    timezone: text("timezone").notNull(),
    country: varchar("country", { length: 2 }).notNull().default("IN"),
    isLaunchCity: boolean("is_launch_city").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("cities_slug_uidx").on(table.slug),
    index("cities_country_name_idx").on(table.country, table.name),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    parentId: text("parent_id"),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("categories_slug_uidx").on(table.slug),
    index("categories_parent_idx").on(table.parentId),
  ],
);

export const organizers = pgTable(
  "organizers",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    websiteUrl: text("website_url"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("organizers_slug_uidx").on(table.slug)],
);

export const venues = pgTable(
  "venues",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    cityId: text("city_id")
      .notNull()
      .references(() => cities.id, { onDelete: "restrict" }),
    streetAddress: text("street_address"),
    locality: text("locality"),
    region: text("region"),
    postalCode: text("postal_code"),
    country: varchar("country", { length: 2 }).notNull().default("IN"),
    latitude: numeric("latitude", { precision: 9, scale: 6 }),
    longitude: numeric("longitude", { precision: 9, scale: 6 }),
    mapsUrl: text("maps_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("venues_city_slug_uidx").on(table.cityId, table.slug),
    index("venues_city_name_idx").on(table.cityId, table.name),
  ],
);

export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    organizerId: text("organizer_id").references(() => organizers.id, {
      onDelete: "set null",
    }),
    publication: publicationStatusEnum("publication").notNull().default("DRAFT"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    imageUrl: text("image_url"),
    imageAttribution: text("image_attribution"),
    isOnline: boolean("is_online").notNull().default(false),
    ageRestriction: text("age_restriction"),
    familyFriendly: boolean("family_friendly"),
    accessibilityNotes: text("accessibility_notes"),
    indoorOutdoor: text("indoor_outdoor"),
    lockedFields: jsonb("locked_fields").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("events_slug_uidx").on(table.slug),
    index("events_publication_published_idx").on(table.publication, table.publishedAt),
    index("events_organizer_idx").on(table.organizerId),
    index("events_updated_idx").on(table.updatedAt),
  ],
);

export const eventOccurrences = pgTable(
  "event_occurrences",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }),
    cityId: text("city_id")
      .notNull()
      .references(() => cities.id, { onDelete: "restrict" }),
    venueId: text("venue_id").references(() => venues.id, { onDelete: "set null" }),
    slug: text("slug").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    timezone: text("timezone").notNull(),
    status: occurrenceStatusEnum("status").notNull().default("SCHEDULED"),
    venueTba: boolean("venue_tba").notNull().default(false),
    neighborhood: text("neighborhood"),
    lockedFields: jsonb("locked_fields").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("event_occurrences_slug_uidx").on(table.slug),
    index("event_occurrences_city_status_starts_idx").on(
      table.cityId,
      table.status,
      table.startsAt,
    ),
    index("event_occurrences_event_starts_idx").on(table.eventId, table.startsAt),
    index("event_occurrences_venue_starts_idx").on(table.venueId, table.startsAt),
  ],
);

export const eventCategories = pgTable(
  "event_categories",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    isPrimary: boolean("is_primary").notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.eventId, table.categoryId] }),
    index("event_categories_category_event_idx").on(table.categoryId, table.eventId),
  ],
);

export const eventSources = pgTable("event_sources", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sourceType: text("source_type").notNull(),
  baseUrl: text("base_url"),
  enabled: boolean("enabled").notNull().default(true),
  config: jsonb("config").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sourceListings = pgTable(
  "source_listings",
  {
    id: text("id").primaryKey(),
    sourceId: text("source_id")
      .notNull()
      .references(() => eventSources.id, { onDelete: "restrict" }),
    eventId: text("event_id").references(() => events.id, { onDelete: "set null" }),
    providerRecordId: text("provider_record_id").notNull(),
    sourceUrl: text("source_url").notNull(),
    rawPayload: jsonb("raw_payload"),
    status: sourceRecordStatusEnum("status").notNull().default("ACTIVE"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("source_listings_source_provider_uidx").on(
      table.sourceId,
      table.providerRecordId,
    ),
    index("source_listings_event_idx").on(table.eventId),
    index("source_listings_status_verified_idx").on(table.status, table.lastVerifiedAt),
  ],
);

export const offers = pgTable(
  "offers",
  {
    id: text("id").primaryKey(),
    occurrenceId: text("occurrence_id")
      .notNull()
      .references(() => eventOccurrences.id, { onDelete: "cascade" }),
    providerName: text("provider_name"),
    url: text("url").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("INR"),
    priceType: priceTypeEnum("price_type").notNull().default("UNKNOWN"),
    priceMin: numeric("price_min", { precision: 12, scale: 2 }),
    priceMax: numeric("price_max", { precision: 12, scale: 2 }),
    availability: offerAvailabilityEnum("availability").notNull().default("UNKNOWN"),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("offers_occurrence_idx").on(table.occurrenceId)],
);

export const eventRevisions = pgTable(
  "event_revisions",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }),
    changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
    actor: text("actor"),
    changes: jsonb("changes").notNull(),
  },
  (table) => [index("event_revisions_event_changed_idx").on(table.eventId, table.changedAt)],
);

export const jobs = pgTable(
  "jobs",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    status: jobStatusEnum("status").notNull().default("PENDING"),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    runAt: timestamp("run_at", { withTimezone: true }).notNull().defaultNow(),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("jobs_status_run_at_idx").on(table.status, table.runAt),
    index("jobs_type_idx").on(table.type),
  ],
);

export const citiesRelations = relations(cities, ({ many }) => ({
  venues: many(venues),
  occurrences: many(eventOccurrences),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_tree",
  }),
  children: many(categories, { relationName: "category_tree" }),
  eventCategories: many(eventCategories),
}));

export const venuesRelations = relations(venues, ({ one, many }) => ({
  city: one(cities, { fields: [venues.cityId], references: [cities.id] }),
  occurrences: many(eventOccurrences),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(organizers, {
    fields: [events.organizerId],
    references: [organizers.id],
  }),
  occurrences: many(eventOccurrences),
  categories: many(eventCategories),
  sourceListings: many(sourceListings),
  revisions: many(eventRevisions),
}));

export const eventOccurrencesRelations = relations(eventOccurrences, ({ one, many }) => ({
  event: one(events, {
    fields: [eventOccurrences.eventId],
    references: [events.id],
  }),
  city: one(cities, {
    fields: [eventOccurrences.cityId],
    references: [cities.id],
  }),
  venue: one(venues, {
    fields: [eventOccurrences.venueId],
    references: [venues.id],
  }),
  offers: many(offers),
}));

export const eventCategoriesRelations = relations(eventCategories, ({ one }) => ({
  event: one(events, {
    fields: [eventCategories.eventId],
    references: [events.id],
  }),
  category: one(categories, {
    fields: [eventCategories.categoryId],
    references: [categories.id],
  }),
}));

export const eventSourcesRelations = relations(eventSources, ({ many }) => ({
  listings: many(sourceListings),
}));

export const sourceListingsRelations = relations(sourceListings, ({ one }) => ({
  source: one(eventSources, {
    fields: [sourceListings.sourceId],
    references: [eventSources.id],
  }),
  event: one(events, {
    fields: [sourceListings.eventId],
    references: [events.id],
  }),
}));

export const offersRelations = relations(offers, ({ one }) => ({
  occurrence: one(eventOccurrences, {
    fields: [offers.occurrenceId],
    references: [eventOccurrences.id],
  }),
}));

export const eventRevisionsRelations = relations(eventRevisions, ({ one }) => ({
  event: one(events, {
    fields: [eventRevisions.eventId],
    references: [events.id],
  }),
}));
