"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { Task, Volunteer, Booth, Area } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { OdooControlPanel } from "@/components/ui/OdooControlPanel";
import { formatDate } from "@/lib/utils";
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  UserCheck,
  Building,
  Edit2,
  CheckCircle2,
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
    <div className="space-y-3">
      {/* Odoo Control Panel */}
      <OdooControlPanel
        breadcrumb="Campaign"
        title="Field Tasks"
        subtitle="Manage volunteer assignments, door-to-door priorities, and deadlines"
        primaryAction={{
          label: "Create Task",
          onClick: handleOpenAdd,
          icon: <Plus className="w-3.5 h-3.5" />,
        }}
        searchPlaceholder="Search task, volunteer, booth..."
        searchValue={search}
        onSearchChange={setSearch}
        filterComponent={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusTab("all")}
              className={`px-2.5 py-1 rounded-[3px] text-xs font-medium transition-colors ${
                statusTab === "all" ? "bg-[#714B67] text-white" : "bg-white text-[#495057] border border-[#DEE2E6] hover:bg-[#F8F9FA]"
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setStatusTab("pending")}
              className={`px-2.5 py-1 rounded-[3px] text-xs font-medium transition-colors ${
                statusTab === "pending" ? "bg-[#714B67] text-white" : "bg-white text-[#495057] border border-[#DEE2E6] hover:bg-[#F8F9FA]"
              }`}
            >
              Pending ({tasks.filter((t) => t.status === "pending").length})
            </button>
            <button
              onClick={() => setStatusTab("in_progress")}
              className={`px-2.5 py-1 rounded-[3px] text-xs font-medium transition-colors ${
                statusTab === "in_progress" ? "bg-[#714B67] text-white" : "bg-white text-[#495057] border border-[#DEE2E6] hover:bg-[#F8F9FA]"
              }`}
            >
              In Progress ({tasks.filter((t) => t.status === "in_progress").length})
            </button>
            <button
              onClick={() => setStatusTab("completed")}
              className={`px-2.5 py-1 rounded-[3px] text-xs font-medium transition-colors ${
                statusTab === "completed" ? "bg-[#2E7D32] text-white" : "bg-white text-[#495057] border border-[#DEE2E6] hover:bg-[#F8F9FA]"
              }`}
            >
              Completed ({tasks.filter((t) => t.status === "completed").length})
            </button>
          </div>
        }
      />

      {/* Dense Odoo Table for Tasks */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Task Title & Instructions</th>
                <th>Assigned Volunteer</th>
                <th>Target Polling Station</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <p className="font-semibold text-[#212529]">{task.title}</p>
                    {task.description && (
                      <p className="text-[11px] text-[#6C757D] truncate max-w-md">{task.description}</p>
                    )}
                  </td>
                  <td className="text-xs text-[#495057]">
                    <span className="font-medium text-[#212529]">{task.volunteer_name || "Unassigned"}</span>
                  </td>
                  <td className="text-xs text-[#714B67] font-medium">
                    {task.booth_name || "General / Constituency"}
                  </td>
                  <td>
                    <Badge status={task.priority} size="sm" />
                  </td>
                  <td className="text-xs text-[#495057] font-mono">
                    {formatDate(task.due_date)}
                  </td>
                  <td>
                    <Badge status={task.status} size="sm" />
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {task.status !== "completed" ? (
                        <button
                          onClick={() => handleUpdateStatus(task, "completed")}
                          className="px-2 py-0.5 rounded-[3px] bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] font-medium text-[11px] hover:bg-[#C8E6C9]"
                        >
                          Mark Done
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(task, "in_progress")}
                          className="px-2 py-0.5 rounded-[3px] bg-[#F8F9FA] text-[#6C757D] border border-[#DEE2E6] font-medium text-[11px]"
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(task)}
                        className="p-1 rounded hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#212529]"
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-[#6C757D]">
                    No tasks found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? `Edit Task: ${editingTask.title}` : "New Field Task"}
        subtitle="Campaign Task Delegation Sheet"
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Discard
            </Button>
            <Button size="sm" variant="primary" onClick={handleSaveTask}>
              {editingTask ? "Save Changes" : "Assign Task"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveTask} className="space-y-3">
          <Input
            label="Task Summary / Title"
            placeholder="e.g. Canvass Block C Voter List"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Textarea
            label="Field Instructions & Guidelines"
            placeholder="Specific instructions for the ground worker..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Select
              label="Assign Volunteer"
              value={formData.volunteer_id}
              onChange={(e) => setFormData({ ...formData, volunteer_id: e.target.value })}
              options={volunteers.map((v) => ({ value: v.id, label: v.name }))}
            />

            <Select
              label="Target Polling Booth"
              value={formData.booth_id}
              onChange={(e) => setFormData({ ...formData, booth_id: e.target.value })}
              options={booths.map((b) => ({ value: b.id, label: `${b.booth_number} - ${b.booth_name}` }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <Select
              label="Priority Level"
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
              label="Task Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Task["status"] })}
              options={[
                { value: "pending", label: "Pending" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
              ]}
            />

            <Input
              label="Target Due Date"
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
