import { BookOpen, Copy, Users, Building2 } from "lucide-react";
import { motion } from "framer-motion";

const modules = [
  {
    icon: BookOpen,
    table: "TABLE: BOOKS",
    title: "Book Management",
    points: [
      'Omni-search by Title, Author, or Genre.',
      'Real-time availability tracking per branch.',
      'Analytics: "Most Borrowed" vs "Top Dust Collectors".',
    ],
  },
  {
    icon: Copy,
    table: "TABLE: LOANS",
    title: "Borrowing Mechanics",
    points: [
      "Check-out/Return cycle logic.",
      "Constraint enforcement: Max 5 items per user.",
      "Overdue status monitoring & date calculation.",
    ],
  },
  {
    icon: Users,
    table: "TABLE: USERS",
    title: "User Hierarchy",
    points: [
      "Staff Roles: General → Librarian → Manager.",
      "Members: Multi-branch association capabilities.",
      "Guard Clause: Cannot delete users with active loans.",
    ],
  },
  {
    icon: Building2,
    table: "TABLE: BRANCHES",
    title: "Network Ops",
    points: [
      "Independent inventory management per location.",
      "Global catalog visibility.",
      "Transfer logic for physical copies.",
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

const SystemModulesSection = () => {
  return (
    <section id="schema" className="px-4 sm:px-8 py-16 md:py-20 bg-surface-dark text-surface-dark-foreground">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-accent mb-4">
              // 02. Core Functionalities
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-black">System Modules</h2>
          </div>
          <pre className="text-[10px] font-mono text-surface-dark-muted hidden md:block text-right leading-relaxed">
{`SELECT * FROM functionalities
WHERE status = 'active';`}
          </pre>
        </div>

        <div className="border-t border-surface-dark-border mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-surface-dark-border rounded-lg overflow-hidden">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              className="bg-surface-dark-card p-6 sm:p-8 hover:bg-surface-dark-border/30 transition-colors cursor-default"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={cardVariants}
            >
              <div className="flex items-start justify-between mb-6">
                <mod.icon className="w-6 h-6 text-surface-dark-muted" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-surface-dark-muted border border-surface-dark-border px-2 py-1">
                  {mod.table}
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold mb-4">{mod.title}</h3>
              <ul className="space-y-2">
                {mod.points.map((point) => (
                  <li key={point} className="text-xs font-mono text-surface-dark-muted leading-relaxed">
                    • {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SystemModulesSection;
