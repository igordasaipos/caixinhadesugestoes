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
} from "lucide-react";

type AssuntoPrincipal = "atendimento" | "mal-funcionamento" | "melhorias" | "outros" | null;
type ModuloSistema = string | null;

interface FormData {
  assuntoPrincipal: AssuntoPrincipal;
  moduloSistema: ModuloSistema;
  sugestao: string;
}

const SuggestionBox = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    assuntoPrincipal: null,
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
    setCurrentStep(2);
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
      moduloSistema: null,
      sugestao: "",
    });
    setCurrentStep(1);
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-base md:text-lg font-bold transition-all duration-300 ${
                  currentStep > step
                    ? "bg-[hsl(var(--primary))] text-primary-foreground"
                    : currentStep === step
                    ? "bg-[hsl(var(--primary))] text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step ? (
                  <Check className="w-4 h-4 md:w-6 md:h-6" />
                ) : (
                  step
                )}
              </div>
              {index < 2 && (
                <div
                  className={`w-12 md:w-24 h-1 mx-1 md:mx-2 transition-all duration-300 ${
                    currentStep > step ? "bg-[hsl(var(--primary))]" : "bg-muted"
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
              className="space-y-8"
            >
              <div className="text-center space-y-2 md:space-y-3">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground">
                  Tem sugestões de melhorias para a Saipos?
                  <br className="hidden md:block" />
                  <span className="md:hidden"> </span>
                  Queremos saber!
                </h1>
                <p className="text-base md:text-xl text-muted-foreground">
                  Selecione abaixo o assunto da sua sugestão:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assuntosPrincipais.map((assunto) => {
                  const Icon = assunto.icon;
                  return (
                    <Card
                      key={assunto.id}
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary hover:scale-105"
                      onClick={() => handleAssuntoSelect(assunto.id)}
                    >
                      <CardContent className="p-6 md:p-10 flex flex-col items-center text-center space-y-3 md:space-y-5">
                        <Icon className={`w-12 h-12 md:w-20 md:h-20 ${assunto.color}`} />
                        <h3 className="font-semibold text-base md:text-xl">
                          {assunto.title}
                        </h3>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Etapa 2: Parte do Sistema */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="space-y-8"
            >
              <div className="text-center space-y-2 md:space-y-3">
                <h2 className="text-xl md:text-3xl font-bold text-foreground">
                  Perfeito! Para qual parte do sistema se aplicaria essa solução?
                </h2>
                <p className="text-base md:text-lg text-muted-foreground">
                  Selecione o contexto da sua sugestão:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {modulosSistema.map((modulo) => {
                  const Icon = modulo.icon;
                  return (
                    <Card
                      key={modulo.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 border hover:border-primary hover:scale-105"
                      onClick={() => handleModuloSelect(modulo.id)}
                    >
                      <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                        <Icon className="w-10 h-10 md:w-14 md:h-14 text-primary" />
                        <h3 className="font-semibold text-sm md:text-base leading-tight">
                          {modulo.title}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground leading-snug">
                          {modulo.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  size="lg"
                  className="min-w-[200px]"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
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
              className="space-y-8"
            >
              <div className="text-center space-y-2 md:space-y-3">
                <h2 className="text-xl md:text-3xl font-bold text-foreground">
                  Por favor, deixe a sua sugestão!
                </h2>
                <div className="text-base md:text-lg text-muted-foreground space-y-2">
                  <p>Precisamos de alguns detalhes para entender melhor sua sugestão:</p>
                  <ul className="text-sm md:text-base space-y-1">
                    <li>• Qual problema ou necessidade ela resolve?</li>
                    <li>• Se possível, relate sua última experiência com esse problema.</li>
                  </ul>
                </div>
              </div>

              <Card className="border-2">
                <CardContent className="p-4 md:p-8 space-y-4 md:space-y-6">
                  <div>
                    <label className="text-sm md:text-base font-medium mb-2 md:mb-3 block">
                      Escreva sua sugestão:
                    </label>
                    <Textarea
                      placeholder="Escreva sua sugestão aqui..."
                      value={formData.sugestao}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sugestao: e.target.value,
                        }))
                      }
                      className="min-h-[150px] md:min-h-[200px] text-sm md:text-base"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  size="lg"
                  className="min-w-[180px]"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.sugestao.trim()}
                  size="lg"
                  className="min-w-[180px] bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                >
                  Enviar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Sucesso */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <span className="text-4xl">🎉</span>
                Obrigado pela sua sugestão!
              </DialogTitle>
              <DialogDescription className="text-center text-lg pt-4">
                Nosso time de Produto vai analisar com carinho 💙
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleCloseSuccess}
                size="lg"
                className="min-w-[200px]"
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
