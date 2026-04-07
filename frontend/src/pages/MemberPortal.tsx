import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import QueryDisplay from "@/components/QueryDisplay";
import { booksApi, membersApi } from "@/lib/api";
import type { Book, Member, Loan } from "@/types/api";

const MemberPortal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [booksQuery, setBooksQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [memberLoans, setMemberLoans] = useState<Loan[]>([]);
  const [loansQuery, setLoansQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [booksRes, membersRes] = await Promise.all([
          booksApi.search(),
          membersApi.getAll(),
        ]);
        setBooks(booksRes.books);
        setBooksQuery(booksRes.query || "");
        setMembers(membersRes.members);
        if (membersRes.members.length > 0) {
          setSelectedMemberId(membersRes.members[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load member loans when selected member changes
  useEffect(() => {
    if (!selectedMemberId) return;
    const loadLoans = async () => {
      try {
        const loansRes = await membersApi.getLoans(selectedMemberId, true);
        setMemberLoans(loansRes.loans);
        setLoansQuery(loansRes.query || "");
      } catch (err) {
        console.error("Failed to load loans:", err);
      }
    };
    loadLoans();
  }, [selectedMemberId]);

  // Search books
  useEffect(() => {
    const searchBooks = async () => {
      try {
        const res = await booksApi.search(searchTerm);
        setBooks(res.books);
        setBooksQuery(res.query || "");
      } catch (err) {
        console.error("Search failed:", err);
      }
    };
    const debounce = setTimeout(searchBooks, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNavbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNavbar />
        <div className="max-w-6xl mx-auto px-8 py-10">
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 text-sm font-mono">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

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
                  placeholder="Search by title or author..."
                  className="flex-1 h-12 px-4 text-sm font-mono bg-background outline-none"
                />
              </div>
            </div>

            {/* Results */}
            <div className="border border-border">
              <div className="grid grid-cols-[1fr_auto] gap-4 px-6 py-3 border-b border-border">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Book</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Genre</span>
              </div>
              {books.map((book) => (
                <div
                  key={book.id}
                  className="grid grid-cols-[1fr_auto] gap-4 items-center px-6 py-4 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-mono font-bold">{book.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-muted-foreground">
                        {book.publish_year || "N/A"}
                      </span>
                      {book.isbn && (
                        <span className="text-xs font-mono text-muted-foreground tabular-nums">
                          ISBN: {book.isbn}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono px-2 py-0.5 border border-border text-muted-foreground">
                      {book.genre || "N/A"}
                    </span>
                  </div>
                </div>
              ))}
              {books.length === 0 && (
                <div className="px-6 py-12 text-center text-sm font-mono text-muted-foreground">
                  No books found matching your query.
                </div>
              )}
            </div>

            <QueryDisplay query={booksQuery} label="Search Query" />
          </div>

          {/* Right: My Account */}
          <div>
            {/* Member Selector */}
            <div className="border border-border p-4 mb-6">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                Select Member
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full h-10 px-3 text-sm font-mono bg-background border border-border focus:border-accent outline-none cursor-pointer"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="border border-border p-6 mb-6">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                Account Stats
              </p>
              <div className="text-center mb-4">
                <p className="font-serif text-5xl font-black">{selectedMember?.total_borrowed || 0}</p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                  Total Books Borrowed
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Active Loans</span>
                  <span className="font-bold">{selectedMember?.active_loans || 0}</span>
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
                    key={loan.id}
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

            <QueryDisplay query={loansQuery} label="Loans Query" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPortal;
