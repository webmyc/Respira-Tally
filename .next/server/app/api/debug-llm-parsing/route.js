"use strict";(()=>{var e={};e.id=810,e.ids=[810],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},7619:(e,t,o)=>{o.r(t),o.d(t,{originalPathname:()=>f,patchFetch:()=>g,requestAsyncStorage:()=>p,routeModule:()=>u,serverHooks:()=>m,staticGenerationAsyncStorage:()=>d});var i={};o.r(i),o.d(i,{POST:()=>c});var r=o(9303),n=o(8716),a=o(670),s=o(7070),l=o(6457);async function c(e){try{let{prompt:t}=await e.json();console.log("\uD83D\uDD0D Starting LLM parsing debug for prompt:",t);let o=await (0,l.J)(t);return s.NextResponse.json({success:!0,prompt:t,result:o,title:o.title})}catch(e){return console.error("❌ LLM parsing debug error:",e),s.NextResponse.json({success:!1,error:e instanceof Error?e.message:"Unknown error",stack:e instanceof Error?e.stack:void 0})}}let u=new r.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/debug-llm-parsing/route",pathname:"/api/debug-llm-parsing",filename:"route",bundlePath:"app/api/debug-llm-parsing/route"},resolvedPagePath:"/Users/akunay/VibeCoding/RESPIRA_TALLY/app/api/debug-llm-parsing/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:p,staticGenerationAsyncStorage:d,serverHooks:m}=u,f="/api/debug-llm-parsing/route";function g(){return(0,a.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:d})}},6457:(e,t,o)=>{o.d(t,{J:()=>r}),function(){var e=Error("Cannot find module 'groq-sdk'");throw e.code="MODULE_NOT_FOUND",e}();let i=null;async function r(e){console.log("\uD83D\uDD0D LLM Parsing - Checking Groq API key..."),console.log("GROQ_API_KEY exists:",!!process.env.GROQ_API_KEY),console.log("GROQ_API_KEY length:",process.env.GROQ_API_KEY?.length||0);let t=(!i&&process.env.GROQ_API_KEY&&(i=Object(function(){var e=Error("Cannot find module 'groq-sdk'");throw e.code="MODULE_NOT_FOUND",e}())({apiKey:process.env.GROQ_API_KEY})),i);if(!t)return console.log("❌ GROQ_API_KEY not found, falling back to basic parsing"),console.log("Available env vars:",Object.keys(process.env).filter(e=>e.includes("GROQ"))),n(e);console.log("✅ Groq client initialized, attempting LLM parsing...");let o=`You are an expert form designer with deep knowledge of Tally.so capabilities. Parse the user's request and create a comprehensive form structure.

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

Make titles playful, alliterative, and engaging while still being clear about the form's purpose!`;try{let i=await t.chat.completions.create({messages:[{role:"system",content:o},{role:"user",content:e}],model:"llama-3.1-8b-instant",temperature:.7,max_tokens:1e3}),r=i.choices[0]?.message?.content;if(console.log("\uD83D\uDD0D Raw LLM response:",r),!r)throw Error("No response from LLM");let n=r.match(/\{[\s\S]*\}/);if(console.log("\uD83D\uDD0D JSON match found:",!!n),!n)throw console.log("❌ No JSON found in response:",r),Error("No JSON found in LLM response");console.log("\uD83D\uDD0D Attempting to parse JSON:",n[0]);let a=JSON.parse(n[0]);if(console.log("✅ LLM parsed response:",JSON.stringify(a,null,2)),!a.title||!a.sections||!Array.isArray(a.sections))throw console.error("Invalid form structure from LLM:",a),Error("Invalid form structure from LLM");return console.log("✅ LLM parsing successful, returning:",a),a}catch(t){return console.error("❌ LLM parsing error:",t),console.log("\uD83D\uDD04 Falling back to basic parsing for prompt:",e),n(e)}}function n(e){console.log("Using basic parsing for prompt:",e);let t=function(e){let t=e.toLowerCase();return t.includes("customer feedback")?"Customer Feedback":t.includes("contact")?"Contact Form":t.includes("survey")?"Survey":t.includes("registration")?"Registration Form":t.includes("application")?"Application Form":"Custom Form"}(e),o=[],i=e.toLowerCase();return i.includes("rating")||i.includes("satisfied")||i.includes("scale")?o.push({type:"text",label:"Full Name",required:!0},{type:"email",label:"Email",required:!0},{type:"text",label:"Country",required:!0},{type:"rating",label:"How satisfied are you with our service?",required:!0,maxRating:5},{type:"textarea",label:"Please tell us what went wrong",required:!1,showIf:"how satisfied are you with our service? <= 3"},{type:"multiple_choice",label:"What did you like the most?",required:!1,options:["Speed","Quality","Support","Price"],showIf:"how satisfied are you with our service? >= 4"},{type:"multiple_choice",label:"Would you recommend us to a friend?",required:!0,options:["Yes","No"]},{type:"email",label:"Friend's email for referral",required:!1,showIf:"would you recommend us to a friend? = Yes"}):o.push({type:"text",label:"Name",required:!0},{type:"email",label:"Email",required:!0},{type:"textarea",label:"Message",required:!0}),{title:t,sections:[{title:"Information",description:"Please provide your details",fields:o}]}}}};var t=require("../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),i=t.X(0,[948,972],()=>o(7619));module.exports=i})();