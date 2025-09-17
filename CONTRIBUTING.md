# Contributing to Fouhou Backend

Thank you for your interest in contributing to the Fouhou Backend API! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 14+
- npm 6+
- OrientDB server
- Git

### Development Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/Fouhou-backend.git
   cd Fouhou-backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy environment template:
   ```bash
   cp .env.example .env
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style
- Use 2 spaces for indentation
- Follow existing code patterns
- Add comments for complex logic
- Use meaningful variable names

### API Design
- Follow RESTful conventions
- Use consistent response formats
- Include proper error handling
- Validate all inputs

### Database
- Use parameterized queries
- Handle connection errors gracefully
- Optimize for performance
- Consider batch operations

## 🔄 Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following guidelines
   - Test your changes thoroughly
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   # Start server
   npm run dev
   
   # Test endpoints
   curl http://localhost:9000/api/health
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🧪 Testing

### Manual Testing
- Test all modified endpoints
- Verify error handling
- Check edge cases
- Test with invalid inputs

### Automated Testing
Currently, the project uses manual testing. We welcome contributions to add:
- Unit tests (Jest)
- Integration tests
- API endpoint tests
- Load testing

## 📝 Commit Messages

Use conventional commit format:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add user ranking endpoint
fix: resolve batch processing memory leak
docs: update API documentation
refactor: optimize database queries
```

## 🐛 Bug Reports

When reporting bugs, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Error logs/messages

Use the bug report template:
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Environment**
- OS: [e.g. Ubuntu 20.04]
- Node.js version: [e.g. 16.14.0]
- npm version: [e.g. 8.3.1]
- OrientDB version: [e.g. 3.2.15]
```

## 💡 Feature Requests

For feature requests:
- Describe the problem you're solving
- Explain your proposed solution
- Consider alternative solutions
- Discuss potential impacts

## 📚 Documentation

### API Documentation
- Update README.md for new endpoints
- Add examples for new features
- Update API.md reference
- Include request/response samples

### Code Documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Explain business logic
- Update deployment guides

## 🔍 Review Process

Pull requests will be reviewed for:
- Code quality and style
- Performance implications
- Security considerations
- Documentation completeness
- Test coverage

### Review Checklist
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Error handling is proper

## 🚀 Release Process

1. Version bump in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to production
5. Update documentation

## 📞 Getting Help

- Create an issue for questions
- Join discussions in issues
- Review existing documentation
- Check troubleshooting guides

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Git commit history

Thank you for contributing to Fouhou Backend! 🎮