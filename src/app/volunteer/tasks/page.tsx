"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { useLanguage } from "@/lib/i18n";
import { Task } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Calendar, Building, CheckCircle2 } from "lucide-react";

export default function VolunteerTasksPage() {
  const { client, volunteer } = useAuth();
  const { success } = useToast();
  const { t } = useLanguage();
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
        <h1 className="text-xl font-bold text-[#212529]">{t("tasksTitle")}</h1>
        <p className="text-sm text-[#6C757D] mt-0.5">{t("tasksSubtitle")}</p>
      </div>

      <div className="bg-white border border-[#DEE2E6] rounded-[4px] divide-y divide-[#DEE2E6] shadow-none overflow-hidden">
        {tasks.map((task) => {
          const isDone = task.status === "completed";
          return (
            <div
              key={task.id}
              className={`p-4 transition-colors ${isDone ? "bg-[#F8F9FA] opacity-75" : "bg-white"}`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleDone(task)}
                  className={`w-6 h-6 rounded-[3px] border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    isDone
                      ? "bg-[#2E7D32] border-[#2E7D32] text-white"
                      : "border-[#DEE2E6] bg-white hover:border-[#714B67]"
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`font-bold text-[15px] text-[#212529] ${
                        isDone ? "line-through text-[#6C757D]" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    <Badge status={task.priority} size="md" />
                  </div>

                  {task.description && (
                    <p className="text-sm text-[#6C757D] mt-1 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-[#6C757D]">
                    {task.booth_name && (
                      <span className="flex items-center gap-1 font-semibold text-[#714B67]">
                        <Building className="w-3.5 h-3.5" />
                        <span>{task.booth_name}</span>
                      </span>
                    )}

                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{t("dueDate")}: {formatDate(task.due_date)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="text-center py-12 text-sm text-[#6C757D]">
            All field tasks completed!
          </div>
        )}
      </div>
    </div>
  );
}
