# Respira Tally - AI Form Creator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue)](https://www.typescriptlang.org/)

> **Transform complex prompts into live Tally forms instantly!** 🎯

**🌐 [Try the Web Interface](https://respiraformspro.com) - No installation required!**

**Respira Tally** is a powerful Node.js application that brings forms into existence by converting natural language descriptions into fully functional Tally.so forms. Simply paste complex prompts (generated with other AIs if needed) and watch as your forms are automatically created in your Tally account. The free Tally account provides everything you need - API access, unlimited forms, and all the features required for this to work seamlessly.

**🎁 Get 50% off Tally with our referral link:** [https://go.respira.cafe/tally](https://go.respira.cafe/tally)

Perfect for therapists, coaches, event organizers, and anyone who needs to create forms quickly and efficiently without the hassle of manual form building.

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
- Tally.so API key

### Test the Application

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Test the CLI:**
   ```bash
   # Set your API key
   export TALLY_API_KEY=your_tally_api_key_here
   
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
- A Tally.so account with API access
- Tally.so API key

### 🎁 Get Started with Tally (50% Off!)

1. **Sign up for Tally** using our referral link: [https://go.respira.cafe/tally](https://go.respira.cafe/tally)
   - Get **50% off** for 3 months on any plan
   - Free account includes unlimited forms and API access
   - No credit card required to start

2. **Get your API key:**
   - Go to [Tally Settings > API](https://tally.so/settings/api)
   - Generate your API key
   - Copy it for use with Respira Tally

3. **Start creating forms instantly!**

### Installation

```bash
# Clone the repository
git clone https://github.com/webmyc/Respira-Tally.git
cd Respira-Tally

# Install dependencies
npm install

# Build the project
npm run build
```

### Web Interface (Recommended)

```bash
# Start the web interface
npm run web

# Open your browser to http://localhost:3000
# Add your Tally API key and start creating forms!
```

### CLI Usage

```bash
# Set up your API key
export TALLY_API_KEY=your_tally_api_key_here

# Interactive mode - describe forms in plain English
npm run cli interactive

# Create a form from a prompt
npm run cli create

# List all your forms
npm run cli list
```

## 🎯 Examples

### AI-Generated Prompt Examples

**From ChatGPT/Claude:** *"Create a comprehensive customer feedback form for a SaaS company that includes: customer satisfaction rating (1-10), feature request section, bug report with severity levels, contact information, company size, and optional file uploads for screenshots"*

**From AI Assistant:** *"Build a therapy intake form with: personal information, medical history, current symptoms checklist, treatment goals, emergency contact, insurance information, and consent forms"*

**From AI:** *"Design an event registration form for a tech conference with: attendee details, dietary restrictions, workshop preferences, networking interests, and payment processing"*

### Structured JSON Prompts (Advanced)

Want precise control over field order, labels, and placeholders? Respira Tally now understands structured JSON definitions. Paste a JSON object (plain or wrapped in a ```json code block) describing your form:

```json
{
  "title": "Customer Feedback",
  "confirmationMessage": "Thanks for helping us improve!",
  "fields": [
    { "type": "text", "label": "Full Name", "required": true },
    { "type": "email", "label": "Work Email", "required": true, "placeholder": "you@example.com" },
    { "type": "phone", "label": "Phone Number" },
    { "type": "heading2", "text": "Rate your experience" },
    { "type": "rating", "label": "Satisfaction", "max": 5 },
    {
      "type": "select",
      "label": "Product Area",
      "options": [
        "Onboarding",
        { "label": "Billing", "value": "billing", "default": true },
        { "label": "Integrations", "payload": { "tag": "beta" } }
      ]
    },
    { "type": "textarea", "label": "Feedback", "required": true }
  ]
}
```

Supported field types for structured prompts now cover every block the Tally MCP exposes: `text`, `email`, `phone`, `textarea`, `date`, `url`, `number`, `radio`, `select`, `checkbox`, `rating`, `file`, `signature`, `heading1`, `heading2`, `heading3`, `text_block`, `divider`, and even `title`. Each field accepts `label`, `required`, and `placeholder` (where relevant). Choice-based fields require an `options` array (strings or `{ "label": "...", "value": "...", "default": true }`).

Need something more specialized (custom layouts, validation rules, max file size, etc.)? Add a `payload` object to any field and its properties will be merged into the generated Tally block, so you can forward advanced MCP parameters without waiting for a code change.

Optional `confirmationMessage` and `redirectUrl` entries still override their defaults when the form is created.

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

The parser automatically detects and creates these field types:

- **text** - Names, companies, general text
- **email** - Email addresses
- **phone** - Phone numbers
- **textarea** - Messages, comments, descriptions
- **number** - Age, quantities, amounts
- **date** - Dates, birthdays, appointments
- **url** - Websites, links
- **rating** - Satisfaction scores, ratings
- **file** - File uploads, documents
- **captcha** - Security verification

## 🌐 Web Interface Features

- **Beautiful UI** - Modern, responsive design
- **API Key Management** - Secure key validation and storage
- **Form Creation** - Natural language form creation
- **Form Management** - View, edit, and delete forms
- **Real-time Updates** - Instant feedback and validation
- **Mobile Friendly** - Works on all devices

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
