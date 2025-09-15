#!/usr/bin/env node

/**
 * Example usage of Respira Tally
 * 
 * This script demonstrates how to use the Respira Tally library
 * to create forms programmatically.
 */

const { RespiraTally } = require('./dist/index');

async function main() {
  console.log('🎯 Respira Tally Example');
  console.log('========================\n');

  // Check if API key is provided
  const apiKey = process.env.TALLY_API_KEY;
  if (!apiKey) {
    console.log('❌ Please set your TALLY_API_KEY environment variable');
    console.log('   Example: export TALLY_API_KEY=your_api_key_here');
    process.exit(1);
  }

  try {
    // Initialize the app
    const app = new RespiraTally(apiKey);
    
    // Validate API key
    console.log('🔑 Validating API key...');
    const isValid = await app.initialize(apiKey);
    if (!isValid) {
      console.log('❌ Invalid API key. Please check your Tally API key.');
      process.exit(1);
    }
    console.log('✅ API key validated successfully!\n');

    // Get user info
    console.log('👤 Getting user information...');
    const user = await app.getUser();
    console.log(`   User: ${user.name || user.email}`);
    console.log(`   Email: ${user.email}\n`);

    // Create a form from natural language
    console.log('📝 Creating form from natural language...');
    const prompt = 'Create a contact form with name, email, phone, and message fields';
    console.log(`   Prompt: "${prompt}"`);
    
    const form = await app.createFormFromPrompt(prompt, {
      title: 'Contact Us Form',
      confirmationMessage: 'Thank you for your message! We\'ll get back to you soon.'
    });
    
    console.log('✅ Form created successfully!');
    console.log(`   Title: ${form.name}`);
    console.log(`   ID: ${form.id}`);
    console.log(`   URL: https://tally.so/r/${form.id}\n`);

    // List all forms
    console.log('📋 Listing all forms...');
    const forms = await app.listForms();
    console.log(`   Found ${forms.length} form(s):`);
    forms.forEach((form, index) => {
      console.log(`   ${index + 1}. ${form.name} (${form.status})`);
    });
    console.log();

    // Create a simple contact form
    console.log('📧 Creating a simple contact form...');
    const contactForm = await app.createContactForm({
      title: 'Quick Contact Form',
      includePhone: true,
      includeCompany: true
    });
    
    console.log('✅ Contact form created successfully!');
    console.log(`   Title: ${contactForm.name}`);
    console.log(`   ID: ${contactForm.id}`);
    console.log(`   URL: https://tally.so/r/${contactForm.id}\n`);

    console.log('🎉 Example completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   - Visit the form URLs to see your created forms');
    console.log('   - Use the web interface: npm run web');
    console.log('   - Try interactive mode: npm run cli interactive');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the example
main();
