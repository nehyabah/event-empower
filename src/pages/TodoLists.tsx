
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import TodoList from "@/components/todos/TodoList";
import CreateTodoList from "@/components/todos/CreateTodoList";
import { TodoProvider } from "@/context/TodoContext";

const TodoLists = () => {
  const [isCreatingList, setIsCreatingList] = useState(false);

  return (
    <TodoProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-5xl pt-24 pb-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight mb-2">Todo Lists</h1>
            <p className="text-muted-foreground">Create and manage your wedding planning checklists</p>
          </div>

          <div className="flex justify-between items-center mt-8 mb-4">
            <h2 className="text-2xl font-serif">My Lists</h2>
            <Button onClick={() => setIsCreatingList(true)} className="gap-1">
              <Plus size={18} />
              Create New List
            </Button>
          </div>

          {isCreatingList ? (
            <div className="bg-card rounded-lg p-6 shadow-sm mb-8">
              <CreateTodoList onCancel={() => setIsCreatingList(false)} />
            </div>
          ) : null}

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Lists</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <TodoList filter="all" />
            </TabsContent>
            <TabsContent value="active">
              <TodoList filter="active" />
            </TabsContent>
            <TabsContent value="completed">
              <TodoList filter="completed" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TodoProvider>
  );
};

export default TodoLists;
