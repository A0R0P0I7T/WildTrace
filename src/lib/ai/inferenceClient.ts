import { Site, Observation, ComparisonPair } from '@/types';
import { ValidatedAIInterpretation } from './schema';
import { aiGateway } from './gateway';

export interface InterpretationResult {
  data: ValidatedAIInterpretation;
  modelIdentifier: string;
  isFallback: boolean;
}

/**
 * Multimodal Vision-Language Inference Client
 * Connects to OpenRouter as primary provider, with secondary Hugging Face support,
 * and automatically falls back to deterministic grounded heuristics if external models are unavailable.
 */
export async function interpretHabitatChanges(
  site: Site,
  obs1: Observation,
  obs2: Observation,
  comparison: ComparisonPair
): Promise<InterpretationResult> {
  const result = await aiGateway.generateInterpretation({
    site,
    baselineObs: obs1,
    targetObs: obs2,
    comparison,
  });

  return {
    data: result.data,
    modelIdentifier: result.modelIdentifier,
    isFallback: result.isFallback,
  };
}
