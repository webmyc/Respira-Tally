import { TallyApiClient } from './tally-client';
import { FormPromptParser } from './form-prompt-parser';
import { configManager } from './utils/config';

// Main entry point for the Respira Tally application
export class RespiraTally {
  private client: TallyApiClient | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || configManager.getApiKey();
    if (key) {
      this.client = new TallyApiClient(key);
    }
  }

  /**
   * Initialize with API key
   */
  async initialize(apiKey: string): Promise<boolean> {
    try {
      this.client = new TallyApiClient(apiKey);
      const validation = await this.client.validateApiKey();
      
      if (validation.isValid) {
        configManager.setApiKey(apiKey);
        configManager.updateApiKeyValidation(true, validation.user?.email);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.client !== null && configManager.isApiKeyValid();
  }

  /**
   * Create a form from natural language description
   */
  async createFormFromPrompt(prompt: string, options?: {
    title?: string;
    description?: string;
    includeCaptcha?: boolean;
    redirectUrl?: string;
    confirmationMessage?: string;
  }) {
    if (!this.client) {
      throw new Error('Not initialized. Please provide an API key.');
    }

    const parser = new FormPromptParser(this.client);
    
    // Get workspaces to use the first one
    const workspaces = await this.client.listWorkspaces();
    if (workspaces.length === 0) {
      throw new Error('No workspaces found. Please create a workspace in Tally first.');
    }

    const workspaceId = workspaces[0].id;
    return await parser.createFormFromPrompt(prompt, options, workspaceId);
  }

  /**
   * Create a simple contact form
   */
  async createContactForm(options?: {
    title?: string;
    includePhone?: boolean;
    includeCompany?: boolean;
  }) {
    if (!this.client) {
      throw new Error('Not initialized. Please provide an API key.');
    }

    const parser = new FormPromptParser(this.client);
    
    // Get workspaces to use the first one
    const workspaces = await this.client.listWorkspaces();
    if (workspaces.length === 0) {
      throw new Error('No workspaces found. Please create a workspace in Tally first.');
    }

    const workspaceId = workspaces[0].id;
    return await parser.createContactForm(workspaceId, options);
  }

  /**
   * List all forms
   */
  async listForms() {
    if (!this.client) {
      throw new Error('Not initialized. Please provide an API key.');
    }
    return await this.client.listForms();
  }

  /**
   * Get a specific form
   */
  async getForm(formId: string) {
    if (!this.client) {
      throw new Error('Not initialized. Please provide an API key.');
    }
    return await this.client.getForm(formId);
  }

  /**
   * Update a form
   */
  async updateForm(formId: string, updateData: any) {
    if (!this.client) {
      throw new Error('Not initialized. Please provide an API key.');
    }
    return await this.client.updateForm(formId, updateData);
  }

  /**
   * Delete a form
   */
  async deleteForm(formId: string) {
    if (!this.client) {
      throw new Error('Not initialized. Please provide an API key.');
    }
    return await this.client.deleteForm(formId);
  }

  /**
   * Get user information
   */
  async getUser() {
    if (!this.client) {
      throw new Error('Not initialized. Please provide an API key.');
    }
    return await this.client.getUser();
  }

  /**
   * List form submissions
   */
  async listSubmissions(formId: string) {
    if (!this.client) {
      throw new Error('Not initialized. Please provide an API key.');
    }
    return await this.client.listSubmissions(formId);
  }

  /**
   * Get a specific submission
   */
  async getSubmission(formId: string, submissionId: string) {
    if (!this.client) {
      throw new Error('Not initialized. Please provide an API key.');
    }
    return await this.client.getSubmission(formId, submissionId);
  }
}

// Export the main app class and utilities
export { TallyApiClient } from './tally-client';
export { FormPromptParser } from './form-prompt-parser';
export { configManager } from './utils/config';
export * from './types/tally';

// Default export
export default RespiraTally;
