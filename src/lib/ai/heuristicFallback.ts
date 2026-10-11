import { Site, Observation, ComparisonPair } from '@/types';
import { ValidatedAIInterpretation } from './schema';

/**
 * Deterministic Grounded Heuristic Engine
 * Generates structured field intelligence directly from algorithmic computer vision metrics
 * and user-supplied environmental observations with zero external API dependencies.
 * Respects the comparison-confidence gate when photographs have incompatible framing.
 */
export function generateDeterministicInterpretation(
  site: Site,
  obs1: Observation,
  obs2: Observation,
  comparison: ComparisonPair
): ValidatedAIInterpretation {
  const observed_changes: string[] = [];
  const ecological_hypotheses: string[] = [];
  const uncertainties: string[] = [];

  const { visualDifferencePercentage, excessGreenDelta, alignmentConfidence, limitationFlags } = comparison;
  const isLowConfidence =
    alignmentConfidence === 'LOW' ||
    limitationFlags.includes('INCOMPATIBLE_FOR_PIXEL_DIFF') ||
    limitationFlags.includes('PERSPECTIVE_SHIFT_DETECTED');

  // 1. Observed changes grounded strictly in data
  if (isLowConfidence) {
    observed_changes.push(
      `Photographs show differences in visible texture and green coverage, but the computer vision engine detected substantial framing or perspective variance (${visualDifferencePercentage}% pixel disparity).`
    );
    observed_changes.push(
      `Excess Green Index (ExG) raw delta measured at ${excessGreenDelta > 0 ? '+' : ''}${excessGreenDelta}%, but spatial pixel registration is not sufficiently aligned for localized difference mapping.`
    );
  } else {
    observed_changes.push(
      `Algorithmic analysis detected ${visualDifferencePercentage}% of the visual frame underwent color/luminance shift.`
    );

    if (excessGreenDelta > 5) {
      observed_changes.push(
        `Excess Green Index (ExG) increased by +${excessGreenDelta}%, indicating vegetative expansion, chlorophyll activation, or algal greening.`
      );
    } else if (excessGreenDelta < -5) {
      observed_changes.push(
        `Excess Green Index (ExG) decreased by ${excessGreenDelta}%, consistent with desiccation, leaf litter accumulation, or foliage senescence.`
      );
    } else {
      observed_changes.push(
        `Vegetation index remained relatively stable (ExG delta: ${excessGreenDelta}%).`
      );
    }
  }

  if (obs2.environmentalMetadata?.moistureEstimate && obs1.environmentalMetadata?.moistureEstimate) {
    if (obs2.environmentalMetadata.moistureEstimate !== obs1.environmentalMetadata.moistureEstimate) {
      observed_changes.push(
        `Ground moisture transitioned from ${obs1.environmentalMetadata.moistureEstimate} to ${obs2.environmentalMetadata.moistureEstimate}.`
      );
    }
  }

  if (obs2.fieldNotes) {
    observed_changes.push(`User field observation logged: "${obs2.fieldNotes.slice(0, 120)}"`);
  }

  // 2. Ecological Hypotheses (Non-definitive, grounded, gated)
  if (isLowConfidence) {
    ecological_hypotheses.push(
      `Inconclusive Directional Trajectory: The framing and perspective are not sufficiently comparable to establish how this micro-habitat changed over time. Unreliable ExG shifts (${excessGreenDelta > 0 ? '+' : ''}${excessGreenDelta}%) cannot be used as evidence of biological growth, dieback, or dehydration.`
    );
    ecological_hypotheses.push(
      `Observational Incongruity: Visual shifts may largely represent camera angle, distance, or lighting discrepancies rather than ecological progression on ${site.habitatType.replace('_', ' ')}.`
    );
  } else {
    if (excessGreenDelta > 8) {
      ecological_hypotheses.push(
        `Hydration Reviviscence: Mosses and lichens on ${site.habitatType.replace('_', ' ')} can rapidly rehydrate and activate chloroplasts within hours of precipitation.`
      );
      ecological_hypotheses.push(
        `Microbial/Bryophyte Spread: Increased moisture may be facilitating spore germination or vegetative spread across quadrant fissures.`
      );
    } else if (excessGreenDelta < -8) {
      ecological_hypotheses.push(
        `Drying / Moisture Depletion: Reduced green index suggests dormant poikilohydric withdrawal or seasonal shedding.`
      );
    } else {
      ecological_hypotheses.push(
        `Micro-climate Equilibrium: Structural vegetation appears steady; changes may primarily reflect surface moisture or lighting angle shifts.`
      );
    }

    if (obs2.weatherNotes.toLowerCase().includes('rain') || obs2.environmentalMetadata?.moistureEstimate === 'saturated') {
      ecological_hypotheses.push(
        `Precipitation Catalyst: High moisture levels often stimulate decomposer mycelial networks and invertebrate activity beneath surface bark and soil.`
      );
    }
  }

  // 3. Uncertainties and Confounds
  if (
    limitationFlags.includes('HIGH_ILLUMINATION_DISPARITY') ||
    limitationFlags.includes('LIGHTING_VARIATION_DETECTED')
  ) {
    uncertainties.push(
      `Lighting disparity: Different ambient illumination levels between visits can cast deeper shadows and artificially alter pixel color values.`
    );
  }

  if (isLowConfidence) {
    uncertainties.push(
      `Perspective and framing disparity (${limitationFlags.join(', ') || 'INCOMPATIBLE_FOR_PIXEL_DIFF'}): The photograph angle or distance differs significantly from the baseline, confounding pixel-level difference masks and ExG accuracy.`
    );
    uncertainties.push(
      `Photographs cannot support a reliable directional comparison until retaken from identical distance and angle.`
    );
  } else if (
    alignmentConfidence === 'MEDIUM' ||
    limitationFlags.includes('MODERATE_FRAMING_VARIANCE') ||
    limitationFlags.includes('POTENTIAL_ANGLE_MISMATCH')
  ) {
    uncertainties.push(
      `Moderate framing variance: The photograph angle differs slightly from the baseline, which may introduce minor boundary displacements.`
    );
  } else {
    uncertainties.push(
      `Framing alignment is good, but camera sensor white balance adjustments between visits may introduce minor color shifts.`
    );
  }

  uncertainties.push(
    `Visual comparison alone cannot definitively determine whether surface darkening is caused by water retention or biological growth.`
  );

  // 4. Exactly ONE Actionable Next-Visit Prompt (Field Mission)
  let next_visit_prompt = '';
  if (isLowConfidence) {
    next_visit_prompt =
      'Touch Grass Mission: Return to this exact micro-habitat spot and use a permanent natural landmark (such as a distinct rock fissure or tree notch) to match the original camera distance, orientation, and angle before drawing conclusions.';
  } else {
    switch (site.habitatType) {
      case 'tree_bark':
        next_visit_prompt =
          'Touch Grass Mission: On your next visit in 3-5 days, get within 15cm and inspect the lowest bark fissure with a magnifying lens or phone macro mode to check whether moss rhizoids or fungal hyphae have anchored further into the wood.';
        break;
      case 'moss_rock':
        next_visit_prompt =
          'Touch Grass Mission: Return in 4-7 days to gently feel the texture of the central moss cushion and check if sporophyte stalks (capsules on thin stems) have emerged.';
        break;
      case 'soil_bed':
        next_visit_prompt =
          'Touch Grass Mission: On your next visit, check the edge where the leaf litter meets exposed soil to observe whether fungal mycelial cords or seedling cotyledons have broken through.';
        break;
      default:
        next_visit_prompt =
          'Touch Grass Mission: Return in 3-5 days at the same time of day to inspect whether the localized change zone has expanded or receded.';
    }
  }

  return {
    observed_changes,
    ecological_hypotheses,
    uncertainties,
    next_visit_prompt,
  };
}
