/**
 * Script d'audit de performance pour toutes les pages du menu
 * Usage: node scripts/perf-audit.js [base-url]
 * 
 * Nécessite: npm install -g lighthouse
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// URL de base (localhost par défaut, ou production)
const BASE_URL = process.argv[2] || 'http://localhost:3000';

// Toutes les pages du menu à tester
const PAGES = [
  '/',                           // Accueil
  '/explore',                    // Explore 3D
  '/identite-cof/notre-vision',  // Notre vision
  '/identite-cof/bulletins',     // Bulletins
  '/organisation/structure',     // Structure
  '/organisation/poles',         // Pôles
  '/partenaires/structures',     // Structures partenaires
  '/partenaires/evenements',     // Événements partenaires
  '/partenaires/cours',          // Cours partenaires
  '/promotions-festivals',       // Promotions festivals
  '/cours',                      // Cours
  '/evenements',                 // Événements
  '/shop',                       // Shop
  '/trainings',                  // Trainings
  '/theorie',                    // Théorie
  '/care',                       // Care
  '/projets',                    // Projets
  '/fichiers',                   // Fichiers
  '/artistes',                   // Artistes
];

// Dossier de sortie
const OUTPUT_DIR = path.join(__dirname, '..', 'perf-reports');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🚀 Audit de performance - Capital of Fusion');
console.log(`📍 Base URL: ${BASE_URL}`);
console.log(`📁 Rapports: ${OUTPUT_DIR}`);
console.log('─'.repeat(50));

const results = [];

for (const page of PAGES) {
  const url = `${BASE_URL}${page}`;
  const safeName = page === '/' ? 'homepage' : page.replace(/\//g, '-').slice(1);
  const outputPath = path.join(OUTPUT_DIR, `${safeName}.json`);
  
  console.log(`\n📊 Testing: ${page}`);
  
  try {
    // Exécuter Lighthouse en mode performance uniquement
    execSync(
      `lighthouse "${url}" --output=json --output-path="${outputPath}" --only-categories=performance --chrome-flags="--headless --no-sandbox" --quiet`,
      { stdio: 'pipe', timeout: 120000 }
    );
    
    // Lire les résultats
    const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    const perf = report.categories.performance;
    const audits = report.audits;
    
    const metrics = {
      page,
      score: Math.round(perf.score * 100),
      fcp: Math.round(audits['first-contentful-paint']?.numericValue || 0),
      lcp: Math.round(audits['largest-contentful-paint']?.numericValue || 0),
      tbt: Math.round(audits['total-blocking-time']?.numericValue || 0),
      cls: audits['cumulative-layout-shift']?.numericValue?.toFixed(3) || '0',
      tti: Math.round(audits['interactive']?.numericValue || 0),
    };
    
    results.push(metrics);
    
    console.log(`   Score: ${metrics.score}% | FCP: ${metrics.fcp}ms | LCP: ${metrics.lcp}ms | TBT: ${metrics.tbt}ms | TTI: ${metrics.tti}ms`);
    
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
    results.push({ page, score: 0, error: error.message });
  }
}

// Résumé final
console.log('\n' + '═'.repeat(50));
console.log('📋 RÉSUMÉ');
console.log('═'.repeat(50));

// Trier par score (pire en premier)
results.sort((a, b) => (a.score || 0) - (b.score || 0));

console.log('\n| Page | Score | FCP | LCP | TBT | TTI |');
console.log('|------|-------|-----|-----|-----|-----|');

for (const r of results) {
  if (r.error) {
    console.log(`| ${r.page} | ❌ | - | - | - | - |`);
  } else {
    const scoreIcon = r.score >= 90 ? '🟢' : r.score >= 50 ? '🟡' : '🔴';
    console.log(`| ${r.page} | ${scoreIcon} ${r.score}% | ${r.fcp}ms | ${r.lcp}ms | ${r.tbt}ms | ${r.tti}ms |`);
  }
}

// Pages problématiques
const problematic = results.filter(r => r.score && r.score < 50);
if (problematic.length > 0) {
  console.log('\n⚠️  Pages nécessitant une attention:');
  for (const p of problematic) {
    console.log(`   - ${p.page} (${p.score}%)`);
  }
}

// Sauvegarder le résumé
const summaryPath = path.join(OUTPUT_DIR, 'summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
console.log(`\n✅ Résumé sauvegardé: ${summaryPath}`);
