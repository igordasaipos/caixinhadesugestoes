import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Store, MessageSquare, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserSuggestion {
  id: string;
  suggestion: string;
  visitor_id: string;
  created_at: string;
}

interface UserSuggestionsProps {
  userSuggestions: UserSuggestion[];
  isLoadingSuggestions: boolean;
  accountId: string;
}

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

const UserSuggestions = ({ userSuggestions, isLoadingSuggestions, accountId }: UserSuggestionsProps) => {
  if (!accountId) return null;

  return (
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
  );
};

export default UserSuggestions;