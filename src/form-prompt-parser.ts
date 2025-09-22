import { TallyApiClient } from './tally-client';
import { CreateFormRequest, TallyBlock, TallyBlockType, FormPromptOptions } from './types/tally';
import { v4 as uuidv4 } from 'uuid';
import { parseFormWithLLM, FormField, ParsedForm } from './llm-form-parser';

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
    const parsedForm = await this.parsePrompt(prompt);

    const formData: CreateFormRequest = {
      name: options.title || parsedForm.title,
      workspaceId: workspaceId,
      status: 'PUBLISHED',
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
        redirectOnCompletion: options.redirectUrl || parsedForm.redirectUrl || null,
        confirmationMessage: parsedForm.confirmationMessage || options.confirmationMessage || 'Thank you for your submission!',
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
  private async parsePrompt(prompt: string): Promise<{
    title: string;
    blocks: TallyBlock[];
    confirmationMessage?: string;
    redirectUrl?: string | null;
  }> {
    const structured = this.tryParseStructuredDefinition(prompt);
    if (structured) {
      return structured;
    }

    try {
      const llmResult = await parseFormWithLLM(prompt);
      const blocks = await this.convertLLMFormToBlocks(llmResult);

      return {
        title: llmResult.title,
        blocks,
        confirmationMessage: llmResult.settings?.confirmationMessage,
        redirectUrl: llmResult.settings?.redirectUrl ?? null
      };
    } catch (error) {
      console.warn('LLM parsing failed, falling back to keyword parser:', error);
    }

    const loweredPrompt = prompt.toLowerCase();
    const title = this.extractTitle(prompt);
    const blocks = this.parseFields(loweredPrompt, title);

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
  private parseFields(prompt: string, title: string): TallyBlock[] {
    const blocks: TallyBlock[] = [];

    blocks.push(this.createFormTitleBlock(title));

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
          blocks.push(...this.createFieldBlocks({
            label,
            type,
            required,
            placeholder: `Enter ${label.toLowerCase()}`
          }));
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
        blocks.push(...this.createFieldBlocks({
          label,
          type: type,
          required,
          placeholder: `Enter ${label.toLowerCase()}`
        }));
      });
    }

    blocks.push(this.createAttributionBlock());

    return blocks;
  }

  private createFormTitleBlock(title: string): TallyBlock {
    return {
      uuid: uuidv4(),
      type: 'FORM_TITLE',
      groupUuid: uuidv4(),
      groupType: 'TEXT',
      payload: {
        title,
        safeHTMLSchema: [[title]]
      }
    };
  }

  private async convertLLMFormToBlocks(form: ParsedForm): Promise<TallyBlock[]> {
    const blocks: TallyBlock[] = [];
    const fieldUuidMap = new Map<string, string>();

    blocks.push(this.createFormTitleBlock(form.title || 'Custom Form'));

    if (form.description) {
      blocks.push(this.createContentBlock('TEXT', form.description));
    }

    if (form.sections && form.sections.length > 0) {
      form.sections.forEach((section, sectionIndex) => {
        if (section.title) {
          blocks.push(this.createContentBlock('HEADING_2', section.title));
        }
        if (section.description) {
          blocks.push(this.createContentBlock('TEXT', section.description));
        }

        if (section.fields && section.fields.length > 0) {
          section.fields.forEach((field) => {
            const fieldBlocks = this.convertLLMFieldToBlocks(field, fieldUuidMap);
            if (fieldBlocks.length > 0) {
              blocks.push(...fieldBlocks);
            }
          });
        }

        if (sectionIndex < form.sections.length - 1) {
          blocks.push(this.createDividerBlock());
        }
      });
    }

    blocks.push(this.createAttributionBlock());

    return blocks;
  }

  private createAttributionBlock(): TallyBlock {
    const groupUuid = uuidv4();

    return {
      uuid: uuidv4(),
      type: 'TEXT',
      groupUuid,
      groupType: 'TEXT',
      payload: {
        safeHTMLSchema: [
          [
            'Generated with ',
            {
              href: 'https://RespiraFormsPro.com',
              target: '_blank',
              rel: 'noopener noreferrer',
              style: 'color:#0ea5e9; text-decoration:underline;'
            },
            'RespiraFormsPro.com'
          ]
        ]
      }
    };
  }

  private createFieldBlocks(field: {
    label: string;
    type: TallyBlockType;
    required?: boolean;
    placeholder?: string;
    extraPayload?: Record<string, any>;
  }): TallyBlock[] {
    const label = field.label;
    const isRequired = field.required ?? false;

    const groupUuid = uuidv4();

    const labelBlock: TallyBlock = {
      uuid: uuidv4(),
      type: 'LABEL',
      groupUuid,
      groupType: 'LABEL',
      payload: {
        safeHTMLSchema: [[label]]
      }
    };

    const payload: Record<string, any> = {
      isRequired
    };

    if (field.placeholder) {
      payload.placeholder = field.placeholder;
    }

    if (field.extraPayload) {
      Object.assign(payload, field.extraPayload);
    }

    const inputBlock: TallyBlock = {
      uuid: uuidv4(),
      type: field.type,
      groupUuid,
      groupType: 'QUESTION',
      payload
    };

    return [labelBlock, inputBlock];
  }

  /**
   * Capitalize first letter of each word
   */
  private capitalizeFirst(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  private tryParseStructuredDefinition(prompt: string): {
    title: string;
    blocks: TallyBlock[];
    confirmationMessage?: string;
    redirectUrl?: string | null;
  } | null {
    const jsonString = this.extractJsonString(prompt);
    if (!jsonString) {
      return null;
    }

    try {
      const definition = JSON.parse(jsonString);
      if (!definition || typeof definition !== 'object') {
        return null;
      }

      const rawFields = definition.fields ?? definition.blocks;
      const fields = Array.isArray(rawFields) ? rawFields : [];
      if (fields.length === 0) {
        return null;
      }

      const title = typeof definition.title === 'string' && definition.title.trim().length > 0
        ? definition.title.trim()
        : 'Custom Form';

      const blocks: TallyBlock[] = [this.createFormTitleBlock(title)];

      fields.forEach((item: any) => {
        const fieldBlocks = this.mapStructuredFieldToBlocks(item);
        if (fieldBlocks.length > 0) {
          blocks.push(...fieldBlocks);
        }
      });

      if (blocks.length === 1) {
        return null;
      }

      const confirmationMessage = typeof definition.confirmationMessage === 'string'
        ? definition.confirmationMessage.trim()
        : undefined;

      const redirectUrl = typeof definition.redirectUrl === 'string'
        ? definition.redirectUrl.trim()
        : undefined;

      return {
        title,
        blocks,
        confirmationMessage: confirmationMessage?.length ? confirmationMessage : undefined,
        redirectUrl: redirectUrl?.length ? redirectUrl : undefined
      };
    } catch {
      return null;
    }
  }

  private extractJsonString(prompt: string): string | null {
    const trimmed = prompt.trim();

    if (trimmed.startsWith('```')) {
      const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return trimmed;
    }

    return null;
  }

  private mapStructuredFieldToBlocks(field: any): TallyBlock[] {
    if (!field || typeof field !== 'object') {
      return [];
    }

    const label = typeof field.label === 'string' ? field.label.trim() : '';
    const type = typeof field.type === 'string' ? field.type.trim().toLowerCase() : '';

    const supportedTypes: Record<string, TallyBlockType> = {
      text: 'INPUT_TEXT',
      short_text: 'INPUT_TEXT',
      email: 'INPUT_EMAIL',
      phone: 'INPUT_PHONE_NUMBER',
      phone_number: 'INPUT_PHONE_NUMBER',
      textarea: 'TEXTAREA',
      long_text: 'TEXTAREA',
      message: 'TEXTAREA',
      date: 'INPUT_DATE',
      url: 'INPUT_TEXT',
      website: 'INPUT_TEXT',
      link: 'INPUT_TEXT',
      number: 'INPUT_TEXT',
      select: 'DROPDOWN',
      dropdown: 'DROPDOWN',
      choice: 'MULTIPLE_CHOICE',
      radio: 'MULTIPLE_CHOICE',
      checkbox: 'CHECKBOXES',
      multi_select: 'CHECKBOXES',
      rating: 'RATING',
      file: 'FILE_UPLOAD',
      upload: 'FILE_UPLOAD',
      file_upload: 'FILE_UPLOAD',
      input_file_upload: 'FILE_UPLOAD',
      signature: 'SIGNATURE',
      sign: 'SIGNATURE',
      heading: 'HEADING_2',
      heading_1: 'HEADING_1',
      heading1: 'HEADING_1',
      h1: 'HEADING_1',
      heading_2: 'HEADING_2',
      heading2: 'HEADING_2',
      h2: 'HEADING_2',
      heading_3: 'HEADING_3',
      heading3: 'HEADING_3',
      h3: 'HEADING_3',
      text_block: 'TEXT',
      paragraph: 'TEXT',
      content: 'TEXT',
      description: 'TEXT',
      divider: 'DIVIDER',
      separator: 'DIVIDER',
      title: 'FORM_TITLE',
      form_title: 'FORM_TITLE'
    };

    const blockType = supportedTypes[type];
    if (!blockType) {
      return [];
    }

    const resolvedLabel = label || this.capitalizeFirst(type.replace(/_/g, ' '));
    let placeholder = typeof field.placeholder === 'string' && field.placeholder.trim().length > 0
      ? field.placeholder.trim()
      : undefined;

    if (!placeholder && this.supportsPlaceholder(blockType)) {
      placeholder = `Enter ${resolvedLabel.toLowerCase()}`;
    }

    const isRequired = typeof field.required === 'boolean' ? field.required : false;

    let extraPayload = this.cleanPayload(field.payload) || {};

    if (blockType === 'RATING') {
      const maxRating = this.parseNumber(field.max ?? field.maxRating ?? field.scale);
      if (typeof maxRating === 'number') {
        extraPayload.maxRating = maxRating;
      }

      if (typeof field.shape === 'string' && field.shape.trim().length > 0) {
        extraPayload.shape = field.shape.trim().toUpperCase();
      }
    }

    if (blockType === 'FILE_UPLOAD') {
      const allowMultiple = typeof field.allowMultiple === 'boolean'
        ? field.allowMultiple
        : typeof field.multiple === 'boolean'
          ? field.multiple
          : undefined;
      if (typeof allowMultiple === 'boolean') {
        extraPayload.allowMultiple = allowMultiple;
      }

      const maxFiles = this.parseNumber(field.maxFiles ?? field.maximumFiles);
      if (typeof maxFiles === 'number') {
        extraPayload.maxFiles = maxFiles;
      }

      const maxFileSize = this.parseNumber(field.maxFileSize ?? field.sizeLimit ?? field.maxSize);
      if (typeof maxFileSize === 'number') {
        extraPayload.maxFileSize = maxFileSize;
      }

      const accepted = this.normalizeStringArray(field.acceptedTypes ?? field.fileTypes ?? field.accept);
      if (accepted.length > 0) {
        extraPayload.acceptedFileTypes = accepted;
      }
    }

    if (blockType === 'SIGNATURE') {
      const strokeWidth = this.parseNumber(field.strokeWidth ?? field.penWidth);
      if (typeof strokeWidth === 'number') {
        extraPayload.strokeWidth = strokeWidth;
      }
    }

    if (blockType === 'FORM_TITLE') {
      const titleText = typeof field.text === 'string' && field.text.trim().length > 0
        ? field.text.trim()
        : resolvedLabel;
      const titleBlock = this.createFormTitleBlock(titleText);
      if (Object.keys(extraPayload).length > 0) {
        Object.assign(titleBlock.payload, extraPayload);
      }
      return [titleBlock];
    }

    if (['TEXT', 'HEADING_1', 'HEADING_2', 'HEADING_3'].includes(blockType)) {
      const content = typeof field.content === 'string' && field.content.trim().length > 0
        ? field.content.trim()
        : typeof field.text === 'string' && field.text.trim().length > 0
          ? field.text.trim()
          : resolvedLabel;

      if (!content) {
        return [];
      }

      const payloadOverrides = Object.keys(extraPayload).length > 0 ? extraPayload : undefined;
      return [this.createContentBlock(blockType as 'TEXT' | 'HEADING_1' | 'HEADING_2' | 'HEADING_3', content, payloadOverrides)];
    }

    if (blockType === 'DIVIDER') {
      const payloadOverrides = Object.keys(extraPayload).length > 0 ? extraPayload : undefined;
      return [this.createDividerBlock(payloadOverrides)];
    }

    if (['DROPDOWN', 'MULTIPLE_CHOICE', 'CHECKBOXES'].includes(blockType)) {
      const options = this.normalizeChoiceOptions(field.options);
      if (options.length === 0) {
        return [];
      }

      const payloadOverrides = Object.keys(extraPayload).length > 0 ? extraPayload : undefined;
      return this.createChoiceBlocks({
        label: resolvedLabel,
        type: blockType as 'DROPDOWN' | 'MULTIPLE_CHOICE' | 'CHECKBOXES',
        required: isRequired,
        options,
        placeholder,
        extraPayload: payloadOverrides
      });
    }

    if (!this.supportsPlaceholder(blockType)) {
      placeholder = undefined;
    }

    const normalizedPayload = Object.keys(extraPayload).length > 0 ? extraPayload : undefined;

    return this.createFieldBlocks({
      label: resolvedLabel,
      type: blockType,
      required: isRequired,
      placeholder,
      extraPayload: normalizedPayload
    });
  }

  private normalizeChoiceOptions(options: any): Array<{
    label: string;
    value: string;
    default?: boolean;
    [key: string]: any;
  }> {
    if (!Array.isArray(options)) {
      return [];
    }

    return options
      .map((option: any) => {
        if (typeof option === 'string') {
          const trimmed = option.trim();
          return trimmed.length > 0 ? { label: trimmed, value: trimmed } : null;
        }

        if (option && typeof option === 'object') {
          const label = typeof option.label === 'string' && option.label.trim().length > 0
            ? option.label.trim()
            : typeof option.value === 'string'
              ? option.value.trim()
              : '';

          if (!label) {
            return null;
          }

          const value = typeof option.value === 'string' && option.value.trim().length > 0
            ? option.value.trim()
            : label;

          const isDefault = typeof option.default === 'boolean' ? option.default : false;

          const extra = this.cleanPayload(option.payload) || {};
          if (typeof option.description === 'string' && option.description.trim().length > 0) {
            extra.description = option.description.trim();
          }

          return { label, value, default: isDefault, ...extra };
        }

        return null;
      })
      .filter((option): option is { label: string; value: string; default?: boolean } => option !== null);
  }

  private createChoiceBlocks(field: {
    label: string;
    type: 'DROPDOWN' | 'MULTIPLE_CHOICE' | 'CHECKBOXES';
    required: boolean;
    options: Array<{ label: string; value: string; default?: boolean }>;
    placeholder?: string;
    extraPayload?: Record<string, any>;
  }): TallyBlock[] {
    const groupUuid = uuidv4();

    const labelBlock: TallyBlock = {
      uuid: uuidv4(),
      type: 'LABEL',
      groupUuid,
      groupType: 'LABEL',
      payload: {
        safeHTMLSchema: [[field.label]]
      }
    };

    // Determine the option block type based on the main field type
    const optionType = field.type === 'DROPDOWN' ? 'DROPDOWN_OPTION'
      : field.type === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICE_OPTION'
      : 'MULTI_SELECT_OPTION'; // for CHECKBOXES

    // Create individual option blocks that Tally requires
    const optionBlocks: TallyBlock[] = field.options.map(option => ({
      uuid: uuidv4(),
      type: optionType,
      groupUuid,
      groupType: optionType,
      payload: {
        label: option.label,
        value: option.value,
        isDefault: option.default ?? false
      }
    }));

    const payload: Record<string, any> = {
      isRequired: field.required,
      placeholder: field.placeholder || undefined
    };

    if (field.type === 'CHECKBOXES') {
      payload.allowMultipleSelections = true;
    }

    if (field.extraPayload) {
      Object.assign(payload, field.extraPayload);
    }

    const choiceBlock: TallyBlock = {
      uuid: uuidv4(),
      type: field.type,
      groupUuid,
      groupType: field.type,
      payload
    };

    return [labelBlock, choiceBlock, ...optionBlocks];
  }

  private createContentBlock(
    type: 'TEXT' | 'HEADING_1' | 'HEADING_2' | 'HEADING_3',
    content: string,
    extraPayload?: Record<string, any>
  ): TallyBlock {
    const payload: Record<string, any> = {
      safeHTMLSchema: [[content]]
    };

    if (type === 'TEXT') {
      payload.text = content;
    } else {
      payload.title = content;
    }

    if (extraPayload) {
      Object.assign(payload, extraPayload);
    }

    return {
      uuid: uuidv4(),
      type,
      groupUuid: uuidv4(),
      groupType: type,
      payload
    };
  }

  private createDividerBlock(extraPayload?: Record<string, any>): TallyBlock {
    const payload = extraPayload ? { ...extraPayload } : {};

    return {
      uuid: uuidv4(),
      type: 'DIVIDER',
      groupUuid: uuidv4(),
      groupType: 'DIVIDER',
      payload
    };
  }

  private supportsPlaceholder(blockType: TallyBlockType): boolean {
    return ['INPUT_TEXT', 'INPUT_EMAIL', 'INPUT_PHONE_NUMBER', 'INPUT_DATE', 'TEXTAREA', 'DROPDOWN'].includes(blockType);
  }

  private cleanPayload(payload: any): Record<string, any> | undefined {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return undefined;
    }
    return { ...payload };
  }

  private parseNumber(value: any): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value.trim());
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return undefined;
  }

  private normalizeStringArray(value: any): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map(item => {
        if (typeof item === 'string') {
          return item.trim();
        }
        if (item != null) {
          return String(item).trim();
        }
        return '';
      })
      .filter(Boolean);
  }

  private convertLLMFieldToBlocks(field: FormField, fieldUuidMap: Map<string, string>): TallyBlock[] {
    const label = field.label?.trim() || this.capitalizeFirst(field.type.replace(/_/g, ' '));
    const normalizedLabel = label.toLowerCase();
    const required = field.required ?? false;
    const placeholder = field.placeholder?.trim();

    let blocks: TallyBlock[] = [];

    const normalizeOptions = (options?: string[]): Array<{ label: string; value: string }> => {
      if (!options || options.length === 0) {
        return [];
      }
      return options
        .map((option) => {
          const trimmed = option.trim();
          return trimmed.length > 0 ? { label: this.capitalizeFirst(trimmed), value: trimmed } : null;
        })
        .filter((opt): opt is { label: string; value: string } => opt !== null);
    };

    switch (field.type) {
      case 'text':
        blocks = this.createFieldBlocks({ label, type: 'INPUT_TEXT', required, placeholder });
        break;
      case 'email':
        blocks = this.createFieldBlocks({ label, type: 'INPUT_EMAIL', required, placeholder });
        break;
      case 'phone':
        blocks = this.createFieldBlocks({ label, type: 'INPUT_PHONE_NUMBER', required, placeholder: placeholder || 'Enter phone number' });
        break;
      case 'textarea':
        blocks = this.createFieldBlocks({ label, type: 'TEXTAREA', required, placeholder });
        break;
      
      // Dropdown/Select variations - map to DROPDOWN
      case 'dropdown':
      case 'select':
      case 'single_select':
      case 'dropdown_field':
      case 'country_select':
        const dropdownOptions = normalizeOptions(field.options);
        if (dropdownOptions.length > 0) {
          blocks = this.createChoiceBlocks({ label, type: 'DROPDOWN', required, options: dropdownOptions });
        } else if (field.type === 'country_select') {
          // Generate default country list
          const defaultCountries = [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'GB' },
            { label: 'Germany', value: 'DE' },
            { label: 'France', value: 'FR' },
            { label: 'Australia', value: 'AU' },
            { label: 'Japan', value: 'JP' },
            { label: 'Other', value: 'OTHER' }
          ];
          blocks = this.createChoiceBlocks({ label, type: 'DROPDOWN', required, options: defaultCountries });
        } else {
          // Fallback to text input if no options provided
          blocks = this.createFieldBlocks({ label, type: 'INPUT_TEXT', required, placeholder: placeholder || 'Enter selection' });
        }
        break;
      
      // Multiple choice/Radio variations - map to MULTIPLE_CHOICE
      case 'multiple_choice':
      case 'radio':
      case 'single_choice':
      case 'binary_choice':
        const radioOptions = normalizeOptions(field.options);
        if (radioOptions.length > 0) {
          blocks = this.createChoiceBlocks({ label, type: 'MULTIPLE_CHOICE', required, options: radioOptions });
        } else if (field.type === 'binary_choice') {
          // Generate default yes/no options
          const defaultBinaryOptions = [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
          ];
          blocks = this.createChoiceBlocks({ label, type: 'MULTIPLE_CHOICE', required, options: defaultBinaryOptions });
        } else {
          // Fallback to text input if no options provided
          blocks = this.createFieldBlocks({ label, type: 'INPUT_TEXT', required, placeholder: placeholder || 'Enter choice' });
        }
        break;
      
      // Checkbox variations - map to CHECKBOXES
      case 'checkboxes':
      case 'checkbox':
      case 'multi_select':
      case 'multiple_select':
      case 'consent_checkbox':
        const checkboxOptions = normalizeOptions(field.options);
        if (checkboxOptions.length > 0) {
          blocks = this.createChoiceBlocks({ label, type: 'CHECKBOXES', required, options: checkboxOptions });
        } else if (field.type === 'consent_checkbox') {
          // Generate single consent checkbox
          const consentOptions = [
            { label: 'I agree to the terms and conditions', value: 'consent' }
          ];
          blocks = this.createChoiceBlocks({ label, type: 'CHECKBOXES', required, options: consentOptions });
        } else {
          // Fallback to text input if no options provided
          blocks = this.createFieldBlocks({ label, type: 'INPUT_TEXT', required, placeholder: placeholder || 'Enter selections' });
        }
        break;
      
      // Rating/Scale variations - map to proper types with correct payloads
      case 'rating':
      case 'star_rating':
        blocks = this.createFieldBlocks({
          label,
          type: 'RATING',
          required,
          extraPayload: {
            maxRating: field.maxRating ?? 5,
            shape: field.shape?.toUpperCase() ?? 'STAR'
          }
        });
        break;
      
      case 'linear_scale':
      case 'nps':
      case 'scale':
      case 'likert_scale':
        blocks = this.createFieldBlocks({
          label,
          type: 'LINEAR_SCALE',
          required,
          extraPayload: {
            minValue: field.minValue ?? (field.type === 'nps' ? 0 : 1),
            maxValue: field.maxValue ?? (field.type === 'nps' ? 10 : field.maxRating ?? 5),
            minLabel: field.minLabel ?? (field.type === 'nps' ? 'Not likely' : field.type === 'likert_scale' ? 'Strongly Disagree' : 'Poor'),
            maxLabel: field.maxLabel ?? (field.type === 'nps' ? 'Very likely' : field.type === 'likert_scale' ? 'Strongly Agree' : 'Excellent'),
            step: field.step ?? 1
          }
        });
        break;
      
      case 'date':
        blocks = this.createFieldBlocks({ label, type: 'INPUT_DATE', required, placeholder });
        break;
      
      // File upload variations - map to FILE_UPLOAD
      case 'file_upload':
      case 'file':
      case 'upload':
      case 'attachment':
        blocks = this.createFieldBlocks({
          label,
          type: 'FILE_UPLOAD',
          required,
          extraPayload: {
            maxFileSize: typeof field.maxFileSize === 'number' ? Math.round(field.maxFileSize * 1024 * 1024) : undefined,
            acceptedFileTypes: field.allowedFileTypes
          }
        });
        break;
      
      case 'signature':
        blocks = this.createFieldBlocks({ label, type: 'SIGNATURE', required });
        break;
      
      case 'number':
        blocks = this.createFieldBlocks({ label, type: 'INPUT_TEXT', required, placeholder: placeholder || 'Enter number' });
        break;
      
      case 'url':
        blocks = this.createFieldBlocks({ label, type: 'INPUT_TEXT', required, placeholder: placeholder || 'Enter URL' });
        break;
      
      default:
        // Fallback to text input for unknown types
        blocks = this.createFieldBlocks({ label, type: 'INPUT_TEXT', required, placeholder });
    }

    if (blocks.length === 0) {
      return blocks;
    }

    const inputBlock = blocks[blocks.length - 1];
    fieldUuidMap.set(normalizedLabel, inputBlock.uuid);

    if (field.showIf) {
      const conditionalLogic = this.parseConditionalLogic(field.showIf, fieldUuidMap);
      if (conditionalLogic) {
        inputBlock.payload = {
          ...inputBlock.payload,
          conditionalLogic
        };
      }
    }

    return blocks;
  }

  private parseConditionalLogic(showIf: string, fieldUuidMap: Map<string, string>): any | null {
    const conditionMatch = showIf.match(/^(.+?)\s*(<=|>=|<|>|=|equals?)\s*(.+)$/i);
    if (!conditionMatch) {
      console.warn('Could not parse conditional logic expression:', showIf);
      return null;
    }

    const [, rawFieldName, rawOperator, rawValue] = conditionMatch;
    const normalizedFieldName = rawFieldName.trim().toLowerCase();
    const questionId = fieldUuidMap.get(normalizedFieldName);

    if (!questionId) {
      console.warn('Conditional logic references unknown field:', normalizedFieldName);
      return null;
    }

    const operatorMap: Record<string, string> = {
      '<=': 'LESS_THAN_OR_EQUAL_TO',
      '>=': 'GREATER_THAN_OR_EQUAL_TO',
      '<': 'LESS_THAN',
      '>': 'GREATER_THAN',
      '=': 'EQUALS',
      equals: 'EQUALS'
    };

    const operatorKey = rawOperator.trim().toLowerCase();
    const tallyOperator = operatorMap[operatorKey];

    if (!tallyOperator) {
      console.warn('Unsupported conditional operator:', rawOperator);
      return null;
    }

    const numericValue = Number(rawValue.trim());
    const value = Number.isFinite(numericValue) ? numericValue : rawValue.trim();

    return {
      action: 'SHOW',
      conditions: [
        {
          questionId,
          operator: tallyOperator,
          value
        }
      ]
    };
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

    const addField = (config: { label: string; type: TallyBlockType; required?: boolean; placeholder?: string }) => {
      blocks.push(
        ...this.createFieldBlocks({
          label: config.label,
          type: config.type,
          required: config.required,
          placeholder: config.placeholder,
        })
      );
    };

    addField({ label: 'Name', type: 'INPUT_TEXT', required: true, placeholder: 'Enter your full name' });
    addField({ label: 'Email', type: 'INPUT_EMAIL', required: true, placeholder: 'Enter your email address' });

    if (includePhone) {
      addField({ label: 'Phone Number', type: 'INPUT_PHONE_NUMBER', placeholder: 'Enter your phone number' });
    }

    if (includeCompany) {
      addField({ label: 'Company', type: 'INPUT_TEXT', placeholder: 'Enter your company name' });
    }

    addField({ label: 'Message', type: 'TEXTAREA', required: true, placeholder: 'Enter your message' });

    const formData: CreateFormRequest = {
      name: title,
      workspaceId: workspaceId,
      status: 'PUBLISHED',
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
