import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, Clock, GripVertical } from "lucide-react";
import { Task, useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, useDroppable, useDraggable, DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

interface TaskKanbanProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500 hover:bg-red-600 text-white";
    case "medium":
      return "bg-amber-500 hover:bg-amber-600 text-white";
    case "low":
      return "bg-blue-500 hover:bg-blue-600 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

interface DraggableCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  deleteMutation: any;
  updateMutation: any;
  handleStatusChange: (task: Task, newStatus: string) => void;
}

const DraggableCard = ({ task, onEdit, deleteMutation, updateMutation, handleStatusChange, index }: DraggableCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { task },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 1,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card className="glass-card border-none hover:shadow-lg transition-shadow">
          <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
            <div className="flex gap-2">
              <button 
                className="mt-0.5 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
                aria-label={`Drag task ${task.title}`}
                {...attributes} 
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <div className="space-y-1 pr-2">
                <CardTitle className="text-base font-medium leading-tight">
                  {task.title}
                </CardTitle>
                {task.dueDate && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock className="mr-1 h-3 w-3" />
                    {format(new Date(task.dueDate), "MMM d, yyyy")}
                  </div>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 shrink-0" aria-label="Open actions menu">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Move to...</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup 
                      value={task.status} 
                      onValueChange={(val) => handleStatusChange(task, val)}
                    >
                      <DropdownMenuRadioItem value="todo">To Do</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="in-progress">In Progress</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this task?")) {
                      deleteMutation.mutate(task._id);
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
            {task.description && (
              <p className="line-clamp-2 mt-2">{task.description}</p>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

interface DroppableColumnProps {
  column: { id: string; title: string };
  tasks: Task[];
  children: React.ReactNode;
}

const DroppableColumn = ({ column, tasks, children }: DroppableColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col gap-4 bg-card/10 rounded-xl p-2 transition-colors">
      <div className="flex items-center justify-between pb-2 border-b border-border/50 px-2">
        <h3 className="font-semibold text-lg">{column.title}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <div 
        ref={setNodeRef} 
        className={`flex flex-col gap-4 min-h-[400px] p-2 rounded-lg transition-colors ${isOver ? 'bg-primary/5 border border-primary/20 border-dashed' : ''}`}
      >
        <AnimatePresence>
          {children}
        </AnimatePresence>
      </div>
    </div>
  );
};

export function TaskKanban({ tasks, onEdit }: TaskKanbanProps) {
  const deleteMutation = useDeleteTask();
  const updateMutation = useUpdateTask();
  const queryClient = useQueryClient();

  const columns = [
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "completed", title: "Completed" },
  ];

  const handleStatusChange = (task: Task, newStatus: string) => {
    if (task.status !== newStatus) {
      updateMutation.mutate({ id: task._id, status: newStatus as any });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const newStatus = over.id as "todo" | "in-progress" | "completed";
    const taskData = active.data.current?.task as Task;

    if (taskData && taskData.status !== newStatus) {
      // Optimistic Update
      queryClient.setQueryData(["tasks", undefined], (oldData: Task[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(t => t._id === taskId ? { ...t, status: newStatus } : t);
      });
      // Fire Mutation
      updateMutation.mutate({ id: taskId, status: newStatus });
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
          
          return (
            <DroppableColumn key={column.id} column={column} tasks={columnTasks}>
              {columnTasks.map((task, index) => (
                <DraggableCard 
                  key={task._id} 
                  task={task} 
                  index={index}
                  onEdit={onEdit}
                  deleteMutation={deleteMutation}
                  updateMutation={updateMutation}
                  handleStatusChange={handleStatusChange}
                />
              ))}
            </DroppableColumn>
          );
        })}
      </div>
    </DndContext>
  );
}
