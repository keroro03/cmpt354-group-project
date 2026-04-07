import { useState, useEffect } from "react";
import { Trash2, Plus, Loader2 } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import QueryDisplay from "@/components/QueryDisplay";
import { booksApi, membersApi, branchesApi } from "@/lib/api";
import type { Book, Member, Branch, BookCopy } from "@/types/api";
import { mockStaff, mockBranches as mockBranchesData } from "@/data/mockData";

type Tab = "books" | "members" | "staff" | "branches" | "copies";

const DatabaseManagement = () => {
  const [activeTab, setActiveTab] = useState<Tab>("books");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Data
  const [books, setBooks] = useState<Book[]>([]);
  const [booksQuery, setBooksQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [membersQuery, setMembersQuery] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);

  // Add Member form
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
  });

  // Add Copy form
  const [showAddCopy, setShowAddCopy] = useState(false);
  const [selectedBookForCopy, setSelectedBookForCopy] = useState("");
  const [allCopies, setAllCopies] = useState<BookCopy[]>([]);
  const [copiesQuery, setCopiesQuery] = useState("");
  const [newCopy, setNewCopy] = useState({
    book_id: "",
    copied_book_id: "",
    branch_id: "",
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "books", label: "Books" },
    { key: "members", label: "Members" },
    { key: "copies", label: "Copies" },
    { key: "staff", label: "Staff" },
    { key: "branches", label: "Branches" },
  ];

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [booksRes, membersRes, branchesRes] = await Promise.all([
          booksApi.search(),
          membersApi.getAll(),
          branchesApi.getAll(),
        ]);
        setBooks(booksRes.books);
        setBooksQuery(booksRes.query || "");
        setMembers(membersRes.members);
        setMembersQuery(membersRes.query || "");
        setBranches(branchesRes.branches);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load copies when a book is selected
  useEffect(() => {
    if (!selectedBookForCopy) {
      setAllCopies([]);
      return;
    }
    const loadCopies = async () => {
      try {
        const res = await booksApi.getAllCopies(selectedBookForCopy);
        setAllCopies(res.copies);
        setCopiesQuery(res.query || "");
      } catch (err) {
        console.error("Failed to load copies:", err);
      }
    };
    loadCopies();
  }, [selectedBookForCopy]);

  const handleDeleteBook = async (bookId: string) => {
    try {
      await booksApi.delete(bookId);
      setBooks(books.filter((b) => b.id !== bookId));
      setSuccessMsg("Book deleted successfully");
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete book");
      setSuccessMsg(null);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await membersApi.delete(memberId);
      setMembers(members.filter((m) => m.id !== memberId));
      setSuccessMsg("Member deleted successfully");
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete member");
      setSuccessMsg(null);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await membersApi.create(newMember);
      // Refresh members list
      const res = await membersApi.getAll();
      setMembers(res.members);
      setShowAddMember(false);
      setNewMember({ first_name: "", last_name: "", email: "", phone_number: "", address: "" });
      setSuccessMsg(`Member ${created.first_name} ${created.last_name} added successfully`);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to add member");
      setSuccessMsg(null);
    }
  };

  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await booksApi.addCopy({
        book_id: newCopy.book_id,
        copied_book_id: parseInt(newCopy.copied_book_id),
        branch_id: newCopy.branch_id,
      });
      // Refresh copies if viewing the same book
      if (selectedBookForCopy === newCopy.book_id) {
        const res = await booksApi.getAllCopies(selectedBookForCopy);
        setAllCopies(res.copies);
      }
      setShowAddCopy(false);
      setNewCopy({ book_id: "", copied_book_id: "", branch_id: "" });
      setSuccessMsg("Book copy added successfully");
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to add copy");
      setSuccessMsg(null);
    }
  };

  const handleDeleteCopy = async (bookId: string, copiedBookId: number) => {
    try {
      await booksApi.deleteCopy(bookId, copiedBookId);
      setAllCopies(allCopies.filter((c) => c.copied_book_id !== copiedBookId));
      setSuccessMsg("Copy deleted successfully");
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete copy");
      setSuccessMsg(null);
    }
  };

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNavbar />
      <div className="max-w-6xl mx-auto px-8 py-10">
        <p className="text-xs font-mono uppercase tracking-wider text-accent mb-2">
          // Database Management
        </p>
        <h1 className="font-serif text-4xl font-black mb-8">Entity Tables</h1>

        {/* Tabs */}
        <div className="flex border border-border mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap px-4 ${
                activeTab === tab.key
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 text-xs font-mono bg-destructive/10 text-destructive border border-destructive/20">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 px-4 py-3 text-xs font-mono bg-accent/10 text-accent border border-accent/20">
            {successMsg}
          </div>
        )}

        {/* Tables */}
        <div className="border border-border overflow-x-auto">
          {activeTab === "books" && (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Title</th>
                    <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">ISBN</th>
                    <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Year</th>
                    <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Genre</th>
                    <th className="py-3 px-6 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} className="border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-6 text-sm font-mono font-bold">{book.title}</td>
                      <td className="py-3 px-6 text-xs font-mono tabular-nums text-muted-foreground">{book.isbn || "—"}</td>
                      <td className="py-3 px-6 text-sm font-mono tabular-nums text-muted-foreground">{book.publish_year || "—"}</td>
                      <td className="py-3 px-6">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-border text-muted-foreground">
                          {book.genre || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <QueryDisplay query={booksQuery} label="Books Query" />
            </>
          )}

          {activeTab === "members" && (
            <>
              {/* Add Member Button */}
              <div className="px-6 py-4 border-b border-border flex justify-end">
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider px-4 py-2 bg-accent text-accent-foreground hover:opacity-90"
                >
                  <Plus className="w-4 h-4" /> Add Member
                </button>
              </div>

              {/* Add Member Form */}
              {showAddMember && (
                <form onSubmit={handleAddMember} className="px-6 py-4 border-b border-border bg-secondary/30">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <input
                      type="text"
                      placeholder="First Name *"
                      value={newMember.first_name}
                      onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
                      required
                      className="h-10 px-3 text-sm font-mono bg-background border border-border"
                    />
                    <input
                      type="text"
                      placeholder="Last Name *"
                      value={newMember.last_name}
                      onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })}
                      required
                      className="h-10 px-3 text-sm font-mono bg-background border border-border"
                    />
                    <input
                      type="email"
                      placeholder="Email *"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      required
                      className="h-10 px-3 text-sm font-mono bg-background border border-border"
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={newMember.phone_number}
                      onChange={(e) => setNewMember({ ...newMember, phone_number: e.target.value })}
                      className="h-10 px-3 text-sm font-mono bg-background border border-border"
                    />
                    <button type="submit" className="h-10 bg-foreground text-background text-xs font-mono uppercase">
                      Create
                    </button>
                  </div>
                </form>
              )}

              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Name</th>
                    <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Email</th>
                    <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Phone</th>
                    <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Active / Total</th>
                    <th className="py-3 px-6 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-6 text-sm font-mono font-bold">{member.first_name} {member.last_name}</td>
                      <td className="py-3 px-6 text-sm font-mono text-muted-foreground">{member.email}</td>
                      <td className="py-3 px-6 text-sm font-mono tabular-nums text-muted-foreground">{member.phone_number || "—"}</td>
                      <td className="py-3 px-6 text-sm font-mono tabular-nums">
                        <span className={member.active_loans && member.active_loans > 0 ? "text-accent" : "text-muted-foreground"}>
                          {member.active_loans || 0}
                        </span>
                        <span className="text-muted-foreground"> / {member.total_borrowed || 0}</span>
                      </td>
                      <td className="py-3 px-6">
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <QueryDisplay query={membersQuery} label="Members Query (with aggregation)" />
            </>
          )}

          {activeTab === "copies" && (
            <>
              {/* Book selector and Add Copy button */}
              <div className="px-6 py-4 border-b border-border flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-48">
                  <select
                    value={selectedBookForCopy}
                    onChange={(e) => setSelectedBookForCopy(e.target.value)}
                    className="w-full h-10 px-3 text-sm font-mono bg-background border border-border cursor-pointer"
                  >
                    <option value="">Select a book to view copies...</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowAddCopy(!showAddCopy)}
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider px-4 py-2 bg-accent text-accent-foreground hover:opacity-90"
                >
                  <Plus className="w-4 h-4" /> Add Copy
                </button>
              </div>

              {/* Add Copy Form */}
              {showAddCopy && (
                <form onSubmit={handleAddCopy} className="px-6 py-4 border-b border-border bg-secondary/30">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <select
                      value={newCopy.book_id}
                      onChange={(e) => setNewCopy({ ...newCopy, book_id: e.target.value })}
                      required
                      className="h-10 px-3 text-sm font-mono bg-background border border-border"
                    >
                      <option value="">Select Book *</option>
                      {books.map((b) => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Copy ID *"
                      value={newCopy.copied_book_id}
                      onChange={(e) => setNewCopy({ ...newCopy, copied_book_id: e.target.value })}
                      required
                      className="h-10 px-3 text-sm font-mono bg-background border border-border"
                    />
                    <select
                      value={newCopy.branch_id}
                      onChange={(e) => setNewCopy({ ...newCopy, branch_id: e.target.value })}
                      required
                      className="h-10 px-3 text-sm font-mono bg-background border border-border"
                    >
                      <option value="">Select Branch *</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.branch_name}</option>
                      ))}
                    </select>
                    <button type="submit" className="h-10 bg-foreground text-background text-xs font-mono uppercase">
                      Create
                    </button>
                  </div>
                </form>
              )}

              {selectedBookForCopy ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Copy #</th>
                      <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Branch</th>
                      <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Location</th>
                      <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Status</th>
                      <th className="py-3 px-6 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCopies.map((copy) => (
                      <tr key={copy.copied_book_id} className="border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-6 text-sm font-mono font-bold tabular-nums">{copy.copied_book_id}</td>
                        <td className="py-3 px-6 text-sm font-mono">{copy.branch_name}</td>
                        <td className="py-3 px-6 text-sm font-mono text-muted-foreground">{copy.location}</td>
                        <td className="py-3 px-6">
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                            copy.status === "AVAILABLE" 
                              ? "border-accent/50 text-accent"
                              : copy.status === "LOANED"
                              ? "border-yellow-500/50 text-yellow-600"
                              : "border-destructive/50 text-destructive"
                          }`}>
                            {copy.status}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <button
                            onClick={() => handleDeleteCopy(copy.book_id, copy.copied_book_id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {allCopies.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm font-mono text-muted-foreground">
                          No copies found for this book.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-sm font-mono text-muted-foreground">
                  Select a book above to view its copies.
                </div>
              )}
              <QueryDisplay query={copiesQuery} label="Copies Query" />
            </>
          )}

          {activeTab === "staff" && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">ID</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Name</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Email</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Role</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Branch</th>
                </tr>
              </thead>
              <tbody>
                {mockStaff.map((s) => (
                  <tr key={s.staff_id} className="border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-6 text-sm font-mono tabular-nums text-muted-foreground">{s.staff_id}</td>
                    <td className="py-3 px-6 text-sm font-mono font-bold">{s.first_name} {s.last_name}</td>
                    <td className="py-3 px-6 text-sm font-mono text-muted-foreground">{s.email}</td>
                    <td className="py-3 px-6">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-border text-muted-foreground">
                        {s.role}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm font-mono tabular-nums text-muted-foreground">
                      {mockBranchesData.find((b) => b.branch_id === s.branch_id)?.branch_name || s.branch_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "branches" && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Name</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Location</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-6 text-sm font-mono font-bold">{b.branch_name}</td>
                    <td className="py-3 px-6 text-sm font-mono text-muted-foreground">{b.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseManagement;
