import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg(connectionString);
const db = new PrismaClient({ adapter });

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

async function main() {
  // Create poet "Harsh"
  const poetSlug = slugify("Harsh");
  const existingPoet = await db.poet.findUnique({ where: { slug: poetSlug } });

  const poet = existingPoet
    ? existingPoet
    : await db.poet.create({
        data: {
          name: "Harsh",
          slug: poetSlug,
          bio: "A poet who writes about love, longing, and the transient nature of life.",
        },
      });

  console.log(`Poet created/found: ${poet.name} (${poet.id})`);

  // Create poem "इश्क़ - इल्म"
  const poemSlug = slugify("ishq-ilm");
  const existingPoem = await db.poem.findUnique({ where: { slug: poemSlug } });

  if (existingPoem) {
    console.log(`Poem already exists: ${existingPoem.title} (${existingPoem.id})`);
    return;
  }

  const poemContent = `हमारा किसी के प्रेम मे रुकना निरह है,
पेड़ पत्ते से एक समय बाद झड़ ही जायेगा

ज्ञात था मुझे भी नहीं है लकीरों मे वो मेरी,
मैने सोचा इश्क़ है, मुकद्दर से तो लड़ ही जायेगा

चाह के भी मुकम्मल ना हुआ फकत मोहब्बत मेरा
कितने ही पुराने दरख़्त मे बधा हो इश्क़ का भरम, महबूब का महबूब देखने के बाद, ये भरम भी उखड़ ही जायेगा

बारिश ज़मीन पे ही क्यों ना हो,
बर्फ का ढेर शिखर चढ़ ही जायेगा

मोहब्बत की जंजीर मे बधा पुरुष,
एक दिन मोहब्बत छोड़ के आगे बढ़ ही जायेगा`;

  const poem = await db.poem.create({
    data: {
      title: "इश्क़ - इल्म",
      slug: poemSlug,
      content: poemContent,
      published: true,
      poetId: poet.id,
    },
  });

  console.log(`Poem created: ${poem.title} (${poem.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
