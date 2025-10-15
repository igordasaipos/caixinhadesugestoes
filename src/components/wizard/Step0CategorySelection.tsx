import { Card, CardContent } from "@/components/ui/card";
import iconAtendimento from "@/assets/icon-atendimento.png";
import iconMalFuncionamento from "@/assets/icon-mal-funcionamento.png";
import iconMelhorias from "@/assets/icon-melhorias.png";
import iconOutros from "@/assets/icon-outros.png";

type Category = "atendimento" | "mal-funcionamento" | "melhorias" | "outros";

interface CategoryOption {
  id: Category;
  title: string;
  image: string;
}

interface Step0CategorySelectionProps {
  selectedCategory: Category | null;
  onCategorySelect: (category: Category) => void;
}

const Step0CategorySelection = ({ selectedCategory, onCategorySelect }: Step0CategorySelectionProps) => {
  const categories: CategoryOption[] = [
    {
      id: "atendimento",
      title: "Atendimento",
      image: iconAtendimento,
    },
    {
      id: "mal-funcionamento",
      title: "Mal funcionamento do sistema",
      image: iconMalFuncionamento,
    },
    {
      id: "melhorias",
      title: "Melhorias do sistema e novas funcionalidades",
      image: iconMelhorias,
    },
    {
      id: "outros",
      title: "Outros",
      image: iconOutros,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          Tem sugestões de melhorias para a Saipos?
        </h2>
        <p className="text-sm text-muted-foreground">
          Selecione o assunto da sua sugestão:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <Card
              key={category.id}
              className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 h-[140px] ${
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3 h-full">
                <img 
                  src={category.image} 
                  alt={category.title} 
                  className="w-12 h-12 object-contain" 
                />
                <h3 className="font-semibold text-sm leading-tight">
                  {category.title}
                </h3>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Step0CategorySelection;
