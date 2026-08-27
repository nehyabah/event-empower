
import { Fragment, useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CheckSquare, Calendar, Plus, Search, Filter, Clock, ArrowUpDown, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePlannerTasks } from "@/hooks/usePlannerTasks";
import { usePlannerClients } from "@/hooks/usePlannerClients";
import { PlannerTask } from "@/services/api/plannerService";

const PlannerTasks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const { tasks, isLoading, error, pendingTasks, inProgressTasks, completedTasks, createTask } = usePlannerTasks();
  const { clients, getClientName } = usePlannerClients();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [taskComments, setTaskComments] = useState<Record<string, { id: string; text: string; createdAt: string }[]>>(() => {
    const stored = localStorage.getItem("plannerTaskComments");
    if (!stored) return {};
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      return {};
    }
    return {};
  });
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [newTask, setNewTask] = useState({
    title: "",
    clientId: "none",
    dueDate: "",
    priority: "medium",
    status: "pending",
    description: "",
  });

  const canSubmit = useMemo(() => newTask.title.trim().length > 0, [newTask.title]);

  // Format date for display
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'No due date';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filter tasks based on search term and completion status
  const filteredTasks = tasks.filter(task =>
    (task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (task.client_name || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (showCompleted || task.status !== "completed")
  );

  // Get overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.due_date || task.status === 'completed') return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  // Get upcoming tasks (due in next 7 days)
  const upcomingTasks = tasks.filter(task => {
    if (!task.due_date || task.status === 'completed') return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const weekFromNow = new Date();
    today.setHours(0, 0, 0, 0);
    weekFromNow.setDate(today.getDate() + 7);
    return dueDate >= today && dueDate <= weekFromNow;
  });

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

  const getNoteItems = (task: PlannerTask) =>
    (task.description || "")
      .split(/\r?\n/)
      .map((note) => note.trim())
      .filter(Boolean);

  useEffect(() => {
    localStorage.setItem("plannerTaskComments", JSON.stringify(taskComments));
  }, [taskComments]);

  const addTaskComment = (taskId: string) => {
    const text = (commentDrafts[taskId] || "").trim();
    if (!text) return;
    const nextComment = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text,
      createdAt: new Date().toISOString(),
    };
    setTaskComments((prev) => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), nextComment],
    }));
    setCommentDrafts((prev) => ({ ...prev, [taskId]: "" }));
  };

  // Task row component
  const TaskRow = ({ task }: { task: PlannerTask }) => {
    const isExpanded = expandedTaskId === task.id;
    const noteItems = getNoteItems(task);
    const comments = taskComments[task.id] || [];
    return (
      <Fragment key={task.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium mb-1">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">{task.client_name || 'No client'}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(task.status)}
                  <div className="flex items-center text-sm">
                    <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                    <span className={getPriorityColor(task.priority)}>{formatDate(task.due_date)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">Click to view comments/notes</TooltipContent>
        </Tooltip>
        {isExpanded && (
          <div className="bg-muted/20 px-4 py-4">
            <div className="text-sm font-medium mb-3">Notes</div>
            {noteItems.length === 0 ? (
              <div className="rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                No notes for this task yet.
              </div>
            ) : (
              <div className="space-y-3">
                {noteItems.map((note, index) => (
                  <div key={`${task.id}-${index}`} className="flex">
                    <div className="rounded-2xl bg-muted/60 px-4 py-2 text-sm text-foreground shadow-sm">
                      {note}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-sm font-medium mt-6 mb-3">Comments</div>
            {comments.length === 0 ? (
              <div className="rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                No comments yet.
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex">
                    <div className="rounded-2xl bg-muted/60 px-4 py-2 text-sm text-foreground shadow-sm">
                      <p className="whitespace-pre-wrap">{comment.text}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Add comment</label>
              <Textarea
                value={commentDrafts[task.id] || ""}
                onChange={(event) =>
                  setCommentDrafts((prev) => ({ ...prev, [task.id]: event.target.value }))
                }
                placeholder="Write a quick update..."
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => addTaskComment(task.id)}
                  disabled={!commentDrafts[task.id]?.trim()}
                >
                  Add Comment
                </Button>
              </div>
            </div>
          </div>
        )}
      </Fragment>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="p-8 text-center bg-red-50 rounded-lg">
            <p className="text-red-600">Error loading tasks: {error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

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
            <Button onClick={() => setIsCreateOpen(true)}>
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

        <TooltipProvider>
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-md h-auto">
            <TabsTrigger className="text-xs sm:text-sm" value="all">All ({tasks.length})</TabsTrigger>
            <TabsTrigger className="text-xs sm:text-sm" value="upcoming">Upcoming ({upcomingTasks.length})</TabsTrigger>
            <TabsTrigger className="text-xs sm:text-sm" value="overdue">Overdue ({overdueTasks.length})</TabsTrigger>
            <TabsTrigger className="text-xs sm:text-sm" value="completed">Done ({completedTasks.length})</TabsTrigger>
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
                      <TaskRow key={task.id} task={task} />
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">
                        {tasks.length === 0 ? "No tasks yet. Create your first task!" : "No tasks found matching your filters."}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader className="py-4">
                <CardTitle>Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {upcomingTasks.length > 0 ? (
                    upcomingTasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No upcoming tasks in the next 7 days.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overdue">
            <Card>
              <CardHeader className="py-4">
                <CardTitle>Overdue Tasks</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {overdueTasks.length > 0 ? (
                    overdueTasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No overdue tasks. Great job!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader className="py-4">
                <CardTitle>Completed Tasks</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {completedTasks.length > 0 ? (
                    completedTasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No completed tasks yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </TooltipProvider>
      </main>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Create new task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Finalize catering quote"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select
                value={newTask.clientId}
                onValueChange={(value) => setNewTask((prev) => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {getClientName(client)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due date</label>
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={newTask.priority}
                onValueChange={(value) => setNewTask((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={newTask.status}
                onValueChange={(value) => setNewTask((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Add task details..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!canSubmit || isSubmitting}
              onClick={async () => {
                if (!canSubmit) return;
                setIsSubmitting(true);
                const created = await createTask({
                  title: newTask.title.trim(),
                  clientId: newTask.clientId !== "none" ? newTask.clientId : undefined,
                  dueDate: newTask.dueDate || undefined,
                  priority: newTask.priority as "low" | "medium" | "high",
                  status: newTask.status as "pending" | "in-progress" | "completed",
                  description: newTask.description.trim() || undefined,
                });
                setIsSubmitting(false);
                if (created) {
                  setIsCreateOpen(false);
                  setNewTask({
                    title: "",
                    clientId: "none",
                    dueDate: "",
                    priority: "medium",
                    status: "pending",
                    description: "",
                  });
                }
              }}
            >
              {isSubmitting ? "Saving..." : "Create task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlannerTasks;
