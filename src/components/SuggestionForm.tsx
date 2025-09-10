import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, CheckCircle, XCircle, Store, User, Mail, Phone, Hash, Clock, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FormData {
  suggestion: string;
  visitorId: string;
  accountId: string;
  userFullName: string;
  userEmail: string;
  storePhone1: string;
}

interface UserSuggestion {
  id: string;
  suggestion: string;
  visitor_id: string;
  created_at: string;
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
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "INIT_SUGGESTION_FORM") {
        console.log("=== REACT RECEIVED DATA ===");
        console.log("Raw event data:", event.data);
        console.log("Data validation:", {
          hasVisitorId: !!event.data.visitorId,
          hasAccountId: !!event.data.accountId,
          hasUserFullName: !!event.data.userFullName,
          hasUserEmail: !!event.data.userEmail,
          hasStorePhone1: !!event.data.storePhone1
        });
        
        const newFormData = {
          suggestion: "",
          visitorId: event.data.visitorId || "",
          accountId: event.data.accountId || "",
          userFullName: event.data.userFullName || "",
          userEmail: event.data.userEmail || "",
          storePhone1: event.data.storePhone1 || "",
        };
        
        console.log("Setting form data to:", newFormData);
        setFormData(newFormData);
      }
    };

    window.addEventListener("message", handleMessage);
    
    // Sinalizar que estamos prontos
    window.parent?.postMessage({ type: "SUGGESTION_FORM_READY" }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const fetchUserSuggestions = async () => {
    if (!formData.accountId) return;
    
    setIsLoadingSuggestions(true);
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('id, suggestion, visitor_id, created_at')
        .eq('account_id', formData.accountId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar sugestões:", error);
        return;
      }

      setUserSuggestions(data || []);
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    if (formData.accountId) {
      fetchUserSuggestions();
    }
  }, [formData.accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.suggestion.trim()) return;
    
    setIsSubmitting(true);

    try {
      console.log("=== SAVING TO SUPABASE ===");
      console.log("Form data before save:", formData);
      
      const dataToSave = {
        suggestion: formData.suggestion.trim(),
        visitor_id: formData.visitorId,
        account_id: formData.accountId,
        user_full_name: formData.userFullName,
        user_email: formData.userEmail,
        store_phone1: formData.storePhone1,
      };
      
      console.log("Data being saved to Supabase:", dataToSave);
      console.log("Data validation before save:", {
        hasSuggestion: !!dataToSave.suggestion,
        hasVisitorId: !!dataToSave.visitor_id,
        hasAccountId: !!dataToSave.account_id,
        hasUserFullName: !!dataToSave.user_full_name,
        hasUserEmail: !!dataToSave.user_email,
        hasStorePhone1: !!dataToSave.store_phone1
      });

      const { data, error } = await supabase
        .from('suggestions')
        .insert(dataToSave);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("✅ Successfully saved to Supabase:", data);

      // Limpar formulário e atualizar lista
      setFormData(prev => ({ ...prev, suggestion: "" }));
      await fetchUserSuggestions();
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const DebugField = ({ icon: Icon, label, value, hasValue }: {
    icon: any;
    label: string;
    value: string;
    hasValue: boolean;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}:</span>
      </div>
      <div className="flex items-center gap-2">
        {hasValue ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-sm ${hasValue ? 'text-foreground' : 'text-muted-foreground'}`}>
          {value || 'Não preenchido'}
        </span>
      </div>
    </div>
  );

  const SuggestionItem = ({ suggestion }: { suggestion: UserSuggestion }) => (
    <div className="p-3 rounded-md border bg-card">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>
            {formatDistanceToNow(new Date(suggestion.created_at), {
              addSuffix: true,
              locale: ptBR
            })}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Store className="w-3 h-3" />
          <span>Loja {suggestion.visitor_id}</span>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-sm text-foreground">{suggestion.suggestion}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Card>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Debug - Dados Recebidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DebugField
            icon={Store}
            label="Loja selecionada"
            value={formData.visitorId}
            hasValue={!!formData.visitorId}
          />
          <DebugField
            icon={Hash}
            label="ID do usuário"
            value={formData.accountId}
            hasValue={!!formData.accountId}
          />
          <DebugField
            icon={User}
            label="Nome"
            value={formData.userFullName}
            hasValue={!!formData.userFullName}
          />
          <DebugField
            icon={Mail}
            label="Email"
            value={formData.userEmail}
            hasValue={!!formData.userEmail}
          />
          <DebugField
            icon={Phone}
            label="Telefone"
            value={formData.storePhone1}
            hasValue={!!formData.storePhone1}
          />
        </CardContent>
      </Card>

      {formData.accountId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Suas Sugestões Enviadas</span>
              {userSuggestions.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  {userSuggestions.length} sugestão{userSuggestions.length !== 1 ? 'ões' : ''}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSuggestions ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : userSuggestions.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma sugestão enviada ainda</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {userSuggestions.map((suggestion) => (
                  <SuggestionItem key={suggestion.id} suggestion={suggestion} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuggestionForm;