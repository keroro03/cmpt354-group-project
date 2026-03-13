import { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground mb-8 inline-block">
          ← Back to Home
        </Link>

        <div className="border border-border p-8">
          <h1 className="font-serif text-3xl font-black mb-2">Register</h1>
          <p className="text-xs font-mono text-muted-foreground mb-8">
            【LIB_SYS_V1.0】 New Member Registration
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full h-10 px-4 text-sm font-mono bg-background border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full h-10 px-4 text-sm font-mono bg-background border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                Email
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
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(604) 555-0123"
                className="w-full h-10 px-4 text-sm font-mono bg-background border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 University Dr, Burnaby, BC"
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

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-4 text-sm font-mono bg-background border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-foreground text-background py-3 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity mt-4"
            >
              Create Account
            </button>
          </form>

          <p className="text-xs font-mono text-muted-foreground text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:underline">Sign In</Link>
          </p>

          <p className="text-[10px] font-mono text-muted-foreground text-center mt-4">
            UI only — no authentication logic implemented.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
