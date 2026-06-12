import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Plus, Search } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import TodoList from "@/components/todos/TodoList";
import CreateTodoList from "@/components/todos/CreateTodoList";
import { TodoProvider } from "@/context/TodoContext";

const TodoLists = () => {
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <TodoProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-5xl px-4 pt-20 pb-12">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-serif font-medium tracking-tight mb-1">
              To-Do Lists
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your wedding planning checklists
            </p>
          </div>

          {/* Search and Create */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lists..."
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => setIsCreatingList(true)}
              className="gap-2 shrink-0"
            >
              <Plus size={18} />
              <span>New List</span>
            </Button>
          </div>

          {/* Create List Form */}
          {isCreatingList && (
            <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm border mb-6">
              <CreateTodoList onCancel={() => setIsCreatingList(false)} />
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 w-full sm:w-auto sm:inline-grid mb-6 h-9 p-1 bg-muted/60 rounded-lg">
              <TabsTrigger
                value="all"
                className="text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="private"
                className="text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1"
              >
                <Lock className="h-3 w-3" />
                Private
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Done
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TodoList filter="all" searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="private">
              <TodoList filter="private" searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="active">
              <TodoList filter="active" searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="completed">
              <TodoList filter="completed" searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TodoProvider>
  );
};

export default TodoLists;
