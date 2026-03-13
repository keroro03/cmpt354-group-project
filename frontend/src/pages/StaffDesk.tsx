import { useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import { mockBooks, mockLoans } from "@/data/mockData";

const StaffDesk = () => {
  const [checkoutMemberId, setCheckoutMemberId] = useState("");
  const [checkoutCopyId, setCheckoutCopyId] = useState("");
  const [returnCopyId, setReturnCopyId] = useState("");
  const [checkoutMsg, setCheckoutMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [returnMsg, setReturnMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const memberId = parseInt(checkoutMemberId);
    const activeLoans = mockLoans.filter((l) => l.member_id === memberId && !l.return_date);
    if (activeLoans.length >= 5) {
      setCheckoutMsg({ type: "error", text: "Constraint Failed: Member has reached the maximum of 5 active loans." });
    } else {
      setCheckoutMsg({ type: "success", text: `BookCopy #${checkoutCopyId} checked out to Member #${checkoutMemberId}.` });
    }
  };

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    setReturnMsg({ type: "success", text: `BookCopy #${returnCopyId} returned. Status updated to 'available'.` });
  };

  // Insights from mock data
  const borrowCounts: Record<number, number> = {};
  mockLoans.forEach((l) => {
    borrowCounts[l.book_id] = (borrowCounts[l.book_id] || 0) + 1;
  });
  const mostBorrowedId = Object.entries(borrowCounts).sort((a, b) => b[1] - a[1])[0];
  const mostBorrowedBook = mockBooks.find((b) => b.book_id === Number(mostBorrowedId?.[0]));

  const borrowedBookIds = new Set(mockLoans.map((l) => l.book_id));
  const neverBorrowed = mockBooks.filter((b) => !borrowedBookIds.has(b.book_id));

  // Division query mock: members who borrowed all dystopian books
  const dystopianBooks = mockBooks.filter((b) => b.genre === "Dystopian");
  const dystopianIds = new Set(dystopianBooks.map((b) => b.book_id));
  const memberBorrows: Record<number, Set<number>> = {};
  mockLoans.forEach((l) => {
    if (!memberBorrows[l.member_id]) memberBorrows[l.member_id] = new Set();
    memberBorrows[l.member_id].add(l.book_id);
  });
  const genreCompletionists = Object.entries(memberBorrows)
    .filter(([, books]) => [...dystopianIds].every((id) => books.has(id)))
    .map(([id]) => `Member #${id}`);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNavbar />
      <div className="max-w-6xl mx-auto px-8 py-10">
        <p className="text-xs font-mono uppercase tracking-wider text-accent mb-2">
          // Staff Operations
        </p>
        <h1 className="font-serif text-4xl font-black mb-8">Staff Desk</h1>

        {/* Action Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Checkout */}
          <div className="border border-border p-6">
            <h2 className="font-serif text-xl font-bold mb-1">Checkout Book</h2>
            <p className="text-xs font-mono text-muted-foreground mb-6">Process a new book loan</p>

            {checkoutMsg && (
              <div className={`mb-4 px-4 py-3 text-xs font-mono ${
                checkoutMsg.type === "error"
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : "bg-accent/10 text-accent border border-accent/20"
              }`}>
                {checkoutMsg.text}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                  Member ID
                </label>
                <input
                  type="text"
                  value={checkoutMemberId}
                  onChange={(e) => setCheckoutMemberId(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full h-10 px-4 text-sm font-mono bg-background border border-border focus:border-accent outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                  Book Copy ID
                </label>
                <input
                  type="text"
                  value={checkoutCopyId}
                  onChange={(e) => setCheckoutCopyId(e.target.value)}
                  placeholder="e.g. 101"
                  className="w-full h-10 px-4 text-sm font-mono bg-background border border-border focus:border-accent outline-none"
                />
              </div>
              <button type="submit" className="w-full bg-accent text-accent-foreground py-3 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity">
                Process Checkout
              </button>
            </form>
          </div>

          {/* Return */}
          <div className="border border-border p-6">
            <h2 className="font-serif text-xl font-bold mb-1">Return Book</h2>
            <p className="text-xs font-mono text-muted-foreground mb-6">Process a book return</p>

            {returnMsg && (
              <div className={`mb-4 px-4 py-3 text-xs font-mono ${
                returnMsg.type === "error"
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : "bg-accent/10 text-accent border border-accent/20"
              }`}>
                {returnMsg.text}
              </div>
            )}

            <form onSubmit={handleReturn} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                  Book Copy ID
                </label>
                <input
                  type="text"
                  value={returnCopyId}
                  onChange={(e) => setReturnCopyId(e.target.value)}
                  placeholder="e.g. 101"
                  className="w-full h-10 px-4 text-sm font-mono bg-background border border-border focus:border-accent outline-none"
                />
              </div>
              <button type="submit" className="w-full bg-foreground text-background py-3 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity">
                Process Return
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
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Nested Query</p>
            <h3 className="font-serif text-lg font-bold mb-4">Most Borrowed Book</h3>
            {mostBorrowedBook ? (
              <>
                <p className="text-sm font-mono font-bold">{mostBorrowedBook.title}</p>
                <p className="text-xs font-mono text-muted-foreground">{mostBorrowedBook.author}</p>
                <p className="text-2xl font-serif font-black text-accent mt-3 tabular-nums">
                  {mostBorrowedId?.[1]} <span className="text-xs font-mono text-muted-foreground font-normal">loans</span>
                </p>
              </>
            ) : (
              <p className="text-xs font-mono text-muted-foreground">No data</p>
            )}
          </div>

          {/* Never Borrowed */}
          <div className="border border-border p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Nested Query</p>
            <h3 className="font-serif text-lg font-bold mb-4">Never Borrowed</h3>
            {neverBorrowed.length > 0 ? (
              <ul className="space-y-2">
                {neverBorrowed.map((b) => (
                  <li key={b.book_id} className="text-sm font-mono">
                    <span className="text-muted-foreground tabular-nums mr-2">#{b.book_id}</span>
                    {b.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs font-mono text-muted-foreground">All books have been borrowed.</p>
            )}
          </div>

          {/* Division */}
          <div className="border border-border p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Division Query</p>
            <h3 className="font-serif text-lg font-bold mb-2">Genre Completionists</h3>
            <p className="text-[10px] font-mono text-muted-foreground mb-4">
              Members who borrowed all <span className="text-foreground">Dystopian</span> books
            </p>
            {genreCompletionists.length > 0 ? (
              <ul className="space-y-1">
                {genreCompletionists.map((m) => (
                  <li key={m} className="text-sm font-mono">{m}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs font-mono text-muted-foreground">No members qualify.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDesk;
