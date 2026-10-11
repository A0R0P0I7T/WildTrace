import fs from 'fs';
import path from 'path';
import { DatabaseSchema, Site, Observation, ComparisonPair, AIInterpretation } from '@/types';
import { getInitialSeedData } from './seedData';
import { prisma } from './prisma';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'wildtrace_db.json');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure directories exist
function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export function getDatabase(): DatabaseSchema {
  ensureStorage();
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file, re-initializing seed data:', err);
    const initialData = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

export function saveDatabase(data: DatabaseSchema): void {
  ensureStorage();
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// Site helpers
export function getAllSites(): Site[] {
  const db = getDatabase();
  return db.sites.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getSiteById(id: string): Site | undefined {
  const db = getDatabase();
  return db.sites.find((s) => s.id === id);
}

export function createSite(site: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>): Site {
  const db = getDatabase();
  const now = new Date().toISOString();
  const newSite: Site = {
    ...site,
    id: `site-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };
  db.sites.push(newSite);
  saveDatabase(db);

  // Background sync to Prisma SQLite
  prisma.site.upsert({
    where: { id: newSite.id },
    update: {},
    create: {
      id: newSite.id,
      name: newSite.name,
      habitatType: newSite.habitatType,
      description: newSite.description,
      latitude: newSite.latitude,
      longitude: newSite.longitude,
      locationLabel: newSite.locationLabel,
      isDemoSite: newSite.isDemoSite,
      isSynthetic: newSite.isSynthetic,
    },
  }).catch((err: any) => console.warn('Prisma background site sync note:', err?.message || err));

  return newSite;
}

export function deleteSite(id: string): boolean {
  const db = getDatabase();
  const siteIndex = db.sites.findIndex((s) => s.id === id);
  if (siteIndex === -1) {
    return false;
  }

  // Find all observations for this site and remove any local upload files
  const siteObs = db.observations.filter((o) => o.siteId === id);
  for (const obs of siteObs) {
    if (obs.imagePath && obs.imagePath.startsWith('/api/uploads/')) {
      const filename = path.basename(obs.imagePath);
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Failed to delete image file on site cleanup:', filePath, e);
        }
      }
    }
  }

  // Remove comparisons for this site
  const removedComparisons = db.comparisons.filter((c) => c.siteId === id);
  const removedCompIds = new Set(removedComparisons.map((c) => c.id));
  db.comparisons = db.comparisons.filter((c) => c.siteId !== id);

  // Remove interpretations associated with removed comparisons
  db.interpretations = db.interpretations.filter((i) => !removedCompIds.has(i.comparisonPairId));

  // Remove observations
  db.observations = db.observations.filter((o) => o.siteId !== id);

  // Remove site
  db.sites.splice(siteIndex, 1);
  saveDatabase(db);

  // Sync to Prisma SQLite
  prisma.site.delete({ where: { id } }).catch(() => {});

  return true;
}

// Observation helpers
export function getObservationsBySiteId(siteId: string): Observation[] {
  const db = getDatabase();
  return db.observations
    .filter((o) => o.siteId === siteId)
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
}

export function getObservationById(id: string): Observation | undefined {
  const db = getDatabase();
  return db.observations.find((o) => o.id === id);
}

export function createObservation(obs: Omit<Observation, 'id' | 'createdAt'>): Observation {
  const db = getDatabase();
  const now = new Date().toISOString();
  const newObs: Observation = {
    ...obs,
    id: `obs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
  };
  db.observations.push(newObs);

  const siteIndex = db.sites.findIndex((s) => s.id === obs.siteId);
  if (siteIndex !== -1) {
    db.sites[siteIndex].updatedAt = now;
  }

  saveDatabase(db);

  // Background sync to Prisma SQLite with parent upsert guarantee
  const parentSite = db.sites.find((s) => s.id === obs.siteId);
  if (parentSite) {
    prisma.site
      .upsert({
        where: { id: parentSite.id },
        update: {},
        create: {
          id: parentSite.id,
          name: parentSite.name,
          habitatType: parentSite.habitatType,
          description: parentSite.description,
          latitude: parentSite.latitude,
          longitude: parentSite.longitude,
          locationLabel: parentSite.locationLabel,
          isDemoSite: parentSite.isDemoSite,
          isSynthetic: parentSite.isSynthetic,
        },
      })
      .then(() => {
        return prisma.observation.create({
          data: {
            id: newObs.id,
            siteId: newObs.siteId,
            recordedAt: new Date(newObs.recordedAt),
            imagePath: newObs.imagePath,
            thumbnailPath: newObs.thumbnailPath,
            weatherNotes: newObs.weatherNotes,
            fieldNotes: newObs.fieldNotes,
            environmentalMetadata: JSON.stringify(newObs.environmentalMetadata),
          },
        });
      })
      .catch((err: any) => console.warn('Prisma background observation sync note:', err?.message || err));
  }

  return newObs;
}

// Comparison helpers
export function getComparisonByPair(baselineId: string, targetId: string): ComparisonPair | undefined {
  const db = getDatabase();
  return db.comparisons.find(
    (c) =>
      (c.baselineObservationId === baselineId && c.targetObservationId === targetId) ||
      (c.baselineObservationId === targetId && c.targetObservationId === baselineId)
  );
}

export function getComparisonById(id: string): ComparisonPair | undefined {
  const db = getDatabase();
  return db.comparisons.find((c) => c.id === id);
}

export function saveComparison(comp: Omit<ComparisonPair, 'id' | 'createdAt'>): ComparisonPair {
  const db = getDatabase();
  const now = new Date().toISOString();
  const existing = getComparisonByPair(comp.baselineObservationId, comp.targetObservationId);
  
  if (existing) {
    const updated: ComparisonPair = { ...existing, ...comp };
    db.comparisons = db.comparisons.map((c) => (c.id === existing.id ? updated : c));
    saveDatabase(db);
    return updated;
  }

  const newComp: ComparisonPair = {
    ...comp,
    id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
  };
  db.comparisons.push(newComp);
  saveDatabase(db);

  // Background sync to Prisma SQLite
  prisma.comparisonPair.create({
    data: {
      id: newComp.id,
      siteId: newComp.siteId,
      baselineObservationId: newComp.baselineObservationId,
      targetObservationId: newComp.targetObservationId,
      visualDifferencePercentage: newComp.visualDifferencePercentage,
      excessGreenDelta: newComp.excessGreenDelta,
      structuralSimilarityScore: newComp.structuralSimilarityScore,
      diffMaskPath: newComp.diffMaskPath,
      alignmentConfidence: newComp.alignmentConfidence,
      limitationFlags: JSON.stringify(newComp.limitationFlags),
    },
  }).catch((err: any) => console.warn('Prisma background comparison sync note:', err?.message || err));

  return newComp;
}

// AI Interpretation helpers
export function getInterpretationByComparisonId(comparisonPairId: string): AIInterpretation | undefined {
  const db = getDatabase();
  return db.interpretations.find((i) => i.comparisonPairId === comparisonPairId);
}

export function saveInterpretation(interp: Omit<AIInterpretation, 'id' | 'createdAt'>): AIInterpretation {
  const db = getDatabase();
  const now = new Date().toISOString();
  const existing = getInterpretationByComparisonId(interp.comparisonPairId);

  if (existing) {
    const updated: AIInterpretation = { ...existing, ...interp };
    db.interpretations = db.interpretations.map((i) => (i.id === existing.id ? updated : i));
    saveDatabase(db);
    return updated;
  }

  const newInterp: AIInterpretation = {
    ...interp,
    id: `interp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
  };
  db.interpretations.push(newInterp);
  saveDatabase(db);

  // Background sync to Prisma SQLite
  prisma.aIInterpretation.create({
    data: {
      id: newInterp.id,
      comparisonPairId: newInterp.comparisonPairId,
      modelIdentifier: newInterp.modelIdentifier,
      observedChanges: JSON.stringify(newInterp.observedChanges),
      ecologicalHypotheses: JSON.stringify(newInterp.ecologicalHypotheses),
      uncertainties: JSON.stringify(newInterp.uncertainties),
      nextVisitPrompt: newInterp.nextVisitPrompt,
      isFallback: newInterp.isFallback,
    },
  }).catch((err: any) => console.warn('Prisma background interpretation sync note:', err?.message || err));

  return newInterp;
}

// Reset / Purge utility
export function resetToSeedData(): DatabaseSchema {
  const initial = getInitialSeedData();
  saveDatabase(initial);
  return initial;
}

export function purgeAllData(): DatabaseSchema {
  ensureStorage();
  const empty: DatabaseSchema = {
    sites: [],
    observations: [],
    comparisons: [],
    interpretations: [],
  };
  saveDatabase(empty);
  
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(UPLOADS_DIR, file));
    }
  } catch (e) {
    console.error('Error clearing uploads:', e);
  }

  return empty;
}
