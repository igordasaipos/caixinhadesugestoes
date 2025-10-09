import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Headphones,
  AlertTriangle,
  Wrench,
  MoreHorizontal,
  ShoppingCart,
  BarChart3,
  FileText,
  Truck,
  Plug,
  Bot,
  Package,
  MapPin,
  Ellipsis,
  Check,
  ArrowLeft,
  DollarSign,
  GraduationCap,
  Building,
  MessageSquare,
} from "lucide-react";

type AssuntoPrincipal = "atendimento" | "mal-funcionamento" | "melhorias" | "outros" | null;
type ModuloSistema = string | null;
type Step2Type = 'atendimento' | 'sistema' | null;

interface FormData {
  assuntoPrincipal: AssuntoPrincipal;
  areaAtendimento?: string | null;
  moduloSistema?: string | null;
  sugestao: string;
}

const SuggestionBox = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [step2Type, setStep2Type] = useState<Step2Type>(null);
  const [formData, setFormData] = useState<FormData>({
    assuntoPrincipal: null,
    areaAtendimento: null,
    moduloSistema: null,
    sugestao: "",
  });

  // Definição dos assuntos principais
  const assuntosPrincipais = [
    {
      id: "atendimento" as const,
      title: "Atendimento",
      icon: Headphones,
      color: "text-blue-500",
    },
    {
      id: "mal-funcionamento" as const,
      title: "Mal funcionamento do sistema",
      icon: AlertTriangle,
      color: "text-orange-500",
    },
    {
      id: "melhorias" as const,
      title: "Melhorias do sistema e novas funcionalidades",
      icon: Wrench,
      color: "text-purple-500",
    },
    {
      id: "outros" as const,
      title: "Outros",
      icon: MoreHorizontal,
      color: "text-gray-500",
    },
  ];

  // Definição das áreas de atendimento
  const areasAtendimento = [
    {
      id: "suporte",
      title: "Suporte",
      icon: Headphones,
    },
    {
      id: "vendas",
      title: "Vendas",
      icon: DollarSign,
    },
    {
      id: "treinamento",
      title: "Treinamento",
      icon: GraduationCap,
    },
    {
      id: "implantacao",
      title: "Implantação",
      icon: Building,
    },
    {
      id: "canais-contato",
      title: "Canais de Contato",
      icon: MessageSquare,
    },
    {
      id: "outros-atendimento",
      title: "Outros",
      icon: MoreHorizontal,
    },
  ];

  // Definição dos módulos do sistema
  const modulosSistema = [
    {
      id: "pdv",
      title: "Operação de Loja (PDV)",
      description: "Sugestões sobre impressões, KDS, vendas de mesa, ficha e delivery.",
      icon: ShoppingCart,
    },
    {
      id: "retaguarda",
      title: "Retaguarda",
      description: "Relatórios, controle de estoque, financeiro, cadastro de clientes.",
      icon: BarChart3,
    },
    {
      id: "fiscal",
      title: "Fiscal",
      description: "Sugestões sobre códigos fiscais e notas fiscais.",
      icon: FileText,
    },
    {
      id: "cardapio-digital",
      title: "Cardápio Digital Delivery e QRCode",
      description: "Cardápio de delivery Saipos e cardápio digital de mesa.",
      icon: Truck,
    },
    {
      id: "integracoes",
      title: "Integrações",
      description: "iFood, Foody Delivery, Delivery Direto, Delivery Much.",
      icon: Plug,
    },
    {
      id: "saipos-bot",
      title: "Saipos Bot",
      description: "Envio de mensagens, chatbot, automações.",
      icon: Bot,
    },
    {
      id: "cadastro-produtos",
      title: "Cadastro de Produtos / Cardápio",
      description: "Cadastro de produtos, disponibilidades de dias e horários.",
      icon: Package,
    },
    {
      id: "roteirizacao",
      title: "Roteirização",
      description: "Roteirização de pedidos, Saipos Entregador, despacho.",
      icon: MapPin,
    },
    {
      id: "outros-modulo",
      title: "Outros",
      description: "Outros contextos ou novos produtos e funcionalidades.",
      icon: Ellipsis,
    },
  ];

  // Handlers
  const handleAssuntoSelect = (assunto: AssuntoPrincipal) => {
    setFormData((prev) => ({ ...prev, assuntoPrincipal: assunto }));
    
    // Lógica condicional para determinar próximo step
    if (assunto === "atendimento") {
      setStep2Type('atendimento');
      setCurrentStep(2);
    } else if (assunto === "mal-funcionamento" || assunto === "melhorias") {
      setStep2Type('sistema');
      setCurrentStep(2);
    } else if (assunto === "outros") {
      setStep2Type(null);
      setCurrentStep(3); // Pula Step 2
    }
  };

  const handleAreaAtendimentoSelect = (area: string) => {
    setFormData((prev) => ({ ...prev, areaAtendimento: area }));
    setCurrentStep(3);
  };

  const handleModuloSelect = (modulo: string) => {
    setFormData((prev) => ({ ...prev, moduloSistema: modulo }));
    setCurrentStep(3);
  };

  const handleSubmit = () => {
    // Simular envio (sem backend)
    console.log("Sugestão enviada:", formData);
    setShowSuccessModal(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    // Reset form
    setFormData({
      assuntoPrincipal: null,
      areaAtendimento: null,
      moduloSistema: null,
      sugestao: "",
    });
    setCurrentStep(1);
    setStep2Type(null);
  };

  // Animações
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const pageTransition = {
    duration: 0.4,
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-2 md:p-4">
      <div className="w-full max-w-2xl">
        {/* Stepper - Dinâmico e compacto */}
        <div className="flex items-center justify-center mb-4 md:mb-6">
          {(step2Type === null ? [1, 3] : [1, 2, 3]).map((step, index, arr) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold transition-all duration-300 ${
                  currentStep > step
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step ? (
                  <Check className="w-3 h-3 md:w-4 md:h-4" />
                ) : (
                  step2Type === null && step === 3 ? 2 : step
                )}
              </div>
              {index < arr.length - 1 && (
                <div
                  className={`w-8 md:w-16 h-0.5 mx-1 transition-all duration-300 ${
                    currentStep > step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Conteúdo das Etapas */}
        <AnimatePresence mode="wait">
          {/* Etapa 1: Assunto Principal */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="space-y-4 md:space-y-5"
            >
              <div className="text-center space-y-1 md:space-y-2">
                <h1 className="text-lg md:text-2xl font-bold text-foreground">
                  Tem sugestões de melhorias para a Saipos?
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Selecione o assunto da sua sugestão:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {assuntosPrincipais.map((assunto) => {
                  const Icon = assunto.icon;
                  return (
                    <Card
                      key={assunto.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border hover:border-primary hover:scale-[1.02] bg-card"
                      onClick={() => handleAssuntoSelect(assunto.id)}
                    >
                      <CardContent className="p-4 md:p-6 flex flex-col items-center text-center space-y-2 md:space-y-3">
                        <Icon className={`w-8 h-8 md:w-12 md:h-12 ${assunto.color}`} />
                        <h3 className="font-semibold text-sm md:text-base leading-tight">
                          {assunto.title}
                        </h3>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Etapa 2A: Área de Atendimento */}
          {currentStep === 2 && step2Type === 'atendimento' && (
            <motion.div
              key="step2-atendimento"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="space-y-4 md:space-y-5"
            >
              <div className="text-center space-y-1 md:space-y-2">
                <h2 className="text-lg md:text-2xl font-bold text-foreground">
                  Qual área de atendimento?
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Selecione a área relacionada:
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {areasAtendimento.map((area) => {
                  const Icon = area.icon;
                  return (
                    <Card
                      key={area.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-200 border hover:border-primary hover:scale-[1.02] bg-card"
                      onClick={() => handleAreaAtendimentoSelect(area.id)}
                    >
                      <CardContent className="p-3 md:p-4 flex flex-col items-center text-center space-y-2">
                        <Icon className="w-7 h-7 md:w-9 md:h-9 text-primary" />
                        <h3 className="font-medium text-xs md:text-sm">
                          {area.title}
                        </h3>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  size="sm"
                  className="min-w-[140px]"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Voltar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Etapa 2B: Módulo do Sistema */}
          {currentStep === 2 && step2Type === 'sistema' && (
            <motion.div
              key="step2-sistema"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="space-y-4 md:space-y-5"
            >
              <div className="text-center space-y-1 md:space-y-2">
                <h2 className="text-lg md:text-2xl font-bold text-foreground">
                  Para qual parte do sistema?
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Selecione o contexto:
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {modulosSistema.map((modulo) => {
                  const Icon = modulo.icon;
                  return (
                    <Card
                      key={modulo.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-200 border hover:border-primary hover:scale-[1.02] bg-card"
                      onClick={() => handleModuloSelect(modulo.id)}
                    >
                      <CardContent className="p-2.5 md:p-3 space-y-1.5 md:space-y-2">
                        <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        <h3 className="font-medium text-[11px] md:text-xs leading-tight">
                          {modulo.title}
                        </h3>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground leading-snug line-clamp-2">
                          {modulo.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  size="sm"
                  className="min-w-[140px]"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Voltar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Etapa 3: Detalhamento da Sugestão */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="space-y-4 md:space-y-5"
            >
              <div className="text-center space-y-1 md:space-y-2">
                <h2 className="text-lg md:text-2xl font-bold text-foreground">
                  Deixe sua sugestão
                </h2>
                <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                  <p>Conte-nos sobre sua ideia:</p>
                  <ul className="text-[11px] md:text-xs space-y-0.5">
                    <li>• Qual problema ela resolve?</li>
                    <li>• Como melhoraria sua experiência?</li>
                  </ul>
                </div>
              </div>

              <Card className="border bg-card">
                <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
                  <div>
                    <label className="text-xs md:text-sm font-medium mb-1.5 md:mb-2 block">
                      Sua sugestão:
                    </label>
                    <Textarea
                      placeholder="Descreva sua sugestão..."
                      value={formData.sugestao}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sugestao: e.target.value,
                        }))
                      }
                      className="min-h-[120px] md:min-h-[140px] text-xs md:text-sm resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2 md:gap-3 justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(step2Type === null ? 1 : 2)}
                  size="sm"
                  className="min-w-[120px]"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.sugestao.trim()}
                  size="sm"
                  className="min-w-[120px]"
                >
                  Enviar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Sucesso */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl text-center flex items-center justify-center gap-2">
                <span className="text-2xl md:text-3xl">🎉</span>
                Obrigado!
              </DialogTitle>
              <DialogDescription className="text-center text-sm md:text-base pt-2">
                Nosso time vai analisar com carinho 💙
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleCloseSuccess}
                size="sm"
                className="min-w-[140px]"
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SuggestionBox;
