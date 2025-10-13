import { Card } from "@/components/ui/card";

interface ImpactStatProps {
  value: string;
  label: string;
}

const ImpactStat = ({ value, label }: ImpactStatProps) => {
  return (
    <Card className="bg-primary text-primary-foreground p-8 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border-0 text-center">
      <div className="text-4xl md:text-5xl font-bold mb-2">{value}</div>
      <div className="text-sm md:text-base opacity-90">{label}</div>
    </Card>
  );
};

export default ImpactStat;
