import fs from 'fs';
import path from 'path';

const brainDir = 'C:/Users/sahaa/.gemini/antigravity-ide/brain/3cb0378b-d633-4579-a460-265b5308e929';
const baseArtifactsDir = path.join(process.cwd(), 'artifacts', 'wildtrace-demo');
const screenshotsDir = path.join(baseArtifactsDir, 'screenshots');
const articleDir = path.join(baseArtifactsDir, 'article-images');

fs.mkdirSync(screenshotsDir, { recursive: true });
fs.mkdirSync(articleDir, { recursive: true });

const filesToCopy = [
  { src: path.join(brainDir, '01_landing_page_fixed_png_1791733958953.png'), dest: path.join(screenshotsDir, '01-landing-page.png') },
  { src: path.join(brainDir, '02_habitat_selection_fixed_png_1791733965584.png'), dest: path.join(screenshotsDir, '02-habitat-selection.png') },
  { src: path.join(brainDir, '3_habitat_detail_header_1791733489151.png'), dest: path.join(screenshotsDir, '03-observation-detail.png') },
  { src: path.join(brainDir, '5_longitudinal_comparison_1791733546094.png'), dest: path.join(screenshotsDir, '04-longitudinal-comparison.png') },
  { src: path.join(brainDir, '7_side_by_side_inspection_1791733637232.png'), dest: path.join(screenshotsDir, '05-framing-warning.png') },
  { src: path.join(brainDir, '6_field_intelligence_1791733597243.png'), dest: path.join(screenshotsDir, '06-field-mission.png') },
  { src: path.join(brainDir, '4_observation_timeline_1791733500706.png'), dest: path.join(screenshotsDir, '07-observation-history.png') },
];

for (const f of filesToCopy) {
  if (fs.existsSync(f.src)) {
    fs.copyFileSync(f.src, f.dest);
    console.log('Copied ->', path.basename(f.dest));
  } else {
    console.warn('Source missing:', f.src);
  }
}

// Copy top 5 to article images
const articleImages = [
  { src: path.join(screenshotsDir, '01-landing-page.png'), dest: path.join(articleDir, '01-hero-overview.png') },
  { src: path.join(screenshotsDir, '04-longitudinal-comparison.png'), dest: path.join(articleDir, '02-longitudinal-comparison.png') },
  { src: path.join(screenshotsDir, '05-framing-warning.png'), dest: path.join(articleDir, '03-framing-gate-warning.png') },
  { src: path.join(screenshotsDir, '06-field-mission.png'), dest: path.join(articleDir, '04-touch-grass-field-mission.png') },
  { src: path.join(screenshotsDir, '07-observation-history.png'), dest: path.join(articleDir, '05-observation-timeline.png') },
];

for (const a of articleImages) {
  if (fs.existsSync(a.src)) {
    fs.copyFileSync(a.src, a.dest);
    console.log('Article image ->', path.basename(a.dest));
  }
}

// Copy demo recording video
const recSrc = path.join(brainDir, 'wildtrace_demo_walkthrough_1791733361533.webp');
if (fs.existsSync(recSrc)) {
  fs.copyFileSync(recSrc, path.join(baseArtifactsDir, 'wildtrace-walkthrough.webp'));
  console.log('Copied demo recording -> wildtrace-walkthrough.webp');
}
