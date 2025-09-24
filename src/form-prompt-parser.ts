import { TallyApiClient } from './tally-client';
import { CreateFormRequest, TallyBlock, TallyBlockType, FormPromptOptions } from './types/tally';
import { v4 as uuidv4 } from 'uuid';
import { parseFormWithLLM, FormField, FormSection, ParsedForm } from './llm-form-parser';

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
      const fieldCount = this.countFields(llmResult);

      if (fieldCount >= 4) {
        const blocks = await this.convertLLMFormToBlocks(llmResult);

        return {
          title: llmResult.title,
          blocks,
          confirmationMessage: llmResult.settings?.confirmationMessage,
          redirectUrl: llmResult.settings?.redirectUrl ?? null
        };
      }

      console.warn('LLM returned too few fields, attempting structured heuristic parser. Field count:', fieldCount);
    } catch (error) {
      console.warn('LLM parsing failed, attempting structured heuristic parser:', error);
    }

    const heuristicParsed = await this.parseStructuredSections(prompt);
    if (heuristicParsed) {
      const blocks = await this.convertLLMFormToBlocks(heuristicParsed);
      return {
        title: heuristicParsed.title,
        blocks,
        confirmationMessage: heuristicParsed.settings?.confirmationMessage,
        redirectUrl: heuristicParsed.settings?.redirectUrl ?? null
      };
    }

    const loweredPrompt = prompt.toLowerCase();
    const title = this.extractTitle(prompt);
    const blocks = this.parseFields(loweredPrompt, title);

    return { title, blocks };
  }

  private countFields(form: ParsedForm): number {
    if (!form.sections) {
      return 0;
    }
    return form.sections.reduce((total, section) => total + (section.fields?.length ?? 0), 0);
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
      input_text: 'INPUT_TEXT',
      email: 'INPUT_EMAIL',
      input_email: 'INPUT_EMAIL',
      phone: 'INPUT_PHONE_NUMBER',
      phone_number: 'INPUT_PHONE_NUMBER',
      input_phone_number: 'INPUT_PHONE_NUMBER',
      textarea: 'TEXTAREA',
      long_text: 'TEXTAREA',
      message: 'TEXTAREA',
      date: 'INPUT_DATE',
      input_date: 'INPUT_DATE',
      time: 'INPUT_TIME',
      input_time: 'INPUT_TIME',
      url: 'INPUT_LINK',
      website: 'INPUT_LINK',
      link: 'INPUT_LINK',
      input_link: 'INPUT_LINK',
      number: 'INPUT_NUMBER',
      input_number: 'INPUT_NUMBER',
      number_input: 'INPUT_NUMBER',
      select: 'DROPDOWN',
      dropdown: 'DROPDOWN',
      choice: 'MULTIPLE_CHOICE',
      radio: 'MULTIPLE_CHOICE',
      checkbox: 'CHECKBOXES',
      multi_select: 'CHECKBOXES',
      rating: 'RATING',
      ranking: 'RANKING',
      matrix: 'MATRIX',
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
      title_block: 'TITLE',
      title: 'FORM_TITLE',
      form_title: 'FORM_TITLE',
      text_block: 'TEXT',
      paragraph: 'TEXT',
      content: 'TEXT',
      description: 'TEXT',
      divider: 'DIVIDER',
      separator: 'DIVIDER',
      page_break: 'PAGE_BREAK',
      pagebreak: 'PAGE_BREAK',
      thank_you: 'THANK_YOU_PAGE',
      thank_you_page: 'THANK_YOU_PAGE',
      image: 'IMAGE',
      photo: 'IMAGE',
      embed: 'EMBED',
      embed_video: 'EMBED_VIDEO',
      video: 'EMBED_VIDEO',
      embed_audio: 'EMBED_AUDIO',
      audio: 'EMBED_AUDIO',
      payment: 'PAYMENT',
      hidden_fields: 'HIDDEN_FIELDS',
      hidden_field: 'HIDDEN_FIELDS',
      wallet_connect: 'WALLET_CONNECT',
      respondent_country: 'RESPONDENT_COUNTRY',
      captcha: 'CAPTCHA',
      calculated_fields: 'CALCULATED_FIELDS',
      calculated_field: 'CALCULATED_FIELDS',
      conditional_logic: 'CONDITIONAL_LOGIC'
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

    const specialBlocks = this.createBlocksForSpecialTypes(
      blockType,
      field,
      resolvedLabel,
      isRequired,
      extraPayload
    );

    if (specialBlocks) {
      return specialBlocks;
    }

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

  private createBlocksForSpecialTypes(
    blockType: TallyBlockType,
    field: any,
    resolvedLabel: string,
    isRequired: boolean,
    extraPayload: Record<string, any> | undefined
  ): TallyBlock[] | null {
    const payloadOverrides = extraPayload && Object.keys(extraPayload).length > 0 ? { ...extraPayload } : undefined;

    switch (blockType) {
      case 'FORM_TITLE':
        return [this.createFormTitleBlock(resolvedLabel || 'Custom Form')];
      case 'TITLE': {
        const titleContent = (field.content ?? field.text ?? resolvedLabel).trim();
        return [this.createContentBlock('HEADING_2', titleContent, payloadOverrides)];
      }
      case 'HEADING_1':
      case 'HEADING_2':
      case 'HEADING_3': {
        const headingContent = (field.content ?? field.text ?? resolvedLabel).trim();
        return [this.createContentBlock(blockType, headingContent, payloadOverrides)];
      }
      case 'TEXT': {
        const textContent = (field.text ?? field.content ?? field.description ?? resolvedLabel).trim();
        return [this.createContentBlock('TEXT', textContent, payloadOverrides)];
      }
      case 'DIVIDER':
        return [this.createDividerBlock(payloadOverrides)];
      case 'PAGE_BREAK':
        return [this.createPageBreakBlock(payloadOverrides)];
      case 'THANK_YOU_PAGE':
        return [
          this.createThankYouPageBlock({
            title: resolvedLabel,
            message: field.message ?? field.description ?? field.text,
            buttonText: field.buttonText ?? field.submitText,
            extraPayload: payloadOverrides
          })
        ];
      case 'IMAGE':
      case 'EMBED':
      case 'EMBED_VIDEO':
      case 'EMBED_AUDIO': {
        const mediaBlock = this.createMediaBlock(blockType, {
          url: field.url ?? field.src ?? field.value ?? field.embedUrl,
          altText: field.alt ?? resolvedLabel,
          caption: field.caption ?? field.description,
          extraPayload: payloadOverrides
        });
        return mediaBlock ? [mediaBlock] : null;
      }
      case 'HIDDEN_FIELDS':
        return [this.createHiddenFieldsBlock(field, payloadOverrides)];
      case 'CALCULATED_FIELDS':
        return [this.createCalculatedFieldsBlock(field, payloadOverrides)];
      case 'CONDITIONAL_LOGIC':
        return [this.createConditionalLogicBlock(field, payloadOverrides)];
      case 'CAPTCHA':
        return [this.createGenericBlock('CAPTCHA', payloadOverrides)];
      case 'RESPONDENT_COUNTRY':
        return [this.createGenericBlock('RESPONDENT_COUNTRY', payloadOverrides)];
      case 'WALLET_CONNECT':
        return [this.createWalletConnectBlock(field, payloadOverrides)];
      case 'PAYMENT':
        return [this.createPaymentBlock(field, payloadOverrides)];
      case 'MATRIX':
        return this.createMatrixBlocks({ field, label: resolvedLabel, required: isRequired, extraPayload: payloadOverrides });
      default:
        return null;
    }
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

  private normalizeMatrixItems(items: any): Array<{ label: string; text: string; value: string; payload?: Record<string, any> }> {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map((item: any, index: number) => {
        if (typeof item === 'string') {
          const trimmed = item.trim();
          if (!trimmed) {
            return null;
          }
          const value = this.slugify(trimmed, `item_${index + 1}`);
          return {
            label: trimmed,
            text: trimmed,
            value
          };
        }

        if (item && typeof item === 'object') {
          const rawLabel = typeof item.label === 'string' && item.label.trim().length > 0
            ? item.label.trim()
            : typeof item.text === 'string'
              ? item.text.trim()
              : '';

          if (!rawLabel) {
            return null;
          }

          const value = typeof item.value === 'string' && item.value.trim().length > 0
            ? item.value.trim()
            : this.slugify(rawLabel, `item_${index + 1}`);

          const payload = this.cleanPayload(item.payload) || undefined;

          return {
            label: rawLabel,
            text: rawLabel,
            value,
            payload
          };
        }

        return null;
      })
      .filter(item => item !== null);
  }

  private createChoiceBlocks(field: {
    label: string;
    type: 'DROPDOWN' | 'MULTIPLE_CHOICE' | 'CHECKBOXES' | 'RANKING';
    required: boolean;
    options: Array<{ label: string; value: string; default?: boolean }>;
    placeholder?: string;
    extraPayload?: Record<string, any>;
  }): TallyBlock[] {
    const groupUuid = uuidv4();

    // Create TITLE block for the question (like Tally AI does)
    const titleBlock: TallyBlock = {
      uuid: uuidv4(),
      type: 'TITLE',
      groupUuid,
      groupType: 'QUESTION',
      payload: {
        safeHTMLSchema: [[field.label]]
      }
    };

    // Determine the option block type - Tally AI uses MULTIPLE_CHOICE_OPTION for everything
    let optionType: TallyBlockType = 'MULTIPLE_CHOICE_OPTION';
    let groupType: string = 'MULTIPLE_CHOICE';

    // Create individual option blocks with proper Tally AI structure
    const optionBlocks: TallyBlock[] = field.options.map((option, index) => ({
      uuid: uuidv4(),
      type: optionType,
      groupUuid,
      groupType: groupType,
      payload: {
        index: index,
        isFirst: index === 0,
        isLast: index === field.options.length - 1,
        isRequired: field.required,
        randomize: false,
        hasOtherOption: false,
        allowMultiple: field.type === 'CHECKBOXES',
        hasMaxChoices: false,
        colorCodeOptions: false,
        hasBadge: true,
        badgeType: 'LETTERS',
        hasDefaultAnswer: option.default ?? false,
        text: option.label // Use the actual option text
      }
    }));

    return [titleBlock, ...optionBlocks];
  }

  private createSingleCheckboxBlock(field: {
    label: string;
    required: boolean;
    option: { label: string; value: string; text?: string; default?: boolean };
    description?: string;
  }): TallyBlock[] {
    const groupUuid = uuidv4();
    const optionLabel = field.option.text?.trim() || field.option.label.trim();

    // Create TITLE block for the question (like Tally AI does)
    const titleBlock: TallyBlock = {
      uuid: uuidv4(),
      type: 'TITLE',
      groupUuid,
      groupType: 'QUESTION',
      payload: {
        safeHTMLSchema: [[field.label]]
      }
    };

    // Create CHECKBOX block with proper Tally AI structure
    const checkboxBlock: TallyBlock = {
      uuid: uuidv4(),
      type: 'CHECKBOX',
      groupUuid,
      groupType: 'CHECKBOX',
      payload: {
        isRequired: field.required,
        hasDefaultAnswer: field.option.default ?? false,
        text: optionLabel // Use the actual checkbox text
      }
    };

    return [titleBlock, checkboxBlock];
  }

  private createGenericBlock(type: TallyBlockType, payloadOverrides?: Record<string, any>): TallyBlock {
    const payload = payloadOverrides ? { ...payloadOverrides } : {};

    return {
      uuid: uuidv4(),
      type,
      groupUuid: uuidv4(),
      groupType: type,
      payload
    };
  }

  private createPageBreakBlock(extraPayload?: Record<string, any>): TallyBlock {
    return this.createGenericBlock('PAGE_BREAK', extraPayload);
  }

  private createThankYouPageBlock(config: {
    title?: string;
    message?: string;
    buttonText?: string;
    extraPayload?: Record<string, any>;
  }): TallyBlock {
    const payload: Record<string, any> = config.extraPayload ? { ...config.extraPayload } : {};

    if (config.title && config.title.trim().length > 0) {
      payload.title = config.title.trim();
    }

    const message = config.message && String(config.message).trim();
    if (message && message.length > 0) {
      payload.message = message;
      payload.safeHTMLSchema = [[message]];
    }

    if (config.buttonText && config.buttonText.trim().length > 0) {
      payload.buttonText = config.buttonText.trim();
    }

    return {
      uuid: uuidv4(),
      type: 'THANK_YOU_PAGE',
      groupUuid: uuidv4(),
      groupType: 'THANK_YOU_PAGE',
      payload
    };
  }

  private createMediaBlock(
    type: 'IMAGE' | 'EMBED' | 'EMBED_VIDEO' | 'EMBED_AUDIO',
    config: {
      url?: string;
      altText?: string;
      caption?: string;
      extraPayload?: Record<string, any>;
    }
  ): TallyBlock | null {
    const url = config.url?.trim();
    if (!url) {
      return null;
    }

    const payload: Record<string, any> = config.extraPayload ? { ...config.extraPayload } : {};

    payload.url = url;
    if (type !== 'IMAGE') {
      payload.embedUrl = url;
    }

    const altText = config.altText?.trim();
    if (altText) {
      payload.altText = altText;
    }

    const caption = config.caption?.trim();
    if (caption) {
      payload.caption = caption;
      payload.safeHTMLSchema = [[caption]];
    }

    return {
      uuid: uuidv4(),
      type,
      groupUuid: uuidv4(),
      groupType: type,
      payload
    };
  }

  private createHiddenFieldsBlock(field: any, extraPayload?: Record<string, any>): TallyBlock {
    const entries = Array.isArray(field.fields)
      ? field.fields
      : Array.isArray(field.hiddenFields)
        ? field.hiddenFields
        : [];

    const normalized = entries
      .map((entry: any) => {
        if (typeof entry === 'string') {
          const trimmed = entry.trim();
          if (!trimmed) {
            return null;
          }
          return {
            name: trimmed,
            value: undefined
          };
        }

        if (entry && typeof entry === 'object') {
          const name = typeof entry.name === 'string' && entry.name.trim().length > 0
            ? entry.name.trim()
            : typeof entry.field === 'string'
              ? entry.field.trim()
              : '';

          if (!name) {
            return null;
          }

          const value = typeof entry.value === 'string' && entry.value.trim().length > 0
            ? entry.value.trim()
            : undefined;

          const payload = this.cleanPayload(entry.payload) || {};

          return { name, value, ...payload };
        }

        return null;
      })
      .filter((entry): entry is Record<string, any> => entry !== null);

    const payload: Record<string, any> = extraPayload ? { ...extraPayload } : {};

    if (normalized.length > 0) {
      payload.fields = normalized;
    }

    return this.createGenericBlock('HIDDEN_FIELDS', payload);
  }

  private createCalculatedFieldsBlock(field: any, extraPayload?: Record<string, any>): TallyBlock {
    const calculations = Array.isArray(field.calculations)
      ? field.calculations
      : Array.isArray(field.formulas)
        ? field.formulas
        : Array.isArray(field.fields)
          ? field.fields
          : [];

    const payload: Record<string, any> = extraPayload ? { ...extraPayload } : {};

    if (calculations.length > 0) {
      payload.calculations = calculations;
    }

    return this.createGenericBlock('CALCULATED_FIELDS', payload);
  }

  private createConditionalLogicBlock(field: any, extraPayload?: Record<string, any>): TallyBlock {
    const rulesSource = Array.isArray(field.rules)
      ? field.rules
      : Array.isArray(field.logic)
        ? field.logic
        : field.rule
          ? [field.rule]
          : [];

    const payload: Record<string, any> = extraPayload ? { ...extraPayload } : {};

    if (rulesSource.length > 0) {
      payload.rules = rulesSource;
    }

    return this.createGenericBlock('CONDITIONAL_LOGIC', payload);
  }

  private createWalletConnectBlock(field: any, extraPayload?: Record<string, any>): TallyBlock {
    const payload: Record<string, any> = extraPayload ? { ...extraPayload } : {};

    if (field.provider) {
      payload.provider = String(field.provider);
    }

    if (field.network) {
      payload.network = String(field.network);
    }

    if (field.chainId) {
      payload.chainId = field.chainId;
    }

    return this.createGenericBlock('WALLET_CONNECT', payload);
  }

  private createPaymentBlock(field: any, extraPayload?: Record<string, any>): TallyBlock {
    const payload: Record<string, any> = extraPayload ? { ...extraPayload } : {};

    const amount = this.parseNumber(field.amount ?? field.price ?? field.value);
    if (typeof amount === 'number') {
      payload.amount = amount;
    }

    const currency = typeof field.currency === 'string' && field.currency.trim().length > 0
      ? field.currency.trim().toUpperCase()
      : undefined;
    if (currency) {
      payload.currency = currency;
    }

    if (field.description) {
      payload.description = String(field.description);
    }

    if (field.buttonText) {
      payload.buttonText = String(field.buttonText);
    }

    return this.createGenericBlock('PAYMENT', payload);
  }

  private createMatrixBlocks(config: {
    field: any;
    label: string;
    required: boolean;
    extraPayload?: Record<string, any>;
  }): TallyBlock[] {
    const { field, label, required, extraPayload } = config;
    const groupUuid = uuidv4();
    const blocks: TallyBlock[] = [];

    blocks.push({
      uuid: uuidv4(),
      type: 'LABEL',
      groupUuid,
      groupType: 'LABEL',
      payload: {
        safeHTMLSchema: [[label]]
      }
    });

    const payload: Record<string, any> = {
      isRequired: required
    };

    if (extraPayload) {
      Object.assign(payload, extraPayload);
    }

    if (field.selectionType) {
      payload.selectionType = field.selectionType;
    }

    if (field.layout) {
      payload.layout = field.layout;
    }

    const matrixBlock: TallyBlock = {
      uuid: uuidv4(),
      type: 'MATRIX',
      groupUuid,
      groupType: 'MATRIX',
      payload
    };

    blocks.push(matrixBlock);

    const rows = this.normalizeMatrixItems(field.rows ?? field.rowOptions ?? field.options);
    const columns = this.normalizeMatrixItems(field.columns ?? field.columnOptions ?? field.headers);

    rows.forEach((row, index) => {
      const rowExtras = this.cleanPayload(row.payload) || {};
      const payloadRow = {
        label: row.label,
        value: row.value,
        text: row.text,
        order: index,
        ...rowExtras
      };

      blocks.push({
        uuid: uuidv4(),
        type: 'MATRIX_ROW',
        groupUuid,
        groupType: 'MATRIX_ROW',
        payload: payloadRow
      });
    });

    columns.forEach((column, index) => {
      const columnExtras = this.cleanPayload(column.payload) || {};
      const payloadColumn = {
        label: column.label,
        value: column.value,
        text: column.text,
        order: index,
        ...columnExtras
      };

      blocks.push({
        uuid: uuidv4(),
        type: 'MATRIX_COLUMN',
        groupUuid,
        groupType: 'MATRIX_COLUMN',
        payload: payloadColumn
      });
    });

    return blocks;
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
    return [
      'INPUT_TEXT',
      'INPUT_EMAIL',
      'INPUT_PHONE_NUMBER',
      'INPUT_DATE',
      'INPUT_TIME',
      'INPUT_NUMBER',
      'INPUT_LINK',
      'TEXTAREA',
      'DROPDOWN'
    ].includes(blockType);
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

  private slugify(input: string, fallback: string): string {
    const slug = input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

    return slug || fallback;
  }

  private convertLLMFieldToBlocks(field: FormField, fieldUuidMap: Map<string, string>): TallyBlock[] {
    const label = field.label?.trim() || this.capitalizeFirst(field.type.replace(/_/g, ' '));
    const normalizedLabel = label.toLowerCase();
    const required = field.required ?? false;
    const placeholder = field.placeholder?.trim();

    let blocks: TallyBlock[] = [];

    const normalizeOptions = (options?: string[]): Array<{ label: string; value: string; text: string }> => {
      if (!options || options.length === 0) {
        return [];
      }
      return options
        .map((option) => {
          const trimmed = option.trim();
          if (!trimmed.length) return null;
          const labelText = this.capitalizeFirst(trimmed);
          const value = trimmed
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '');
          return {
            label: labelText,
            text: labelText,
            value: value || labelText
          };
        })
        .filter((opt): opt is { label: string; value: string; text: string } => opt !== null);
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
        if (checkboxOptions.length > 1) {
          blocks = this.createChoiceBlocks({ label, type: 'CHECKBOXES', required, options: checkboxOptions });
        } else if (checkboxOptions.length === 1) {
          blocks = this.createSingleCheckboxBlock({
            label,
            required,
            option: checkboxOptions[0],
            description: field.description
          });
        } else if (field.type === 'consent_checkbox') {
          const consentOption = {
            label: 'I agree to the terms and conditions',
            text: 'I agree to the terms and conditions',
            value: 'consent'
          };
          blocks = this.createSingleCheckboxBlock({
            label,
            required,
            option: consentOption,
            description: field.description
          });
        } else {
          // Fallback to text input if no options provided
          blocks = this.createFieldBlocks({
            label,
            type: 'INPUT_TEXT',
            required,
            placeholder: placeholder || 'Enter selections'
          });
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
            shape: (field as any).shape ? (field as any).shape.toUpperCase() : 'STAR'
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
            minValue: (field as any).minValue ?? (field.type === 'nps' ? 0 : 1),
            maxValue: (field as any).maxValue ?? (field.type === 'nps' ? 10 : field.maxRating ?? 5),
            minLabel:
              (field as any).minLabel ??
              (field.type === 'nps'
                ? 'Not likely'
                : field.type === 'likert_scale'
                ? 'Strongly Disagree'
                : 'Lowest'),
            maxLabel:
              (field as any).maxLabel ??
              (field.type === 'nps'
                ? 'Very likely'
                : field.type === 'likert_scale'
                ? 'Strongly Agree'
                : 'Highest'),
            step: (field as any).step ?? 1
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

  private async parseStructuredSections(prompt: string): Promise<ParsedForm | null> {
    const normalized = prompt.replace(/\r\n/g, '\n');
    const title = this.extractTitle(prompt) || 'Custom Form';

    const introMatch = normalized.match(/Intro\s*\/\s*Description:\s*([\s\S]*?)(?=\n\s*\n|Section:|$)/i);
    const description = introMatch ? introMatch[1].trim() : undefined;

    const thankMatch = normalized.match(/End\s*\/\s*Thank You Page:[\s\S]*?Message:\s*["“]?([^\n"”]+)["”]?/i);
    const confirmationMessage = thankMatch ? thankMatch[1].trim() : undefined;

    const sections: FormSection[] = [];
    const sectionRegex = /Section:\s*(.+)/gi;
    const sectionMatches: Array<{ title: string; start: number; end: number }> = [];

    let match: RegExpExecArray | null;
    while ((match = sectionRegex.exec(normalized)) !== null) {
      sectionMatches.push({ title: match[1].trim(), start: match.index + match[0].length, end: normalized.length });
    }

    sectionMatches.forEach((section, index) => {
      if (index < sectionMatches.length - 1) {
        section.end = sectionMatches[index + 1].start - sectionMatches[index + 1].title.length - 'Section: '.length;
      } else if (thankMatch) {
        section.end = thankMatch.index || normalized.length;
      }
    });

    const promptLower = normalized.toLowerCase();
    const needsSeverity = promptLower.includes('severity');
    const needsPreferredMethod = promptLower.includes('preferred method');
    const needsTimeOfDay = promptLower.includes('time of day');
    const needsConsent = promptLower.includes('consent');

    sectionMatches.forEach(({ title: sectionTitle, start, end }) => {
      const body = normalized.slice(start, end).trim();
      if (!body) {
        return;
      }

      const parsedSection = this.parseSectionBody(sectionTitle, body);
      if (parsedSection.fields.length > 0) {
        sections.push(parsedSection);
      }
    });

    if (sections.length === 0) {
      return this.generateDomainSpecificFallback(prompt, {
        title,
        description,
        confirmationMessage
      });
    }

    const firstSection = sections[0];
    if (needsSeverity && !this.sectionHasField(sections, 'severity')) {
      firstSection.fields.unshift({
        type: 'multiple_choice',
        label: 'Severity',
        required: true,
        options: [
          '🔴 Critical - System crash or complete failure',
          '🟠 High - Major functionality broken',
          '🟡 Medium - Noticeable issue but workaround exists',
          '🟢 Low - Minor cosmetic or convenience issue'
        ]
      });
    }

    if (needsPreferredMethod && !this.sectionHasField(sections, 'preferred method')) {
      const contactSection = sections.find(section => section.title.toLowerCase().includes('contact')) || firstSection;
      contactSection.fields.push({
        type: 'multiple_choice',
        label: 'Preferred Method of Contact',
        required: true,
        options: ['Email', 'Phone call', 'Video call', 'Chat message']
      });
    }

    if (needsTimeOfDay && !this.sectionHasField(sections, 'time of day')) {
      const contactSection = sections.find(section => section.title.toLowerCase().includes('contact')) || firstSection;
      contactSection.fields.push({
        type: 'dropdown',
        label: 'Best Time of Day to Contact',
        required: true,
        options: ['Morning (9AM - 12PM)', 'Afternoon (12PM - 5PM)', 'Evening (5PM - 9PM)', 'Any time']
      });
    }

    if (needsConsent && !this.sectionHasField(sections, 'consent')) {
      const consentSection = sections.find(section => section.title.toLowerCase().includes('consent')) || sections[sections.length - 1];
      consentSection.fields.push({
        type: 'checkbox',
        label: 'I consent to being contacted regarding this bug report and agree to the privacy policy.',
        required: true,
      });
    }

    return {
      title,
      description,
      sections,
      settings: confirmationMessage
        ? {
            confirmationMessage,
          }
        : undefined,
    };
  }

  private generateDomainSpecificFallback(
    prompt: string,
    context: { title: string; description?: string; confirmationMessage?: string }
  ): ParsedForm | null {
    const normalizedPrompt = prompt.toLowerCase();

    if (
      normalizedPrompt.includes('bug report') ||
      (normalizedPrompt.includes('bug') && normalizedPrompt.includes('form')) ||
      normalizedPrompt.includes('severity dropdown')
    ) {
      return this.generateBugReportFallback(prompt, context);
    }

    return null;
  }

  private generateBugReportFallback(
    prompt: string,
    context: { title: string; description?: string; confirmationMessage?: string }
  ): ParsedForm {
    const fallbackTitles = [
      'Bug Busters Unite! 🐜👽',
      'Glitch Snitch Hotline 🐞☎️',
      'Squash Squad HQ 🪲🚨',
      'Debugger Distress Call 🚑🐛',
      'Mission: Fix It Fast 🚀🐞'
    ];

    const preferredTitle = context.title && context.title !== 'Custom Form'
      ? context.title
      : this.pickDeterministicItem(fallbackTitles, prompt);

    const defaultDescription =
      context.description ??
      'Help us squash this bug quickly by sharing the details below. Screenshots, emojis, and dramatic reenactments welcome!';

    const confirmationMessage =
      context.confirmationMessage ??
      'Thanks for helping us improve! Our team will reach out after we review your report.';

    const severityOptions = [
      '🔴 Critical - System crash or complete failure',
      '🟠 High - Major functionality broken',
      '🟡 Medium - Noticeable issue but workaround exists',
      '🟢 Low - Cosmetic hiccup or nice-to-have'
    ];

    const areaOptions = this.determineBugAreaOptions(prompt);

    const sections: FormSection[] = [
      {
        title: 'Bug Details',
        description: 'What went sideways? Give us the highlights so we can reproduce it fast.',
        fields: [
          {
            type: 'text',
            label: 'Bug Title',
            required: true,
            placeholder: 'e.g. Severity dropdown loses emoji formatting'
          },
          {
            type: 'multiple_choice',
            label: 'Severity',
            required: true,
            options: severityOptions
          },
          {
            type: 'multiple_choice',
            label: 'Area Affected',
            required: true,
            options: areaOptions
          },
          {
            type: 'textarea',
            label: 'What happened?',
            required: true,
            placeholder: 'Describe the unexpected behavior, error messages, and impact.'
          },
          {
            type: 'textarea',
            label: 'Steps to Reproduce',
            required: true,
            placeholder: `1. Start on...
2. Click...
3. See the bug...`
          },
          {
            type: 'textarea',
            label: 'Expected vs Actual',
            required: false,
            placeholder: 'Let us know what you expected to happen versus what actually happened.'
          },
          {
            type: 'file_upload',
            label: 'Screenshots, Loom, or Logs',
            required: false,
            description: 'Upload screenshots, recordings, or logs that showcase the issue.',
            allowedFileTypes: ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'pdf']
          }
        ]
      },
      {
        title: 'Reporter & Account Info',
        description: 'Tell us who found the bug so we can follow up if we need more context.',
        fields: [
          {
            type: 'text',
            label: 'Reporter Name',
            required: true,
            placeholder: 'Who should we thank for catching this?'
          },
          {
            type: 'email',
            label: 'Account Email',
            required: true,
            placeholder: 'account@company.com'
          },
          {
            type: 'text',
            label: 'Account ID or Workspace URL',
            required: false,
            placeholder: 'Workspace slug, account ID, or helpful link'
          },
          {
            type: 'text',
            label: 'Role / Team',
            required: false,
            placeholder: 'Product, Engineering, Support, QA...'
          }
        ]
      },
      {
        title: 'Contact Preferences',
        description: 'We’ll use these details to coordinate updates or clarifying questions.',
        fields: [
          {
            type: 'multiple_choice',
            label: 'Preferred Contact Method',
            required: true,
            options: ['✉️ Email', '📞 Phone Call', '🎥 Video Call', '💬 Chat Message']
          },
          {
            type: 'multiple_choice',
            label: 'Best Time of Day to Reach You',
            required: true,
            options: [
              '🌅 Morning (9AM - 12PM)',
              '🌞 Afternoon (12PM - 5PM)',
              '🌇 Evening (5PM - 9PM)',
              '🌙 Anytime works for me'
            ]
          },
          {
            type: 'textarea',
            label: 'Additional Notes',
            required: false,
            placeholder: 'Share deadlines, related tickets, or anything else that helps.'
          }
        ]
      },
      {
        title: 'Consent',
        fields: [
          {
            type: 'checkbox',
            label: 'Consent',
            required: true,
            options: ['I consent to being contacted regarding this bug report and agree to the privacy policy.']
          }
        ]
      }
    ];

    return {
      title: preferredTitle,
      description: defaultDescription,
      sections,
      settings: {
        confirmationMessage,
        hasProgressBar: true,
        hasPartialSubmissions: true,
        saveForLater: true
      }
    };
  }

  private determineBugAreaOptions(prompt: string): string[] {
    const baseOptions = [
      '🖥️ User Interface / Layout',
      '⚙️ Core Functionality',
      '🔌 Integrations & API',
      '🚀 Performance / Speed',
      '🔒 Authentication & Security',
      '💳 Billing & Payments',
      '📱 Mobile / Responsive',
      'Other (tell us more)'
    ];

    const normalized = prompt.toLowerCase();
    const enrichedOptions = new Set(baseOptions);

    if (normalized.includes('analytics') || normalized.includes('dashboard')) {
      enrichedOptions.add('📊 Dashboard & Analytics');
    }

    if (normalized.includes('email')) {
      enrichedOptions.add('✉️ Notifications & Email');
    }

    if (normalized.includes('consent') || normalized.includes('privacy')) {
      enrichedOptions.add('🛡️ Compliance & Privacy');
    }

    if (normalized.includes('account')) {
      enrichedOptions.add('👤 Account Management');
    }

    if (normalized.includes('mobile')) {
      enrichedOptions.add('📲 Native Mobile Apps');
    }

    return Array.from(enrichedOptions);
  }

  private pickDeterministicItem(items: string[], seed: string): string {
    if (!items.length) {
      return '';
    }

    const hash = seed
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const index = Math.abs(hash) % items.length;
    return items[index];
  }

  private parseSectionBody(title: string, body: string): FormSection {
    const lines = body.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const descriptionLines: string[] = [];
    const fields: FormField[] = [];
    let lastChoiceLabel: string | null = null;

    const addField = (field: FormField) => {
      fields.push(field);
      if (['multiple_choice', 'dropdown', 'checkboxes'].includes(field.type)) {
        lastChoiceLabel = field.label;
      }
    };

    const lowerTitle = title.toLowerCase();

    lines.forEach((line, index) => {
      const lower = line.toLowerCase();

      if (/consent checkbox/.test(lower)) {
        addField({
          type: 'checkbox',
          label: line.replace(/\.$/, ''),
          required: true,
        });
        return;
      }

      if (/preferred method/.test(lower) && !line.includes('(')) {
        addField({
          type: 'multiple_choice',
          label: 'Preferred Method of Contact',
          required: true,
          options: ['Email', 'Phone call', 'Video call', 'Chat message'],
        });
        return;
      }

      if (/time of day/.test(lower) && !line.includes('(')) {
        addField({
          type: 'dropdown',
          label: 'Best Time of Day to Contact',
          required: true,
          options: ['Morning (9AM - 12PM)', 'Afternoon (12PM - 5PM)', 'Evening (5PM - 9PM)', 'Any time'],
        });
        return;
      }

      if (/^long description text/i.test(lower)) {
        const nextLine = lines[index + 1] || '';
        const textMatch = nextLine.match(/["“](.+)["”]/);
        if (textMatch) {
          addField({
            type: 'text',
            label: `${title} Details`,
            required: false,
            description: textMatch[1],
          });
        }
        return;
      }

      const fieldFromLine = this.parseFieldLine(line);
      if (fieldFromLine) {
        fieldFromLine.forEach((field) => {
          if (field.label.toLowerCase().startsWith('if yes') && lastChoiceLabel) {
            field.label = 'Facilitation Topic';
            field.showIf = `${lastChoiceLabel.toLowerCase()} = Yes`;
          }

          addField(field);

          if (field.type === 'checkboxes' && field.options?.some((opt) => opt.toLowerCase().includes('other'))) {
            addField({
              type: 'text',
              label: `${field.label} - Other details`,
              required: false,
              showIf: `${field.label.toLowerCase()} = Other`,
            });
          }
        });
        return;
      }

      if (fields.length === 0) {
        descriptionLines.push(line);
      }
    });

    return {
      title,
      description: descriptionLines.length ? descriptionLines.join(' ') : undefined,
      fields,
    };
  }

  private parseFieldLine(line: string): FormField[] | null {
    const match = line.match(/^\s*(?:\d+[.)]\s*)?(.*?)(?:\(([^)]+)\))?\s*$/);
    if (!match) {
      return null;
    }

    const rawLabel = match[1]?.trim();
    if (!rawLabel) {
      return null;
    }

    const attributes = match[2]?.trim() || '';
    const attrLower = attributes.toLowerCase();
    const label = rawLabel.replace(/:$/, '').trim();

    if (!attributes && !/required|optional|text|dropdown|radio|checkbox|date|email|phone/i.test(line)) {
      return null;
    }

    const parsedFields: FormField[] = [];
    let type: FormField['type'] = 'text';
    let options: string[] | undefined;
    let required = /required/i.test(attributes);
    let placeholder: string | undefined;

    if (/email/.test(attrLower)) {
      type = 'email';
      placeholder = 'Enter email';
    } else if (/phone/.test(attrLower)) {
      type = 'phone';
      placeholder = 'Enter phone number';
    } else if (/date/.test(attrLower)) {
      type = 'date';
    } else if (/long text|text area|textarea/.test(attrLower)) {
      type = 'textarea';
      placeholder = 'Tell us more...';
    } else if (/radio|single choice/.test(attrLower)) {
      type = 'multiple_choice';
    } else if (/dropdown|select/.test(attrLower)) {
      type = 'dropdown';
    } else if (/checkbox/.test(attrLower)) {
      type = 'checkboxes';
    } else if (/rating|scale/.test(attrLower)) {
      type = 'rating';
    } else {
      type = 'text';
      if (attrLower.includes('short text')) {
        placeholder = 'Enter text';
      }
    }

    const optionMatch = attributes.match(/:\s*(.+)$/);
    if (optionMatch) {
      options = optionMatch[1]
        .split(/[,;]+/)
        .map((opt) => opt.trim())
        .filter(Boolean);
    }

    if (/other with text option/i.test(attributes) && options) {
      if (!options.some((opt) => opt.toLowerCase().includes('other'))) {
        options.push('Other');
      }
    }

    if (type === 'rating' && (!options || options.length === 0)) {
      type = 'multiple_choice';
      options = [
        '🔴 Critical - System crash or complete failure',
        '🟠 High - Major functionality broken',
        '🟡 Medium - Noticeable issue but workaround exists',
        '🟢 Low - Minor cosmetic or convenience issue',
      ];
    }

    parsedFields.push({
      type,
      label,
      required,
      placeholder,
      options,
    });

    return parsedFields;
  }

  private sectionHasField(sections: FormSection[], keyword: string): boolean {
    const lower = keyword.toLowerCase();
    return sections.some((section) =>
      section.fields?.some((field) => field.label.toLowerCase().includes(lower)),
    );
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
