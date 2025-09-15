import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  TallyForm,
  TallyUser,
  TallyWorkspace,
  TallySubmission,
  CreateFormRequest,
  UpdateFormRequest,
  TallyApiResponse
} from './types/tally';

export class TallyApiClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string = 'https://api.tally.so';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new Error(`Tally API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
        } else if (error.request) {
          throw new Error('Network Error: Unable to connect to Tally API');
        } else {
          throw new Error(`Request Error: ${error.message}`);
        }
      }
    );
  }

  /**
   * Validate API key by getting user info
   */
  async validateApiKey(): Promise<{ isValid: boolean; user?: TallyUser; error?: string }> {
    try {
      const response: AxiosResponse<TallyUser> = await this.client.get('/user');
      return { isValid: true, user: response.data };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  /**
   * Get current user information
   */
  async getUser(): Promise<TallyUser> {
    try {
      const response: AxiosResponse<TallyUser> = await this.client.get('/user');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List all forms
   */
  async listForms(): Promise<TallyForm[]> {
    try {
      const response: AxiosResponse<{ items: TallyForm[] }> = await this.client.get('/forms');
      return response.data.items;
    } catch (error) {
      throw new Error(`Failed to list forms: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a specific form by ID
   */
  async getForm(formId: string): Promise<TallyForm> {
    try {
      const response: AxiosResponse<TallyForm> = await this.client.get(`/forms/${formId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get form ${formId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create a new form
   */
  async createForm(formData: CreateFormRequest): Promise<TallyForm> {
    try {
      const response: AxiosResponse<TallyForm> = await this.client.post('/forms', formData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create form: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update an existing form
   */
  async updateForm(formId: string, updateData: UpdateFormRequest): Promise<TallyForm> {
    try {
      const response: AxiosResponse<TallyForm> = await this.client.patch(`/forms/${formId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update form ${formId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete a form
   */
  async deleteForm(formId: string): Promise<boolean> {
    try {
      await this.client.delete(`/forms/${formId}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete form ${formId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List form submissions
   */
  async listSubmissions(formId: string): Promise<TallySubmission[]> {
    try {
      const response: AxiosResponse<{ items: TallySubmission[] }> = await this.client.get(`/forms/${formId}/submissions`);
      return response.data.items;
    } catch (error) {
      throw new Error(`Failed to list submissions for form ${formId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a specific submission
   */
  async getSubmission(formId: string, submissionId: string): Promise<TallySubmission> {
    try {
      const response: AxiosResponse<TallySubmission> = await this.client.get(`/forms/${formId}/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get submission ${submissionId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete a submission
   */
  async deleteSubmission(formId: string, submissionId: string): Promise<boolean> {
    try {
      await this.client.delete(`/forms/${formId}/submissions/${submissionId}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete submission ${submissionId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List workspaces
   */
  async listWorkspaces(): Promise<TallyWorkspace[]> {
    try {
      const response: AxiosResponse<{ items: TallyWorkspace[] }> = await this.client.get('/workspaces');
      return response.data.items;
    } catch (error) {
      throw new Error(`Failed to list workspaces: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create a workspace
   */
  async createWorkspace(name: string, slug?: string): Promise<TallyWorkspace> {
    try {
      const response: AxiosResponse<TallyWorkspace> = await this.client.post('/workspaces', {
        name,
        slug
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create workspace: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
