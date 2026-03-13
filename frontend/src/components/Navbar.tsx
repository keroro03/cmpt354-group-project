import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#overview", label: "01. Overview" },
    { href: "#schema", label: "02. Schema" },
    { href: "#team", label: "03. Team" },
  ];

  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 py-4 bg-background border-b border-border relative">
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono tracking-tight">【LIB_SYS_V1.0】</span>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            {link.label}
          </a>
        ))}
        <Link to="/login" className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
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
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </a>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
