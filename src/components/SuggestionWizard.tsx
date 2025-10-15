import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, FileX, AlertCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Step0CategorySelection from "./wizard/Step0CategorySelection";
import Step1SuggestionForm from "./wizard/Step1SuggestionForm";
import Step2ContactConfirmation from "./wizard/Step2ContactConfirmation";
import StepIndicator from "./wizard/StepIndicator";
import UserSuggestions from "./UserSuggestions";

interface FormData {
  category: "atendimento" | "mal-funcionamento" | "melhorias" | "outros" | null;
  suggestion: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  storeId: string;
  storeName: string;
  storePhone: string;
  preferredContactMethod: 'email' | 'whatsapp' | '';
  contactValue: string;
  contactWhatsapp: string;
  contactEmail: string;
}

interface UserSuggestion {
  id: string;
  suggestion: string;
  user_id: string;
  created_at: string;
}

const SuggestionWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    category: null,
    suggestion: "",
    userId: "",
    userFullName: "",
    userEmail: "",
    storeId: "",
    storeName: "",
    storePhone: "",
    preferredContactMethod: '',
    contactValue: "",
    contactWhatsapp: "",
    contactEmail: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { toast } = useToast();

  const getDataFromLocalStorage = () => {
    try {
      console.log("🔍 Fallback: Trying to access localStorage directly...");
      
      const userStorage = localStorage.getItem('ngStorage-user');
      const storeStorage = localStorage.getItem('ngStorage-currentStore');
      
      console.log("📦 LocalStorage contents:", {
        hasUserData: !!userStorage,
        hasStoreData: !!storeStorage
      });

      if (userStorage && storeStorage) {
        const userData = JSON.parse(userStorage);
        const storeData = JSON.parse(storeStorage);
        
        const fallbackData = {
          category: null,
          suggestion: "",
          userId: String(userData.id_user || ''),
          userFullName: userData.full_name || '',
          userEmail: userData.email || '',
          storeId: String(storeData.id_store || ''),
          storeName: storeData.trade_name || '',
          storePhone: storeData.phone_1 || '',
          preferredContactMethod: '' as 'email' | 'whatsapp' | '',
          contactValue: "",
          contactWhatsapp: "",
          contactEmail: "",
        };

        console.log("✅ Fallback data extracted:", fallbackData);
        return fallbackData;
      } else {
        console.log("❌ Required localStorage data not found");
        return null;
      }
    } catch (error) {
      console.error("❌ Error accessing localStorage:", error);
      return null;
    }
  };

  useEffect(() => {
    let dataReceived = false;
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "INIT_SUGGESTION_FORM") {
        dataReceived = true;
        console.log("=== REACT RECEIVED DATA VIA POSTMESSAGE ===");
        console.log("Event data:", event.data);
        
        const newFormData = {
          category: null,
          suggestion: "",
          userId: String(event.data.userId || ''),
          userFullName: event.data.userFullName || '',
          userEmail: event.data.userEmail || '',
          storeId: String(event.data.storeId || ''),
          storeName: event.data.storeName || '',
          storePhone: event.data.storePhone || '',
          preferredContactMethod: '' as 'email' | 'whatsapp' | '',
          contactValue: "",
          contactWhatsapp: "",
          contactEmail: "",
        };
        
        console.log("✅ Setting form data from postMessage:", newFormData);
        setFormData(newFormData);
      }
    };

    // Fallback timer - apenas para desenvolvimento/debug
    const fallbackTimer = setTimeout(() => {
      if (!dataReceived && !formData.userId) {
        console.log("⚠️ No postMessage received after 5 seconds, trying localStorage fallback...");
        
        // Apenas tentar localStorage em desenvolvimento/debug
        if (window.location.hostname === 'localhost' || 
            window.location.search.includes('debug=1') ||
            import.meta.env.MODE === 'development') {
          
          const fallbackData = getDataFromLocalStorage();
          
          if (fallbackData && fallbackData.userId && fallbackData.storeName) {
            console.log("✅ Using fallback data from localStorage (DEV MODE)");
            setFormData(fallbackData);
          } else {
            console.log("🧪 Development environment detected, using test data");
            const testFormData = {
              category: null,
              suggestion: "",
              userId: "88251",
              userFullName: "Igor Nascimento",
              userEmail: "igor.nascimento@saipos.com",
              storeId: "63702",
              storeName: "Loja Teste",
              storePhone: "54992400194",
              preferredContactMethod: '' as 'email' | 'whatsapp' | '',
              contactValue: "",
              contactWhatsapp: "",
              contactEmail: "",
            };
            setFormData(testFormData);
          }
        } else {
          console.log("🚫 Production environment - no test data or localStorage fallback will be used");
          console.log("💡 Check if GTM script is properly sending postMessage with INIT_SUGGESTION_FORM");
        }
      } else if (dataReceived) {
        console.log("✅ Data was received via postMessage - no fallback needed");
      } else if (formData.userId) {
        console.log("✅ Form data already available - no fallback needed");
      }
    }, 5000);

    window.addEventListener("message", handleMessage);
    
    // Sinalizar que estamos prontos
    console.log("📤 Sending READY signal to parent window");
    window.parent?.postMessage({ type: "SUGGESTION_FORM_READY" }, "*");

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const fetchUserSuggestions = async () => {
    if (!formData.userId) {
      console.log("❌ fetchUserSuggestions: No userId available");
      return;
    }
    
    console.log("🔍 fetchUserSuggestions: Starting fetch for userId:", formData.userId);
    setIsLoadingSuggestions(true);
    
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('id, suggestion, user_id, created_at')
        .eq('user_id', formData.userId)
        .order('created_at', { ascending: false });

      console.log("📊 Supabase query result:", { data, error, userId: formData.userId });

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
    console.log("👀 useEffect triggered with userId:", formData.userId);
    if (formData.userId) {
      fetchUserSuggestions();
    } else {
      console.log("⚠️ No userId, clearing suggestions");
      setUserSuggestions([]);
    }
  }, [formData.userId]);

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
    if (!formData.category || !formData.suggestion.trim() || !formData.preferredContactMethod) return;
    
    // Prevenir envio com dados de teste em produção
    if (formData.storeName === "Loja Teste" && 
        window.location.hostname !== 'localhost' && 
        !window.location.search.includes('debug=1') &&
        import.meta.env.MODE !== 'development') {
      console.error("🚫 Cannot submit with test data in production environment");
      toast({
        title: "Erro",
        description: "Dados de teste não podem ser enviados em produção. Recarregue a página.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log("=== SAVING TO SUPABASE ===");
      console.log("Form data before save:", formData);
      
      const categoryLabel = `[${formData.category}]`;
      
      const dataToSave = {
        suggestion: `${categoryLabel} ${formData.suggestion.trim()}`,
        user_id: formData.userId,
        user_full_name: formData.userFullName,
        user_email: formData.userEmail,
        store_id: formData.storeId,
        store_name: formData.storeName,
        store_phone1: formData.storePhone,
        preferred_contact_method: formData.preferredContactMethod,
        contact_value: formData.contactValue,
        contact_whatsapp: formData.contactWhatsapp,
        source: 'webapp'
      };
      
      console.log("Data being saved to Supabase:", dataToSave);

      const { data, error } = await supabase
        .from('suggestions')
        .insert([dataToSave])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("✅ Successfully saved to Supabase:", data);

      // Send to n8n
      const n8nPayload = {
        category: formData.category,
        suggestion: formData.suggestion,
        user: {
          id: formData.userId,
          name: formData.userFullName,
          email: formData.userEmail
        },
        store: {
          id: formData.storeId,
          name: formData.storeName,
          phone: formData.storePhone
        },
        contact_preferences: {
          preferred_method: formData.preferredContactMethod,
          contact_value: formData.contactValue,
          email: formData.userEmail,
          whatsapp: formData.contactWhatsapp
        },
        submission_info: {
          timestamp: new Date().toISOString(),
          source: 'suggestion_box_form'
        }
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
      
      toast({
        title: "Sucesso!",
        description: "Sua sugestão foi enviada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Erro ao enviar sugestão. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (category: "atendimento" | "mal-funcionamento" | "melhorias" | "outros") => {
    setFormData((prev) => ({ ...prev, category }));
    setCurrentStep(2);
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Check if we have any user data
  const hasUserData = formData.userId || formData.userFullName || formData.userEmail;

  // Debug information for production troubleshooting
  const debugInfo = {
    hasUserId: !!formData.userId,
    hasUserName: !!formData.userFullName,
    hasStoreName: !!formData.storeName,
    userIdValue: formData.userId,
    storeNameValue: formData.storeName,
    storeIdValue: formData.storeId,
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname.includes('lovable'),
  };

  // Show debug panel always
  const showDebugInfo = true;

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

            {/* Debug Info Panel */}
            {showDebugInfo && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 text-left">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium mb-2 text-red-700">Debug Information:</p>
                    <div className="text-xs text-red-600 space-y-1">
                      <div>• Has User ID: {debugInfo.hasUserId ? '✅' : '❌'}</div>
                      <div>• Has User Name: {debugInfo.hasUserName ? '✅' : '❌'}</div>
                      <div>• Has Store Name: {debugInfo.hasStoreName ? '✅' : '❌'}</div>
                      <div>• User ID: {debugInfo.userIdValue || 'Vazio'}</div>
                      <div>• Store Name: {debugInfo.storeNameValue || 'Vazio'}</div>
                      <div>• Store ID: {debugInfo.storeIdValue || 'Vazio'}</div>
                      <div>• Environment: {debugInfo.isLocalhost ? 'Development' : 'Production'}</div>
                    </div>
                    <p className="text-xs text-red-600 mt-2">
                      Verifique o console do navegador para mais detalhes sobre localStorage e postMessage.
                    </p>
                  </div>
                </div>
              </div>
            )}
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
              <StepIndicator currentStep={currentStep} totalSteps={3} />
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
              <Step0CategorySelection 
                selectedCategory={formData.category}
                onCategorySelect={handleCategorySelect}
              />
              <Button
                onClick={handleNext}
                disabled={!formData.category}
                className="w-full"
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <Step1SuggestionForm 
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
                  onClick={handleNext}
                  disabled={!formData.suggestion.trim()}
                  className="flex-1"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {currentStep === 3 && (
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
        userId={formData.userId}
      />
    </div>
  );
};

export default SuggestionWizard;