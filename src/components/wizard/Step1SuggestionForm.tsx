import { Textarea } from "@/components/ui/textarea";

interface FormData {
  suggestion: string;
  visitorId: string;
  accountId: string;
  userFullName: string;
  userEmail: string;
  storePhone1: string;
  preferredContactMethod: 'email' | 'whatsapp' | '';
  contactValue: string;
  contactWhatsapp: string;
  tradeName: string;
}

interface Step1Props {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

const Step1SuggestionForm = ({ formData, setFormData }: Step1Props) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Qual sua sugestão de melhoria?
        </label>
        <Textarea
          placeholder="Digite aqui sua sugestão de melhoria para o sistema..."
          value={formData.suggestion}
          onChange={(e) => setFormData(prev => ({ ...prev, suggestion: e.target.value }))}
          className="min-h-[120px]"
        />
      </div>
      
      <div className="text-xs text-muted-foreground">
        Sua sugestão será analisada pela nossa equipe e você receberá atualizações sobre o andamento.
      </div>
    </div>
  );
};

export default Step1SuggestionForm;