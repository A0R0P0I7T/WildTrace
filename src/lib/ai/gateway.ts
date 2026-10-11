import { HabitatComparisonPayload, GatewayResult, AIInferenceProvider } from './types';
import { DeterministicHeuristicProvider } from './providers/heuristic';
import { OpenRouterProvider } from './providers/openrouter';
import { HuggingFaceProvider } from './providers/huggingface';

export class AIGateway {
  private primaryProvider: AIInferenceProvider | null = null;
  private secondaryProvider: AIInferenceProvider | null = null;
  private fallbackProvider: DeterministicHeuristicProvider;

  constructor(customPrimary?: AIInferenceProvider) {
    this.fallbackProvider = new DeterministicHeuristicProvider();

    if (customPrimary) {
      this.primaryProvider = customPrimary;
      return;
    }

    // 1. Primary External Provider: OpenRouter
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey && openrouterKey.trim() !== '') {
      const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
      const timeoutMs = parseInt(process.env.OPENROUTER_TIMEOUT_MS || '35000', 10);
      this.primaryProvider = new OpenRouterProvider(openrouterKey, model, timeoutMs);
    }

    // 2. Secondary External Provider: Hugging Face (backward compatibility)
    const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
    if (hfKey && hfKey.trim() !== '') {
      this.secondaryProvider = new HuggingFaceProvider(hfKey);
    }
  }

  getPrimaryProvider(): AIInferenceProvider | null {
    return this.primaryProvider;
  }

  getSecondaryProvider(): AIInferenceProvider | null {
    return this.secondaryProvider;
  }

  getFallbackProvider(): DeterministicHeuristicProvider {
    return this.fallbackProvider;
  }

  async generateInterpretation(payload: HabitatComparisonPayload): Promise<GatewayResult> {
    // 1. Attempt primary provider (OpenRouter) if configured
    if (this.primaryProvider) {
      try {
        const data = await this.primaryProvider.interpret(payload);
        return {
          data,
          modelIdentifier: this.primaryProvider.name,
          isFallback: false,
        };
      } catch (err: any) {
        console.warn(`[WildTrace AI Gateway] Primary inference (${this.primaryProvider.name}) failed or timed out: ${err.message}. Seamlessly engaging fallback.`);
      }
    }

    // 2. Attempt secondary provider (Hugging Face) if configured
    if (this.secondaryProvider) {
      try {
        const data = await this.secondaryProvider.interpret(payload);
        return {
          data,
          modelIdentifier: this.secondaryProvider.name,
          isFallback: false,
        };
      } catch (err: any) {
        console.warn(`[WildTrace AI Gateway] Secondary inference (${this.secondaryProvider.name}) failed: ${err.message}. Seamlessly engaging fallback.`);
      }
    }

    // 3. Guaranteed zero-dependency deterministic heuristic fallback
    const fallbackData = await this.fallbackProvider.interpret(payload);
    return {
      data: fallbackData,
      modelIdentifier: this.fallbackProvider.name,
      isFallback: true,
    };
  }
}

export const aiGateway = new AIGateway();
