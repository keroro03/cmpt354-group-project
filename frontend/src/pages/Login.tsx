import { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [role, setRole] = useState<"member" | "staff">("member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground mb-8 inline-block">
          ← Back to Home
        </Link>

        <div className="border border-border p-8">
          <h1 className="font-serif text-3xl font-black mb-2">Sign In</h1>
          <p className="text-xs font-mono text-muted-foreground mb-8">
            【LIB_SYS_V1.0】 Authentication Portal
          </p>

          {/* Role toggle */}
          <div className="flex mb-8 border border-border">
            <button
              onClick={() => setRole("member")}
              className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider transition-colors ${
                role === "member"
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Member
            </button>
            <button
              onClick={() => setRole("staff")}
              className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider transition-colors ${
                role === "staff"
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Staff
            </button>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                {role === "member" ? "Member Email" : "Staff Email"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@library.org"
                className="w-full h-10 px-4 text-sm font-mono bg-background border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-4 text-sm font-mono bg-background border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-foreground text-background py-3 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity mt-4"
            >
              Sign In as {role === "member" ? "Member" : "Staff"}
            </button>
          </form>

          <p className="text-xs font-mono text-muted-foreground text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-accent hover:underline">Register</Link>
          </p>

          <p className="text-[10px] font-mono text-muted-foreground text-center mt-4">
            UI only — no authentication logic implemented.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
