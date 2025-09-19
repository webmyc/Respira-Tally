// BaseHub Schema Test Script
// Run this with: node test-basehub-schema.js

import { basehub } from "basehub";

async function testBaseHubSchema() {
  console.log("🔍 Testing BaseHub Schema Structure...\n");
  
  try {
    // Test 1: Check if site exists
    console.log("1. Testing site structure...");
    const siteTest = await basehub().query({
      site: {
        _id: true,
        _title: true,
      },
    });
    console.log("✅ Site found:", siteTest.site._title);
    
    // Test 2: Check settings
    console.log("\n2. Testing settings...");
    const settingsTest = await basehub().query({
      site: {
        settings: {
          _id: true,
          _title: true,
        },
      },
    });
    console.log("✅ Settings found:", settingsTest.site.settings._title);
    
    // Test 3: Check pages collection
    console.log("\n3. Testing pages collection...");
    const pagesTest = await basehub().query({
      site: {
        pages: {
          items: {
            _id: true,
            _title: true,
            pathname: true,
          },
        },
      },
    });
    console.log(`✅ Pages found: ${pagesTest.site.pages.items.length} pages`);
    pagesTest.site.pages.items.forEach(page => {
      console.log(`   - ${page._title} (${page.pathname})`);
    });
    
    // Test 4: Check header
    console.log("\n4. Testing header...");
    const headerTest = await basehub().query({
      site: {
        header: {
          _id: true,
          _title: true,
        },
      },
    });
    console.log("✅ Header found:", headerTest.site.header._title);
    
    // Test 5: Check footer
    console.log("\n5. Testing footer...");
    const footerTest = await basehub().query({
      site: {
        footer: {
          _id: true,
          _title: true,
        },
      },
    });
    console.log("✅ Footer found:", footerTest.site.footer._title);
    
    // Test 6: Check theme
    console.log("\n6. Testing theme...");
    const themeTest = await basehub().query({
      site: {
        settings: {
          theme: {
            accent: true,
            grayScale: true,
          },
        },
      },
    });
    console.log("✅ Theme found:", themeTest.site.settings.theme.accent, themeTest.site.settings.theme.grayScale);
    
    console.log("\n🎉 All schema tests passed! Your BaseHub setup is ready.");
    
  } catch (error) {
    console.error("\n❌ Schema test failed:");
    console.error(error.message);
    
    if (error.message.includes("Cannot query field \"site\"")) {
      console.log("\n💡 Solution: You need to create a 'site' document in your BaseHub repository.");
      console.log("   Go to: https://basehub.com/webmyc/respiraforms/explore");
      console.log("   Create a new Document called 'site'");
    }
    
    if (error.message.includes("Cannot query field \"settings\"")) {
      console.log("\n💡 Solution: You need to create a 'settings' document inside the 'site' document.");
    }
    
    if (error.message.includes("Cannot query field \"pages\"")) {
      console.log("\n💡 Solution: You need to create a 'pages' collection inside the 'site' document.");
    }
  }
}

// Run the test
testBaseHubSchema().catch(console.error);
