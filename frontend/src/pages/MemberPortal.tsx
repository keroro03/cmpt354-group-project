import { useState } from "react";
import { Search } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import { mockBooks, mockLoans } from "@/data/mockData";

const MemberPortal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState<"title" | "author" | "genre" | "book_id">("title");

  // Simulate current member = member_id 1
  const currentMemberId = 1;
  const memberLoans = mockLoans.filter((l) => l.member_id === currentMemberId && !l.return_date);
  const totalBorrowed = mockLoans.filter((l) => l.member_id === currentMemberId).length;

  const filteredBooks = mockBooks.filter((book) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    switch (searchFilter) {
      case "title": return book.title.toLowerCase().includes(term);
      case "author": return book.author.toLowerCase().includes(term);
      case "genre": return book.genre.toLowerCase().includes(term);
      case "book_id": return book.book_id.toString().includes(term);
      default: return true;
    }
  });

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNavbar />
      <div className="max-w-6xl mx-auto px-8 py-10">
        <p className="text-xs font-mono uppercase tracking-wider text-accent mb-2">
          // Member Portal
        </p>
        <h1 className="font-serif text-4xl font-black mb-8">Book Catalog</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Search + Results */}
          <div className="lg:col-span-2">
            {/* Search */}
            <div className="border border-border mb-6">
              <div className="flex">
                <div className="flex items-center px-4 border-r border-border">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search by ${searchFilter}...`}
                  className="flex-1 h-12 px-4 text-sm font-mono bg-background outline-none"
                />
                <select
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value as typeof searchFilter)}
                  className="h-12 px-4 text-xs font-mono uppercase bg-background border-l border-border outline-none cursor-pointer"
                >
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                  <option value="genre">Genre</option>
                  <option value="book_id">Book ID</option>
                </select>
              </div>
            </div>

            {/* Results */}
            <div className="border border-border">
              <div className="grid grid-cols-[1fr_auto] gap-4 px-6 py-3 border-b border-border">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Book</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Availability</span>
              </div>
              {filteredBooks.map((book) => (
                <div
                  key={book.book_id}
                  className="grid grid-cols-[1fr_auto] gap-4 items-center px-6 py-4 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-mono font-bold">{book.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 border border-border text-muted-foreground">
                        {book.genre}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-muted-foreground">{book.author}</span>
                      <span className="text-xs font-mono text-muted-foreground tabular-nums">ISBN: {book.isbn}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-mono font-bold tabular-nums ${
                        book.available_copies === 0 ? "text-destructive" : "text-accent"
                      }`}
                    >
                      {book.available_copies}/{book.total_copies}
                    </span>
                    <p className="text-[10px] font-mono uppercase text-muted-foreground">Available</p>
                  </div>
                </div>
              ))}
              {filteredBooks.length === 0 && (
                <div className="px-6 py-12 text-center text-sm font-mono text-muted-foreground">
                  No books found matching your query.
                </div>
              )}
            </div>
          </div>

          {/* Right: My Account */}
          <div>
            <div className="border border-border p-6 mb-6">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                Account Stats
              </p>
              <div className="text-center mb-4">
                <p className="font-serif text-5xl font-black">{totalBorrowed}</p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                  Total Books Borrowed
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Active Loans</span>
                  <span className="font-bold">{memberLoans.length}</span>
                </div>
              </div>
            </div>

            <div className="border border-border">
              <div className="px-6 py-3 border-b border-border">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Active Loans
                </p>
              </div>
              {memberLoans.map((loan) => {
                const overdue = isOverdue(loan.due_date);
                return (
                  <div
                    key={loan.copied_book_id}
                    className={`px-6 py-4 border-b border-border last:border-b-0 ${
                      overdue ? "bg-destructive/5" : ""
                    }`}
                  >
                    <p className="text-sm font-mono font-bold mb-1">{loan.book_title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground tabular-nums">
                        Due: {new Date(loan.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 ${
                          overdue
                            ? "bg-destructive/10 text-destructive"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {overdue ? "Overdue" : "Active"}
                      </span>
                    </div>
                  </div>
                );
              })}
              {memberLoans.length === 0 && (
                <div className="px-6 py-8 text-center text-xs font-mono text-muted-foreground">
                  No active loans.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPortal;
