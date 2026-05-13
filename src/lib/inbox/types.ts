export interface WorkloadItem {
  user_id: string | null;
  name: string;
  email: string | null;
  avatar_url: string | null;
  open_count: number;
  pending_count: number;
}
