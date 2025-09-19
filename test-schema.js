import { basehub } from "basehub";
import "../basehub.config";

async function testBaseHubSchema() {
  console.log("🔍 Testing BaseHub Schema Structure...\n");
  
  try {
    // Test 1: Basic connection
    console.log("1. Testing BaseHub connection...");
    const basicTest = await basehub().query({
      _sys: {
        playgroundInfo: {
          expiresAt: true,
          editUrl: true,
          claimUrl: true,
        },
      },
    });
    console.log("✅ BaseHub connection successful");
    
    // Test 2: Check available types
    console.log("\n2. Checking available types...");
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
    
    console.log(`📋 Found ${schemaTest._sys.schema.types.items.length} types:`);
    schemaTest._sys.schema.types.items.forEach(type => {
      console.log(`   - ${type.name} (${type.kind})`);
    });
    
    // Test 3: Check if site exists
    console.log("\n3. Testing site structure...");
    try {
      const siteTest = await basehub().query({
        site: {
          _id: true,
          _title: true,
        },
      });
      console.log("✅ Site found:", siteTest.site._title);
    } catch (error) {
      console.log("❌ Site not found:", error.message);
      console.log("💡 You need to create a 'site' document in your BaseHub repository");
    }
    
    // Test 4: Check root level documents
    console.log("\n4. Checking root level documents...");
    try {
      const rootTest = await basehub().query({
        _sys: {
          documents: {
            items: {
              _id: true,
              _title: true,
              _type: true,
            },
          },
        },
      });
      
      console.log(`📄 Found ${rootTest._sys.documents.items.length} root documents:`);
      rootTest._sys.documents.items.forEach(doc => {
        console.log(`   - ${doc._title} (${doc._type})`);
      });
    } catch (error) {
      console.log("❌ Could not fetch root documents:", error.message);
    }
    
    // Test 5: Check collections
    console.log("\n5. Checking collections...");
    try {
      const collectionsTest = await basehub().query({
        _sys: {
          collections: {
            items: {
              _id: true,
              _title: true,
              _type: true,
            },
          },
        },
      });
      
      console.log(`📚 Found ${collectionsTest._sys.collections.items.length} collections:`);
      collectionsTest._sys.collections.items.forEach(col => {
        console.log(`   - ${col._title} (${col._type})`);
      });
    } catch (error) {
      console.log("❌ Could not fetch collections:", error.message);
    }
    
  } catch (error) {
    console.error("\n❌ Schema test failed:");
    console.error(error.message);
    
    if (error.message.includes("Token not found")) {
      console.log("\n💡 Solution: Make sure BASEHUB_TOKEN is set in your .env.local file");
    }
    
    if (error.message.includes("Repository not found")) {
      console.log("\n💡 Solution: Check that the repository name 'webmyc/respiraformspro-com' is correct");
    }
  }
}

// Run the test
testBaseHubSchema().catch(console.error);
