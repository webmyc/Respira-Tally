import Groq from "groq-sdk";

// Initialize Groq client lazily to avoid build-time errors
let groq: Groq | null = null;

function getGroqClient(): Groq | null {
  if (!groq && process.env.GROQ_API_KEY) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

export interface FormField {
  type:
    | "text"
    | "email"
    | "phone"
    | "textarea"
    | "dropdown"
    | "select"
    | "single_select"
    | "dropdown_field"
    | "country_select"
    | "multiple_choice"
    | "radio"
    | "single_choice"
    | "binary_choice"
    | "checkboxes"
    | "checkbox"
    | "multi_select"
    | "multiple_select"
    | "consent_checkbox"
    | "rating"
    | "star_rating"
    | "linear_scale"
    | "nps"
    | "scale"
    | "likert_scale"
    | "date"
    | "file_upload"
    | "file"
    | "upload"
    | "attachment"
    | "signature"
    | "number"
    | "url";
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
  maxRating?: number;
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
  step?: number;
  shape?: string;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  showIf?: string; // Conditional logic: "field_name operator value"
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface ParsedForm {
  title: string;
  description?: string;
  sections: FormSection[];
  settings?: {
    confirmationMessage?: string;
    redirectUrl?: string;
    hasProgressBar?: boolean;
    hasPartialSubmissions?: boolean;
    saveForLater?: boolean;
  };
}

export async function parseFormWithLLM(prompt: string): Promise<ParsedForm> {
  // Check if Groq API key is available
  console.log("🔍 LLM Parsing - Checking Groq API key...");
  console.log("GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY);
  console.log("GROQ_API_KEY length:", process.env.GROQ_API_KEY?.length || 0);
  
  const groqClient = getGroqClient();
  if (!groqClient) {
    console.log("❌ GROQ_API_KEY not found, falling back to basic parsing");
    console.log(
      "Available env vars:",
      Object.keys(process.env).filter((k) => k.includes("GROQ")),
    );
    return parseFormBasic(prompt);
  }
  
  console.log("✅ Groq client initialized, attempting LLM parsing...");

  const systemPrompt = `You are an expert form designer with deep knowledge of Tally.so capabilities. Parse the user's request and create a comprehensive form structure.

Available field types (use ALL of these as appropriate):
- text: Single line text input
- email: Email address input with validation
- phone: Phone number input
- textarea: Multi-line text input
- dropdown: Dropdown selection (use instead of "select")
- multiple_choice: Single choice from options (use instead of "radio")
- checkboxes: Multiple choice from options (use instead of "checkbox")
- rating: Star rating (1-5 or 1-10)
- date: Date picker
- file_upload: File upload with size/type limits (use instead of "file")
- signature: Digital signature capture
- number: Numeric input
- url: URL input with validation

CONDITIONAL LOGIC SUPPORT:
- When the prompt mentions "if", "when", "show only if", or conditional behavior, create conditional fields
- Use "conditional" field type with "showIf" property to specify when fields should appear
- Example: "If rating ≤ 3, show textarea" → use conditional field with showIf condition

IMPORTANT: Use ALL field types as appropriate. Create multi-page forms with sections when the prompt suggests complexity. ALWAYS implement conditional logic when requested.

Return ONLY a valid JSON object with this structure:
{
  "title": "Form Title",
  "description": "Brief form description",
  "sections": [
    {
      "title": "Section Title",
      "description": "Section introduction text",
      "fields": [
        {
          "type": "field_type",
          "label": "Field Label",
          "required": true/false,
          "placeholder": "Optional placeholder",
          "description": "Optional field description",
          "options": ["Option 1", "Option 2"], // For dropdown/multiple_choice/checkboxes
          "maxRating": 5, // For rating fields
          "maxFileSize": 10, // For file_upload fields (MB)
          "allowedFileTypes": ["pdf", "doc", "docx"], // For file_upload fields
          "showIf": "field_name operator value" // For conditional fields (e.g., "satisfaction <= 3")
        }
      ]
    }
  ],
  "settings": {
    "confirmationMessage": "Thank you for your submission!",
    "redirectUrl": "https://example.com/thank-you",
    "hasProgressBar": true,
    "hasPartialSubmissions": true,
    "saveForLater": true
  }
}

Be intelligent about form structure and field types:

WITTY TITLE GENERATION:
- Create creative, engaging, and memorable form titles
- Use puns, alliteration, or clever wordplay when appropriate
- Match the tone to the form's purpose (professional, casual, fun, etc.)
- Examples:
  * Job Application → "Your Dream Job Awaits! Launch"
  * Customer Feedback → "Spill the Tea ☕️"
  * Event Registration → "Party Time! 🎉"
  * Survey → "Your Voice Matters 🎤"
  * Contact Form → "Let's Chat! 💬"
  * Feedback Form → "Tell Us What You Really Think 🤔"
  * Registration → "Join the Fun! 🎊"
  * Application → "Ready to Rock? 🎸"

COMPLEX FORMS & MULTI-PAGE:
- Create multiple sections for complex forms (e.g., "Personal Information", "Work Experience", "Additional Details")
- Add descriptive section introductions
- Use progress bars and partial submissions for long forms
- Group related fields logically

FIELD TYPE SELECTION:
- "rating" → rating field with appropriate scale
- "comments/feedback" → textarea
- "file upload/resume" → file field with appropriate limits
- "signature" → signature field
- "phone number" → phone field
- "website/URL" → url field
- "age/quantity" → number field
- "experience level" → select with options
- "multiple choice" → checkbox
- "single choice" → radio
- "date/birthday" → date field

JOB APPLICATION EXAMPLES:
- Personal Information section: name, email, phone, address
- Work Experience section: experience description, skills, resume upload
- Additional Information section: cover letter, availability, salary expectations

SURVEY EXAMPLES:
- Demographics section: age, location, occupation
- Experience section: rating questions, feedback textareas
- Additional section: open-ended questions, file uploads

EVENT REGISTRATION EXAMPLES:
- Attendee Information section: name, email, phone, dietary restrictions
- Event Preferences section: workshop selections, networking interests
- Payment section: payment method, special requests

CRITICAL: Create WITTY, CREATIVE, and ENGAGING titles that are fun and memorable! Examples:
- "Pizza Perfection Feedback Form" (not "Customer Feedback Form")
- "Event Registration Extravaganza" (not "Event Registration Form")
- "Job Application Adventure" (not "Job Application Form")
- "Survey of the Stars" (not "Customer Survey Form")
- "Feedback Fiesta" (not "Feedback Form")

Make titles playful, alliterative, and engaging while still being clear about the form's purpose!`;

  try {
    const completion: any = await groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      max_tokens: 1600,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    console.log("🔍 Raw LLM response:", response);
    
    if (!response) {
      throw new Error("No response from LLM");
    }

    let parsed: ParsedForm;
    try {
      console.log("🔍 Attempting to parse JSON directly from response");
      parsed = JSON.parse(response);
    } catch (directParseError) {
      console.warn("⚠️ Direct JSON parse failed, attempting to extract JSON block", directParseError);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      console.log("🔍 JSON match found:", !!jsonMatch);
      if (!jsonMatch) {
        console.log("❌ No JSON found in response:", response);
        throw new Error("No JSON found in LLM response");
      }
      parsed = JSON.parse(jsonMatch[0]);
    }
    console.log("✅ LLM parsed response:", JSON.stringify(parsed, null, 2));

    // Validate the response
    if (!parsed.title || !parsed.sections || !Array.isArray(parsed.sections)) {
      console.error("Invalid form structure from LLM:", parsed);
      throw new Error("Invalid form structure from LLM");
    }

    console.log("✅ LLM parsing successful, returning:", parsed);
    return parsed as ParsedForm;
  } catch (error) {
    console.error("❌ LLM parsing error:", error);
    console.log("🔄 Falling back to basic parsing for prompt:", prompt);
    // Fallback to basic parsing
    return parseFormBasic(prompt);
  }
}

function parseFormBasic(prompt: string): ParsedForm {
  console.log("Using basic parsing for prompt:", prompt);
  // Fallback basic parsing
  const title = extractBasicTitle(prompt);
  const fields: FormField[] = [];
  const lowerPrompt = prompt.toLowerCase();

  // Enhanced field detection based on prompt content
  if (
    lowerPrompt.includes("rating") ||
    lowerPrompt.includes("satisfied") ||
    lowerPrompt.includes("scale")
  ) {
    fields.push(
      { type: "text", label: "Full Name", required: true },
      { type: "email", label: "Email", required: true },
      { type: "text", label: "Country", required: true },
      {
        type: "rating",
        label: "How satisfied are you with our service?",
        required: true,
        maxRating: 5,
      },
      {
        type: "textarea",
        label: "Please tell us what went wrong",
        required: false,
        showIf: "how satisfied are you with our service? <= 3",
      },
      {
        type: "multiple_choice",
        label: "What did you like the most?",
        required: false,
        options: ["Speed", "Quality", "Support", "Price"],
        showIf: "how satisfied are you with our service? >= 4",
      },
      {
        type: "multiple_choice",
        label: "Would you recommend us to a friend?",
        required: true,
        options: ["Yes", "No"],
      },
      {
        type: "email",
        label: "Friend's email for referral",
        required: false,
        showIf: "would you recommend us to a friend? = Yes",
      },
    );
  } else {
    // Default basic fields
    fields.push(
      { type: "text", label: "Name", required: true },
      { type: "email", label: "Email", required: true },
      { type: "textarea", label: "Message", required: true },
    );
  }

  return {
    title,
    sections: [
      {
        title: "Information",
        description: "Please provide your details",
        fields,
      },
    ],
  };
}

function extractBasicTitle(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("customer feedback")) return "Customer Feedback";
  if (lowerPrompt.includes("contact")) return "Contact Form";
  if (lowerPrompt.includes("survey")) return "Survey";
  if (lowerPrompt.includes("registration")) return "Registration Form";
  if (lowerPrompt.includes("application")) return "Application Form";

  return "Custom Form";
}
