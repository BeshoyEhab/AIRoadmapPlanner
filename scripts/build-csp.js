#!/usr/bin/env node

/**
 * Build script to generate CSP header with nonces and update netlify.toml
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { generateNonces, generateCSPHeader } from '../src/utils/cspUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Update netlify.toml with CSP header containing nonces
 */
function updateNetlifyConfig() {
  const netlifyConfigPath = path.join(projectRoot, 'netlify.toml');
  const noncesPath = path.join(projectRoot, 'dist', 'csp-nonces.json');
  
  let scriptNonce, styleNonce;
  
  // Try to read nonces from the generated file first
  if (fs.existsSync(noncesPath)) {
    try {
      const noncesData = JSON.parse(fs.readFileSync(noncesPath, 'utf8'));
      scriptNonce = noncesData.scriptNonce;
      styleNonce = noncesData.styleNonce;
      console.log('📖 Using nonces from build output');
    } catch (_error) {
      console.warn('⚠️ Could not read nonces from build output, generating new ones');
      const nonces = generateNonces();
      scriptNonce = nonces.scriptNonce;
      styleNonce = nonces.styleNonce;
    }
  } else {
    // Generate new nonces if file doesn't exist
    console.log('🔄 Generating new nonces');
    const nonces = generateNonces();
    scriptNonce = nonces.scriptNonce;
    styleNonce = nonces.styleNonce;
  }
  
  // Generate CSP header with nonces
  const cspHeader = generateCSPHeader({
    scriptNonce,
    styleNonce,
    additionalScripts: ['https://apis.google.com'],
    additionalStyles: []
  });
  
  // Read current netlify.toml
  let configContent = fs.readFileSync(netlifyConfigPath, 'utf8');
  
  // Replace the CSP header line with actual nonces
  const cspRegex = /Content-Security-Policy = ".*?"/;
  const newCspLine = `Content-Security-Policy = "${cspHeader}"`;
  
  if (cspRegex.test(configContent)) {
    configContent = configContent.replace(cspRegex, newCspLine);
  } else {
    // If CSP header doesn't exist, add it to the security headers section
    const securityHeadersRegex = /(\[headers\.values\])/;
    const replacement = `$1\n    Content-Security-Policy = "${cspHeader}"`;
    configContent = configContent.replace(securityHeadersRegex, replacement);
  }
  
  // Write updated config
  fs.writeFileSync(netlifyConfigPath, configContent);
  
  console.log('✅ Updated netlify.toml with CSP nonces');
  console.log(`📝 Script nonce: ${scriptNonce}`);
  console.log(`📝 Style nonce: ${styleNonce}`);
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('🔒 Generating CSP nonces and updating netlify.toml...');
    updateNetlifyConfig();
    console.log('✅ CSP configuration updated successfully!');
  } catch (error) {
    console.error('❌ Error updating CSP configuration:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { updateNetlifyConfig };
