import type {
  BooksResponse,
  CopiesResponse,
  MembersResponse,
  BranchesResponse,
  StaffResponse,
  AuthorsResponse,
  LoansResponse,
  OverdueLoansResponse,
  PopularBooksResponse,
  GenresResponse,
  GenreCompletionistsResponse,
  BorrowStatsResponse,
  Member,
} from "@/types/api";

const API_BASE = "http://localhost:8000";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

// Books API
export const booksApi = {
  search: (query?: string) =>
    fetchApi<BooksResponse>(`/books${query ? `?q=${encodeURIComponent(query)}` : ""}`),

  getById: (bookId: string) =>
    fetchApi<BooksResponse>(`/books?book_id=${bookId}`),

  getAvailableCopies: (bookId: string) =>
    fetchApi<CopiesResponse>(`/books/${bookId}/copies`),

  getAllCopies: (bookId: string) =>
    fetchApi<CopiesResponse>(`/books/${bookId}/copies/all`),

  getPopular: () => fetchApi<PopularBooksResponse>("/books/popular"),

  getNeverBorrowed: () => fetchApi<BooksResponse>("/books/never-borrowed"),

  getGenres: () => fetchApi<GenresResponse>("/books/genres"),

  delete: (bookId: string) =>
    fetchApi<{ message: string }>(`/books/${bookId}`, { method: "DELETE" }),

  addCopy: (data: { book_id: string; copied_book_id: number; branch_id: string }) =>
    fetchApi<{ message: string; ids: [string, number] }>("/books/copies", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteCopy: (bookId: string, copiedBookId: number) =>
    fetchApi<{ message: string }>(`/books/copies/${bookId}/${copiedBookId}`, {
      method: "DELETE",
    }),
};

// Members API
export const membersApi = {
  getAll: () => fetchApi<MembersResponse>("/members"),

  create: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    address?: string;
  }) =>
    fetchApi<Member>("/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (memberId: string) =>
    fetchApi<{ message: string }>(`/members/${memberId}`, { method: "DELETE" }),

  getLoans: (memberId: string, activeOnly = false) =>
    fetchApi<LoansResponse>(`/members/${memberId}/loans?active=${activeOnly}`),

  getOverdueLoans: (memberId: string) =>
    fetchApi<OverdueLoansResponse>(`/members/${memberId}/overdue`),

  getGenreCompletionists: (genre: string) =>
    fetchApi<GenreCompletionistsResponse>(
      `/members/genre-completionists?genre=${encodeURIComponent(genre)}`
    ),
};

// Borrow API
export const borrowApi = {
  checkout: (data: {
    member_id: string;
    book_id: string;
    copied_book_id: number;
    due_date: string;
  }) =>
    fetchApi<{ message: string; borrow_id: string }>("/borrow", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  return: (data: { book_id: string; copied_book_id: number }) =>
    fetchApi<{ message: string }>("/borrow/return", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getStats: () => fetchApi<BorrowStatsResponse>("/borrow/stats"),

  getMemberActiveLoans: (memberId: string) =>
    fetchApi<LoansResponse>(`/borrow/member/${memberId}/active`),
};

// Branches API
export const branchesApi = {
  getAll: () => fetchApi<BranchesResponse>("/branches"),
};

// Staff API
export const staffApi = {
  getAll: () => fetchApi<StaffResponse>("/staffs"),
};
// Authors API
export const authorsApi = {
  getAll: () => fetchApi<AuthorsResponse>("/authors"),
};

