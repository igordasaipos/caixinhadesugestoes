import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Store, User, Mail, Phone, Hash, MessageSquare } from "lucide-react";

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
}

interface Step2Props {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

const Step2ContactConfirmation = ({ formData, setFormData }: Step2Props) => {
  const handleContactMethodChange = (method: 'email' | 'whatsapp') => {
    let contactValue = '';
    
    if (method === 'email') {
      contactValue = formData.userEmail;
    } else if (method === 'whatsapp') {
      contactValue = formData.storePhone1;
    }
    
    setFormData(prev => ({
      ...prev,
      preferredContactMethod: method,
      contactValue: contactValue,
      contactWhatsapp: method === 'whatsapp' ? contactValue : ''
    }));
  };

  const handleWhatsappChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      contactWhatsapp: value,
      contactValue: value
    }));
  };

  return (
    <div className="space-y-4">
      {/* Resumo dos dados */}
      <div>
        <h3 className="font-medium mb-3">Confirme seus dados:</h3>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Store className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Loja:</span>
              <span>{formData.visitorId}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">ID:</span>
              <span>{formData.accountId}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Nome:</span>
              <span>{formData.userFullName}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sugestão */}
      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Sua sugestão:
        </h4>
        <div className="p-3 bg-muted/50 rounded-md text-sm">
          {formData.suggestion}
        </div>
      </div>

      {/* Escolha de contato */}
      <div>
        <h4 className="font-medium mb-3">Como você prefere receber atualizações?</h4>
        <div className="space-y-3">
          <Button
            variant={formData.preferredContactMethod === 'email' ? 'default' : 'outline'}
            onClick={() => handleContactMethodChange('email')}
            className="w-full justify-start"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email: {formData.userEmail}
          </Button>
          
          <div className="space-y-2">
            <Button
              variant={formData.preferredContactMethod === 'whatsapp' ? 'default' : 'outline'}
              onClick={() => handleContactMethodChange('whatsapp')}
              className="w-full justify-start"
            >
              <Phone className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            
            {formData.preferredContactMethod === 'whatsapp' && (
              <div className="pl-4">
                <label className="text-sm font-medium mb-1 block">
                  Número do WhatsApp:
                </label>
                <Input
                  placeholder="Ex: 5549992400194"
                  value={formData.contactWhatsapp}
                  onChange={(e) => handleWhatsappChange(e.target.value)}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use o formato: código do país + DDD + número (ex: 5549992400194)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2ContactConfirmation;