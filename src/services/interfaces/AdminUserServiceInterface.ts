export type AdminUserListItem = {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'delivery_agent' | 'admin';
  created_at: Date;
};

export interface AdminUserServiceInterface {
  listUsers(): Promise<AdminUserListItem[]>;
  resetPassword(userId: number, password: string): Promise<AdminUserListItem | null>;
}
