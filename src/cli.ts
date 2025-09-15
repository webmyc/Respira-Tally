#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { RespiraTally } from './index';
import { configManager } from './utils/config';

const program = new Command();

program
  .name('respira-tally')
  .description('Respira Tally - Create Tally.so forms using natural language descriptions')
  .version('1.0.0');

// Helper function to get API key
async function getApiKey(): Promise<string> {
  let apiKey = configManager.getApiKey();
  
  if (!apiKey) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your Tally API key:',
        validate: (input) => input.length > 0 || 'API key is required'
      }
    ]);
    
    apiKey = answers.apiKey;
    if (apiKey) {
      configManager.setApiKey(apiKey);
    }
  }
  
  if (!apiKey) {
    throw new Error('API key is required');
  }
  
  return apiKey;
}

// Helper function to create client
async function createClient(): Promise<RespiraTally> {
  const apiKey = await getApiKey();
  const client = new RespiraTally(apiKey);
  
  // Validate the API key
  const isValid = await client.initialize(apiKey);
  if (!isValid) {
    throw new Error('Invalid API key. Please check your Tally API key.');
  }
  
  return client;
}

// Interactive mode command
program
  .command('interactive')
  .description('Start interactive mode for real-time form creation')
  .action(async () => {
    try {
      const client = await createClient();
      
      console.log(chalk.blue('🎯 Respira Tally Interactive Mode'));
      console.log(chalk.gray('Describe your form and I\'ll create it for you!'));
      console.log(chalk.gray('Type "exit" to quit.\n'));
      
      while (true) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'prompt',
            message: 'Describe your form:',
          }
        ]);
        
        if (answers.prompt.toLowerCase() === 'exit') {
          console.log(chalk.yellow('Goodbye! 👋'));
          break;
        }
        
        if (!answers.prompt.trim()) {
          console.log(chalk.yellow('Please enter a form description.'));
          continue;
        }
        
        try {
          console.log(chalk.blue('Creating form...'));
          
          const form = await client.createFormFromPrompt(answers.prompt);
          
          console.log(chalk.green('✅ Form created successfully!'));
          console.log(chalk.cyan(`Title: ${form.name}`));
          console.log(chalk.cyan(`ID: ${form.id}`));
          console.log(chalk.cyan(`URL: https://tally.so/r/${form.id}`));
          console.log();
          
        } catch (error) {
          console.error(chalk.red('❌ Error creating form:'), error instanceof Error ? error.message : String(error));
          console.log();
        }
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error in interactive mode:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Create form from prompt command
program
  .command('create')
  .description('Create a form from natural language description')
  .option('-t, --title <title>', 'Form title')
  .option('-d, --description <description>', 'Form description')
  .action(async (options) => {
    try {
      const client = await createClient();
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'prompt',
          message: 'Describe the form you want to create:',
          validate: (input) => input.length > 0 || 'Prompt is required'
        }
      ]);
      
      console.log(chalk.blue('Creating form from prompt...'));
      
      const form = await client.createFormFromPrompt(answers.prompt, {
        title: options.title,
        description: options.description
      });
      
      console.log(chalk.green('✅ Form created successfully!'));
      console.log(chalk.cyan(`Form ID: ${form.id}`));
      console.log(chalk.cyan(`Form URL: https://tally.so/r/${form.id}`));
      console.log(chalk.cyan(`Title: ${form.name}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Error creating form:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Create contact form command
program
  .command('contact')
  .description('Create a simple contact form')
  .option('-p, --phone', 'Include phone field')
  .option('-c, --company', 'Include company field')
  .action(async (options) => {
    try {
      const client = await createClient();
      
      console.log(chalk.blue('Creating contact form...'));
      
      const form = await client.createContactForm({
        includePhone: options.phone,
        includeCompany: options.company
      });
      
      console.log(chalk.green('✅ Contact form created successfully!'));
      console.log(chalk.cyan(`Form ID: ${form.id}`));
      console.log(chalk.cyan(`Form URL: https://tally.so/r/${form.id}`));
      console.log(chalk.cyan(`Title: ${form.name}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Error creating contact form:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// List forms command
program
  .command('list')
  .description('List all forms')
  .action(async () => {
    try {
      const client = await createClient();
      
      console.log(chalk.blue('Fetching forms...'));
      
      const forms = await client.listForms();
      
      if (forms.length === 0) {
        console.log(chalk.yellow('No forms found.'));
        return;
      }
      
      console.log(chalk.green(`Found ${forms.length} form(s):`));
      console.log();
      
      forms.forEach((form, index) => {
        console.log(chalk.cyan(`${index + 1}. ${form.name}`));
        console.log(chalk.gray(`   ID: ${form.id}`));
        console.log(chalk.gray(`   URL: https://tally.so/r/${form.id}`));
        console.log(chalk.gray(`   Status: ${form.status}`));
        console.log(chalk.gray(`   Created: ${new Date(form.createdAt).toLocaleDateString()}`));
        console.log();
      });
      
    } catch (error) {
      console.error(chalk.red('❌ Error listing forms:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Get form details command
program
  .command('get <formId>')
  .description('Get details of a specific form')
  .action(async (formId) => {
    try {
      const client = await createClient();
      
      console.log(chalk.blue(`Fetching form ${formId}...`));
      
      const form = await client.getForm(formId);
      
      console.log(chalk.green('✅ Form details:'));
      console.log(chalk.cyan(`Title: ${form.name}`));
      console.log(chalk.cyan(`URL: https://tally.so/r/${form.id}`));
      console.log(chalk.cyan(`Status: ${form.status}`));
      console.log(chalk.cyan(`Blocks: ${form.blocks.length}`));
      console.log();
      
      form.blocks.forEach((block: any, index: number) => {
        if (block.type === 'LABEL') {
          console.log(chalk.yellow(`${index + 1}. ${block.payload.safeHTMLSchema[0][0]}`));
        }
      });
      
    } catch (error) {
      console.error(chalk.red('❌ Error getting form:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Delete form command
program
  .command('delete <formId>')
  .description('Delete a form')
  .action(async (formId) => {
    try {
      const client = await createClient();
      
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete form ${formId}?`,
          default: false
        }
      ]);
      
      if (!answers.confirm) {
        console.log(chalk.yellow('Deletion cancelled.'));
        return;
      }
      
      console.log(chalk.blue(`Deleting form ${formId}...`));
      
      await client.deleteForm(formId);
      
      console.log(chalk.green('✅ Form deleted successfully!'));
      
    } catch (error) {
      console.error(chalk.red('❌ Error deleting form:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Configure API key command
program
  .command('config')
  .description('Configure API key')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiKey',
          message: 'Enter your Tally API key:',
          validate: (input) => input.length > 0 || 'API key is required'
        }
      ]);
      
      configManager.setApiKey(answers.apiKey);
      
      console.log(chalk.green('✅ API key configured successfully!'));
      
    } catch (error) {
      console.error(chalk.red('❌ Error configuring API key:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Web server command
program
  .command('web')
  .description('Start the web interface')
  .option('-p, --port <port>', 'Port to run the web server on', '3000')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 Starting Respira Tally web interface...'));
      console.log(chalk.cyan(`Web UI will be available at: http://localhost:${options.port}`));
      console.log(chalk.gray('Press Ctrl+C to stop the server'));
      
      // Import and start the web server
      const { default: app } = await import('./web-server');
      
    } catch (error) {
      console.error(chalk.red('❌ Error starting web server:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
