import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, FileX, AlertCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Step1SuggestionForm from "./wizard/Step1SuggestionForm";
import Step2ContactConfirmation from "./wizard/Step2ContactConfirmation";
import StepIndicator from "./wizard/StepIndicator";
import UserSuggestions from "./UserSuggestions";

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
  storeId: string;
}

interface UserSuggestion {
  id: string;
  suggestion: string;
  visitor_id: string;
  created_at: string;
}

const SuggestionWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    suggestion: "",
    visitorId: "",
    accountId: "",
    userFullName: "",
    userEmail: "",
    storePhone1: "",
    preferredContactMethod: '',
    contactValue: "",
    contactWhatsapp: "",
    tradeName: "",
    storeId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "INIT_SUGGESTION_FORM") {
        console.log("=== REACT RECEIVED DATA ===");
        console.log("Raw event data:", event.data);
        
        const newFormData = {
          suggestion: "",
          visitorId: event.data.visitorId || "",
          accountId: event.data.accountId || "",
          userFullName: event.data.userFullName || "",
          userEmail: event.data.userEmail || "",
          storePhone1: event.data.storePhone1 || "",
          preferredContactMethod: '' as 'email' | 'whatsapp' | '',
          contactValue: "",
          contactWhatsapp: "",
          tradeName: event.data.tradeName || "",
          storeId: event.data.storeId || "",
        };
        
        console.log("Setting form data to:", newFormData);
        setFormData(newFormData);
      }
    };

    // FOR TESTING: Simulate data if no message received within 2 seconds
    const testDataTimer = setTimeout(() => {
      if (!formData.accountId) {
        console.log("🧪 No data received, setting test data");
        const testFormData = {
          suggestion: "",
          visitorId: "63702",
          accountId: "88251",
          userFullName: "Igor Nascimento",
          userEmail: "igor.nascimento@saipos.com",
          storePhone1: "54992400194",
          preferredContactMethod: '' as 'email' | 'whatsapp' | '',
          contactValue: "",
          contactWhatsapp: "",
          tradeName: "Loja Teste",
          storeId: "63702 - Loja Teste",
        };
        setFormData(testFormData);
      }
    }, 2000);

    window.addEventListener("message", handleMessage);
    
    // Sinalizar que estamos prontos
    window.parent?.postMessage({ type: "SUGGESTION_FORM_READY" }, "*");

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(testDataTimer);
    };
  }, []);

  const fetchUserSuggestions = async () => {
    if (!formData.accountId) {
      console.log("❌ fetchUserSuggestions: No accountId available");
      return;
    }
    
    console.log("🔍 fetchUserSuggestions: Starting fetch for accountId:", formData.accountId);
    setIsLoadingSuggestions(true);
    
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('id, suggestion, visitor_id, created_at')
        .eq('account_id', formData.accountId)
        .order('created_at', { ascending: false });

      console.log("📊 Supabase query result:", { data, error, accountId: formData.accountId });

      if (error) {
        console.error("❌ Erro ao buscar sugestões:", error);
        return;
      }

      console.log(`✅ Found ${data?.length || 0} suggestions for user`);
      setUserSuggestions(data || []);
    } catch (error) {
      console.error("❌ Erro ao buscar sugestões:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    console.log("👀 useEffect triggered with accountId:", formData.accountId);
    if (formData.accountId) {
      fetchUserSuggestions();
    } else {
      console.log("⚠️ No accountId, clearing suggestions");
      setUserSuggestions([]);
    }
  }, [formData.accountId]);

  const sendToN8n = async (suggestionData: any) => {
    try {
      // Load n8n config from Supabase
      const accountId = 'default-account';
      
      const { data: config, error } = await supabase
        .from('n8n_configs')
        .select('*')
        .eq('account_id', accountId)
        .eq('is_enabled', true)
        .maybeSingle();

      if (error) {
        console.error("Error loading n8n config:", error);
        return;
      }

      if (!config || !config.webhook_url) {
        console.log("n8n integration disabled or no webhook URL configured");
        return;
      }

      const webhookUrl = config.webhook_url;

      // Validate URL format
      try {
        new URL(webhookUrl);
      } catch {
        console.error("Invalid n8n webhook URL:", webhookUrl);
        return;
      }

      if (webhookUrl.includes('/webhook-test/')) {
        console.warn("n8n test URL detected. Live submissions may not trigger the workflow. Use the production '/webhook/' URL.");
      }
      console.log("Sending to n8n:", { webhookUrl, payload: suggestionData });
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(suggestionData),
      });

      // In no-cors mode we can't inspect the response; assume it was sent.
      console.log("n8n request sent (no-cors). Verify receipt in your n8n workflow history.");
    } catch (error) {
      console.error("Error sending to n8n:", error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.suggestion.trim() || !formData.preferredContactMethod) return;
    
    setIsSubmitting(true);

    try {
      console.log("=== SAVING TO SUPABASE ===");
      console.log("Form data before save:", formData);
      
      const dataToSave = {
        suggestion: formData.suggestion.trim(),
        visitor_id: formData.visitorId,
        account_id: formData.accountId,              // ID do usuário
        user_full_name: formData.userFullName,
        user_email: formData.userEmail,
        store_phone1: formData.storePhone1,
        preferred_contact_method: formData.preferredContactMethod,
        contact_value: formData.contactValue,
        contact_whatsapp: formData.contactWhatsapp,
        store_id: formData.storeId,                  // ID da loja no formato "id_store - trade_name"
      };
      
      console.log("Data being saved to Supabase:", dataToSave);

      const { data, error } = await supabase
        .from('suggestions')
        .insert(dataToSave);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("✅ Successfully saved to Supabase:", data);

      // Send to n8n
      const n8nPayload = {
        suggestion: formData.suggestion,
        user: {
          id: formData.accountId,
          name: formData.userFullName,
          email: formData.userEmail
        },
        store: {
          id: formData.visitorId,
          phone: formData.storePhone1
        },
        contact_preference: {
          method: formData.preferredContactMethod,
          value: formData.contactValue
        },
        timestamp: new Date().toISOString()
      };

      await sendToN8n(n8nPayload);

      // Reset form and go back to step 1
      setFormData(prev => ({ 
        ...prev, 
        suggestion: "",
        preferredContactMethod: '',
        contactValue: "",
        contactWhatsapp: ""
      }));
      setCurrentStep(1);
      await fetchUserSuggestions();
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && formData.suggestion.trim()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // Check if we have any user data
  const hasUserData = formData.accountId || formData.userFullName || formData.userEmail;

  // Show empty state if no user data is available
  if (!hasUserData) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <FileX className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h1 className="text-xl font-semibold mb-2">Sistema de Sugestões</h1>
            <p className="text-muted-foreground mb-4">
              Aguardando dados do usuário...
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Como usar:</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Este formulário deve ser aberto através do sistema principal</li>
                    <li>• Os dados do usuário serão carregados automaticamente</li>
                    <li>• Após o carregamento, você poderá enviar suas sugestões</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Envie sua Sugestão</CardTitle>
            <div className="flex items-center gap-2">
              <StepIndicator currentStep={currentStep} totalSteps={2} />
              <Link to="/config/n8n">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 1 && (
            <>
              <Step1SuggestionForm 
                formData={formData}
                setFormData={setFormData}
              />
              <Button
                onClick={handleNext}
                disabled={!formData.suggestion.trim()}
                className="w-full"
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <Step2ContactConfirmation 
                formData={formData}
                setFormData={setFormData}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.preferredContactMethod || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Sugestão"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <UserSuggestions 
        userSuggestions={userSuggestions}
        isLoadingSuggestions={isLoadingSuggestions}
        accountId={formData.accountId}
      />
    </div>
  );
};

export default SuggestionWizard;