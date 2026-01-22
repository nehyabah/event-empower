import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, Users, Gift } from "lucide-react";

export interface ProjectStatsProps {
  totalTasks?: number;
  completedTasks?: number;
  totalGuests?: number;
  confirmedGuests?: number;
  weddingDate?: Date | undefined;
}

const ProjectStats = ({
  totalTasks = 0,
  completedTasks = 0,
  totalGuests = 0,
  confirmedGuests = 0,
  weddingDate,
}: ProjectStatsProps) => {
  // Calculate days until wedding
  const calculateDaysToEvent = () => {
    if (!weddingDate) return { days: "-", description: "Set your date" };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const wedding = new Date(weddingDate);
    wedding.setHours(0, 0, 0, 0);
    const diffTime = wedding.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { days: "Past", description: "Wedding date has passed" };
    }
    if (diffDays === 0) {
      return { days: "Today!", description: "It's your wedding day!" };
    }

    const formattedDate = wedding.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    return { days: diffDays.toString(), description: `Wedding: ${formattedDate}` };
  };

  const daysInfo = calculateDaysToEvent();
  const taskProgress = totalTasks > 0
    ? `${completedTasks} of ${totalTasks} done`
    : "No tasks yet";
  const guestProgress = totalGuests > 0
    ? `${confirmedGuests} confirmed`
    : "No guests yet";

  const stats = [
    {
      title: "Tasks",
      value: totalTasks.toString(),
      icon: CheckCircle2,
      description: taskProgress,
    },
    {
      title: "Guests",
      value: totalGuests.toString(),
      icon: Users,
      description: guestProgress,
    },
    {
      title: "Days to Event",
      value: daysInfo.days,
      icon: CalendarDays,
      description: daysInfo.description,
    },
    {
      title: "Confirmed",
      value: confirmedGuests.toString(),
      icon: Gift,
      description: totalGuests > 0
        ? `${Math.round((confirmedGuests / totalGuests) * 100)}% of guests`
        : "Awaiting RSVPs",
    },
  ];

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

