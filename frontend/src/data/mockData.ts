// Mock data kept for Staff tab (Staff API deferred)

export interface Staff {
  staff_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  branch_id: number;
}

export interface Branch {
  branch_id: number;
  branch_name: string;
  location: string;
}

export const mockStaff: Staff[] = [
  { staff_id: 1, first_name: "Margaret", last_name: "Liu", email: "m.liu@library.org", role: "Manager", branch_id: 1 },
  { staff_id: 2, first_name: "Robert", last_name: "Singh", email: "r.singh@library.org", role: "Librarian", branch_id: 1 },
  { staff_id: 3, first_name: "Sarah", last_name: "Williams", email: "s.williams@library.org", role: "Assistant Manager", branch_id: 2 },
  { staff_id: 4, first_name: "James", last_name: "Brown", email: "j.brown@library.org", role: "Librarian", branch_id: 2 },
  { staff_id: 5, first_name: "Nina", last_name: "Patel", email: "n.patel@library.org", role: "General", branch_id: 3 },
];

export const mockBranches: Branch[] = [
  { branch_id: 1, branch_name: "Central Library", location: "100 Main St, Vancouver" },
  { branch_id: 2, branch_name: "Westside Branch", location: "250 W 4th Ave, Vancouver" },
  { branch_id: 3, branch_name: "Eastside Branch", location: "800 E Hastings St, Vancouver" },
];
