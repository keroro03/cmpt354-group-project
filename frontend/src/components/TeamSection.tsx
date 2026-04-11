import { motion } from "framer-motion";

const team = [
  { id: "01", name: "Jerry Meng", role: "SQL Queries and Backend" },
  { id: "02", name: "Mike Bui", role: "SQL Queries and Backend" },
  { id: "03", name: "Jason Jang", role: "SQL Queries and Backend" },
  { id: "04", name: "James Hoang", role: "SQL Queries and Backend" },
];

const TeamSection = () => {
  return (
    <section id="team" className="px-4 sm:px-8 py-16 md:py-20 bg-background">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-wider text-accent mb-4">
          // 03. Project Contributors
        </p>

        <div className="mt-8 border border-border overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-mono uppercase tracking-wider text-muted-foreground py-3 px-4 sm:px-6 w-20">ID</th>
                <th className="text-left text-xs font-mono uppercase tracking-wider text-muted-foreground py-3 px-4 sm:px-6">Name</th>
                <th className="text-left text-xs font-mono uppercase tracking-wider text-muted-foreground py-3 px-4 sm:px-6">Role</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member, i) => (
                <motion.tr
                  key={member.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <td className="py-4 px-4 sm:px-6 text-sm font-mono text-muted-foreground tabular-nums">{member.id}</td>
                  <td className="py-4 px-4 sm:px-6 text-sm font-mono font-bold">{member.name}</td>
                  <td className="py-4 px-4 sm:px-6 text-sm font-mono text-muted-foreground">{member.role}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-xs font-mono text-muted-foreground">
          This project was created for <span className="font-bold text-foreground">CMPT354: Database Systems</span>.
        </p>
      </div>
    </section>
  );
};

export default TeamSection;
