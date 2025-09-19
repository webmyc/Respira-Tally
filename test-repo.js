// Test script to check BaseHub repository structure
import { basehub } from "basehub";
import "../basehub.config";

async function testRepository() {
  console.log("🔍 Testing BaseHub repository structure...");
  
  try {
    // Test 1: Basic connection
    const connectionTest = await basehub().query({
      _sys: {
        playgroundInfo: {
          expiresAt: true,
          editUrl: true,
          claimUrl: true,
        },
      },
    });
    console.log("✅ BaseHub connection successful");
    console.log("🔗 Edit URL:", connectionTest._sys.playgroundInfo.editUrl);
    
    // Test 2: Try to get root level data
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
      console.log("📄 Root documents:", rootTest._sys.documents.items.map(d => `${d._title} (${d._type})`));
    } catch (error) {
      console.log("❌ Could not fetch root documents:", error.message);
    }
    
    // Test 3: Try to get collections
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
      console.log("📚 Collections:", collectionsTest._sys.collections.items.map(c => `${c._title} (${c._type})`));
    } catch (error) {
      console.log("❌ Could not fetch collections:", error.message);
    }
    
    // Test 4: Try to get site data
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
      console.log("💡 The marketing template might have a different structure");
    }
    
    // Test 5: Try to get any data at root level
    try {
      // Let's try to see what fields are available at root level
      const anyData = await basehub().query({
        _sys: {
          playgroundInfo: {
            expiresAt: true,
            editUrl: true,
            claimUrl: true,
          },
        },
      });
      console.log("🔗 Playground info available");
    } catch (error) {
      console.log("❌ Could not get playground info:", error.message);
    }
    
  } catch (error) {
    console.log("❌ BaseHub test failed:", error.message);
  }
}

testRepository().catch(console.error);
