import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const AppNavbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

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
        <Link
          to="/login"
          className="text-xs font-mono uppercase tracking-wider bg-foreground text-background px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Login
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
          <Link to="/login" onClick={() => setOpen(false)} className="text-xs font-mono uppercase tracking-wider bg-foreground text-background px-4 py-2 w-fit hover:opacity-90 transition-opacity">
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default AppNavbar;
