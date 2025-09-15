# Respira Tally - AI Form Creator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue)](https://www.typescriptlang.org/)

> **Create Tally.so forms using natural language descriptions!** 🎯

Respira Tally is a powerful Node.js application that allows you to create Tally.so forms programmatically by simply describing what you want in plain English. Perfect for therapists, coaches, event organizers, and anyone who needs to create forms quickly and efficiently.

## ✨ Features

- 🎯 **Natural Language Form Creation** - Describe your form in plain English
- 🌐 **Beautiful Web Interface** - User-friendly UI for form creation
- 📝 **Complete Tally.so Integration** - Full CRUD operations for forms
- 🖥️ **Command-Line Interface** - Easy-to-use CLI with multiple commands
- 🤖 **Interactive Mode** - Real-time form creation through conversation
- 🔐 **Secure API Management** - Safe API key handling and configuration
- 📚 **Comprehensive Documentation** - Examples, guides, and API reference
- 🚀 **Ready to Deploy** - Works out of the box with minimal setup

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

### Web Interface
1. Start the web server: `npm run web`
2. Open http://localhost:3000
3. Add your Tally API key
4. Describe your form: *"Create a contact form with name, email, phone, and message fields"*
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

- 📧 **Email**: [hello@respira.com](mailto:hello@respira.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/webmyc/Respira-Tally/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/webmyc/Respira-Tally/discussions)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Made with ❤️ by the Respira Community**
