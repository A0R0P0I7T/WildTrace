import { Site, Observation, ComparisonPair } from '@/types';
import { ValidatedAIInterpretation } from './schema';

export interface HabitatComparisonPayload {
  site: Site;
  baselineObs: Observation;
  targetObs: Observation;
  comparison: ComparisonPair;
}

export interface AIInferenceProvider {
  name: string;
  isLocal: boolean;
  interpret(payload: HabitatComparisonPayload): Promise<ValidatedAIInterpretation>;
}

export interface GatewayResult {
  data: ValidatedAIInterpretation;
  modelIdentifier: string;
  isFallback: boolean;
}
