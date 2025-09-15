import { TallyApiClient } from './tally-client';
import { CreateFormRequest, TallyBlock, TallyBlockType, FormPromptOptions } from './types/tally';
import { v4 as uuidv4 } from 'uuid';

export class FormPromptParser {
  private client: TallyApiClient;

  constructor(client: TallyApiClient) {
    this.client = client;
  }

  /**
   * Parse natural language prompt and create a form
   */
  async createFormFromPrompt(
    prompt: string, 
    options: FormPromptOptions = {},
    workspaceId: string
  ): Promise<any> {
    const parsedForm = this.parsePrompt(prompt);
    
    const formData: CreateFormRequest = {
      name: options.title || parsedForm.title,
      workspaceId: workspaceId,
      status: 'DRAFT',
      blocks: parsedForm.blocks,
      settings: {
        language: 'en',
        isClosed: false,
        hasSelfEmailNotifications: true,
        hasRespondentEmailNotifications: false,
        hasProgressBar: true,
        hasPartialSubmissions: true,
        pageAutoJump: false,
        saveForLater: true,
        redirectOnCompletion: options.redirectUrl || null,
        confirmationMessage: options.confirmationMessage || 'Thank you for your submission!',
        styles: {
          theme: 'LIGHT',
          font: {
            provider: 'Google',
            family: 'Roboto Slab'
          }
        }
      }
    };

    return await this.client.createForm(formData);
  }

  /**
   * Parse natural language prompt into form structure
   */
  private parsePrompt(prompt: string): {
    title: string;
    blocks: TallyBlock[];
  } {
    const lowerPrompt = prompt.toLowerCase();
    
    // Extract title from prompt
    const title = this.extractTitle(prompt);
    
    // Parse fields based on keywords
    const blocks = this.parseFields(lowerPrompt);

    return { title, blocks };
  }

  /**
   * Extract title from prompt
   */
  private extractTitle(prompt: string): string {
    // Look for patterns like "create a [title] form"
    const createMatch = prompt.match(/create\s+(?:a\s+)?(?:simple\s+)?(?:contact\s+)?(?:survey\s+)?(?:registration\s+)?(?:feedback\s+)?(?:application\s+)?(?:.*?)\s+form/i);
    
    if (createMatch) {
      const titlePart = createMatch[0].replace(/create\s+(?:a\s+)?(?:simple\s+)?(?:contact\s+)?(?:survey\s+)?(?:registration\s+)?(?:feedback\s+)?(?:application\s+)?/i, '').replace(/\s+form/i, '');
      return this.capitalizeFirst(titlePart.trim());
    }

    // Look for quoted titles
    const quotedMatch = prompt.match(/"([^"]+)"/);
    if (quotedMatch) {
      return quotedMatch[1];
    }

