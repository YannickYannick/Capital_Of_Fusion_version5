/**
 * Script d'audit de performance en PRODUCTION via l'API PageSpeed Insights
 * Usage: node scripts/perf-audit-prod.js
 * 
 * Utilise l'API gratuite de Google (pas besoin de clé API pour usage basique)
 */

const fs = require('fs');
const path = require('path');

// URL de base en production
const BASE_URL = 'https://capital-of-fusion-version5.vercel.app';

// Pages à tester
const PAGES = [
  '/',                           // Accueil
  '/explore',                    // Explore 3D
  '/artistes',                   // Artistes
  '/care',                       // Care
  '/cours',                      // Cours
  '/evenements',                 // Événements
  '/shop',                       // Shop
  '/trainings',                  // Trainings
  '/theorie',                    // Théorie
  '/projets',                    // Projets
  '/fichiers',                   // Fichiers
  '/organisation/structure',     // Structure
  '/organisation/poles',         // Pôles
  '/partenaires/structures',     // Structures partenaires
  '/identite-cof/notre-vision',  // Notre vision
];

// Dossier de sortie
const OUTPUT_DIR = path.join(__dirname, '..', 'perf-reports-prod');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Clé API PageSpeed Insights
const API_KEY = 'AIzaSyARBDqToMZT-z8Oz5DKV7U_C5VkKOo5N-E';

// Stratégie: 'mobile' ou 'desktop'
const STRATEGY = process.argv[3] || 'desktop';

async function testPage(pageUrl) {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(pageUrl)}&category=performance&strategy=${STRATEGY}&key=${API_KEY}`;
  
  const response = await fetch(apiUrl);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText.slice(0, 100)}`);
  }
  
  return response.json();
}

function extractMetrics(data) {
  const audits = data.lighthouseResult?.audits || {};
  const categories = data.lighthouseResult?.categories || {};
  
  return {
    score: Math.round((categories.performance?.score || 0) * 100),
    fcp: Math.round(audits['first-contentful-paint']?.numericValue || 0),
    lcp: Math.round(audits['largest-contentful-paint']?.numericValue || 0),
    tbt: Math.round(audits['total-blocking-time']?.numericValue || 0),
    cls: (audits['cumulative-layout-shift']?.numericValue || 0).toFixed(3),
    tti: Math.round(audits['interactive']?.numericValue || 0),
    si: Math.round(audits['speed-index']?.numericValue || 0),
  };
}

async function main() {
  console.log('🚀 Audit de performance PRODUCTION - Capital of Fusion');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📱 Stratégie: ${STRATEGY.toUpperCase()}`);
  console.log(`📁 Rapports: ${OUTPUT_DIR}`);
  console.log('─'.repeat(60));
  console.log('⏳ Chaque page prend ~30-60 secondes à analyser...\n');

  const results = [];

  for (let i = 0; i < PAGES.length; i++) {
    const page = PAGES[i];
    const url = `${BASE_URL}${page}`;
    const safeName = page === '/' ? 'homepage' : page.replace(/\//g, '-').slice(1);
    
    console.log(`[${i + 1}/${PAGES.length}] 📊 Testing: ${page}`);
    
    try {
      const data = await testPage(url);
      const metrics = extractMetrics(data);
      metrics.page = page;
      metrics.url = url;
      
      results.push(metrics);
      
      // Sauvegarder le rapport complet
      const outputPath = path.join(OUTPUT_DIR, `${safeName}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
      
      const scoreIcon = metrics.score >= 90 ? '🟢' : metrics.score >= 50 ? '🟡' : '🔴';
      console.log(`    ${scoreIcon} Score: ${metrics.score}% | FCP: ${metrics.fcp}ms | LCP: ${metrics.lcp}ms | TBT: ${metrics.tbt}ms | TTI: ${metrics.tti}ms\n`);
      
      // Pause entre les requêtes pour éviter le rate limiting
      if (i < PAGES.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
      
    } catch (error) {
      console.log(`    ❌ Erreur: ${error.message}\n`);
      results.push({ page, url, score: 0, error: error.message });
    }
  }

  // Résumé final
  console.log('\n' + '═'.repeat(60));
  console.log('📋 RÉSUMÉ DES PERFORMANCES');
  console.log('═'.repeat(60));

  // Trier par score (pire en premier)
  const validResults = results.filter(r => !r.error);
  validResults.sort((a, b) => a.score - b.score);

  console.log('\n| Page | Score | FCP | LCP | TBT | TTI | Speed Index |');
  console.log('|------|-------|-----|-----|-----|-----|-------------|');

  for (const r of validResults) {
    const scoreIcon = r.score >= 90 ? '🟢' : r.score >= 50 ? '🟡' : '🔴';
    console.log(`| ${r.page.padEnd(25)} | ${scoreIcon} ${String(r.score).padStart(2)}% | ${String(r.fcp).padStart(4)}ms | ${String(r.lcp).padStart(4)}ms | ${String(r.tbt).padStart(4)}ms | ${String(r.tti).padStart(5)}ms | ${String(r.si).padStart(5)}ms |`);
  }

  // Erreurs
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.log('\n❌ Pages en erreur:');
    for (const e of errors) {
      console.log(`   - ${e.page}: ${e.error}`);
    }
  }

  // Pages problématiques
  const problematic = validResults.filter(r => r.score < 50);
  if (problematic.length > 0) {
    console.log('\n⚠️  Pages nécessitant une optimisation (score < 50%):');
    for (const p of problematic) {
      console.log(`   - ${p.page} (${p.score}%) - TBT: ${p.tbt}ms, TTI: ${p.tti}ms`);
    }
  }

  // Meilleures pages
  const best = validResults.filter(r => r.score >= 90);
  if (best.length > 0) {
    console.log('\n✅ Pages performantes (score >= 90%):');
    for (const p of best) {
      console.log(`   - ${p.page} (${p.score}%)`);
    }
  }

  // Moyennes
  if (validResults.length > 0) {
    const avgScore = Math.round(validResults.reduce((sum, r) => sum + r.score, 0) / validResults.length);
    const avgTBT = Math.round(validResults.reduce((sum, r) => sum + r.tbt, 0) / validResults.length);
    const avgTTI = Math.round(validResults.reduce((sum, r) => sum + r.tti, 0) / validResults.length);
    
    console.log('\n📊 Moyennes:');
    console.log(`   - Score moyen: ${avgScore}%`);
    console.log(`   - TBT moyen: ${avgTBT}ms`);
    console.log(`   - TTI moyen: ${avgTTI}ms`);
  }

  // Sauvegarder le résumé
  const summaryPath = path.join(OUTPUT_DIR, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Résumé sauvegardé: ${summaryPath}`);
  console.log(`📁 Rapports détaillés: ${OUTPUT_DIR}`);
}

main().catch(console.error);
