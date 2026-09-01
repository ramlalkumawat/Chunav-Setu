"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { Task } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { CheckSquare, Calendar, Building2, CheckCircle2 } from "lucide-react";

export default function VolunteerTasksPage() {
  const { client, volunteer } = useAuth();
  const { success } = useToast();
  const clientId = client?.id || "client-1";
  const volunteerId = volunteer?.id || "vol-1";

  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = () => {
    setTasks(dbService.getTasks(clientId, volunteerId));
  };

  useEffect(() => {
    loadTasks();
  }, [clientId, volunteerId]);

  const handleToggleDone = (task: Task) => {
    const newStatus = task.status === "completed" ? "in_progress" : "completed";
    dbService.updateTask(clientId, task.id, { status: newStatus });
    success(
      newStatus === "completed" ? "Task Completed" : "Task Reopened",
      task.title
    );
    loadTasks();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#172033]">My Assigned Tasks</h1>
        <p className="text-xs text-[#64748B]">Action items dispatched from Campaign HQ</p>
      </div>

      <div className="space-y-2.5">
        {tasks.map((task) => {
          const isDone = task.status === "completed";
          return (
            <Card
              key={task.id}
              padding="sm"
              className={`transition-all ${isDone ? "opacity-75 bg-[#FAFAF8]" : "bg-white"}`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleDone(task)}
                  className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    isDone
                      ? "bg-[#2F6B4F] border-[#2F6B4F] text-white"
                      : "border-[#CBD5E1] bg-white hover:border-[#1F3A5F]"
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`font-bold text-sm text-[#172033] ${
                        isDone ? "line-through text-[#64748B]" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    <Badge status={task.priority} size="sm" />
                  </div>

                  {task.description && (
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-[#64748B]">
                    {task.booth_name && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{task.booth_name}</span>
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Due: {formatDate(task.due_date)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {tasks.length === 0 && (
          <Card padding="lg" className="text-center py-10">
            <CheckSquare className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-[#172033]">All tasks completed!</p>
            <p className="text-xs text-[#64748B] mt-0.5">Check back later for new campaign assignments.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
