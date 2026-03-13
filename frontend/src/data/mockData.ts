export interface Book {
  book_id: number;
  title: string;
  isbn: string;
  publish_year: number;
  publisher: string;
  genre: string;
  author: string;
  language: string;
  total_copies: number;
  available_copies: number;
}

export interface BookCopy {
  copied_book_id: number;
  book_id: number;
  status: "available" | "borrowed" | "damaged";
}

export interface LibraryMember {
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  phone_number: string;
}

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

export interface Author {
  author_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  bio: string;
}

export interface Loan {
  member_id: number;
  copied_book_id: number;
  book_id: number;
  book_title: string;
  loan_date: string;
  due_date: string;
  return_date: string | null;
}

export const mockBooks: Book[] = [
  { book_id: 1, title: "The Great Gatsby", isbn: "978-0743273565", publish_year: 1925, publisher: "Scribner", genre: "Fiction", author: "F. Scott Fitzgerald", language: "English", total_copies: 5, available_copies: 3 },
  { book_id: 2, title: "To Kill a Mockingbird", isbn: "978-0061120084", publish_year: 1960, publisher: "Harper Perennial", genre: "Fiction", author: "Harper Lee", language: "English", total_copies: 4, available_copies: 1 },
  { book_id: 3, title: "1984", isbn: "978-0451524935", publish_year: 1949, publisher: "Signet Classic", genre: "Dystopian", author: "George Orwell", language: "English", total_copies: 6, available_copies: 4 },
  { book_id: 4, title: "Pride and Prejudice", isbn: "978-0141439518", publish_year: 1813, publisher: "Penguin Classics", genre: "Romance", author: "Jane Austen", language: "English", total_copies: 3, available_copies: 0 },
  { book_id: 5, title: "The Catcher in the Rye", isbn: "978-0316769488", publish_year: 1951, publisher: "Back Bay Books", genre: "Fiction", author: "J.D. Salinger", language: "English", total_copies: 4, available_copies: 2 },
  { book_id: 6, title: "Brave New World", isbn: "978-0060850524", publish_year: 1932, publisher: "Harper Perennial", genre: "Dystopian", author: "Aldous Huxley", language: "English", total_copies: 3, available_copies: 3 },
  { book_id: 7, title: "The Hobbit", isbn: "978-0547928227", publish_year: 1937, publisher: "Mariner Books", genre: "Fantasy", author: "J.R.R. Tolkien", language: "English", total_copies: 5, available_copies: 2 },
  { book_id: 8, title: "Fahrenheit 451", isbn: "978-1451673319", publish_year: 1953, publisher: "Simon & Schuster", genre: "Dystopian", author: "Ray Bradbury", language: "English", total_copies: 3, available_copies: 1 },
  { book_id: 9, title: "Dune", isbn: "978-0441013593", publish_year: 1965, publisher: "Ace", genre: "Sci-Fi", author: "Frank Herbert", language: "English", total_copies: 4, available_copies: 4 },
  { book_id: 10, title: "Crime and Punishment", isbn: "978-0486415871", publish_year: 1866, publisher: "Dover", genre: "Fiction", author: "Fyodor Dostoevsky", language: "English", total_copies: 2, available_copies: 1 },
];

export const mockLoans: Loan[] = [
  { member_id: 1, copied_book_id: 101, book_id: 1, book_title: "The Great Gatsby", loan_date: "2024-10-01", due_date: "2024-10-15", return_date: null },
  { member_id: 1, copied_book_id: 204, book_id: 2, book_title: "To Kill a Mockingbird", loan_date: "2024-10-05", due_date: "2024-10-19", return_date: null },
  { member_id: 1, copied_book_id: 702, book_id: 7, book_title: "The Hobbit", loan_date: "2024-11-01", due_date: "2024-11-15", return_date: null },
  { member_id: 2, copied_book_id: 401, book_id: 4, book_title: "Pride and Prejudice", loan_date: "2024-09-20", due_date: "2024-10-04", return_date: null },
  { member_id: 2, copied_book_id: 802, book_id: 8, book_title: "Fahrenheit 451", loan_date: "2024-10-10", due_date: "2024-10-24", return_date: null },
  { member_id: 3, copied_book_id: 501, book_id: 5, book_title: "The Catcher in the Rye", loan_date: "2024-10-08", due_date: "2024-10-22", return_date: "2024-10-20" },
];

export const mockMembers: LibraryMember[] = [
  { member_id: 1, first_name: "Alice", last_name: "Chen", email: "alice.chen@mail.com", address: "123 Oak St", phone_number: "604-555-0101" },
  { member_id: 2, first_name: "Bob", last_name: "Kumar", email: "bob.kumar@mail.com", address: "456 Elm Ave", phone_number: "604-555-0102" },
  { member_id: 3, first_name: "Clara", last_name: "Jones", email: "clara.j@mail.com", address: "789 Pine Rd", phone_number: "604-555-0103" },
  { member_id: 4, first_name: "David", last_name: "Park", email: "david.park@mail.com", address: "321 Birch Ln", phone_number: "604-555-0104" },
  { member_id: 5, first_name: "Eva", last_name: "Schmidt", email: "eva.s@mail.com", address: "654 Cedar Dr", phone_number: "604-555-0105" },
];

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
