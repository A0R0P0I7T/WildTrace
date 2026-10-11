import { AIInferenceProvider, HabitatComparisonPayload } from '../types';
import { AIInterpretationSchema, ValidatedAIInterpretation } from '../schema';
import { prepareImageAsDataUrl } from '../imageUtils';

export class OpenRouterProvider implements AIInferenceProvider {
  name: string;
  isLocal = false;
  private apiKey: string;
  private model: string;
  private timeoutMs: number;

  constructor(
    apiKey: string,
    model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
    timeoutMs = parseInt(process.env.OPENROUTER_TIMEOUT_MS || '35000', 10)
  ) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('OpenRouter API key is required but was empty.');
    }
    this.apiKey = apiKey.trim();
    this.model = model;
    this.timeoutMs = timeoutMs;
    this.name = `${this.model} (via OpenRouter)`;
  }

  async interpret(payload: HabitatComparisonPayload): Promise<ValidatedAIInterpretation> {
    const { site, baselineObs, targetObs, comparison } = payload;

    // 1. Prepare and rasterize actual observation images to base64 Data URLs
    const [baselineDataUrl, targetDataUrl] = await Promise.all([
      prepareImageAsDataUrl(baselineObs.imagePath),
      prepareImageAsDataUrl(targetObs.imagePath),
    ]);

    // 2. Build scientifically grounded, structured prompt
    const promptText = `You are WildTrace, a grounded longitudinal micro-habitat observation intelligence system.
You are analyzing two photographic observations of the exact same physical outdoor micro-habitat patch over time.

Habitat Overview:
- Name: "${site.name}"
- Habitat Classification: ${site.habitatType}
- Description: ${site.description || 'N/A'}

Observation 1 (Baseline - ${baselineObs.recordedAt}):
- Weather: "${baselineObs.weatherNotes}"
- Observer Field Notes: "${baselineObs.fieldNotes || 'None'}"

Observation 2 (Revisit - ${targetObs.recordedAt}):
- Weather: "${targetObs.weatherNotes}"
- Observer Field Notes: "${targetObs.fieldNotes || 'None'}"

Image-Derived Photometric & Computer Vision Metrics:
- Frame Pixels Altered: ${comparison.visualDifferencePercentage}%
- Excess Green Index (ExG: 2G - R - B) Delta: ${comparison.excessGreenDelta}%
- Framing Edge Correlation: ${comparison.structuralSimilarityScore} (${comparison.alignmentConfidence} confidence)
- Automated Limitation Disclosures: ${comparison.limitationFlags.join(', ') || 'None'}

${
  comparison.alignmentConfidence === 'LOW' ||
  comparison.limitationFlags.includes('INCOMPATIBLE_FOR_PIXEL_DIFF') ||
  comparison.limitationFlags.includes('PERSPECTIVE_SHIFT_DETECTED')
    ? `CRITICAL SCIENTIFIC RELIABILITY GATE (INCOMPATIBLE FRAMING / LOW CONFIDENCE):
The automated computer vision engine has flagged this image pair with LOW alignment confidence (${comparison.limitationFlags.join(', ') || 'INCOMPATIBLE_FOR_PIXEL_DIFF'}).
CRITICAL SCIENTIFIC LIMITATION: Camera framing and perspective between these two observations are INCOMPATIBLE for direct comparison. DO NOT present ExG delta or pixel difference as evidence of ecological change.
1. In "observed_changes": Note differences in visible surface texture and green hue, but explicitly state that they are substantially affected by framing, distance, or angle differences.
2. In "ecological_hypotheses": Explicitly state that because the framing and perspective are not sufficiently comparable, the photographs CANNOT establish a reliable directional comparison of habitat change (do NOT claim verified moss growth, dieback, dehydration, or recovery).
3. In "uncertainties": Explicitly emphasize that perspective shifts, angle disparities, and lighting differences prevent definitive pixel-subtraction conclusions.
4. In "next_visit_prompt": Provide a "Touch Grass Mission" prioritizing returning to the exact spot, matching distance, angle, and framing against a stable physical landmark. Retake the photograph from the same distance and angle before drawing conclusions.`
    : comparison.alignmentConfidence === 'MEDIUM' ||
      comparison.limitationFlags.includes('MODERATE_FRAMING_VARIANCE') ||
      comparison.limitationFlags.includes('HIGH_ILLUMINATION_DISPARITY')
    ? `SCIENTIFIC CAUTION GATE (PARTIAL COMPATIBILITY / MEDIUM CONFIDENCE):
Moderate framing or lighting variation detected (${comparison.limitationFlags.join(', ')}).
1. Describe visible differences cautiously and distinguish lighting/exposure/moisture from genuine biological shifts.
2. Keep ecological hypotheses explicitly tentative.
3. Include lighting, shadow, and angle confounders in uncertainties.`
    : `HIGH COMPATIBILITY:
Images show strong framing and structural consistency. Detail visible surface shifts while maintaining scientific uncertainty disclosures (ExG changes do not prove biological growth).`
}

Scientific Grounding & Ethical Rules:
1. Ground your observations strictly in what is visible in the two attached photographs and the measured photometric indicators.
2. DO NOT claim that visual differences or ExG changes alone prove biological growth, species vitality, or ecological improvement.
3. Explicitly acknowledge photometric confounds (e.g. lighting variation, camera angle displacement, surface ground moisture) in the "uncertainties" section.
4. Formulate non-definitive, plausible ecological hypotheses that consider micro-climate, hydration reviviscence, or seasonal patterns.
5. Provide exactly ONE specific, tangible "Touch Grass Mission" starting with "Touch Grass Mission:" that instructs the human observer to physically inspect or touch a specific micro-feature on their next visit.

Return ONLY a raw JSON object matching this exact schema:
{
  "observed_changes": ["concrete visual change 1", "concrete visual change 2"],
  "ecological_hypotheses": ["plausible ecological hypothesis 1", "plausible ecological hypothesis 2"],
  "uncertainties": ["photometric or framing uncertainty 1", "lighting or moisture uncertainty 2"],
  "next_visit_prompt": "Touch Grass Mission: Return in 3-5 days to specifically inspect..."
}`;

    // 3. Assemble multimodal payload according to OpenRouter vision specifications
    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: promptText,
            },
            {
              type: 'image_url',
              image_url: {
                url: baselineDataUrl,
              },
            },
            {
              type: 'image_url',
              image_url: {
                url: targetDataUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    };

    // 4. Execute request with bounded retries (max 2 attempts: 1 initial + at most 1 retry for transient 429/503)
    let lastError: Error | null = null;
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://wildtrace.dev',
            'X-Title': 'WildTrace Micro-Habitat Observation Intelligence',
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(this.timeoutMs),
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error(`OpenRouter authentication failed: HTTP ${response.status} (invalid or unauthorized API key)`);
        }

        if (response.status === 429 || response.status === 503) {
          const retryAfterSec = parseInt(response.headers.get('retry-after') || '1', 10);
          const backoffMs = Math.min(Math.max(retryAfterSec, 1) * 1000, 2000);

          if (attempt < maxAttempts) {
            console.warn(`[OpenRouter] Received HTTP ${response.status}. Retrying once after ${backoffMs}ms...`);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          } else {
            throw new Error(`OpenRouter rate limited or temporarily unavailable: HTTP ${response.status}`);
          }
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          throw new Error(`OpenRouter API error: HTTP ${response.status} ${response.statusText}${errorText ? ` - ${errorText.slice(0, 150)}` : ''}`);
        }

        const json = await response.json();
        const rawContent = json.choices?.[0]?.message?.content;

        if (!rawContent || typeof rawContent !== 'string') {
          throw new Error('OpenRouter response contained empty or missing message content');
        }

        // Strip markdown code fences if model wrapped response in ```json ... ```
        const cleaned = rawContent.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON structure found in OpenRouter model output');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return AIInterpretationSchema.parse(parsed);
      } catch (err: any) {
        lastError = err;
        // Do not retry on authentication failure, client validation, or timeout
        if (
          err.name === 'TimeoutError' ||
          err.name === 'AbortError' ||
          err.message?.includes('authentication failed') ||
          err.message?.includes('ZodError')
        ) {
          break;
        }
      }
    }

    throw lastError || new Error('OpenRouter inference failed after retries');
  }
}
