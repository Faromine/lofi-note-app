export interface Task {
  id: number;
  text: string;
  completed: boolean;
  seconds: number;
  isActive: boolean;
  isCountdown: boolean;
  date: string;
  last_started_at?: string | null;
  user_id?: string;
}
