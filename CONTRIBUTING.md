# Contributing to Respira Tally

Thank you for your interest in contributing to Respira Tally! We welcome contributions from the community and appreciate your help in making this project better.

## 🚀 Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn package manager
- Git
- A Tally.so account with API access

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/your-username/Respira-Tally.git
   cd Respira-Tally
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   # Set your Tally API key
   export TALLY_API_KEY=your_api_key_here
   
   # Or create a .env file
   echo "TALLY_API_KEY=your_api_key_here" > .env
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Run in development mode**
   ```bash
   # Start web interface
   npm run web
   
   # Or run CLI
   npm run cli interactive
   ```

## 🏗️ Project Structure

```
Respira-Tally/
├── src/
│   ├── index.ts              # Main application class
│   ├── tally-client.ts       # Tally.so API client
│   ├── form-prompt-parser.ts # Natural language form parser
│   ├── web-server.ts         # Express web server
│   ├── cli.ts               # Command-line interface
│   ├── types/
│   │   └── tally.ts         # TypeScript type definitions
│   └── utils/
│       └── config.ts        # Configuration management
├── public/
│   └── index.html           # Web interface
├── test/
│   └── test-runner.js       # Test suite
└── dist/                    # Compiled TypeScript
```

## 🎯 Contribution Areas

### High Priority
- **AI Prompt Parsing**: Improve natural language form creation
- **Web UI Enhancements**: Better user experience and design
- **API Error Handling**: More robust error handling and user feedback
- **Testing**: Add comprehensive test coverage
- **Documentation**: Improve API documentation and examples

### Medium Priority
- **Performance**: Optimize form creation speed
- **Security**: Enhance API key handling and validation
- **Accessibility**: Improve web interface accessibility
- **Internationalization**: Support for multiple languages

### Low Priority
- **CLI Enhancements**: Additional command-line features
- **Integration**: Connect with more form platforms
- **Analytics**: Usage tracking and insights

## 🛠️ Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run build
   npm test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Follow existing naming conventions
- Add proper type annotations
- Use interfaces for complex objects

### Code Formatting
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Follow ESLint configuration

### File Organization
- Keep related functionality together
- Use descriptive file and function names
- Add JSDoc comments for public APIs

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Write tests for new features
- Test both success and error cases
- Use descriptive test names
- Mock external dependencies

## 📚 Documentation

### Updating Documentation
- Update README.md for user-facing changes
- Update API documentation for new endpoints
- Add examples for new features
- Keep changelog up to date

### Code Comments
- Add JSDoc comments for public methods
- Explain complex logic
- Include examples in comments when helpful

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment details**
   - Node.js version
   - Operating system
   - Package versions

2. **Steps to reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior
   - Screenshots if applicable

3. **Error messages**
   - Full error output
   - Stack traces
   - Console logs

## ✨ Feature Requests

When suggesting features:

1. **Check existing issues** - Avoid duplicates
2. **Describe the use case** - Why is this needed?
3. **Provide examples** - How would it work?
4. **Consider implementation** - Any technical considerations?

## 🔄 Pull Request Process

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] No console.log statements left in code
- [ ] Branch is up to date with main

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## 🏷️ Release Process

### Version Bumping
- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features, non-breaking
- **Major** (2.0.0): Breaking changes

### Release Steps
1. Update version in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Publish to npm (if applicable)

## 🤝 Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Focus on what's best for the community

### Be Constructive
- Provide helpful feedback
- Suggest improvements
- Help others learn and grow

### Be Patient
- Maintainers are volunteers
- Response times may vary
- Be understanding of constraints

## 📞 Getting Help

### Questions?
- 💬 **Discussions**: [GitHub Discussions](https://github.com/webmyc/Respira-Tally/discussions)
- 📧 **Email**: [mihai@respira.cafe](mailto:mihai@respira.cafe)
- 🐛 **Issues**: [GitHub Issues](https://github.com/webmyc/Respira-Tally/issues)

### Resources
- [Tally.so API Documentation](https://developers.tally.so/api-reference)
- [Node.js Documentation](https://nodejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## 🙏 Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Given credit in the project

Thank you for contributing to Respira Tally! 🎉
