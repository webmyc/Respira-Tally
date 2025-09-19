// Simple BaseHub schema test
// Run with: npm run test-schema

import { basehub } from "basehub";
import "../basehub.config";

async function testSchema() {
  console.log("🔍 Testing BaseHub Schema...\n");
  
  try {
    // Test basic connection
    const test = await basehub().query({
      _sys: {
        playgroundInfo: {
          expiresAt: true,
          editUrl: true,
          claimUrl: true,
        },
      },
    });
    console.log("✅ BaseHub connection successful");
    
    // Check available types
    const schemaTest = await basehub().query({
      _sys: {
        schema: {
          types: {
            items: {
              name: true,
              kind: true,
            },
          },
        },
      },
    });
    
    console.log(`\n📋 Available types (${schemaTest._sys.schema.types.items.length}):`);
    schemaTest._sys.schema.types.items.forEach(type => {
      console.log(`   - ${type.name} (${type.kind})`);
    });
    
    // Check if site exists
    try {
      const siteTest = await basehub().query({
        site: {
          _id: true,
          _title: true,
        },
      });
      console.log(`\n✅ Site found: ${siteTest.site._title}`);
    } catch (error) {
      console.log(`\n❌ Site not found: ${error.message}`);
      console.log("💡 You need to create a 'site' document in your BaseHub repository");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testSchema();
