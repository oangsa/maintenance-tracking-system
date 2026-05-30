export interface IWorkTask {
  id: number;
  workOrderId: number;
  description: string;
  startedAt?: string | null;
  endedAt?: string | null;
  note?: string | null;
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
