import { Link } from "react-router-dom";
import libraryImg from "@/assets/library-shelves.jpg";
import { ArrowDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="px-4 sm:px-8 py-12 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8 md:gap-12">
        {/* Left side */}
        <motion.div
          className="flex-1 max-w-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block border border-foreground px-3 py-1 mb-6 md:mb-8">
            <span className="text-xs font-mono uppercase tracking-wider">CMPT354 • Spring Semester</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-6 md:mb-8">
            Library<br />
            <span className="text-accent italic">Network</span><br />
            Db System
          </h1>

          <div className="border-l-2 border-foreground pl-4 mb-6 md:mb-8">
            <p className="text-sm leading-relaxed text-muted-foreground">
              A relational database implementation for multi-branch inventory tracking, distinct user roles, and lifecycle management.
            </p>
          </div>

          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-6 md:mb-8">
            Stack: Python (Flask) + PostgreSQL
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              to="/member"
              className="group inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-all hover:gap-3"
            >
              Get Started <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#overview"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Read Docs <ArrowDown className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        {/* Right side - tilted card */}
        <motion.div
          className="flex-shrink-0 relative hidden sm:block"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 1, rotate: 6 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          whileHover={{ rotate: 0, scale: 1.05 }}
        >
          <div className="w-56 md:w-72 shadow-2xl cursor-pointer">
            <div className="bg-muted p-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2">
                FIG 1.1
              </span>
              <img
                src={libraryImg}
                alt="Library bookshelves"
                className="w-full h-40 md:h-48 object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="bg-background p-4 md:p-6">
              <h3 className="font-serif text-xl md:text-2xl font-bold italic leading-tight">
                Query<br />Result
              </h3>
              <div className="mt-3 space-y-1">
                <div className="h-[3px] bg-foreground w-3/4" />
                <div className="h-[3px] bg-foreground w-1/2" />
                <div className="h-[3px] bg-foreground w-2/3" />
                <div className="h-[3px] bg-foreground w-1/3" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
