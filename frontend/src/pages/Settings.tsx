import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Check, User } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import { membersApi } from "@/lib/api";
import { useMember } from "@/contexts/MemberContext";
import type { Member } from "@/types/api";

const Settings = () => {
  const navigate = useNavigate();
  const { selectedMember, setSelectedMember } = useMember();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(selectedMember?.id || "");

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await membersApi.getAll();
        setMembers(res.members);
        if (selectedMember) {
          setSelectedId(selectedMember.id);
        }
      } catch (err) {
        console.error("Failed to load members:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, [selectedMember]);

  const handleSave = () => {
    setSaving(true);
    const member = members.find((m) => m.id === selectedId) || null;
    setSelectedMember(member);
    setTimeout(() => {
      setSaving(false);
      navigate("/member");
    }, 500);
  };

  const handleClear = () => {
    setSelectedMember(null);
    setSelectedId("");
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
      <div className="max-w-2xl mx-auto px-8 py-10">
        <p className="text-xs font-mono uppercase tracking-wider text-accent mb-2">
          // Settings
        </p>
        <h1 className="font-serif text-4xl font-black mb-2">Identity Selection</h1>
        <p className="text-sm font-mono text-muted-foreground mb-8">
          Choose which library member you are acting as. All borrow and return operations will be performed under this identity.
        </p>

        <div className="border border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Currently Acting As
              </p>
              <p className="text-lg font-serif font-bold">
                {selectedMember 
                  ? `${selectedMember.first_name} ${selectedMember.last_name}`
                  : "No member selected"
                }
              </p>
            </div>
          </div>

          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
            Select Member
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full h-12 px-4 text-sm font-mono bg-background border border-border focus:border-accent outline-none cursor-pointer mb-4"
          >
            <option value="">-- Select a member --</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name} — {member.email}
              </option>
            ))}
          </select>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!selectedId || saving}
              className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save Selection
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-3 text-xs font-mono uppercase tracking-wider border border-border hover:bg-secondary transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="border border-border p-6 bg-secondary/20">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Note
          </p>
          <p className="text-sm font-mono text-muted-foreground">
            This setting is stored in your browser and will persist across sessions. 
            You can change your identity at any time by returning to this page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
