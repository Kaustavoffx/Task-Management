import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { type Task, useTasks } from "@/hooks/useTasks";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, Menu, Calendar as CalendarIcon, Settings as SettingsIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useSearchParams, useLocation } from "react-router-dom";
import { TaskTable } from "@/components/TaskTable";
import { TaskKanban } from "@/components/TaskKanban";
import { TaskModal } from "@/components/TaskModal";
import { EmptyState } from "@/components/EmptyState";
import { Sidebar } from "@/components/Sidebar";
import { FilterBar } from "@/components/FilterBar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { viewMode, setViewMode, searchQuery } = useUiStore();
  const queryClient = useQueryClient();
  const socket = useSocket();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const currentView = location.pathname.split("/").pop();

  const MotionButton = motion.create ? motion.create(Button) : motion(Button as any);
  
  // Extract filters from URL and Zustand
  const statusFilter = searchParams.get("status") || undefined;
  const priorityFilter = searchParams.get("priority") || undefined;
  
  const { data: tasks, isLoading } = useTasks({ 
    status: statusFilter, 
    priority: priorityFilter,
    search: searchQuery 
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    const handleTaskUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    const handleTaskDeleted = () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    socket.on("task_created", handleTaskCreated);
    socket.on("task_updated", handleTaskUpdated);
    socket.on("task_deleted", handleTaskDeleted);

    return () => {
      socket.off("task_created", handleTaskCreated);
      socket.off("task_updated", handleTaskUpdated);
      socket.off("task_deleted", handleTaskDeleted);
    };
  }, [socket, queryClient]);

  const handleAddTask = useCallback(() => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  }, []);

  const { completedTasks, totalTasks, progressPercent } = useMemo(() => {
    const completed = tasks?.filter(t => t.status === 'completed').length || 0;
    const total = tasks?.length || 0;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completedTasks: completed, totalTasks: total, progressPercent: percent };
  }, [tasks]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r border-border shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/10 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 shrink-0 transition-colors">
          <div className="flex items-center gap-4 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <span className="font-bold text-lg">Motion Todoist</span>
          </div>

          <div className="hidden md:flex flex-col">
            <h1 className="text-xl font-bold tracking-tight">Task Dashboard</h1>
            <p className="text-xs text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-secondary/30 backdrop-blur-md rounded-lg p-1 mr-2 border border-white/10">
              <MotionButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={`h-8 px-2 min-h-[44px] sm:min-h-[32px] ${viewMode === "table" ? "bg-background/80 shadow-sm" : ""}`}
                aria-label="Switch to table view"
              >
                <List size={16} className="mr-2" />
                Table
              </MotionButton>
              <MotionButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                variant={viewMode === "kanban" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className={`h-8 px-2 min-h-[44px] sm:min-h-[32px] ${viewMode === "kanban" ? "bg-background/80 shadow-sm" : ""}`}
                aria-label="Switch to kanban view"
              >
                <LayoutGrid size={16} className="mr-2" />
                Board
              </MotionButton>
            </div>
            
            <MotionButton 
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddTask} 
              className="gap-2 shadow-sm min-h-[44px] sm:min-h-[36px] border border-white/10"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Task</span>
            </MotionButton>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {currentView === "calendar" ? (
            <div className="flex items-center justify-center h-full">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="glass-card p-12 text-center rounded-3xl max-w-md w-full"
              >
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-primary/50" />
                <h2 className="text-2xl font-bold mb-2">Calendar View</h2>
                <p className="text-muted-foreground">Your schedule will appear here. Coming soon in a future update.</p>
              </motion.div>
            </div>
          ) : currentView === "settings" ? (
            <div className="flex items-center justify-center h-full">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="glass-card p-12 text-center rounded-3xl max-w-md w-full"
              >
                <SettingsIcon className="h-16 w-16 mx-auto mb-4 text-primary/50" />
                <h2 className="text-2xl font-bold mb-2">Settings</h2>
                <p className="text-muted-foreground">Manage your preferences here. Coming soon in a future update.</p>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              
              <FilterBar />

            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                <span>Task Progress</span>
                <span>{completedTasks} of {totalTasks} ({progressPercent}%)</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-primary"
                />
              </div>
            </div>

            <div className="mt-8">
              {isLoading ? (
                <div className="flex justify-center p-12 text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                  Loading tasks...
                </div>
              ) : tasks?.length === 0 ? (
                <EmptyState onAdd={handleAddTask} />
              ) : viewMode === "table" ? (
                <div className="overflow-x-auto pb-4">
                  <TaskTable tasks={tasks || []} onEdit={handleEditTask} />
                </div>
              ) : (
                <TaskKanban tasks={tasks || []} onEdit={handleEditTask} />
              )}
            </div>
          </div>
          )}
        </main>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={taskToEdit} 
      />
    </div>
  );
}
