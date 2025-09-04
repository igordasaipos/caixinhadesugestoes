import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  suggestion: string;
  visitorId: string;
  accountId: string;
}

interface PostMessageData {
  type: string;
  visitorId: string;
  accountId: string;
}

const SuggestionForm = () => {
  const [formData, setFormData] = useState<FormData>({
    suggestion: "",
    visitorId: "",
    accountId: "",
  });
  const [isDataReceived, setIsDataReceived] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleMessage = (event: MessageEvent<PostMessageData>) => {
      console.log("Mensagem recebida do parent:", event.data);
      
      if (event.data && event.data.type === "INIT_SUGGESTION_FORM") {
        setFormData(prev => ({
          ...prev,
          visitorId: event.data.visitorId || "",
          accountId: event.data.accountId || "",
        }));
        setIsDataReceived(true);
        
        toast({
          title: "Dados recebidos!",
          description: "Formulário pronto para uso.",
          duration: 2000,
        });
      }
    };

    window.addEventListener("message", handleMessage);
    
    // Sinalizar que estamos prontos para receber dados
    if (window.parent) {
      window.parent.postMessage({ type: "SUGGESTION_FORM_READY" }, "*");
    }

    // Timeout para ativar modo de fallback após 5 segundos
    const fallbackTimer = setTimeout(() => {
      if (!isDataReceived) {
        setFallbackMode(true);
        setFormData(prev => ({
          ...prev,
          visitorId: "fallback_visitor_" + Date.now(),
          accountId: "fallback_account_" + Date.now(),
        }));
        setIsDataReceived(true);
        
        toast({
          title: "Modo de teste ativado",
          description: "Formulário funcionando sem conexão com aplicativo pai.",
          duration: 3000,
        });
      }
    }, 5000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(fallbackTimer);
    };
  }, [toast, isDataReceived]);

  const handleSuggestionChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      suggestion: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isDataReceived) {
      toast({
        title: "Dados não recebidos",
        description: "Aguardando dados do aplicativo pai...",
        variant: "destructive",
      });
      return;
    }

    if (!formData.suggestion.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, digite sua sugestão.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("=== SALVANDO SUGESTÃO NO BANCO ===");
      console.log("Dados:", formData);
      
      // Inserir no Supabase
      const { data, error } = await supabase
        .from('suggestions')
        .insert({
          suggestion: formData.suggestion.trim(),
          visitor_id: formData.visitorId,
          account_id: formData.accountId,
        })
        .select();

      if (error) {
        console.error("Erro ao salvar:", error);
        throw error;
      }

      console.log("Sugestão salva com sucesso:", data);

      toast({
        title: "Sugestão enviada com sucesso!",
        description: `Obrigado pelo seu feedback. ${fallbackMode ? '(Modo teste)' : ''}`,
      });
      
      // Limpar apenas o campo de sugestão
      setFormData(prev => ({
        ...prev,
        suggestion: "",
      }));

    } catch (error) {
      console.error("Erro completo:", error);
      
      toast({
        title: "Erro ao enviar sugestão",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-form)] border-border/40 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Envie sua Sugestão
            </h1>
            <p className="text-sm text-muted-foreground">
              Sua opinião é muito importante para nós
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm">
              {isDataReceived ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">
                    {fallbackMode ? 'Modo teste ativo' : 'Conectado ao aplicativo'}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground border-t-primary animate-spin" />
                  <span className="text-muted-foreground">Aguardando conexão...</span>
                </>
              )}
            </div>
            {fallbackMode && (
              <div className="flex items-center gap-2 text-xs mt-2">
                <AlertCircle className="w-3 h-3 text-orange-500" />
                <span className="text-orange-600">
                  Funcionando sem dados do aplicativo pai
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos hidden */}
            <input type="hidden" name="visitorId" value={formData.visitorId} />
            <input type="hidden" name="accountId" value={formData.accountId} />
            
            <div className="space-y-2">
              <Textarea
                placeholder="Digite sua sugestão aqui..."
                value={formData.suggestion}
                onChange={(e) => handleSuggestionChange(e.target.value)}
                className="min-h-[120px] resize-none transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                disabled={!isDataReceived}
              />
              <p className="text-xs text-muted-foreground">
                {formData.suggestion.length}/500 caracteres
              </p>
            </div>

            <Button
              type="submit"
              disabled={!isDataReceived || !formData.suggestion.trim() || isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-[var(--shadow-elegant)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Enviar Sugestão
                </div>
              )}
            </Button>
          </form>

          {/* Debug info (apenas para desenvolvimento) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-muted/50 rounded-lg text-xs">
              <p className="font-medium mb-1">Debug Info:</p>
              <p>Visitor ID: {formData.visitorId || 'Não recebido'}</p>
              <p>Account ID: {formData.accountId || 'Não recebido'}</p>
              <p>Status: {isDataReceived ? 'Conectado' : 'Aguardando'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionForm;