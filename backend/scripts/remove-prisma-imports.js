/**
 * Quick Fix: Remove Prisma imports from all controllers
 * This prevents the "Cannot find module" error
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllersDir = path.join(__dirname, '..', 'src', 'controllers');

function removePrismaImport(filePath) {
  const fileName = path.basename(filePath);
  console.log(`Processing: ${fileName}`);

  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Remove prisma import
  content = content.replace(/import prisma from ["']\.\.\/config\/database\.js["'];?\s*\n?/g, '');

  // Comment out all prisma. calls to prevent crashes
  content = content.replace(/(\s+)(await\s+)?prisma\./g, '$1// FIXME: Convert to Mongoose - prisma.');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed ${fileName}`);
  } else {
    console.log(`  ⏭️  No changes needed`);
  }
}

console.log('🔧 Removing Prisma imports to prevent crashes...\n');

const files = fs.readdirSync(controllersDir);
const jsFiles = files.filter(f => f.endsWith('.js') && !f.includes('.example'));

jsFiles.forEach(file => {
  const filePath = path.join(controllersDir, file);
  try {
    removePrismaImport(filePath);
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
  }
});

console.log('\n✨ Done! Server should now start without Prisma errors.');
console.log('⚠️  Note: Controllers with "FIXME" comments need manual conversion to Mongoose\n');
