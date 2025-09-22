// Types for Tally.so API integration

export interface TallyForm {
  id: string;
  name: string;
  description?: string;
  blocks: TallyBlock[];
  settings?: TallyFormSettings;
  createdAt: string;
  updatedAt: string;
  url?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
}

export interface TallyBlock {
  uuid: string;
  type: TallyBlockType;
  groupUuid: string;
  groupType: string;
  payload: any;
}

export type TallyBlockType = 
  | 'FORM_TITLE'
  | 'TEXT'
  | 'LABEL'
  | 'TITLE'
  | 'HEADING_1'
  | 'HEADING_2'
  | 'HEADING_3'
  | 'DIVIDER'
  | 'PAGE_BREAK'
  | 'THANK_YOU_PAGE'
  | 'IMAGE'
  | 'EMBED'
  | 'EMBED_VIDEO'
  | 'EMBED_AUDIO'
  | 'QUESTION'
  | 'MULTIPLE_CHOICE'
  | 'CHECKBOXES'
  | 'DROPDOWN'
  | 'RANKING'
  | 'MATRIX'
  | 'MULTI_SELECT'
  | 'INPUT_TEXT'
  | 'INPUT_NUMBER'
  | 'INPUT_EMAIL'
  | 'INPUT_LINK'
  | 'INPUT_PHONE_NUMBER'
  | 'INPUT_DATE'
  | 'INPUT_TIME'
  | 'TEXTAREA'
  | 'FILE_UPLOAD'
  | 'LINEAR_SCALE'
  | 'RATING'
  | 'HIDDEN_FIELDS'
  | 'MULTIPLE_CHOICE_OPTION'
  | 'CHECKBOX'
  | 'DROPDOWN_OPTION'
  | 'RANKING_OPTION'
  | 'MULTI_SELECT_OPTION'
  | 'PAYMENT'
  | 'SIGNATURE'
  | 'MATRIX_ROW'
  | 'MATRIX_COLUMN'
  | 'WALLET_CONNECT'
  | 'CONDITIONAL_LOGIC'
  | 'CALCULATED_FIELDS'
  | 'CAPTCHA'
  | 'RESPONDENT_COUNTRY';

export interface TallyFormSettings {
  language?: string;
  isClosed?: boolean;
  hasSelfEmailNotifications?: boolean;
  hasRespondentEmailNotifications?: boolean;
  hasProgressBar?: boolean;
  hasPartialSubmissions?: boolean;
  pageAutoJump?: boolean;
  saveForLater?: boolean;
  redirectOnCompletion?: string | null;
  confirmationMessage?: string;
  styles?: {
    theme?: 'LIGHT' | 'DARK';
    font?: {
      provider?: string;
      family?: string;
    };
  };
}

export interface CreateFormRequest {
  name: string;
  workspaceId: string;
  status: 'DRAFT' | 'PUBLISHED';
  blocks: TallyBlock[];
  settings?: TallyFormSettings;
}

export interface UpdateFormRequest {
  name?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  blocks?: TallyBlock[];
  settings?: TallyFormSettings;
}

export interface TallyApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TallyUser {
  id: string;
  email: string;
  name?: string;
}

export interface TallyWorkspace {
  id: string;
  name: string;
  slug: string;
}

export interface TallySubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface FormPromptOptions {
  title?: string;
  description?: string;
  includeCaptcha?: boolean;
  redirectUrl?: string;
  confirmationMessage?: string;
}

export interface ApiKeyConfig {
  apiKey: string;
  isValid: boolean;
  lastChecked: string;
  userEmail?: string;
}
