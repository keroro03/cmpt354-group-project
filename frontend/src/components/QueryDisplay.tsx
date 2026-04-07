import { useState } from "react";
import { ChevronDown, ChevronUp, Code } from "lucide-react";

interface QueryDisplayProps {
  query: string;
  label?: string;
  defaultOpen?: boolean;
}

const QueryDisplay = ({ query, label = "SQL Query", defaultOpen = false }: QueryDisplayProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!query) return null;

  return (
    <div className="border border-border mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-secondary/30 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-accent" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-background overflow-x-auto">
          <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed">
            {formatSql(query)}
          </pre>
        </div>
      )}
    </div>
  );
};

function formatSql(sql: string): string {
  // Basic SQL formatting - capitalize keywords
  const keywords = [
    "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN",
    "ON", "AND", "OR", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET",
    "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "AS", "DISTINCT",
    "COUNT", "SUM", "AVG", "MIN", "MAX", "NOT", "IN", "IS", "NULL", "LIKE",
    "EXISTS", "FILTER", "RETURNING", "PRIMARY", "KEY", "REFERENCES", "CASCADE",
    "CURRENT_DATE", "DESC", "ASC"
  ];

  let formatted = sql.trim();
  
  // Capitalize SQL keywords
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    formatted = formatted.replace(regex, keyword);
  });

  return formatted;
}

export default QueryDisplay;
