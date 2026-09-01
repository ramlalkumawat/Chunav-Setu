"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { Task, Volunteer, Booth, Area } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  UserCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
} from "lucide-react";

export default function TasksPage() {
  const { client, user } = useAuth();
  const { success, error: toastError } = useToast();
  const clientId = client?.id || "client-1";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  const [statusTab, setStatusTab] = useState<"all" | "pending" | "in_progress" | "completed">("all");
  const [search, setSearch] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    volunteer_id: "",
    booth_id: "",
    area_id: "",
    priority: "medium" as Task["priority"],
    due_date: new Date().toISOString().split("T")[0],
    status: "pending" as Task["status"],
  });

  const loadData = () => {
    setTasks(dbService.getTasks(clientId));
    setVolunteers(dbService.getVolunteers(clientId));
    setBooths(dbService.getBooths(clientId));
    setAreas(dbService.getAreas(clientId));
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  const filteredTasks = tasks.filter((t) => {
    const matchesTab = statusTab === "all" || t.status === statusTab;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
      (t.volunteer_name && t.volunteer_name.toLowerCase().includes(search.toLowerCase())) ||
      (t.booth_name && t.booth_name.toLowerCase().includes(search.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      volunteer_id: volunteers[0]?.id || "",
      booth_id: booths[0]?.id || "",
      area_id: areas[0]?.id || "",
      priority: "medium",
      due_date: new Date().toISOString().split("T")[0],
      status: "pending",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      volunteer_id: task.volunteer_id || "",
      booth_id: task.booth_id || "",
      area_id: task.area_id || "",
      priority: task.priority,
      due_date: task.due_date || new Date().toISOString().split("T")[0],
      status: task.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toastError("Validation Error", "Task Title is required.");
      return;
    }

    const selectedVol = volunteers.find((v) => v.id === formData.volunteer_id);
    const selectedBooth = booths.find((b) => b.id === formData.booth_id);
    const selectedArea = areas.find((a) => a.id === formData.area_id);

    if (editingTask) {
      dbService.updateTask(clientId, editingTask.id, {
        ...formData,
        volunteer_name: selectedVol?.name,
        booth_name: selectedBooth ? `${selectedBooth.booth_number} (${selectedBooth.booth_name})` : undefined,
        area_name: selectedArea?.name,
      });
      dbService.logAction(
        { id: user?.id, name: user?.full_name || "Admin" },
        "TASK_UPDATED",
        "Task",
        editingTask.id,
        { title: formData.title, status: formData.status },
        clientId
      );
      success("Task Updated", "Task modifications saved.");
    } else {
      const created = dbService.createTask({
        client_id: clientId,
        campaign_id: "camp-1",
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        volunteer_id: formData.volunteer_id || undefined,
        volunteer_name: selectedVol?.name,
        booth_id: formData.booth_id || undefined,
        booth_name: selectedBooth ? `${selectedBooth.booth_number} (${selectedBooth.booth_name})` : undefined,
        area_id: formData.area_id || undefined,
        area_name: selectedArea?.name,
        priority: formData.priority,
        due_date: formData.due_date,
        status: formData.status,
      });
      dbService.logAction(
        { id: user?.id, name: user?.full_name || "Admin" },
        "TASK_CREATED",
        "Task",
        created.id,
        { title: created.title, volunteer: created.volunteer_name },
        clientId
      );
      success("Task Assigned", `Dispatched task to ${created.volunteer_name || "Field Team"}`);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleUpdateStatus = (task: Task, newStatus: Task["status"]) => {
    dbService.updateTask(clientId, task.id, { status: newStatus });
    success("Status Updated", `Task marked as ${newStatus.replace("_", " ")}`);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Field Tasks & Assignments
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Create, delegate, and monitor door-to-door assignments for volunteers
          </p>
        </div>

        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Create Task
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E5E2DC] rounded-lg text-xs font-semibold">
          <button
            onClick={() => setStatusTab("all")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusTab === "all" ? "bg-[#1F3A5F] text-white" : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setStatusTab("pending")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusTab === "pending" ? "bg-[#1F3A5F] text-white" : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            Pending ({tasks.filter((t) => t.status === "pending").length})
          </button>
          <button
            onClick={() => setStatusTab("in_progress")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusTab === "in_progress" ? "bg-[#1F3A5F] text-white" : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            In Progress ({tasks.filter((t) => t.status === "in_progress").length})
          </button>
          <button
            onClick={() => setStatusTab("completed")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusTab === "completed" ? "bg-[#2F6B4F] text-white" : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            Completed ({tasks.filter((t) => t.status === "completed").length})
          </button>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search task title, volunteer, booth..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} padding="md" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge status={task.priority} size="sm" />
                <Badge status={task.status} size="sm" />
              </div>

              <h3 className="text-sm font-bold text-[#172033] leading-snug">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-[#E5E2DC] space-y-1.5 text-xs text-[#64748B]">
                <div className="flex items-center gap-1.5 font-medium text-[#172033]">
                  <UserCheck className="w-3.5 h-3.5 text-[#1F3A5F]" />
                  <span>Assigned: {task.volunteer_name || "Unassigned"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{task.booth_name || "General Task"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Due: <strong className="text-[#172033]">{formatDate(task.due_date)}</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E2DC] flex items-center justify-between">
              <div className="flex items-center gap-1">
                {task.status !== "completed" ? (
                  <button
                    onClick={() => handleUpdateStatus(task, "completed")}
                    className="px-2.5 py-1 rounded bg-[#EAF3EE] text-[#2F6B4F] border border-[#C3DEC9] font-semibold text-[11px] hover:bg-[#D5EADB]"
                  >
                    Mark Done
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(task, "in_progress")}
                    className="px-2.5 py-1 rounded bg-[#F1F3F5] text-[#64748B] border border-[#E2E8F0] font-semibold text-[11px]"
                  >
                    Reopen
                  </button>
                )}
              </div>

              <button
                onClick={() => handleOpenEdit(task)}
                className="p-1 rounded hover:bg-[#F7F6F2] text-[#64748B] hover:text-[#172033]"
                title="Edit Task"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card padding="lg" className="text-center py-10">
          <CheckSquare className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-50" />
          <p className="text-xs font-semibold text-[#172033]">No tasks found</p>
          <p className="text-xs text-[#64748B] mt-0.5">Click "Create Task" to assign field work.</p>
        </Card>
      )}

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? "Edit Field Task" : "Assign New Field Task"}
        subtitle="Specify task targets, assigned volunteer, booth, and due date"
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveTask}>
              {editingTask ? "Save Changes" : "Assign Task"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveTask} className="space-y-3">
          <Input
            label="Task Title"
            placeholder="e.g. Distribute Voter Slips in Block C"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Textarea
            label="Description & Instructions"
            placeholder="Detailed instructions for volunteer on the ground..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Assign Volunteer"
              value={formData.volunteer_id}
              onChange={(e) => setFormData({ ...formData, volunteer_id: e.target.value })}
              options={volunteers.map((v) => ({ value: v.id, label: v.name }))}
            />

            <Select
              label="Target Booth"
              value={formData.booth_id}
              onChange={(e) => setFormData({ ...formData, booth_id: e.target.value })}
              options={booths.map((b) => ({ value: b.id, label: `${b.booth_number} - ${b.booth_name}` }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task["priority"] })}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Task["status"] })}
              options={[
                { value: "pending", label: "Pending" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
              ]}
            />

            <Input
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
