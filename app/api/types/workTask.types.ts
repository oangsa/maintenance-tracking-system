export interface IWorkTask {
  id: number;
  workOrderId: number;
  description: string;
  startedAt?: string | null;
  endedAt?: string | null;
  note?: string | null;
  assigneeId?: number | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  assignedById?: number | null;
  assignedByName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IWorkTaskForCreate {
  workOrderId: number;
  description: string;
  startedAt?: string | null;
  endedAt?: string | null;
  note?: string | null;
}

export interface IWorkTaskForUpdate {
  description?: string;
  startedAt?: string | null;
  endedAt?: string | null;
  note?: string | null;
}

export interface IWorkTaskAssignRequest
{
    assigneeId: number;
}

export interface IWorkTaskAssignment
{
    id: number;
    workTaskId: number;
    assigneeId: number | null;
    assigneeName: string | null;
    assigneeEmail: string | null;
    assignedById: number | null;
    assignedByName: string | null;
    assignedAt: string;
    unassignedAt: string | null;
}
