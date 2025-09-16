import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Settings, Webhook, ArrowLeft, TestTube } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface N8nConfig {
  webhookUrl: string;
  isEnabled: boolean;
  lastTestResult?: 'success' | 'error';
  lastTestTime?: string;
}

const N8nConfig = () => {
  const [config, setConfig] = useState<N8nConfig>({
    webhookUrl: '',
    isEnabled: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load config from Supabase on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      // Using a default account_id since we don't have auth yet
      const accountId = 'default-account';
      
      const { data, error } = await supabase
        .from('n8n_configs')
        .select('*')
        .eq('account_id', accountId)
        .maybeSingle();

      if (error) {
        console.error('Error loading n8n config:', error);
        return;
      }

      if (data) {
        setConfig({
          webhookUrl: data.webhook_url || '',
          isEnabled: data.is_enabled || false,
          lastTestResult: data.last_test_result as 'success' | 'error' | undefined,
          lastTestTime: data.last_test_time || undefined
        });
      }
    } catch (error) {
      console.error('Error loading n8n config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save config to Supabase
  const saveConfig = async (newConfig: N8nConfig) => {
    try {
      setIsLoading(true);
      // Using a default account_id since we don't have auth yet
      const accountId = 'default-account';
      
      const configData = {
        account_id: accountId,
        webhook_url: newConfig.webhookUrl,
        is_enabled: newConfig.isEnabled,
        last_test_result: newConfig.lastTestResult,
        last_test_time: newConfig.lastTestTime
      };

      const { error } = await supabase
        .from('n8n_configs')
        .upsert(configData, { 
          onConflict: 'account_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error saving n8n config:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar a configuração no banco de dados.",
          variant: "destructive",
        });
        return false;
      }

      setConfig(newConfig);
      toast({
        title: "Configuração salva",
        description: "As configurações do n8n foram salvas com sucesso no banco de dados.",
      });
      return true;
    } catch (error) {
      console.error('Error saving n8n config:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Validate webhook URL
  const isValidUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    } catch {
      return false;
    }
  };

  // Test webhook connection
  const testWebhook = async () => {
    if (!config.webhookUrl || !isValidUrl(config.webhookUrl)) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida para o webhook.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    const testData = {
      type: "test",
      suggestion: "Esta é uma sugestão de teste para validar a conexão com n8n",
      user: {
        name: "Usuário Teste",
        email: "teste@example.com",
        id: "test-user"
      },
      store: {
        id: "test-store",
        phone: "00000000000"
      },
      timestamp: new Date().toISOString(),
      source: "suggestion_box_config_test"
    };

    try {
      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(testData),
      });

      // Due to no-cors mode, we can't read the response status
      // We'll assume success if no error was thrown
      const newConfig = {
        ...config,
        lastTestResult: 'success' as const,
        lastTestTime: new Date().toISOString()
      };
      
      await saveConfig(newConfig);
      
      toast({
        title: "Teste enviado",
        description: "Os dados de teste foram enviados para o n8n. Verifique o histórico do seu workflow para confirmar o recebimento.",
      });
    } catch (error) {
      console.error("Error testing webhook:", error);
      const newConfig = {
        ...config,
        lastTestResult: 'error' as const,
        lastTestTime: new Date().toISOString()
      };
      
      await saveConfig(newConfig);
      
      toast({
        title: "Erro no teste",
        description: "Não foi possível conectar com o webhook. Verifique a URL e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Handle form submission
  const handleSave = async () => {
    if (config.isEnabled && (!config.webhookUrl || !isValidUrl(config.webhookUrl))) {
      toast({
        title: "URL obrigatória",
        description: "Para ativar a integração, é necessário inserir uma URL válida.",
        variant: "destructive",
      });
      return;
    }

    await saveConfig(config);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configuração n8n</h1>
              <p className="text-muted-foreground">Configure a integração com n8n para automatizar suas sugestões</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Configuration Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Configuração do Webhook
              </CardTitle>
              <CardDescription>
                Configure a URL do webhook n8n para receber as sugestões automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL do Webhook n8n</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://your-n8n-instance.com/webhook/suggestions"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                  className="font-mono text-sm"
                />
                {config.webhookUrl && !isValidUrl(config.webhookUrl) && (
                  <p className="text-sm text-destructive">URL inválida</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-n8n">Ativar Integração</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar sugestões automaticamente para o n8n
                  </p>
                </div>
                <Switch
                  id="enable-n8n"
                  checked={config.isEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, isEnabled: checked })}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={testWebhook}
                  variant="outline"
                  size="sm"
                  disabled={isTesting || !config.webhookUrl}
                  className="flex-1"
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Testar Webhook
                </Button>
                <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Status da Integração</CardTitle>
              <CardDescription>
                Informações sobre o estado atual da configuração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={config.isEnabled ? "default" : "secondary"}>
                  {config.isEnabled ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">URL configurada:</span>
                <Badge variant={config.webhookUrl ? "default" : "destructive"}>
                  {config.webhookUrl ? "Sim" : "Não"}
                </Badge>
              </div>

              {config.lastTestTime && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Último teste:</span>
                  <div className="flex items-center gap-2">
                    {config.lastTestResult === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {new Date(config.lastTestTime).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documentation Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Como configurar o n8n</CardTitle>
            <CardDescription>
              Siga estes passos para configurar seu workflow n8n
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <Badge variant="outline" className="shrink-0">1</Badge>
                <div>
                  <p className="font-medium">Crie um novo workflow no n8n</p>
                  <p className="text-sm text-muted-foreground">Acesse sua instância n8n e crie um novo workflow</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Badge variant="outline" className="shrink-0">2</Badge>
                <div>
                  <p className="font-medium">Adicione um nó Webhook</p>
                  <p className="text-sm text-muted-foreground">Configure como trigger do workflow, método POST</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Badge variant="outline" className="shrink-0">3</Badge>
                <div>
                  <p className="font-medium">Copie a URL do webhook</p>
                  <p className="text-sm text-muted-foreground">Cole a URL gerada no campo acima</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Badge variant="outline" className="shrink-0">4</Badge>
                <div>
                  <p className="font-medium">Configure ações do workflow</p>
                  <p className="text-sm text-muted-foreground">Adicione nós para processar as sugestões (email, Slack, CRM, etc.)</p>
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Dados enviados:</strong> O webhook receberá informações da sugestão, dados do usuário, loja e timestamp.
                Use estes dados nos próximos nós do seu workflow.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default N8nConfig;