#!/usr/bin/env node

/**
 * Quick Start Script for PostgreSQL Migration
 *
 * This script helps you get started with the migration process
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${description}...`, 'blue');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    return false;
  }
}

async function main() {
  log('\n🚀 PostgreSQL Migration Quick Start\n', 'bright');

  // Check if .env exists
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found!', 'red');
    log('Please create a .env file with DATABASE_URL', 'yellow');
    process.exit(1);
  }

  // Check if DATABASE_URL is set
  const envContent = fs.readFileSync(envPath, 'utf-8');
  if (!envContent.includes('DATABASE_URL')) {
    log('❌ DATABASE_URL not found in .env!', 'red');
    log('Please add your Neon PostgreSQL connection string:', 'yellow');
    log('DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"', 'blue');
    process.exit(1);
  }

  log('Step 1: Installing Prisma dependencies', 'bright');
  if (!runCommand('npm install prisma @prisma/client pg', 'Installing packages')) {
    process.exit(1);
  }

  log('\nStep 2: Generating Prisma Client', 'bright');
  if (!runCommand('npx prisma generate', 'Generating Prisma Client')) {
    process.exit(1);
  }

  log('\nStep 3: Creating database tables', 'bright');
  log('Choose migration method:', 'yellow');
  log('  1. db push (quick, for development)', 'blue');
  log('  2. migrate dev (recommended, creates migration files)', 'blue');

  // For now, use db push for simplicity
  if (!runCommand('npx prisma db push', 'Creating database schema')) {
    process.exit(1);
  }

  log('\n✅ Setup completed successfully!', 'green');
  log('\nNext steps:', 'bright');
  log('  1. Review the migration guide: MONGODB-TO-POSTGRESQL-MIGRATION-GUIDE.md', 'blue');
  log('  2. Run the data migration script: node scripts/migrate-data.js', 'blue');
  log('  3. Update your controllers to use Prisma', 'blue');
  log('  4. Test your application', 'blue');
  log('\nTo view your database:', 'bright');
  log('  npx prisma studio', 'blue');
}

main().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
