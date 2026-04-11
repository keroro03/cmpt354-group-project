import { motion } from "framer-motion";

const ProjectScopeSection = () => {
  const stats = [
    { value: "5", label: "MAX LOANS" },
    { value: "PostgreSQL", label: "DATABASE" },
    { value: "Flask", label: "BACKEND" },
    { value: "3+", label: "BRANCHES" },
  ];

  return (
    <section id="overview" className="px-4 sm:px-8 py-16 md:py-20 bg-background">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-wider text-accent mb-4">
          // 01. Project Scope
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl font-black leading-tight mb-8 md:mb-12">
          Managing the complete lifecycle of a book across a distributed network.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
          <p className="text-sm leading-relaxed text-muted-foreground">
            This system provides a robust backend solution for the day-to-day operations of a multi-branch library network. It moves beyond simple lists, implementing complex relationships between physical copies, branch locations, and member records.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            From cataloging a new title to tracking its lending history and overdue status, the application serves two distinct user personas: the Library Staff (Inventory & Management) and the Library Members (Search & Borrow).
          </p>
        </div>

        <div className="border-t border-b border-border py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <p className="font-serif text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectScopeSection;
