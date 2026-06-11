
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TaskCardProps {
  title: string;
  assignee: {
    name: string;
    image?: string;
  };
  progress: number;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

const TaskCard = ({ title, assignee, progress, dueDate, priority }: TaskCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="font-medium">{title}</div>
        <Avatar className="h-8 w-8">
          <AvatarImage src={assignee.image} alt={assignee.name} />
          <AvatarFallback>{assignee.name[0]}</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className={getPriorityColor(priority)}>{priority}</span>
            <span className="text-muted-foreground">{dueDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
