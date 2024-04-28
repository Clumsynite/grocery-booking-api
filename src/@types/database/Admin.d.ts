interface Admin {
  admin_id: string;
  username: string;
  password: string;
  email: string;
  last_login_ip: string | null;
  last_login_timestamp: string | null;
  password_changed_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export default Admin;