    // Default fallback
    return 'Custom Form';
  }

  /**
   * Parse fields from prompt
   */
  private parseFields(prompt: string): TallyBlock[] {
    const blocks: TallyBlock[] = [];

    // Add form title
    blocks.push({
      uuid: uuidv4(),
      type: 'FORM_TITLE',
      groupUuid: uuidv4(),
      groupType: 'TEXT',
      payload: {
        title: this.extractTitle(prompt),
        safeHTMLSchema: [[this.extractTitle(prompt)]]
      }
    });

    // Common field patterns
    const fieldPatterns = [
      // Name fields
      { pattern: /\b(?:name|full name|first name|last name)\b/, type: 'INPUT_TEXT' as TallyBlockType, label: 'Name', required: true },
      
      // Email fields
      { pattern: /\b(?:email|e-mail|email address)\b/, type: 'INPUT_EMAIL' as TallyBlockType, label: 'Email', required: true },
      
      // Phone fields
      { pattern: /\b(?:phone|telephone|mobile|cell|phone number)\b/, type: 'INPUT_PHONE_NUMBER' as TallyBlockType, label: 'Phone Number', required: false },
      
      // Message/comment fields
      { pattern: /\b(?:message|comment|feedback|suggestion|inquiry|question|note|description)\b/, type: 'TEXTAREA' as TallyBlockType, label: 'Message', required: true },
      
      // Company/Organization
      { pattern: /\b(?:company|organization|business|firm|corporation)\b/, type: 'INPUT_TEXT' as TallyBlockType, label: 'Company', required: false },
      
      // Address
      { pattern: /\b(?:address|location|street|city|zip|postal)\b/, type: 'TEXTAREA' as TallyBlockType, label: 'Address', required: false },
      
      // Website/URL
      { pattern: /\b(?:website|url|link|web)\b/, type: 'INPUT_TEXT' as TallyBlockType, label: 'Website', required: false },
      
      // Age/Number
      { pattern: /\b(?:age|number|quantity|amount|count)\b/, type: 'INPUT_TEXT' as TallyBlockType, label: 'Number', required: false },
      
      // Date
      { pattern: /\b(?:date|birthday|birth|appointment|schedule)\b/, type: 'INPUT_DATE' as TallyBlockType, label: 'Date', required: false }
    ];

    // Check for each pattern
    fieldPatterns.forEach(({ pattern, type, label, required }) => {
      if (pattern.test(prompt)) {
        // Check if field already exists (avoid duplicates)
        const exists = blocks.some(block => 
          block.type === 'LABEL' && 
          block.payload?.safeHTMLSchema?.[0]?.[0]?.toLowerCase() === label.toLowerCase()
        );
        if (!exists) {
          // Add label
          blocks.push({
            uuid: uuidv4(),
            type: 'LABEL',
            groupUuid: uuidv4(),
            groupType: 'LABEL',
            payload: {
              safeHTMLSchema: [[label]]
            }
          });

          // Add input field
          blocks.push({
            uuid: uuidv4(),
            type: type,
            groupUuid: uuidv4(),
            groupType: type,
            payload: {
              isRequired: required,
              placeholder: `Enter ${label.toLowerCase()}`
            }
          });
        }
      }
    });

    // If no fields were detected, create a basic contact form
    if (blocks.length === 1) {
      const basicFields = [
        { type: 'INPUT_TEXT' as TallyBlockType, label: 'Name', required: true },
        { type: 'INPUT_EMAIL' as TallyBlockType, label: 'Email', required: true },
        { type: 'TEXTAREA' as TallyBlockType, label: 'Message', required: true }
      ];

      basicFields.forEach(({ type, label, required }) => {
        // Add label
        blocks.push({
          uuid: uuidv4(),
          type: 'LABEL',
          groupUuid: uuidv4(),
          groupType: 'LABEL',
          payload: {
            safeHTMLSchema: [[label]]
          }
        });

        // Add input field
        blocks.push({
          uuid: uuidv4(),
          type: type,
          groupUuid: uuidv4(),
          groupType: type,
          payload: {
            isRequired: required,
            placeholder: `Enter ${label.toLowerCase()}`
          }
        });
      });
    }

    return blocks;
  }

  /**
   * Capitalize first letter of each word
   */
  private capitalizeFirst(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Create a simple contact form
   */
  async createContactForm(
    workspaceId: string,
    options: {
      title?: string;
      includePhone?: boolean;
      includeCompany?: boolean;
    } = {}
  ): Promise<any> {
    const { title = 'Contact Form', includePhone = false, includeCompany = false } = options;
    
    const blocks: TallyBlock[] = [
      {
        uuid: uuidv4(),
        type: 'FORM_TITLE',
        groupUuid: uuidv4(),
        groupType: 'TEXT',
        payload: {
          title: title,
          safeHTMLSchema: [[title]]
        }
      }
    ];

    // Name field
    blocks.push({
      uuid: uuidv4(),
      type: 'LABEL',
      groupUuid: uuidv4(),
      groupType: 'LABEL',
      payload: {
        safeHTMLSchema: [['Name']]
      }
    });
    blocks.push({
      uuid: uuidv4(),
      type: 'INPUT_TEXT',
      groupUuid: uuidv4(),
      groupType: 'INPUT_TEXT',
      payload: {
        isRequired: true,
        placeholder: 'Enter your full name'
      }
    });

    // Email field
    blocks.push({
      uuid: uuidv4(),
      type: 'LABEL',
      groupUuid: uuidv4(),
      groupType: 'LABEL',
      payload: {
        safeHTMLSchema: [['Email']]
      }
    });
    blocks.push({
      uuid: uuidv4(),
      type: 'INPUT_EMAIL',
      groupUuid: uuidv4(),
      groupType: 'INPUT_EMAIL',
      payload: {
        isRequired: true,
        placeholder: 'Enter your email address'
      }
    });

    if (includePhone) {
      blocks.push({
        uuid: uuidv4(),
        type: 'LABEL',
        groupUuid: uuidv4(),
        groupType: 'LABEL',
        payload: {
          safeHTMLSchema: [['Phone Number']]
        }
      });
      blocks.push({
        uuid: uuidv4(),
        type: 'INPUT_PHONE_NUMBER',
        groupUuid: uuidv4(),
        groupType: 'INPUT_PHONE_NUMBER',
        payload: {
          isRequired: false,
          placeholder: 'Enter your phone number'
        }
      });
    }

    if (includeCompany) {
      blocks.push({
        uuid: uuidv4(),
        type: 'LABEL',
        groupUuid: uuidv4(),
        groupType: 'LABEL',
        payload: {
          safeHTMLSchema: [['Company']]
        }
      });
      blocks.push({
        uuid: uuidv4(),
        type: 'INPUT_TEXT',
        groupUuid: uuidv4(),
        groupType: 'INPUT_TEXT',
        payload: {
          isRequired: false,
          placeholder: 'Enter your company name'
        }
      });
    }

    // Message field
    blocks.push({
      uuid: uuidv4(),
      type: 'LABEL',
      groupUuid: uuidv4(),
      groupType: 'LABEL',
      payload: {
        safeHTMLSchema: [['Message']]
      }
    });
    blocks.push({
      uuid: uuidv4(),
      type: 'TEXTAREA',
      groupUuid: uuidv4(),
      groupType: 'TEXTAREA',
      payload: {
        isRequired: true,
        placeholder: 'Enter your message'
      }
    });

    const formData: CreateFormRequest = {
      name: title,
      workspaceId: workspaceId,
      status: 'DRAFT',
      blocks: blocks,
      settings: {
        language: 'en',
        isClosed: false,
        hasSelfEmailNotifications: true,
        hasRespondentEmailNotifications: false,
        hasProgressBar: true,
        hasPartialSubmissions: true,
        pageAutoJump: false,
        saveForLater: true,
        confirmationMessage: 'Thank you for your message! We\'ll get back to you soon.',
        styles: {
          theme: 'LIGHT',
          font: {
            provider: 'Google',
            family: 'Roboto Slab'
          }
        }
      }
    };

    return await this.client.createForm(formData);
  }
}
