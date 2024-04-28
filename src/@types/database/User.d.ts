interface User {
  user_id: string;
  email: string;
  password: string;
  full_name: string;
  last_login_ip: string | null;
  last_login_timestamp: string | null;
  password_changed_at: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export default User;
