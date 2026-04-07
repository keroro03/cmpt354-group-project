import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Member } from "@/types/api";

interface MemberContextType {
  selectedMember: Member | null;
  setSelectedMember: (member: Member | null) => void;
  isLoaded: boolean;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

const STORAGE_KEY = "library_selected_member";

export function MemberProvider({ children }: { children: ReactNode }) {
  const [selectedMember, setSelectedMemberState] = useState<Member | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSelectedMemberState(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when member changes
  const setSelectedMember = (member: Member | null) => {
    setSelectedMemberState(member);
    if (member) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(member));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <MemberContext.Provider value={{ selectedMember, setSelectedMember, isLoaded }}>
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  const context = useContext(MemberContext);
  if (context === undefined) {
    throw new Error("useMember must be used within a MemberProvider");
  }
  return context;
}
