import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface ProgramCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
}

const ProgramCard = ({ id, title, description, category }: ProgramCardProps) => {
  return (
    <Card className="bg-primary text-primary-foreground shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 rounded-2xl border-0">
      <CardHeader>
        <Badge className="w-fit mb-2 bg-secondary text-secondary-foreground" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
          {category}
        </Badge>
        <CardTitle className="text-xl" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-primary-foreground/80" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
          {description}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Link to={`/programs/${id}`} className="w-full">
          <Button variant="secondary" className="w-full rounded-xl" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
            Learn More
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProgramCard;
