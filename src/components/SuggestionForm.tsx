import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  suggestion: string;
  visitorId: string;
  accountId: string;
  userFullName: string;
  userEmail: string;
  storePhone1: string;
}

const SuggestionForm = () => {
  const [formData, setFormData] = useState<FormData>({
    suggestion: "",
    visitorId: "",
    accountId: "",
    userFullName: "",
    userEmail: "",
    storePhone1: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "INIT_SUGGESTION_FORM") {
        setFormData(prev => ({
          ...prev,
          visitorId: event.data.visitorId || "",
          accountId: event.data.accountId || "",
          userFullName: event.data.userFullName || "",
          userEmail: event.data.userEmail || "",
          storePhone1: event.data.storePhone1 || "",
        }));
      }
    };

    window.addEventListener("message", handleMessage);
    
    // Sinalizar que estamos prontos
    window.parent?.postMessage({ type: "SUGGESTION_FORM_READY" }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.suggestion.trim()) return;
    
    setIsSubmitting(true);

    try {
      await supabase
        .from('suggestions')
        .insert({
          suggestion: formData.suggestion.trim(),
          visitor_id: formData.visitorId,
          account_id: formData.accountId,
          user_full_name: formData.userFullName,
          user_email: formData.userEmail,
          store_phone1: formData.storePhone1,
        });

      // Limpar formulário
      setFormData(prev => ({ ...prev, suggestion: "" }));
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <h1 className="text-xl font-semibold mb-4">Envie sua Sugestão</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Digite sua sugestão aqui..."
            value={formData.suggestion}
            onChange={(e) => setFormData(prev => ({ ...prev, suggestion: e.target.value }))}
            className="min-h-[100px]"
          />
          
          <Button
            type="submit"
            disabled={!formData.suggestion.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              "Enviando..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SuggestionForm;