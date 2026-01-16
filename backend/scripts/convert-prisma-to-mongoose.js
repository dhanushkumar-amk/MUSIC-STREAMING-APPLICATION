/**
 * Automated Prisma to Mongoose Converter
 * Converts all Prisma controller code to use Mongoose models
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllersDir = path.join(__dirname, '..', 'src', 'controllers');

// Mongoose model imports
const modelImports = {
  user: "import User from '../models/user.model.js';",
  userSettings: "import UserSettings from '../models/userSettings.model.js';",
  playlist: "import Playlist from '../models/playlist.model.js';",
  library: "import Library from '../models/library.model.js';",
  session: "import Session from '../models/session.model.js';",
  recentlyPlayed: "import RecentlyPlayed from '../models/recentlyPlayed.model.js';",
  recentSearch: "import RecentSearch from '../models/recentSearch.model.js';",
  recommendation: "import Recommendation from '../models/recommendation.model.js';",
  lyrics: "import Lyrics from '../models/lyrics.model.js';",
  chatMessage: "import ChatMessage from '../models/chatMessage.model.js';"
};

// Prisma to Mongoose conversion patterns
const conversions = [
  // Remove prisma import
  {
    from: /import prisma from ["']\.\.\/config\/database\.js["'];?\s*/g,
    to: ''
  },

  // findUnique -> findOne or findById
  {
    from: /prisma\.(\w+)\.findUnique\(\{\s*where:\s*\{\s*id:\s*([^}]+)\s*\}\s*\}\)/g,
    to: (match, model, id) => `${capitalize(model)}.findById(${id})`
  },
  {
    from: /prisma\.(\w+)\.findUnique\(\{\s*where:\s*\{\s*([^:]+):\s*([^}]+)\s*\}\s*\}\)/g,
    to: (match, model, field, value) => `${capitalize(model)}.findOne({ ${field}: ${value} })`
  },

  // findFirst -> findOne
  {
    from: /prisma\.(\w+)\.findFirst\(/g,
    to: (match, model) => `${capitalize(model)}.findOne(`
  },

  // findMany -> find
  {
    from: /prisma\.(\w+)\.findMany\(/g,
    to: (match, model) => `${capitalize(model)}.find(`
  },

  // create
  {
    from: /prisma\.(\w+)\.create\(\{\s*data:\s*/g,
    to: (match, model) => `${capitalize(model)}.create(`
  },

  // update
  {
    from: /prisma\.(\w+)\.update\(\{\s*where:\s*\{\s*id:\s*([^}]+)\s*\},\s*data:\s*/g,
    to: (match, model, id) => `${capitalize(model)}.findByIdAndUpdate(${id}, `
  },
  {
    from: /prisma\.(\w+)\.update\(\{\s*where:\s*\{\s*([^:]+):\s*([^}]+)\s*\},\s*data:\s*/g,
    to: (match, model, field, value) => `${capitalize(model)}.findOneAndUpdate({ ${field}: ${value} }, `
  },

  // delete
  {
    from: /prisma\.(\w+)\.delete\(\{\s*where:\s*\{\s*id:\s*([^}]+)\s*\}\s*\}\)/g,
    to: (match, model, id) => `${capitalize(model)}.findByIdAndDelete(${id})`
  },
  {
    from: /prisma\.(\w+)\.delete\(\{\s*where:\s*\{\s*([^:]+):\s*([^}]+)\s*\}\s*\}\)/g,
    to: (match, model, field, value) => `${capitalize(model)}.findOneAndDelete({ ${field}: ${value} })`
  },

  // count
  {
    from: /prisma\.(\w+)\.count\(/g,
    to: (match, model) => `${capitalize(model)}.countDocuments(`
  },

  // upsert
  {
    from: /prisma\.(\w+)\.upsert\(\{\s*where:\s*\{\s*([^:]+):\s*([^}]+)\s*\},\s*create:\s*([^,]+),\s*update:\s*([^}]+)\s*\}\)/g,
    to: (match, model, field, value, createData, updateData) =>
      `${capitalize(model)}.findOneAndUpdate({ ${field}: ${value} }, ${updateData}, { upsert: true, new: true })`
  }
];

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function detectModelsUsed(content) {
  const models = new Set();
  const modelPattern = /prisma\.(\w+)\./g;
  let match;

  while ((match = modelPattern.exec(content)) !== null) {
    models.add(match[1]);
  }

  return Array.from(models);
}

function convertFile(filePath) {
  console.log(`\n📝 Converting: ${path.basename(filePath)}`);

  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Detect which models are used
  const modelsUsed = detectModelsUsed(content);

  if (modelsUsed.length === 0) {
    console.log('  ⏭️  No Prisma code found, skipping');
    return;
  }

  console.log(`  📦 Models used: ${modelsUsed.join(', ')}`);

  // Apply conversions
  conversions.forEach(({ from, to }) => {
    if (typeof to === 'function') {
      content = content.replace(from, to);
    } else {
      content = content.replace(from, to);
    }
  });

  // Add model imports at the top
  const imports = modelsUsed
    .map(model => modelImports[model])
    .filter(Boolean)
    .join('\n');

  if (imports) {
    // Find the last import statement
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf(';', lastImportIndex) + 1;

    content =
      content.slice(0, endOfLastImport) +
      '\n' + imports +
      content.slice(endOfLastImport);
  }

  // Clean up Prisma-specific syntax
  content = content.replace(/\{\s*where:\s*/g, '');
  content = content.replace(/,\s*select:\s*\{[^}]+\}/g, ''); // Remove select (use .select() in Mongoose)
  content = content.replace(/,\s*include:\s*\{[^}]+\}/g, ''); // Remove include (use .populate() in Mongoose)
  content = content.replace(/,\s*orderBy:\s*\{[^}]+\}/g, ''); // Remove orderBy (use .sort() in Mongoose)

  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log('  ✅ Converted successfully');
  } else {
    console.log('  ⚠️  No changes made');
  }
}

function convertAllControllers() {
  console.log('🚀 Starting Prisma to Mongoose conversion...\n');

  const files = fs.readdirSync(controllersDir);
  const jsFiles = files.filter(f => f.endsWith('.js') && !f.includes('.example'));

  console.log(`Found ${jsFiles.length} controller files\n`);

  jsFiles.forEach(file => {
    const filePath = path.join(controllersDir, file);
    try {
      convertFile(filePath);
    } catch (error) {
      console.error(`  ❌ Error converting ${file}:`, error.message);
    }
  });

  console.log('\n✨ Conversion complete!');
  console.log('\n⚠️  IMPORTANT: Manual review required!');
  console.log('   - Check complex queries (joins, aggregations)');
  console.log('   - Update .select(), .populate(), .sort() calls');
  console.log('   - Test all endpoints thoroughly');
}

convertAllControllers();
