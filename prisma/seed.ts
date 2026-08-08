import "dotenv/config";
import { PlanTier } from "@prisma/client";
import { db } from "../src/server/db/client";

async function main() {
  const org = await db.organization.upsert({
    where: { slug: "demo-workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
      owner: {
        create: {
          clerkId: "demo_clerk_user",
          email: "demo@healsite.ai",
          name: "Demo User",
        },
      },
    },
  });

  await db.subscription.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      plan: PlanTier.FREE,
      status: "TRIALING",
    },
  });

  console.log(`Seeded organization: ${org.name} (${org.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
