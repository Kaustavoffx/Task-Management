import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 text-primary opacity-80"
        >
          <rect x="20" y="40" width="160" height="120" rx="16" stroke="currentColor" strokeWidth="4" className="stroke-primary/20" />
          <path d="M50 70H150" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="stroke-primary/40" />
          <path d="M50 100H120" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="stroke-primary/40" />
          <path d="M50 130H90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="stroke-primary/40" />
          <circle cx="150" cy="130" r="16" fill="currentColor" className="fill-primary/20" />
          <path d="M142 130L148 136L158 124" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-2xl font-semibold tracking-tight mb-2"
      >
        No tasks found
      </motion.h3>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="text-muted-foreground max-w-sm mb-8"
      >
        You're all caught up! Create a new task to get started and stay productive.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Button onClick={onAdd} size="lg" className="shadow-lg hover:shadow-xl transition-all">
          <Plus className="mr-2 h-5 w-5" /> Add Your First Task
        </Button>
      </motion.div>
    </div>
  );
}
