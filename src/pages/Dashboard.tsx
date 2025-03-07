import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import TaskCard from "@/components/dashboard/TaskCard";
import ProjectStats from "@/components/dashboard/ProjectStats";
import TaskAssignForm from "@/components/dashboard/TaskAssignForm";
import InvitationGenerator from "@/components/invitations/InvitationGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Initial tasks data
const initialTasks = [
  {
    title: "Book Venue",
    assignee: { name: "Sarah M", image: "" },
    progress: 75,
    dueDate: "Mar 15",
    priority: "high" as const
  },
  {
    title: "Catering Menu",
    assignee: { name: "John D", image: "" },
    progress: 45,
    dueDate: "Mar 20",
    priority: "medium" as const
  },
  {
    title: "Send Invitations",
    assignee: { name: "Emma W", image: "" },
    progress: 30,
    dueDate: "Mar 25",
    priority: "high" as const
  },
  {
    title: "Music Selection",
    assignee: { name: "Michael B", image: "" },
    progress: 60,
    dueDate: "Mar 30",
    priority: "low" as const
  }
];

interface Task {
  title: string;
  assignee: {
    name: string;
    image?: string;
  };
  progress: number;
  dueDate: string;
  priority: "low" | "medium" | "high";
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Basic auth check - replace with your auth logic
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  // Handle new task assignments
  const handleTaskAssigned = (newTask: any) => {
    // Format the task to match our Task interface
    const formattedTask: Task = {
      title: newTask.title,
      assignee: { name: newTask.assignee, image: "" },
      progress: newTask.progress,
      dueDate: formatDate(newTask.dueDate),
      priority: newTask.priority,
    };
    
    setTasks([...tasks, formattedTask]);
  };

  // Simple date formatter to convert YYYY-MM-DD to MMM DD
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle task progress update
  const handleProgressUpdate = (taskTitle: string, newProgress: number) => {
    setTasks(
      tasks.map((task) =>
        task.title === taskTitle ? { ...task, progress: newProgress } : task
      )
    );
    
    toast.success("Progress updated", {
      description: `${taskTitle} is now at ${newProgress}% completion`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-serif mb-2">Wedding Planning Dashboard</h1>
            <p className="text-muted-foreground">Track your wedding planning progress and tasks</p>
          </div>
          
          <ProjectStats />
          
          <Tabs defaultValue="invitations" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="tasks">Planning Tasks</TabsTrigger>
              <TabsTrigger value="invitations">AI Invitations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <h2 className="text-xl font-medium mb-4">Current Tasks</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tasks.map((task) => (
                      <div key={task.title} onClick={() => handleProgressUpdate(task.title, Math.min(100, task.progress + 5))}>
                        <TaskCard {...task} />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-medium mb-4">Manage Tasks</h2>
                  <div className="space-y-4">
                    <TaskAssignForm onTaskAssigned={handleTaskAssigned} />
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Task Tips</h3>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• Click on a task to update progress by 5%</li>
                        <li>• Assign clear deadlines for better tracking</li>
                        <li>• Break large tasks into smaller ones</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="invitations">
              <div className="space-y-4">
                <h2 className="text-xl font-medium mb-4">Create AI-Generated Invitations</h2>
                <p className="text-muted-foreground mb-6">
                  Use our AI to help you create beautiful wedding invitations. Fill in your details and let 
                  the AI generate personalized content for your special day.
                </p>
                <InvitationGenerator />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
