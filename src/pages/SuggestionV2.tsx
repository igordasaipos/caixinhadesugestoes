import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Headphones, AlertTriangle, Wrench, MoreHorizontal, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Category = "atendimento" | "mal-funcionamento" | "melhorias" | "outros" | null;

interface FormData {
  category: Category;
  suggestion: string;
  name: string;
  email: string;
  phone: string;
}

const SuggestionV2 = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    category: null,
    suggestion: "",
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const categories = [
    {
      id: "atendimento" as const,
      title: "ATENDIMENTO",
      icon: Headphones,
      color: "text-blue-500",
    },
    {
      id: "mal-funcionamento" as const,
      title: "MAL FUNCIONAMENTO\nDO SISTEMA",
      icon: AlertTriangle,
      color: "text-orange-500",
    },
    {
      id: "melhorias" as const,
      title: "MELHORIAS DO SISTEMA E\nNOVAS FUNCIONALIDADES",
      icon: Wrench,
      color: "text-purple-500",
    },
    {
      id: "outros" as const,
      title: "OUTROS",
      icon: MoreHorizontal,
      color: "text-gray-500",
    },
  ];

  const handleCategorySelect = (categoryId: Category) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from("suggestions").insert({
        suggestion: `[${formData.category}] ${formData.suggestion}`,
        visitor_id: "v2-flow",
        account_id: "direct-submission",
        user_full_name: formData.name,
        user_email: formData.email,
        store_phone1: formData.phone,
        contact_value: formData.email,
        preferred_contact_method: "email",
      });

      if (error) throw error;

      toast({
        title: "Sugestão enviada!",
        description: "Obrigado pelo seu feedback. Entraremos em contato em breve.",
      });

      // Reset form
      setFormData({
        category: null,
        suggestion: "",
        name: "",
        email: "",
        phone: "",
      });
      setCurrentStep(1);
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar sua sugestão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-colors ${
                  currentStep >= step
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step}
              </div>
              {index < 2 && (
                <div
                  className={`w-24 h-1 mx-2 transition-colors ${
                    currentStep > step ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Category Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">
                Tem sugestões de melhorias para a Saipos?
                <br />
                Queremos saber!
              </h1>
              <p className="text-lg text-muted-foreground">
                Selecione abaixo o assunto da sua sugestão:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                      <Icon className={`w-16 h-16 ${category.color}`} />
                      <h3 className="font-semibold text-lg whitespace-pre-line">
                        {category.title}
                      </h3>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Suggestion Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                Conte-nos mais sobre sua sugestão
              </h2>
              <p className="text-muted-foreground">
                Categoria selecionada: <span className="font-semibold">{formData.category}</span>
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Descreva sua sugestão
                  </label>
                  <Textarea
                    placeholder="Digite aqui os detalhes da sua sugestão..."
                    value={formData.suggestion}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, suggestion: e.target.value }))
                    }
                    className="min-h-[150px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="w-full"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!formData.suggestion.trim()}
                className="w-full"
              >
                Continuar
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Information */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Seus dados de contato</h2>
              <p className="text-muted-foreground">
                Para que possamos retornar sobre sua sugestão
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nome completo</label>
                  <Input
                    placeholder="Ex: João Silva"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">E-mail</label>
                  <Input
                    type="email"
                    placeholder="Ex: joao@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Telefone (opcional)
                  </label>
                  <Input
                    placeholder="Ex: (11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="w-full"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name.trim() || !formData.email.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Enviando..." : "Enviar Sugestão"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionV2;
