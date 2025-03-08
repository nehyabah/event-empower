
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CheckSquare, Calendar, Plus, Search, Filter, Clock, ArrowUpDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Task {
  id: string;
  title: string;
  client: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
}

const PlannerTasks = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Sample tasks data
  const initialTasks: Task[] = [
    { id: "1", title: "Confirm catering order", client: "Smith Wedding", dueDate: "Mar 15", status: "pending", priority: "high" },
    { id: "2", title: "Schedule final venue walkthrough", client: "Johnson Wedding", dueDate: "Mar 20", status: "in-progress", priority: "medium" },
    { id: "3", title: "Send welcome packages", client: "Garcia Wedding", dueDate: "Mar 22", status: "completed", priority: "low" },
    { id: "4", title: "Confirm floral arrangements", client: "Smith Wedding", dueDate: "Mar 25", status: "pending", priority: "medium" },
    { id: "5", title: "Review seating arrangements", client: "Johnson Wedding", dueDate: "Mar 28", status: "in-progress", priority: "high" },
    { id: "6", title: "Book transportation", client: "Chen Wedding", dueDate: "Apr 2", status: "pending", priority: "medium" },
    { id: "7", title: "Finalize music playlist", client: "Williams Wedding", dueDate: "Apr 5", status: "completed", priority: "low" },
    { id: "8", title: "Send final timeline to vendors", client: "Garcia Wedding", dueDate: "Apr 8", status: "pending", priority: "high" },
  ];
  
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  
  // Basic auth check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);
  
  // Filter tasks based on search term and completion status
  const filteredTasks = tasks.filter(task => 
    (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     task.client.toLowerCase().includes(searchTerm.toLowerCase())) && 
    (showCompleted || task.status !== "completed")
  );
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-green-500';
      default: return 'text-slate-500';
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': 
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Completed</span>;
      case 'in-progress': 
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">In Progress</span>;
      case 'pending': 
        return <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">Pending</span>;
      default: 
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-serif">Task Management</h1>
            <p className="text-muted-foreground">Track and manage all your wedding planning tasks</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar View
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks or clients..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Show completed:</span>
            <Switch checked={showCompleted} onCheckedChange={setShowCompleted} />
          </div>
        </div>
        
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <Card>
              <CardHeader className="py-4">
                <div className="flex justify-between items-center">
                  <CardTitle>All Tasks</CardTitle>
                  <Button variant="ghost" size="sm">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <div key={task.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium mb-1">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">{task.client}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {getStatusBadge(task.status)}
                            <div className="flex items-center text-sm">
                              <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                              <span className={getPriorityColor(task.priority)}>{task.dueDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No tasks found matching your filters.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Tasks due in the next 7 days...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="overdue">
            <Card>
              <CardHeader>
                <CardTitle>Overdue Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Tasks that are past their due date...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Tasks you've already completed...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PlannerTasks;
