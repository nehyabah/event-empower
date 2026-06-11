import { Card, CardContent } from "@/components/ui/card";
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
  const calculateDaysToEvent = () => {
    if (!weddingDate) return { days: "-", description: "Set your date" };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const wedding = new Date(weddingDate);
    wedding.setHours(0, 0, 0, 0);
    const diffTime = wedding.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { days: "Past", description: "Date passed" };
    }
    if (diffDays === 0) {
      return { days: "Today!", description: "It's the day!" };
    }

    const formattedDate = wedding.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    return { days: diffDays.toString(), description: formattedDate };
  };

  const daysInfo = calculateDaysToEvent();
  const taskProgress = totalTasks > 0
    ? `${completedTasks}/${totalTasks} done`
    : "No tasks";
  const guestProgress = totalGuests > 0
    ? `${confirmedGuests} confirmed`
    : "No guests";

  const stats = [
    {
      title: "Tasks",
      value: totalTasks.toString(),
      icon: CheckCircle2,
      description: taskProgress,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Guests",
      value: totalGuests.toString(),
      icon: Users,
      description: guestProgress,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Days Left",
      value: daysInfo.days,
      icon: CalendarDays,
      description: daysInfo.description,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Confirmed",
      value: confirmedGuests.toString(),
      icon: Gift,
      description: totalGuests > 0
        ? `${Math.round((confirmedGuests / totalGuests) * 100)}%`
        : "Awaiting",
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-0 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
              <div className={`w-7 h-7 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProjectStats;
