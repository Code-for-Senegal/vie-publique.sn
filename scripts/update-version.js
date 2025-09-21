#!/usr/bin/env node

/**
 * Script pour mettre à jour automatiquement la version de l'application
 * Usage: 
 *   npm run version:patch  (1.0.0 -> 1.0.1)
 *   npm run version:minor  (1.0.0 -> 1.1.0)
 *   npm run version:major  (1.0.0 -> 2.0.0)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const versionType = process.argv[2] || 'patch';

function updateVersion(type) {
  try {
    // Lire package.json
    const packagePath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    
    // Parser la version actuelle
    const [major, minor, patch] = packageJson.version.split('.').map(Number);
    
    // Calculer la nouvelle version
    let newVersion;
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }
    
    // Mettre à jour package.json
    packageJson.version = newVersion;
    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`✅ Version mise à jour: ${packageJson.version} -> ${newVersion}`);
    console.log(`📦 Prête pour le déploiement`);
    
    return newVersion;
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la version:', error.message);
    process.exit(1);
  }
}

updateVersion(versionType);