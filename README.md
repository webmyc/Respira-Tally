# Respira Tally - AI Form Creator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made for Developers](https://img.shields.io/badge/made_for-developers-1f6feb.svg)](https://respiraformspro.com)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue)](https://www.typescriptlang.org/)

<div align="center">
  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop&crop=center" alt="Respira Tally - AI Form Creator" width="100%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
  <p><em>Transform natural language into beautiful Tally.so forms with AI-powered automation</em></p>
</div>

Respira Forms Pro is a free, open-source CLI and Node.js library that lets you generate Tally.so forms from either natural language or structured JSON prompts. Built on the Tally MCP and HTTP API, it slots directly into developer workflows. Bring your own Groq key if you want witty titles, multi-section layouts, and conditional logic; without it the toolkit falls back to the deterministic keyword parser.

Automate the forms you build most often—event registrations, surveys, onboarding flows, and client intake forms—without leaving your terminal.

**🌐 [Try the Web Interface](https://respiraformspro.com) - No installation required!**

**🎁 Get 50% off Tally with our referral link:** [https://go.respira.cafe/tally](https://go.respira.cafe/tally)

## 🌐 Web Interface (Recommended)

**🚀 [Try it now at respiraformspro.com](https://respiraformspro.com)**

The easiest way to get started! No installation required - just visit the website, add your Tally API key, and start creating forms instantly.

### Features:
- ✅ **No Installation Required** - Works directly in your browser
- ✅ **Beautiful UI** - Modern, responsive design
- ✅ **Instant Setup** - Just add your Tally API key
- ✅ **Real-time Form Creation** - Paste prompts and get forms instantly
- ✅ **Form Management** - View, edit, and manage all your forms
- ✅ **Mobile Friendly** - Works perfectly on all devices

## ✨ Features

- 🎯 **AI-Powered Form Creation** - Paste complex prompts from ChatGPT, Claude, or any AI and watch forms come to life
- 🌐 **Beautiful Web Interface** - User-friendly UI for form creation
- 📝 **Complete Tally.so Integration** - Full CRUD operations for forms
- 🖥️ **Command-Line Interface** - Easy-to-use CLI with multiple commands
- 🤖 **Interactive Mode** - Real-time form creation through conversation
- 🔐 **Secure API Management** - Safe API key handling and configuration
- 📚 **Comprehensive Documentation** - Examples, guides, and API reference
- 🚀 **Ready to Deploy** - Works out of the box with minimal setup
- 🆓 **Free Tally Account** - Everything you need included in Tally's free tier

## 🧪 Testing

### Prerequisites for Testing

- Node.js 16.0.0 or higher
- A Tally.so account with API access
- Tally.so API key (`TALLY_API_KEY`)
- (Optional) Groq API key (`GROQ_API_KEY`) if you want to exercise the LLM-powered planner during tests

### Test the Application

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Test the CLI:**
 ```bash
  # Set your API key
  export TALLY_API_KEY=your_tally_api_key_here
  export GROQ_API_KEY=your_groq_api_key_here # optional but enables Groq planner
  
  # Test interactive mode
  npm run cli interactive
   
   # Test form creation
   npm run cli create
   
   # Test listing forms
   npm run cli list
   ```

3. **Test the Web Interface:**
   ```bash
   # Start the web server
   npm run web
   
   # Open http://localhost:3000 in your browser
   # Add your API key and test form creation
   ```

4. **Test the Example Script:**
   ```bash
   # Set your API key
   export TALLY_API_KEY=your_tally_api_key_here
   
   # Run the example
   node example.js
   ```

### Manual Testing Checklist

- [ ] API key validation works
- [ ] Form creation from natural language works
- [ ] Contact form creation works
- [ ] Form listing works
- [ ] Form deletion works
- [ ] Web interface loads correctly
- [ ] All CLI commands work
- [ ] Error handling works properly

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- A Tally.so account with API access (**required**)
- `TALLY_API_KEY` environment variable set (or run `npx respira-tally config`)
- `GROQ_API_KEY` environment variable (**optional but recommended**) to enable Groq-powered planning; without it the CLI falls back to the keyword parser

### 🎁 Get Started with Tally (50% Off!)

1. **Sign up for Tally** using our referral link: [https://go.respira.cafe/tally](https://go.respira.cafe/tally)
   - Get **50% off** for 3 months on any plan
   - Free account includes unlimited forms and API access
   - No credit card required to start

2. **Generate your API key:**
   - Go to [Tally Settings > API](https://tally.so/settings/api)
   - Create a new API key and keep it handy

### One-liners

**Natural language (default)**

```bash
npx respira-tally "feedback form with name, email, 1-5 rating"
```

**Structured JSON (advanced)**

```bash
npx respira-tally job-app.json
```

Create `job-app.json` using the [Structured JSON Prompts](#structured-json-prompts) format shown below.

### Install locally (optional)

```bash
git clone https://github.com/webmyc/Respira-Tally.git
cd Respira-Tally
npm install
npm run build
```

### Web interface (optional)

```bash
npm run web
open http://localhost:3000
```

## Structured JSON Prompts

Respira Forms Pro understands structured payloads whenever you need pixel-perfect control. Save a definition like the following to `job-app.json`:

```json
{
  "title": "Job Application Form",
  "blocks": [
    { "type": "INPUT_TEXT", "label": "Full Name", "required": true },
    { "type": "INPUT_EMAIL", "label": "Email", "required": true },
    { "type": "INPUT_FILE_UPLOAD", "label": "Resume", "maxFileSize": 10 },
    { "type": "RATING", "label": "Culture Fit", "scale": 5 }
  ]
}
```

Run it through the CLI:

```bash
npx respira-tally job-app.json
```

Supported block types include text, email, number, date, rating scales, file uploads, signatures, headings, dividers, selects/radios/checkboxes, content blocks, and more. Field names are case-insensitive and additional metadata (like `options`, `placeholder`, `payload`, or validation settings) is merged into the generated Tally blocks, so you always have an escape hatch for new MCP capabilities.

> 💡 **Tip:** Natural-language prompts produce the richest results when `GROQ_API_KEY` is set. If you omit it, the CLI falls back to the legacy keyword parser, which still works but won’t generate witty titles, multi-section layouts, or conditional logic automatically.

## 🎯 Examples

### AI-Generated Prompt Examples

**From ChatGPT/Claude:** *"Create a comprehensive customer feedback form for a SaaS company that includes: customer satisfaction rating (1-10), feature request section, bug report with severity levels, contact information, company size, and optional file uploads for screenshots"*

**From AI Assistant:** *"Build a therapy intake form with: personal information, medical history, current symptoms checklist, treatment goals, emergency contact, insurance information, and consent forms"*

**From AI:** *"Design an event registration form for a tech conference with: attendee details, dietary restrictions, workshop preferences, networking interests, and payment processing"*

### Web Interface
1. Start the web server: `npm run web`
2. Open http://localhost:3000
3. Add your Tally API key
4. Paste any AI-generated prompt above
5. Click "Create Form" and get your form URL!

### Interactive Mode
```bash
npm run cli interactive
```

Then simply describe your form:
- *"Create a contact form with name, email, phone, and message fields"*
- *"Make a customer satisfaction survey with rating, comments, and email for follow-up"*
- *"Build an event registration form with dietary restrictions and emergency contact"*

### Programmatic Usage

```typescript
import { RespiraTally } from './src/index';

const app = new RespiraTally('your_api_key');

// Create form from natural language
const form = await app.createFormFromPrompt(
  'Create a contact form with name, email, phone, and message fields'
);

// Create simple contact form
const contactForm = await app.createContactForm({
  includePhone: true,
  includeCompany: true
});
```

## 📋 CLI Commands

| Command | Description |
|---------|-------------|
| `web` | Start the web interface (recommended) |
| `interactive` | Start interactive mode for real-time form creation |
| `create` | Create a form from natural language description |
| `contact` | Create a simple contact form with options |
| `list` | List all your forms |
| `get <form_id>` | Get details of a specific form |
| `delete <form_id>` | Delete a form |
| `config` | Configure your API key |

## 🏗️ Project Structure

```
src/
├── index.ts              # Main application class
├── tally-client.ts       # Tally.so API client
├── form-prompt-parser.ts # Natural language form parser
├── web-server.ts         # Express web server
├── cli.ts               # Command-line interface
├── types/
│   └── tally.ts         # TypeScript type definitions
└── utils/
    └── config.ts        # Configuration management
public/
└── index.html           # Web interface
```

## 🔧 Configuration

### Environment Variables

```bash
export TALLY_API_KEY=your_tally_api_key_here
```

### Web Interface Configuration

1. Start the web server: `npm run web`
2. Open http://localhost:3000
3. Enter your Tally API key in the configuration section
4. The key will be validated and saved securely

## 📚 Supported Field Types

The parser automatically detects and creates these block types:

- **Text inputs** (`text`, `email`, `phone`, `number`, `url`, `date`)
- **Long form content** (`textarea`, `text_block`)
- **Choices** (`select`, `radio`, `checkbox`) with custom option metadata
- **Ratings** (1–10 or custom scales, shapes)
- **File uploads** (single or multiple, size/type limits)
- **Signature** capture
- **Headings** (`heading1`, `heading2`, `heading3`) and dividers
- **Form title** overrides and confirmation/redirect settings

## 🌐 Web Interface Features

- **Beautiful UI** - Modern, responsive design
- **API Key Management** - Secure key validation and storage
- **Form Creation** - Natural language form creation
- **Form Management** - View, edit, and delete forms
- **Real-time Updates** - Instant feedback and validation
- **Mobile Friendly** - Works on all devices

## ❓ FAQ

**Why not just use Tally’s AI builder?**  
Tally’s AI beta works inside their UI. Respira Forms Pro is automation-ready: it’s a CLI, API, and open-source toolkit with full JSON control, perfect for scripts, CI pipelines, or teams that need reproducible form definitions.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/Respira-Tally.git
cd Respira-Tally

# Install dependencies
npm install

# Run in development mode
npm run dev

# Start web interface
npm run dev:web
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tally.so](https://tally.so) for providing an excellent form platform
- The open-source community for inspiration and tools
- All contributors who help make this project better

## 📞 Support

- 📧 **Email**: [mihai@respira.cafe](mailto:mihai@respira.cafe)
- 🐛 **Issues**: [GitHub Issues](https://github.com/webmyc/Respira-Tally/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/webmyc/Respira-Tally/discussions)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

### ☕ Support Development

Love this app and want to support the development of Respira Tally and other Respira apps? 

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/respira.buzz)

**☕ [Buy Me a Coffee](https://buymeacoffee.com/respira.buzz)** - Help fund development of this and other Respira applications!

---

**Made with ❤️ by the Respira Community**
