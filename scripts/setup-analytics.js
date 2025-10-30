#!/usr/bin/env node

/**
 * Analytics Setup Script
 * This script helps you set up Google Analytics integration
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Google Analytics Integration...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env.local file...');
  const envTemplate = `# Google Analytics 4 Configuration
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
GA4_PROPERTY_ID=123456789

# Google Analytics Service Account
# Option 1: Path to JSON file (for local development)
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Option 2: JSON content directly (recommended for production)
# GA4_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project",...}

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/sabri-admin

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
`;
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local file');
} else {
  console.log('✅ .env.local file already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Set up a Google Analytics 4 property');
console.log('2. Create a Google Cloud project and enable Analytics API');
console.log('3. Create a service account and download the JSON key');
console.log('4. Update your .env.local file with the correct values');
console.log('5. Grant your service account access to your GA4 property');
console.log('\n📖 For detailed instructions, see: GOOGLE_ANALYTICS_API_SETUP.md');

console.log('\n🚀 Your analytics dashboard is ready!');
console.log('   - Real data will be fetched when GA4 is configured');
console.log('   - Mock data will be used as fallback');
console.log('   - All API endpoints are ready: /api/analytics/*');
