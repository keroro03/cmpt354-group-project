import { useState } from "react";
import { Trash2 } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import { mockBooks, mockMembers, mockStaff, mockBranches, mockLoans } from "@/data/mockData";

type Tab = "books" | "members" | "staff" | "branches";

const DatabaseManagement = () => {
  const [activeTab, setActiveTab] = useState<Tab>("books");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: "books", label: "Books" },
    { key: "members", label: "Members" },
    { key: "staff", label: "Staff" },
    { key: "branches", label: "Branches" },
  ];

  const handleDeleteBook = (bookId: number) => {
    const hasBorrowed = mockLoans.some((l) => l.book_id === bookId && !l.return_date);
    if (hasBorrowed) {
      setErrorMsg(`Referential Integrity Lock: Book #${bookId} has copies currently borrowed. Return all copies before deletion.`);
    } else {
      setErrorMsg(null);
      // Mock success
    }
  };

  const handleDeleteMember = (memberId: number) => {
    const hasActiveLoans = mockLoans.some((l) => l.member_id === memberId && !l.return_date);
    if (hasActiveLoans) {
      setErrorMsg(`Deletion Blocked: Member #${memberId} has active borrowed books. All books must be returned before removal.`);
    } else {
      setErrorMsg(null);
    }
  };

  const activeLoansCount = (memberId: number) =>
    mockLoans.filter((l) => l.member_id === memberId && !l.return_date).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNavbar />
      <div className="max-w-6xl mx-auto px-8 py-10">
        <p className="text-xs font-mono uppercase tracking-wider text-accent mb-2">
          // Database Management
        </p>
        <h1 className="font-serif text-4xl font-black mb-8">Entity Tables</h1>

        {/* Tabs */}
        <div className="flex border border-border mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setErrorMsg(null); }}
              className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeTab === tab.key
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 text-xs font-mono bg-destructive/10 text-destructive border border-destructive/20">
            {errorMsg}
          </div>
        )}

        {/* Tables */}
        <div className="border border-border overflow-x-auto">
          {activeTab === "books" && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Book ID</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Title</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Author</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">ISBN</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Genre</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Copies</th>
                  <th className="py-3 px-6 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {mockBooks.map((book) => (
                  <tr key={book.book_id} className="border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-6 text-sm font-mono tabular-nums text-muted-foreground">{book.book_id}</td>
                    <td className="py-3 px-6 text-sm font-mono font-bold">{book.title}</td>
                    <td className="py-3 px-6 text-sm font-mono text-muted-foreground">{book.author}</td>
                    <td className="py-3 px-6 text-xs font-mono tabular-nums text-muted-foreground">{book.isbn}</td>
                    <td className="py-3 px-6">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-border text-muted-foreground">
                        {book.genre}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm font-mono tabular-nums">
                      {book.available_copies}/{book.total_copies}
                    </td>
                    <td className="py-3 px-6">
                      <button
                        onClick={() => handleDeleteBook(book.book_id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "members" && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">ID</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Name</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Email</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Phone</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Active Loans</th>
                  <th className="py-3 px-6 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {mockMembers.map((member) => {
                  const loans = activeLoansCount(member.member_id);
                  return (
                    <tr key={member.member_id} className="border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-6 text-sm font-mono tabular-nums text-muted-foreground">{member.member_id}</td>
                      <td className="py-3 px-6 text-sm font-mono font-bold">{member.first_name} {member.last_name}</td>
                      <td className="py-3 px-6 text-sm font-mono text-muted-foreground">{member.email}</td>
                      <td className="py-3 px-6 text-sm font-mono tabular-nums text-muted-foreground">{member.phone_number}</td>
                      <td className="py-3 px-6 text-sm font-mono tabular-nums">{loans}</td>
                      <td className="py-3 px-6">
                        <button
                          onClick={() => handleDeleteMember(member.member_id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                      {mockBranches.find((b) => b.branch_id === s.branch_id)?.branch_name || s.branch_id}
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
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">ID</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Name</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 px-6">Location</th>
                </tr>
              </thead>
              <tbody>
                {mockBranches.map((b) => (
                  <tr key={b.branch_id} className="border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-6 text-sm font-mono tabular-nums text-muted-foreground">{b.branch_id}</td>
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
