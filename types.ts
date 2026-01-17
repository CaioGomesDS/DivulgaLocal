
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
}

export interface DailyData {
  [dateKey: string]: {
    categories: Category[];
  };
}
