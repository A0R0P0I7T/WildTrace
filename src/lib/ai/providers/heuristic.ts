import { AIInferenceProvider, HabitatComparisonPayload } from '../types';
import { ValidatedAIInterpretation } from '../schema';
import { generateDeterministicInterpretation } from '../heuristicFallback';

export class DeterministicHeuristicProvider implements AIInferenceProvider {
  name = 'WildTrace Grounded Heuristic Engine (Offline Mode)';
  isLocal = true;

  async interpret(payload: HabitatComparisonPayload): Promise<ValidatedAIInterpretation> {
    return generateDeterministicInterpretation(
      payload.site,
      payload.baselineObs,
      payload.targetObs,
      payload.comparison
    );
  }
}
