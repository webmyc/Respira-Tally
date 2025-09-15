import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { TallyApiClient } from './tally-client';
import { FormPromptParser } from './form-prompt-parser';
import { configManager } from './utils/config';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes

/**
 * Validate API key
 */
app.post('/api/validate-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'API key is required' 
      });
    }

    const client = new TallyApiClient(apiKey);
    const validation = await client.validateApiKey();
    
    if (validation.isValid) {
      // Save the API key
      configManager.setApiKey(apiKey);
      configManager.updateApiKeyValidation(true, validation.user?.email);
      
      return res.json({
        success: true,
        message: 'API key is valid',
        user: validation.user
      });
    } else {
      return res.status(400).json({
        success: false,
        error: validation.error || 'Invalid API key'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get current API key status
 */
app.get('/api/key-status', (req, res) => {
  try {
    const apiKey = configManager.getApiKey();
    const config = configManager.getApiKeyConfig();
    
    res.json({
      success: true,
      hasKey: !!apiKey,
      isValid: config?.isValid || false,
      lastChecked: config?.lastChecked,
      userEmail: config?.userEmail
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Create form from prompt
 */
app.post('/api/create-form', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const apiKey = configManager.getApiKey();
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key not configured. Please add your Tally API key first.'
      });
    }

    const client = new TallyApiClient(apiKey);
    const parser = new FormPromptParser(client);
    
    // Get workspaces to use the first one
    const workspaces = await client.listWorkspaces();
    if (workspaces.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No workspaces found. Please create a workspace in Tally first.'
      });
    }

    const workspaceId = workspaces[0].id;
    const form = await parser.createFormFromPrompt(prompt, options, workspaceId);
    
    res.json({
      success: true,
      form: {
        id: form.id,
        name: form.name,
        url: `https://tally.so/r/${form.id}`,
        status: form.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Create contact form
 */
app.post('/api/create-contact-form', async (req, res) => {
  try {
    const { options = {} } = req.body;

    const apiKey = configManager.getApiKey();
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key not configured. Please add your Tally API key first.'
      });
    }

    const client = new TallyApiClient(apiKey);
    const parser = new FormPromptParser(client);
    
    // Get workspaces to use the first one
    const workspaces = await client.listWorkspaces();
    if (workspaces.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No workspaces found. Please create a workspace in Tally first.'
      });
    }

    const workspaceId = workspaces[0].id;
    const form = await parser.createContactForm(workspaceId, options);
    
    res.json({
      success: true,
      form: {
        id: form.id,
        name: form.name,
        url: `https://tally.so/r/${form.id}`,
        status: form.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * List forms
 */
app.get('/api/forms', async (req, res) => {
  try {
    const apiKey = configManager.getApiKey();
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key not configured. Please add your Tally API key first.'
      });
    }

    const client = new TallyApiClient(apiKey);
    const forms = await client.listForms();
    
    res.json({
      success: true,
      forms: forms.map(form => ({
        id: form.id,
        name: form.name,
        url: `https://tally.so/r/${form.id}`,
        status: form.status,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get form details
 */
app.get('/api/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const apiKey = configManager.getApiKey();
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key not configured. Please add your Tally API key first.'
      });
    }

    const client = new TallyApiClient(apiKey);
    const form = await client.getForm(id);
    
    res.json({
      success: true,
      form: {
        id: form.id,
        name: form.name,
        url: `https://tally.so/r/${form.id}`,
        status: form.status,
        blocks: form.blocks,
        settings: form.settings,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Delete form
 */
app.delete('/api/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const apiKey = configManager.getApiKey();
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key not configured. Please add your Tally API key first.'
      });
    }

    const client = new TallyApiClient(apiKey);
    await client.deleteForm(id);
    
    res.json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Clear API key
 */
app.post('/api/clear-key', (req, res) => {
  try {
    configManager.resetApiKey();
    res.json({
      success: true,
      message: 'API key cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Respira Tally server running on http://localhost:${PORT}`);
  console.log(`📝 Web UI available at http://localhost:${PORT}`);
  console.log(`🔑 Add your Tally API key to get started!`);
});

export default app;
