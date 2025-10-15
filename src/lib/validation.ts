import { z } from "zod";

export const suggestionSchema = z.object({
  category: z.enum(["atendimento", "mal-funcionamento", "melhorias", "outros"], {
    required_error: "Por favor, selecione uma categoria"
  }),
  suggestion: z.string()
    .trim()
    .min(10, { message: "A sugestão deve ter pelo menos 10 caracteres" })
    .max(5000, { message: "A sugestão deve ter no máximo 5000 caracteres" }),
  preferredContactMethod: z.enum(["email", "whatsapp"], {
    required_error: "Por favor, selecione um método de contato"
  }),
  contactEmail: z.string()
    .trim()
    .email({ message: "E-mail inválido" })
    .max(255, { message: "E-mail muito longo" })
    .optional(),
  contactWhatsapp: z.string()
    .trim()
    .regex(/^\d{10,15}$/, { message: "WhatsApp deve conter apenas números (10-15 dígitos)" })
    .optional(),
  contactValue: z.string()
    .trim()
    .min(1, { message: "Valor de contato é obrigatório" })
    .max(255, { message: "Valor de contato muito longo" }),
});

export type SuggestionFormData = z.infer<typeof suggestionSchema>;

// Helper function to safely encode for WhatsApp URLs
export function encodeWhatsAppMessage(message: string): string {
  return encodeURIComponent(message.trim());
}

// Helper function to validate and sanitize phone numbers
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}
