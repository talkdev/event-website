import "dotenv/config";
import { eq } from "drizzle-orm";
import {
  categories,
  cities,
  eventCategories,
  eventOccurrences,
  events,
  offers,
  venues,
} from "../src/db/schema";
import { getDb, getSql } from "../src/lib/db";
import { createId } from "../src/lib/ids";

const CITY_SEED = [
  { name: "Delhi", slug: "delhi", sortOrder: 1 },
  { name: "Mumbai", slug: "mumbai", sortOrder: 2 },
  { name: "Bengaluru", slug: "bengaluru", sortOrder: 3 },
] as const;

const CATEGORY_TREE: Array<{
  name: string;
  slug: string;
  children: Array<{ name: string; slug: string }>;
}> = [
  {
    name: "Music & Nightlife",
    slug: "music-nightlife",
    children: [
      { name: "Concerts", slug: "concerts" },
      { name: "Live music", slug: "live-music" },
      { name: "DJs & clubs", slug: "djs-clubs" },
    ],
  },
  {
    name: "Arts & Culture",
    slug: "arts-culture",
    children: [
      { name: "Theatre", slug: "theatre" },
      { name: "Comedy", slug: "comedy" },
      { name: "Exhibitions", slug: "exhibitions" },
      { name: "Museums", slug: "museums" },
    ],
  },
  {
    name: "Food & Drink",
    slug: "food-drink",
    children: [
      { name: "Food festivals", slug: "food-festivals" },
      { name: "Tastings", slug: "tastings" },
      { name: "Culinary experiences", slug: "culinary-experiences" },
    ],
  },
  {
    name: "Workshops & Learning",
    slug: "workshops-learning",
    children: [
      { name: "Creative workshops", slug: "creative-workshops" },
      { name: "Classes", slug: "classes" },
      { name: "Talks", slug: "talks" },
    ],
  },
  {
    name: "Festivals & Community",
    slug: "festivals-community",
    children: [
      { name: "Cultural festivals", slug: "cultural-festivals" },
      { name: "Fairs", slug: "fairs" },
      { name: "Community gatherings", slug: "community-gatherings" },
    ],
  },
  {
    name: "Sports & Fitness",
    slug: "sports-fitness",
    children: [
      { name: "Matches", slug: "matches" },
      { name: "Running", slug: "running" },
      { name: "Fitness sessions", slug: "fitness-sessions" },
    ],
  },
  {
    name: "Family & Kids",
    slug: "family-kids",
    children: [
      { name: "Children's activities", slug: "childrens-activities" },
      { name: "Family experiences", slug: "family-experiences" },
    ],
  },
  {
    name: "Markets & Shopping",
    slug: "markets-shopping",
    children: [
      { name: "Flea markets", slug: "flea-markets" },
      { name: "Pop-ups", slug: "pop-ups" },
      { name: "Craft fairs", slug: "craft-fairs" },
    ],
  },
  {
    name: "Business & Networking",
    slug: "business-networking",
    children: [
      { name: "Conferences", slug: "conferences" },
      { name: "Professional meetups", slug: "professional-meetups" },
    ],
  },
  {
    name: "Nature & Outdoors",
    slug: "nature-outdoors",
    children: [
      { name: "Walks", slug: "walks" },
      { name: "Outdoor experiences", slug: "outdoor-experiences" },
    ],
  },
];

const DEMO_EVENTS: Array<{
  citySlug: string;
  title: string;
  eventSlug: string;
  occurrenceSlug: string;
  categorySlug: string;
  description: string;
  daysFromNow: number;
  hour: number;
  venueName?: string;
  locality?: string;
  venueTba?: boolean;
  priceType: "FREE" | "PAID" | "RANGE";
  priceMin?: string;
}> = [
  {
    citySlug: "delhi",
    title: "Acoustic Evening at Lodhi",
    eventSlug: "acoustic-evening-lodhi",
    occurrenceSlug: "acoustic-evening-lodhi-2026",
    categorySlug: "live-music",
    description:
      "An open-air acoustic set featuring independent Delhi artists. Demo listing for interface development — not a real event.",
    daysFromNow: 2,
    hour: 18,
    venueName: "Lodhi Garden Amphitheatre",
    locality: "Lodhi Road",
    priceType: "RANGE",
    priceMin: "499",
  },
  {
    citySlug: "delhi",
    title: "Weekend Flea at Dhan Mill",
    eventSlug: "weekend-flea-dhan-mill",
    occurrenceSlug: "weekend-flea-dhan-mill-2026",
    categorySlug: "flea-markets",
    description:
      "Independent makers, vintage stalls, and food carts. Demo listing for interface development — not a real event.",
    daysFromNow: 3,
    hour: 11,
    venueName: "Dhan Mill Compound",
    locality: "Chattarpur",
    priceType: "FREE",
  },
  {
    citySlug: "mumbai",
    title: "Stand-up Night in Bandra",
    eventSlug: "standup-night-bandra",
    occurrenceSlug: "standup-night-bandra-2026",
    categorySlug: "comedy",
    description:
      "A curated comedy lineup for a weeknight crowd. Demo listing for interface development — not a real event.",
    daysFromNow: 1,
    hour: 20,
    venueName: "Canvas Laugh Club",
    locality: "Bandra West",
    priceType: "PAID",
    priceMin: "799",
  },
  {
    citySlug: "mumbai",
    title: "Harbour Walk & Sketch",
    eventSlug: "harbour-walk-sketch",
    occurrenceSlug: "harbour-walk-sketch-2026",
    categorySlug: "walks",
    description:
      "A guided morning walk with short sketching stops. Demo listing for interface development — not a real event.",
    daysFromNow: 5,
    hour: 7,
    venueName: "Gateway of India",
    locality: "Colaba",
    priceType: "FREE",
  },
  {
    citySlug: "bengaluru",
    title: "Indie Gig at Indiranagar",
    eventSlug: "indie-gig-indiranagar",
    occurrenceSlug: "indie-gig-indiranagar-2026",
    categorySlug: "concerts",
    description:
      "Local bands, standing room, and late dinner nearby. Demo listing for interface development — not a real event.",
    daysFromNow: 4,
    hour: 19,
    venueName: "The Humming Tree",
    locality: "Indiranagar",
    priceType: "RANGE",
    priceMin: "599",
  },
  {
    citySlug: "bengaluru",
    title: "Pottery Workshop (Beginners)",
    eventSlug: "pottery-workshop-beginners",
    occurrenceSlug: "pottery-workshop-beginners-2026",
    categorySlug: "creative-workshops",
    description:
      "A hands-on clay session for first-timers. Demo listing for interface development — not a real event.",
    daysFromNow: 6,
    hour: 10,
    venueTba: true,
    priceType: "PAID",
    priceMin: "1500",
  },
];

