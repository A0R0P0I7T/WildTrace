import { AIInferenceProvider, HabitatComparisonPayload } from '../types';
import { AIInterpretationSchema, ValidatedAIInterpretation } from '../schema';

export class HuggingFaceProvider implements AIInferenceProvider {
  name = 'Qwen2-VL-7B-Instruct (Open-Weight via HuggingFace)';
  isLocal = false;
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'Qwen/Qwen2-VL-7B-Instruct') {
    this.apiKey = apiKey;
    this.model = model;
    this.name = `${model} (Open-Weight via HuggingFace)`;
  }

  async interpret(payload: HabitatComparisonPayload): Promise<ValidatedAIInterpretation> {
    const { site, baselineObs, targetObs, comparison } = payload;

    const promptText = `You are WildTrace, a grounded longitudinal micro-habitat observation intelligence.
Habitat: "${site.name}" (Type: ${site.habitatType})
Observation A (Baseline, ${baselineObs.recordedAt}): Weather="${baselineObs.weatherNotes}", Notes="${baselineObs.fieldNotes}"
Observation B (Revisit, ${targetObs.recordedAt}): Weather="${targetObs.weatherNotes}", Notes="${targetObs.fieldNotes}"

Image-Derived Photometric Indicators:
- Visual frame altered: ${comparison.visualDifferencePercentage}%
- Excess Green Index shift: ${comparison.excessGreenDelta}%
- Framing correlation: ${comparison.structuralSimilarityScore} (${comparison.alignmentConfidence} confidence)
- Suitability Disclosures: ${comparison.limitationFlags.join(', ') || 'None'}

Return ONLY valid JSON matching this exact structure:
{
  "observed_changes": ["concrete visual change 1", "concrete visual change 2"],
  "ecological_hypotheses": ["non-definitive plausible hypothesis 1", "non-definitive plausible hypothesis 2"],
  "uncertainties": ["photometric confound 1", "lighting/angle uncertainty 2"],
  "next_visit_prompt": "Touch Grass Mission: Return in X days to specifically inspect..."
}`;

    const res = await fetch(`https://api-inference.huggingface.co/models/${this.model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: promptText }),
      signal: AbortSignal.timeout(12000), // 12-second cutoff
    });

    if (!res.ok) {
      throw new Error(`HuggingFace API error: HTTP ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON structure found in model output');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return AIInterpretationSchema.parse(parsed);
  }
}
