import { z } from 'zod';

export const AIInterpretationSchema = z.object({
  observed_changes: z
    .array(z.string())
    .min(1)
    .describe('Concrete visual changes directly visible between the two observation photographs'),
  ecological_hypotheses: z
    .array(z.string())
    .min(1)
    .describe('Plausible natural hypotheses explaining the observed changes, clearly framed as non-definitive'),
  uncertainties: z
    .array(z.string())
    .min(1)
    .describe('Known confounds such as lighting variance, camera angle shift, or weather shifts'),
  next_visit_prompt: z
    .string()
    .min(10)
    .describe('Exactly ONE specific, actionable physical observation mission for the next field visit'),
});

export type ValidatedAIInterpretation = z.infer<typeof AIInterpretationSchema>;
