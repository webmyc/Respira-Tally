import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ApiKeyConfig } from '../types/tally';

export class ConfigManager {
  private configPath: string;
  private config: Record<string, any> = {};

  constructor(configFileName: string = '.respira-tally-config.json') {
    this.configPath = path.join(os.homedir(), configFileName);
    this.loadConfig();
  }

  /**
   * Load configuration from file
   */
  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(configData);
      }
    } catch (error) {
      console.warn('Failed to load config file:', error instanceof Error ? error.message : String(error));
      this.config = {};
    }
  }

  /**
   * Save configuration to file
   */
  private saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a configuration value
   */
  get(key: string): any {
    return this.config[key];
  }

  /**
   * Set a configuration value
   */
  set(key: string, value: any): void {
    this.config[key] = value;
    this.saveConfig();
  }

  /**
   * Get API key from config or environment
   */
  getApiKey(): string | null {
    // First try environment variable
    const envApiKey = process.env.TALLY_API_KEY;
    if (envApiKey) {
      return envApiKey;
    }

    // Then try config file
    return this.get('apiKey') || null;
  }

  /**
   * Set API key with validation
   */
  setApiKey(apiKey: string): void {
    this.set('apiKey', apiKey);
    this.set('apiKeyConfig', {
      apiKey,
      isValid: false,
      lastChecked: new Date().toISOString()
    });
  }

  /**
   * Update API key validation status
   */
  updateApiKeyValidation(isValid: boolean, userEmail?: string): void {
    const config = this.get('apiKeyConfig') || {};
    config.isValid = isValid;
    config.lastChecked = new Date().toISOString();
    if (userEmail) {
      config.userEmail = userEmail;
    }
    this.set('apiKeyConfig', config);
  }

  /**
   * Get API key configuration
   */
  getApiKeyConfig(): ApiKeyConfig | null {
    return this.get('apiKeyConfig') || null;
  }

  /**
   * Check if API key is configured
   */
  hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  /**
   * Check if API key is valid
   */
  isApiKeyValid(): boolean {
    const config = this.getApiKeyConfig();
    return config?.isValid || false;
  }

  /**
   * Get default workspace
   */
  getDefaultWorkspace(): string | null {
    return this.get('defaultWorkspace') || null;
  }

  /**
   * Set default workspace
   */
  setDefaultWorkspace(workspaceId: string): void {
    this.set('defaultWorkspace', workspaceId);
  }

  /**
   * Clear all configuration
   */
  clear(): void {
    this.config = {};
    this.saveConfig();
  }

  /**
   * Get all configuration
   */
  getAll(): Record<string, any> {
    return { ...this.config };
  }

  /**
   * Reset API key configuration
   */
  resetApiKey(): void {
    this.set('apiKey', null);
    this.set('apiKeyConfig', null);
  }
}

export const configManager = new ConfigManager();
