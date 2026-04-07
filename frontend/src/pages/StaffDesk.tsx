import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import QueryDisplay from "@/components/QueryDisplay";
import { booksApi, borrowApi, membersApi } from "@/lib/api";
import { useMember } from "@/contexts/MemberContext";
import type { Book, PopularBook, BookCopy, Loan } from "@/types/api";

const StaffDesk = () => {
  const navigate = useNavigate();
  const { selectedMember, isLoaded } = useMember();

  // Checkout state
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [availableCopies, setAvailableCopies] = useState<BookCopy[]>([]);
  const [selectedCopyId, setSelectedCopyId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [checkoutMsg, setCheckoutMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Return state - now uses member's active loans
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<string>(""); // borrow_id
  const [returnMsg, setReturnMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loadingLoans, setLoadingLoans] = useState(false);

  // Insights state
  const [popularBooks, setPopularBooks] = useState<PopularBook[]>([]);
  const [popularQuery, setPopularQuery] = useState("");
  const [neverBorrowed, setNeverBorrowed] = useState<Book[]>([]);
  const [neverBorrowedQuery, setNeverBorrowedQuery] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genreCompletionists, setGenreCompletionists] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [divisionQuery, setDivisionQuery] = useState("");

  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [booksRes, popularRes, neverBorrowedRes, genresRes] = await Promise.all([
          booksApi.search(),
          booksApi.getPopular(),
          booksApi.getNeverBorrowed(),
          booksApi.getGenres(),
        ]);
        setBooks(booksRes.books);
        setPopularBooks(popularRes.popular_books);
        setPopularQuery(popularRes.query || "");
        setNeverBorrowed(neverBorrowedRes.books);
        setNeverBorrowedQuery(neverBorrowedRes.query || "");
        setGenres(genresRes.genres);
        if (genresRes.genres.length > 0) {
          setSelectedGenre(genresRes.genres[0]);
        }

        // Set default due date to 14 days from now
        const defaultDue = new Date();
        defaultDue.setDate(defaultDue.getDate() + 14);
        setDueDate(defaultDue.toISOString().split("T")[0]);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load member's active loans when member changes
  useEffect(() => {
    if (!selectedMember) {
      setActiveLoans([]);
      return;
    }
    const loadLoans = async () => {
      setLoadingLoans(true);
      try {
        const res = await borrowApi.getMemberActiveLoans(selectedMember.id);
        setActiveLoans(res.loans);
      } catch (err) {
        console.error("Failed to load active loans:", err);
      } finally {
        setLoadingLoans(false);
      }
    };
    loadLoans();
  }, [selectedMember]);

  // Load available copies when book is selected
  useEffect(() => {
    if (!selectedBookId) {
      setAvailableCopies([]);
      setSelectedCopyId(null);
      return;
    }
    const loadCopies = async () => {
      try {
        const res = await booksApi.getAvailableCopies(selectedBookId);
        setAvailableCopies(res.copies);
        if (res.copies.length > 0) {
          setSelectedCopyId(res.copies[0].copied_book_id);
        }
      } catch (err) {
        console.error("Failed to load copies:", err);
      }
    };
    loadCopies();
  }, [selectedBookId]);

  // Load genre completionists when genre changes
  useEffect(() => {
    if (!selectedGenre) return;
    const loadCompletionists = async () => {
      try {
        const res = await membersApi.getGenreCompletionists(selectedGenre);
        setGenreCompletionists(res.members);
        setDivisionQuery(res.query || "");
      } catch (err) {
        console.error("Failed to load completionists:", err);
      }
    };
    loadCompletionists();
  }, [selectedGenre]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      navigate("/settings");
      return;
    }
    if (!selectedBookId || !selectedCopyId || !dueDate) {
      setCheckoutMsg({ type: "error", text: "Please fill in all fields" });
      return;
    }
    try {
      await borrowApi.checkout({
        member_id: selectedMember.id,
        book_id: selectedBookId,
        copied_book_id: selectedCopyId,
        due_date: dueDate,
      });
      setCheckoutMsg({ type: "success", text: "Book checked out successfully!" });
      // Refresh available copies and member's loans
      const [copiesRes, loansRes] = await Promise.all([
        booksApi.getAvailableCopies(selectedBookId),
        borrowApi.getMemberActiveLoans(selectedMember.id),
      ]);
      setAvailableCopies(copiesRes.copies);
      setActiveLoans(loansRes.loans);
      setSelectedCopyId(copiesRes.copies.length > 0 ? copiesRes.copies[0].copied_book_id : null);
    } catch (err) {
      setCheckoutMsg({ type: "error", text: err instanceof Error ? err.message : "Checkout failed" });
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      navigate("/settings");
      return;
    }
    if (!selectedLoan) {
      setReturnMsg({ type: "error", text: "Please select a book to return" });
      return;
    }
    const loan = activeLoans.find((l) => l.borrow_id === selectedLoan);
    if (!loan) {
      setReturnMsg({ type: "error", text: "Selected loan not found" });
      return;
    }
    try {
      await borrowApi.return({
        book_id: loan.book_id,
        copied_book_id: loan.copied_book_id,
      });
      setReturnMsg({ type: "success", text: "Book returned successfully!" });
      setSelectedLoan("");
      // Refresh member's loans
      const loansRes = await borrowApi.getMemberActiveLoans(selectedMember.id);
      setActiveLoans(loansRes.loans);
    } catch (err) {
      setReturnMsg({ type: "error", text: err instanceof Error ? err.message : "Return failed" });
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNavbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  const noMemberSelected = !selectedMember;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNavbar />
      <div className="max-w-6xl mx-auto px-8 py-10">
        <p className="text-xs font-mono uppercase tracking-wider text-accent mb-2">
          // Staff Operations
        </p>
        <h1 className="font-serif text-4xl font-black mb-8">Staff Desk</h1>

        {/* No member warning */}
        {noMemberSelected && (
          <div className="mb-8 p-4 border border-yellow-500/30 bg-yellow-500/5 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm font-mono text-yellow-500">No member selected</p>
              <p className="text-xs font-mono text-muted-foreground">
                Please{" "}
                <button onClick={() => navigate("/settings")} className="underline hover:text-foreground">
                  select a member
                </button>{" "}
                to checkout or return books.
              </p>
            </div>
          </div>
        )}

        {/* Action Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Checkout */}
          <div className="border border-border p-6">
            <h2 className="font-serif text-xl font-bold mb-1">Checkout Book</h2>
            <p className="text-xs font-mono text-muted-foreground mb-2">
              Process a new book loan
            </p>
            {selectedMember && (
              <p className="text-xs font-mono text-accent mb-4">
                For: {selectedMember.first_name} {selectedMember.last_name}
              </p>
            )}

            {checkoutMsg && (
              <div
                className={`mb-4 px-4 py-3 text-xs font-mono ${
                  checkoutMsg.type === "error"
                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                    : "bg-accent/10 text-accent border border-accent/20"
                }`}
              >
                {checkoutMsg.text}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                  Book
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  disabled={noMemberSelected}
                  className="w-full h-10 px-4 text-sm font-mono bg-background border border-border focus:border-accent outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select a book...</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>
              {selectedBookId && (
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                    Available Copy
                  </label>
                  {availableCopies.length > 0 ? (
                    <select
                      value={selectedCopyId || ""}
                      onChange={(e) => setSelectedCopyId(parseInt(e.target.value))}
                      className="w-full h-10 px-4 text-sm font-mono bg-background border border-border focus:border-accent outline-none cursor-pointer"
                    >
                      {availableCopies.map((c) => (
                        <option key={c.copied_book_id} value={c.copied_book_id}>
                          Copy #{c.copied_book_id} - {c.branch_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="h-10 px-4 flex items-center text-sm font-mono text-destructive border border-border">
                      No copies available
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={noMemberSelected}
                  className="w-full h-10 px-4 text-sm font-mono bg-background border border-border focus:border-accent outline-none disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={noMemberSelected || !selectedBookId || !selectedCopyId}
                className="w-full bg-accent text-accent-foreground py-3 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {noMemberSelected ? "Select Member First" : "Process Checkout"}
              </button>
            </form>
          </div>

          {/* Return */}
          <div className="border border-border p-6">
            <h2 className="font-serif text-xl font-bold mb-1">Return Book</h2>
            <p className="text-xs font-mono text-muted-foreground mb-2">
              Process a book return
            </p>
            {selectedMember && (
              <p className="text-xs font-mono text-accent mb-4">
                For: {selectedMember.first_name} {selectedMember.last_name}
              </p>
            )}

            {returnMsg && (
              <div
                className={`mb-4 px-4 py-3 text-xs font-mono ${
                  returnMsg.type === "error"
                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                    : "bg-accent/10 text-accent border border-accent/20"
                }`}
              >
                {returnMsg.text}
              </div>
            )}

            <form onSubmit={handleReturn} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                  Active Loan
                </label>
                {loadingLoans ? (
                  <div className="h-10 px-4 flex items-center text-sm font-mono text-muted-foreground border border-border">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading loans...
                  </div>
                ) : noMemberSelected ? (
                  <div className="h-10 px-4 flex items-center text-sm font-mono text-muted-foreground border border-border">
                    Select a member first
                  </div>
                ) : activeLoans.length > 0 ? (
                  <select
                    value={selectedLoan}
                    onChange={(e) => setSelectedLoan(e.target.value)}
                    className="w-full h-10 px-4 text-sm font-mono bg-background border border-border focus:border-accent outline-none cursor-pointer"
                  >
                    <option value="">Select a book to return...</option>
                    {activeLoans.map((loan) => (
                      <option key={loan.borrow_id} value={loan.borrow_id}>
                        {loan.book_title} (Due: {new Date(loan.due_date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="h-10 px-4 flex items-center text-sm font-mono text-muted-foreground border border-border">
                    No active loans for this member
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={noMemberSelected || !selectedLoan}
                className="w-full bg-foreground text-background py-3 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {noMemberSelected ? "Select Member First" : "Process Return"}
              </button>
            </form>
          </div>
        </div>

        {/* Insights */}
        <p className="text-xs font-mono uppercase tracking-wider text-accent mb-4">
          // Database Insights
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Most Borrowed */}
          <div className="border border-border p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Nested Query
            </p>
            <h3 className="font-serif text-lg font-bold mb-4">Most Borrowed Books</h3>
            {popularBooks.length > 0 ? (
              <ul className="space-y-3">
                {popularBooks.slice(0, 5).map((book, idx) => (
                  <li key={book.id} className="flex justify-between items-center">
                    <span className="text-sm font-mono">
                      <span className="text-muted-foreground mr-2">#{idx + 1}</span>
                      {book.title}
                    </span>
                    <span className="text-xs font-mono text-accent tabular-nums">
                      {book.borrow_count}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs font-mono text-muted-foreground">No borrow data yet</p>
            )}
            <QueryDisplay query={popularQuery} label="Query" />
          </div>

          {/* Never Borrowed */}
          <div className="border border-border p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Nested Query
            </p>
            <h3 className="font-serif text-lg font-bold mb-4">Never Borrowed</h3>
            {neverBorrowed.length > 0 ? (
              <ul className="space-y-2">
                {neverBorrowed.map((b) => (
                  <li key={b.id} className="text-sm font-mono">
                    {b.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs font-mono text-muted-foreground">All books have been borrowed.</p>
            )}
            <QueryDisplay query={neverBorrowedQuery} label="Query" />
          </div>

          {/* Division */}
          <div className="border border-border p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Division Query
            </p>
            <h3 className="font-serif text-lg font-bold mb-2">Genre Completionists</h3>
            <div className="mb-4">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full h-8 px-2 text-xs font-mono bg-background border border-border focus:border-accent outline-none cursor-pointer"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <p className="text-[10px] font-mono text-muted-foreground mt-2">
                Members who borrowed ALL{" "}
                <span className="text-foreground">{selectedGenre}</span> books
              </p>
            </div>
            {genreCompletionists.length > 0 ? (
              <ul className="space-y-1">
                {genreCompletionists.map((m) => (
                  <li key={m.id} className="text-sm font-mono">
                    {m.first_name} {m.last_name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs font-mono text-muted-foreground">No members qualify.</p>
            )}
            <QueryDisplay query={divisionQuery} label="Query" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDesk;
