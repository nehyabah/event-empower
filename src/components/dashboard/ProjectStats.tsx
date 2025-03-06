
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, Clock, Users } from "lucide-react";

const stats = [
  {
    title: "Total Tasks",
    value: "12",
    icon: CheckCircle2,
    description: "3 completed this week"
  },
  {
    title: "Team Members",
    value: "6",
    icon: Users,
    description: "Active collaborators"
  },
  {
    title: "Days to Event",
    value: "45",
    icon: CalendarDays,
    description: "Wedding date: Jun 15"
  },
  {
    title: "Hours Planned",
    value: "124",
    icon: Clock,
    description: "Last 30 days"
  }
];

const ProjectStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProjectStats;
