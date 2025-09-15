#!/usr/bin/env node

/**
 * Test Runner for Respira Tally
 * 
 * This script runs basic tests to ensure the application is working correctly.
 * It performs smoke tests without requiring actual API calls.
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Respira Tally Test Runner');
console.log('============================\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, testFn) {
  try {
    console.log(`Testing: ${name}`);
    testFn();
    console.log(`✅ PASS: ${name}\n`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}\n`);
    testsFailed++;
  }
}

// Test 1: Check if dist directory exists and has required files
test('Build output exists', () => {
  const distPath = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('dist directory does not exist. Run "npm run build" first.');
  }
  
  const requiredFiles = [
    'index.js',
    'cli.js',
    'web-server.js',
    'tally-client.js',
    'form-prompt-parser.js'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required file ${file} is missing from dist directory`);
    }
  }
});

// Test 2: Check if package.json is valid
test('Package.json is valid', () => {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageContent = fs.readFileSync(packagePath, 'utf8');
  const packageJson = JSON.parse(packageContent);
  
  if (!packageJson.name) {
    throw new Error('Package name is missing');
  }
  
  if (!packageJson.version) {
    throw new Error('Package version is missing');
  }
  
  if (!packageJson.main) {
    throw new Error('Package main entry point is missing');
  }
  
  if (!packageJson.bin) {
    throw new Error('Package bin entry is missing');
  }
});

// Test 3: Check if TypeScript compilation was successful
test('TypeScript compilation successful', () => {
  const distPath = path.join(__dirname, '..', 'dist');
  const sourceMapFiles = fs.readdirSync(distPath).filter(file => file.endsWith('.js.map'));
  
  if (sourceMapFiles.length === 0) {
    throw new Error('No source map files found. TypeScript compilation may have failed.');
  }
});

// Test 4: Check if web interface HTML exists
test('Web interface exists', () => {
  const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
  if (!fs.existsSync(htmlPath)) {
    throw new Error('Web interface HTML file is missing');
  }
  
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  if (!htmlContent.includes('Respira Tally')) {
    throw new Error('Web interface HTML does not contain expected content');
  }
});

// Test 5: Check if example script exists
test('Example script exists', () => {
  const examplePath = path.join(__dirname, '..', 'example.js');
  if (!fs.existsSync(examplePath)) {
    throw new Error('Example script is missing');
  }
});

// Test 6: Check if README exists and is comprehensive
test('README is comprehensive', () => {
  const readmePath = path.join(__dirname, '..', 'README.md');
  if (!fs.existsSync(readmePath)) {
    throw new Error('README.md is missing');
  }
  
  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  const requiredSections = [
    '# Respira Tally',
    '## ✨ Features',
    '## 🚀 Quick Start',
    '## 🧪 Testing',
    '## 📋 CLI Commands',
    '## 📄 License'
  ];
  
  for (const section of requiredSections) {
    if (!readmeContent.includes(section)) {
      throw new Error(`README is missing required section: ${section}`);
    }
  }
});

// Test 7: Check if all dependencies are installed
test('Dependencies are installed', () => {
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    throw new Error('node_modules directory does not exist. Run "npm install" first.');
  }
  
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageContent = fs.readFileSync(packagePath, 'utf8');
  const packageJson = JSON.parse(packageContent);
  
  const requiredDeps = [
    'axios',
    'commander',
    'express',
    'inquirer',
    'chalk'
  ];
  
  for (const dep of requiredDeps) {
    const depPath = path.join(nodeModulesPath, dep);
    if (!fs.existsSync(depPath)) {
      throw new Error(`Required dependency ${dep} is not installed`);
    }
  }
});

// Test 8: Check if CLI is executable
test('CLI is executable', () => {
  const cliPath = path.join(__dirname, '..', 'dist', 'cli.js');
  if (!fs.existsSync(cliPath)) {
    throw new Error('CLI file does not exist');
  }
  
  const cliContent = fs.readFileSync(cliPath, 'utf8');
  if (!cliContent.includes('#!/usr/bin/env node')) {
    throw new Error('CLI file does not have proper shebang');
  }
});

// Summary
console.log('📊 Test Summary');
console.log('================');
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📈 Total Tests: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n🎉 All tests passed! The application is ready for release.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please fix the issues before releasing.');
  process.exit(1);
}
