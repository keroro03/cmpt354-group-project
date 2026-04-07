import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, User, Settings } from "lucide-react";
import { useMember } from "@/contexts/MemberContext";

const AppNavbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { selectedMember, isLoaded } = useMember();

  const links = [
    { path: "/member", label: "Catalog" },
    { path: "/staff/desk", label: "Staff Desk" },
    { path: "/staff/manage", label: "Management" },
  ];

  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 py-4 bg-background border-b border-border relative">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-sm font-mono tracking-tight">【LIB_SYS】</span>
      </Link>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-6">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-xs font-mono uppercase tracking-wider transition-colors ${
              location.pathname === link.path
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        ))}

        {/* Member identity display */}
        <Link
          to="/settings"
          className="flex items-center gap-2 pl-4 border-l border-border"
        >
          <User className="w-4 h-4 text-muted-foreground" />
          {isLoaded && (
            <span className="text-xs font-mono text-muted-foreground">
              {selectedMember
                ? `${selectedMember.first_name} ${selectedMember.last_name}`
                : "No member"}
            </span>
          )}
          <Settings className="w-3 h-3 text-muted-foreground" />
        </Link>
      </div>

      {/* Mobile toggle */}
      <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border flex flex-col p-4 gap-4 z-50 md:hidden">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`text-xs font-mono uppercase tracking-wider transition-colors ${
                location.pathname === link.path ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 pt-4 border-t border-border text-xs font-mono uppercase tracking-wider text-muted-foreground"
          >
            <User className="w-4 h-4" />
            {isLoaded && (
              <span>
                {selectedMember
                  ? `Acting as: ${selectedMember.first_name}`
                  : "Select member"}
              </span>
            )}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default AppNavbar;
