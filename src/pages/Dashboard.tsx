
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import TaskCard from "@/components/dashboard/TaskCard";
import ProjectStats from "@/components/dashboard/ProjectStats";

// Temporary mock data - in a real app, this would come from an API
const tasks = [
  {
    title: "Book Venue",
    assignee: { name: "Sarah M", image: "" },
    progress: 75,
    dueDate: "Mar 15",
    priority: "high"
  },
  {
    title: "Catering Menu",
    assignee: { name: "John D", image: "" },
    progress: 45,
    dueDate: "Mar 20",
    priority: "medium"
  },
  {
    title: "Send Invitations",
    assignee: { name: "Emma W", image: "" },
    progress: 30,
    dueDate: "Mar 25",
    priority: "high"
  },
  {
    title: "Music Selection",
    assignee: { name: "Michael B", image: "" },
    progress: 60,
    dueDate: "Mar 30",
    priority: "low"
  }
] as const;

const Dashboard = () => {
  const navigate = useNavigate();

  // Basic auth check - replace with your auth logic
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-serif mb-2">Wedding Planning Dashboard</h1>
            <p className="text-muted-foreground">Track your wedding planning progress and tasks</p>
          </div>
          
          <ProjectStats />
          
          <div>
            <h2 className="text-xl font-medium mb-4">Current Tasks</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {tasks.map((task) => (
                <TaskCard key={task.title} {...task} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
