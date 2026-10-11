import { spawnSync } from 'child_process';
import path from 'path';

interface SuiteResult {
  name: string;
  command: string;
  exitCode: number;
  durationMs: number;
}

async function runAllSuites() {
  console.log('================================================================');
  console.log('       WILDTRACE COMPREHENSIVE AUTOMATED TEST SUITE RUNNER       ');
  console.log('================================================================\n');

  const suites = [
    {
      name: 'Synthetic Fixture Generation',
      file: 'tests/fixtures/generate-fixtures.ts',
    },
    {
      name: 'Photometric & Computer Vision Engine Unit Tests',
      file: 'tests/vision-engine.test.ts',
    },
    {
      name: 'Repository Image Inventory & Vision Engine Stress Tests',
      file: 'tests/image-inventory.test.ts',
    },
    {
      name: 'API Routes, Security & Lifecycle Integration Tests',
      file: 'tests/api-integration.test.ts',
    },
    {
      name: 'Autonomous End-to-End User Journeys A-E (Live Server)',
      file: 'tests/e2e-user-journeys.test.ts',
    },
    {
      name: 'OpenRouter Multimodal Vision & Gateway Tests',
      file: 'tests/openrouter-provider.test.ts',
    },
    {
      name: 'End-to-End User Verification Journey',
      file: 'tests/verify-journey.ts',
    },
    {
      name: 'Moss Real Image Longitudinal E2E Audit & AI Validation',
      file: 'tests/moss-e2e-verification.ts',
    },
  ];

  const results: SuiteResult[] = [];
  let totalStartTime = Date.now();

  for (const suite of suites) {
    console.log(`▶ Running Suite: ${suite.name}...`);
    const startTime = Date.now();
    const child = spawnSync('npx', ['tsx', suite.file], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
    });
    const durationMs = Date.now() - startTime;
    results.push({
      name: suite.name,
      command: `npx tsx ${suite.file}`,
      exitCode: child.status ?? 1,
      durationMs,
    });
    console.log(`⏱ Completed in ${(durationMs / 1000).toFixed(2)}s\n`);
  }

  const totalDuration = ((Date.now() - totalStartTime) / 1000).toFixed(2);

  console.log('================================================================');
  console.log('                     FINAL TEST MATRIX SUMMARY                  ');
  console.log('================================================================');

  let allPassed = true;
  for (const r of results) {
    const status = r.exitCode === 0 ? '✓ PASS' : '✗ FAIL';
    if (r.exitCode !== 0) allPassed = false;
    console.log(`[${status}] ${r.name.padEnd(52)} (${(r.durationMs / 1000).toFixed(2)}s)`);
  }

  console.log('----------------------------------------------------------------');
  console.log(`Total Execution Time: ${totalDuration}s`);
  console.log(`Overall Result: ${allPassed ? 'ALL TEST SUITES PASSED (100%)' : 'TEST FAILURES DETECTED'}`);
  console.log('================================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runAllSuites().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
