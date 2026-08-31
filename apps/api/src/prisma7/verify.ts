import { createPrismaClient } from "./db.js";

const prisma = createPrismaClient();

try {
  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Product'
  `;
  const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Product'
    ORDER BY ordinal_position
  `;
  const migrations = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count FROM "_prisma_migrations"
  `;
  const products = await prisma.product.findMany({
    select: { id: true, purchaseMode: true },
    orderBy: { id: "asc" },
  });

  if (
    tables.length !== 1 ||
    columns.length !== 8 ||
    migrations[0]?.count !== 1n ||
    products.length !== 3 ||
    products.filter(({ purchaseMode }) => purchaseMode === "QUOTE_REQUIRED")
      .length !== 1 ||
    products.filter(({ purchaseMode }) => purchaseMode === "DIRECT_PURCHASE")
      .length !== 2
  ) {
    throw new Error("Prisma 7 schema verification failed.");
  }

  console.log(
    JSON.stringify({
      table: tables[0]?.table_name,
      columns: columns.map(({ column_name }) => column_name),
      migrationCount: migrations[0]?.count.toString(),
      products,
    }),
  );
} finally {
  await prisma.$disconnect();
}
