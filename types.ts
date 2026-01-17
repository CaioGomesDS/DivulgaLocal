
export interface TaskItem {
  id: string;
  label: string;
  completed: boolean;
  text: string;
  images: string;
  tags: string;
}

export interface Category {
  id: string;
  name: string;
  items: TaskItem[];
  active?: boolean;
}

export interface DailyData {
  [dateKey: string]: {
    categories: Category[];
  };
}

export interface SyncState {
  syncId: string;
  lastSync: string | null;
  status: 'idle' | 'syncing' | 'error' | 'success';
}
