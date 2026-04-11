// API response types matching the Flask backend

export interface Book {
  id: string;
  title: string;
  isbn: string | null;
  publish_year: number | null;
  publisher: string | null;
  genre: string | null;
}

export interface BookCopy {
  book_id: string;
  copied_book_id: number;
  branch_id: string;
  status: "AVAILABLE" | "LOANED" | "LOST" | "DAMAGED" | "MAINTENANCE";
  branch_name: string;
  location: string;
}

export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  active_loans?: number;
  total_borrowed?: number;
}

export interface Branch {
  id: string;
  branch_name: string;
  location: string;
}

export interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  branch_id: string;
}

export interface Author {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  biography: string | null;
}

export interface Loan {
  id: string;
  member_id: string;
  book_id: string;
  copied_book_id: number;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  book_title?: string;
  branch_name?: string;
  borrow_id: string;
}

export interface PopularBook {
  id: string;
  title: string;
  borrow_count: number;
}

export interface BorrowStats {
  member_id: string;
  first_name: string;
  last_name: string;
  total_borrowed: number;
  active_loans: number;
  overdue_count: number;
}

// API Response wrappers (include query for display)
export interface ApiResponse<T> {
  query?: string;
}

export interface BooksResponse extends ApiResponse<Book[]> {
  books: Book[];
}

export interface CopiesResponse extends ApiResponse<BookCopy[]> {
  copies: BookCopy[];
}

export interface MembersResponse extends ApiResponse<Member[]> {
  members: Member[];
}

export interface BranchesResponse extends ApiResponse<Branch[]> {
  branches: Branch[];
}

export interface StaffResponse extends ApiResponse<Staff[]> {
  staffs: Staff[];
}

export interface AuthorsResponse extends ApiResponse<Author[]> {
  authors: Author[];
}

export interface LoansResponse extends ApiResponse<Loan[]> {
  loans: Loan[];
}

export interface OverdueLoansResponse extends ApiResponse<Loan[]> {
  overdue_loans: Loan[];
}

export interface PopularBooksResponse extends ApiResponse<PopularBook[]> {
  popular_books: PopularBook[];
}

export interface GenresResponse extends ApiResponse<string[]> {
  genres: string[];
}

export interface GenreCompletionistsResponse extends ApiResponse<Member[]> {
  members: Member[];
  genre: string;
}

export interface BorrowStatsResponse extends ApiResponse<BorrowStats[]> {
  stats: BorrowStats[];
}

export interface ErrorResponse {
  error: string;
}