async function upsertCities() {
  const db = getDb();
  const cityIds = new Map<string, string>();

  for (const city of CITY_SEED) {
    const existing = await db.select().from(cities).where(eq(cities.slug, city.slug)).limit(1);
    if (existing[0]) {
      cityIds.set(city.slug, existing[0].id);
      continue;
    }
    const id = createId("city");
    await db.insert(cities).values({
      id,
      name: city.name,
      slug: city.slug,
      timezone: "Asia/Kolkata",
      country: "IN",
      isLaunchCity: true,
      sortOrder: city.sortOrder,
    });
    cityIds.set(city.slug, id);
  }

  return cityIds;
}

async function upsertCategories() {
  const db = getDb();
  const categoryIds = new Map<string, string>();

  let sort = 0;
  for (const parent of CATEGORY_TREE) {
    sort += 10;
    let parentId: string;
    const existingParent = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, parent.slug))
      .limit(1);

    if (existingParent[0]) {
      parentId = existingParent[0].id;
    } else {
      parentId = createId("cat");
      await db.insert(categories).values({
        id: parentId,
        name: parent.name,
        slug: parent.slug,
        parentId: null,
        sortOrder: sort,
      });
    }
    categoryIds.set(parent.slug, parentId);

    let childSort = 0;
    for (const child of parent.children) {
      childSort += 1;
      const existingChild = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, child.slug))
        .limit(1);
      if (existingChild[0]) {
        categoryIds.set(child.slug, existingChild[0].id);
        continue;
      }
      const childId = createId("cat");
      await db.insert(categories).values({
        id: childId,
        name: child.name,
        slug: child.slug,
        parentId,
        sortOrder: childSort,
      });
      categoryIds.set(child.slug, childId);
    }
  }

  return categoryIds;
}

async function seedDemoEvents(
  cityIds: Map<string, string>,
  categoryIds: Map<string, string>,
) {
  const db = getDb();

  for (const demo of DEMO_EVENTS) {
    const existing = await db
      .select()
      .from(events)
      .where(eq(events.slug, demo.eventSlug))
      .limit(1);
    if (existing[0]) continue;

    const cityId = cityIds.get(demo.citySlug);
    const categoryId = categoryIds.get(demo.categorySlug);
    if (!cityId || !categoryId) continue;

    const eventId = createId("evt");
    const occurrenceId = createId("occ");
    let venueId: string | null = null;

    if (demo.venueName) {
      venueId = createId("ven");
      const venueSlug = demo.venueName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await db.insert(venues).values({
        id: venueId,
        name: demo.venueName,
        slug: `${venueSlug}-${demo.citySlug}`,
        cityId,
        locality: demo.locality,
        country: "IN",
      });
    }

    const startsAt = new Date();
    startsAt.setUTCDate(startsAt.getUTCDate() + demo.daysFromNow);
    startsAt.setUTCHours(demo.hour - 5, 30, 0, 0); // rough IST evening/day alignment for demo

    await db.insert(events).values({
      id: eventId,
      slug: demo.eventSlug,
      title: demo.title,
      description: demo.description,
      publication: "PUBLISHED",
      publishedAt: new Date(),
      isOnline: false,
    });

    await db.insert(eventCategories).values({
      eventId,
      categoryId,
      isPrimary: true,
    });

    await db.insert(eventOccurrences).values({
      id: occurrenceId,
      eventId,
      cityId,
      venueId,
      slug: demo.occurrenceSlug,
      startsAt,
      endsAt: new Date(startsAt.getTime() + 2 * 60 * 60 * 1000),
      timezone: "Asia/Kolkata",
      status: "SCHEDULED",
      venueTba: demo.venueTba ?? !demo.venueName,
    });

    await db.insert(offers).values({
      id: createId("ofr"),
      occurrenceId,
      providerName: "Official",
      url: "https://example.com/tickets",
      currency: "INR",
      priceType: demo.priceType,
      priceMin: demo.priceMin ?? null,
      availability: "AVAILABLE",
      isPrimary: true,
    });
  }
}

async function main() {
  console.log("Seeding SceneAround…");
  const cityIds = await upsertCities();
  const categoryIds = await upsertCategories();
  await seedDemoEvents(cityIds, categoryIds);
  console.log("Seed complete: cities, categories, and demo events (marked in descriptions).");
  await getSql().end({ timeout: 5 });
}

main().catch(async (error) => {
  console.error(error);
  try {
    await getSql().end({ timeout: 5 });
  } catch {
    // ignore
  }
  process.exit(1);
});
