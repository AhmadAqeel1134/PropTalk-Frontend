# PropTalk Frontend Test Suite

## Overview

This test suite contains comprehensive end-to-end test cases for the PropTalk frontend application. The tests are organized by functional modules and use sequential test case IDs (TC-061 to TC-090) for easy reference in documentation.

## Test Organization

### Test Modules

1. **Authentication Module (TC-061 to TC-070)**
   - Login form rendering and validation
   - Admin and agent authentication flows
   - Form validation and error handling
   - Session persistence

2. **Property Management Module (TC-071 to TC-080)**
   - Property list rendering
   - Property creation and editing
   - Property filtering and search
   - Property details view

3. **Call Management Module (TC-081 to TC-090)**
   - Call history display
   - Call initiation (single and batch)
   - Call status and duration formatting
   - Call recordings and transcripts
   - Call statistics

## Installation

Install test dependencies:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

Or if using the updated package.json:

```bash
npm install
```

## Running Tests

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

Run a specific test file:

```bash
npm test -- tests/test-authentication.test.tsx
```

Run tests with coverage:

```bash
npm test -- --coverage
```

Run tests with verbose output:

```bash
npm test -- --verbose
```

## Test Case Format

Each test case follows this structure:

- **Test ID**: Sequential ID (TC-061, TC-062, etc.)
- **Description**: Clear description of what is being tested
- **Expected Result**: What the test expects to verify

## Configuration

The test suite uses:
- **Jest** as the test runner
- **React Testing Library** for component testing
- **Next.js Jest configuration** for Next.js specific features
- **TypeScript** support for type-safe tests

## Notes for FYP Documentation

- All test cases use descriptive names suitable for documentation
- Test IDs are sequential and can be easily referenced
- Test output is formatted for screenshot capture
- Each test module covers a complete functional area
- Tests are written to be screenshot-friendly for report inclusion
