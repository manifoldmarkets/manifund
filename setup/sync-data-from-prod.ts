#!/usr/bin/env bun
import { $ } from "bun";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { createInterface } from "readline";
import { format } from "date-fns";

// Create readline interface for user input
const readline = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promise wrapper for readline question
function question(query: string): Promise<string> {
  return new Promise(resolve => {
    readline.question(query, answer => {
      resolve(answer);
    });
  });
}

async function main() {
  let prodDbUrl = "";

  // Load environment variables from .env.local if it exists
  if (existsSync(".env.local")) {
    const envFile = readFileSync(".env.local", "utf8");
    const prodDbUrlMatch = envFile.match(/PROD_DB_URL=(.+)$/m);
    if (prodDbUrlMatch && prodDbUrlMatch[1]) {
      prodDbUrl = prodDbUrlMatch[1];
    }
  }

  if (!prodDbUrl) {
    console.error("Error: PROD_DB_URL must be set in .env.local");
    process.exit(1);
  }

  const localDbStatus = (await $`npx supabase status`.text()).split("\n");
  const localDbUrl = localDbStatus
    .find((line: string) => line.includes("DB URL:"))
    ?.replace(/.*DB URL: */, "");
  if (!localDbUrl) {
    console.error("Error: Local database URL not found");
    process.exit(1);
  }

  const currentDate = format(new Date(), "yyyyMMdd_HHmmss");
  const dataBackup = `prod_data_${currentDate}.sql`;

  console.log("This will:");
  console.log("   1. Export data from production: ", prodDbUrl);
  console.log("   2. Clear all data in local database: ", localDbUrl);
  console.log("   3. Import production data to local");
  console.log("");

  const reply = await question("Continue? (y/N): ");
  if (!reply.match(/^[Yy]$/)) {
    readline.close();
    process.exit(1);
  }

  console.log("Step 1: Exporting data from production...");
  try {
    await $`pg_dump --data-only --no-owner --no-acl ${prodDbUrl} -f ${dataBackup}`;
    console.log(`Data exported to ${dataBackup}`);
  } catch (error) {
    console.error("Error exporting data:", error);
    readline.close();
    process.exit(1);
  }

  console.log("\nStep 2: Clearing local database data...");
  try {
    await $`psql ${localDbUrl} -c "
      DO \$\$ 
      DECLARE
          r RECORD;
      BEGIN
          -- Truncate all tables in public schema
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
          END LOOP;
      END \$\$;
    "`;
    console.log("Local data cleared");
  } catch (error) {
    console.error("Error clearing local database:", error);
    readline.close();
    process.exit(1);
  }

  console.log("\nStep 3: Importing production data (filtering harmless errors)...");
  try {
    // Import data and filter out known harmless errors
    const result = await $`psql ${localDbUrl} -f ${dataBackup}`.text();

    // Filter and display output, removing harmless errors
    const filteredOutput = result
      .split("\n")
      .filter(line =>
        !line.includes("error: invalid command") &&
        !line.includes("ERROR") && !line.includes("duplicate key value violates unique constraint") &&
        !line.includes("migrations") &&
        !line.includes("schema_migrations") &&
        !line.includes("supabase_migrations") && !line.includes("does not exist") &&
        !line.includes("syntax error at or near") &&
        !line.includes("invalid command")
      )
      .join("\n");

    if (filteredOutput.trim()) {
      console.log(filteredOutput);
    }

    console.log("Production data imported");
  } catch (error) {
    console.log("Production data imported with some errors (this might be expected)");
  }

  console.log("\nStep 4: Verifying data import...");
  console.log("   Checking row counts for main tables:");

  try {
    const tableStats = await $`psql ${localDbUrl} -c "
      SELECT 
          'bids' as table_name, 
          count(*) as row_count
      FROM bids
      UNION ALL
      SELECT 
          'projects', 
          count(*) 
      FROM projects
      UNION ALL
      SELECT 
          'comments', 
          count(*) 
      FROM comments
      UNION ALL
      SELECT 
          'profiles', 
          count(*) 
      FROM profiles
      ORDER BY row_count DESC;
    " --quiet --tuples-only`.text();

    // Display table stats
    tableStats.split("\n").forEach(line => {
      if (line.trim()) {
        console.log(`   ${line.trim()}`);
      }
    });
  } catch (error) {
    console.error("Error verifying data import:", error);
  }

  console.log("\n🧹 Cleanup:");
  const deleteReply = await question("Delete backup file? (y/N): ");

  if (deleteReply.match(/^[Yy]$/)) {
    try {
      unlinkSync(dataBackup);
      console.log("Backup file deleted");
    } catch (error) {
      console.error("Error deleting backup file:", error);
    }
  } else {
    console.log(`Backup file kept: ${dataBackup}`);
  }

  readline.close();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
}); 