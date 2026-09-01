import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(1, 'nameRequired'),
  email: z.string().min(1, 'emailRequired').email('emailInvalid'),
  phone: z.string().optional(),
  message: z.string().min(1, 'messageRequired'),
  budget: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
