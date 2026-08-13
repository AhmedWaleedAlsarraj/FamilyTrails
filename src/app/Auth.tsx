import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export const LoginScreen = () => {
  const navigate = useNavigate();
  const { signIn, signInAsGuest } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    navigate("/");
  };

  const handleGuest = async () => {
    setError(null);
    setGuestLoading(true);
    const { error } = await signInAsGuest();
    setGuestLoading(false);
    if (error) {
      setError(error);
      return;
    }
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-full bg-white px-6 pb-8 pt-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
        <p className="text-sm text-gray-500">
          Log in to see your family's saved memories
        </p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-2 block font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-gray-50 p-4 rounded-2xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E5C8A] outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-2 block font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-gray-50 p-4 rounded-2xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E5C8A] outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="text-xs text-[#2E5C8A] font-medium text-right -mt-2"
        >
          Forgot password?
        </button>

        {error && <div className="text-xs text-red-500 text-center">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2E5C8A] text-white py-4 rounded-2xl font-bold shadow-md mt-2 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{" "}
        <button
          onClick={() => navigate("/signup")}
          className="text-[#2E5C8A] font-bold"
        >
          Create one
        </button>
      </p>

      {/* Pushes the guest button to the bottom of the screen regardless of
          content height above, per the requested layout. */}
      <div className="flex-1" />

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        onClick={handleGuest}
        disabled={guestLoading}
        className="w-full py-4 rounded-2xl font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-60"
      >
        {guestLoading ? "Continuing..." : "Continue as Guest"}
      </button>
    </div>
  );
};

export const SignupScreen = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName, phoneNumber);
    setLoading(false);

    if (error) {
      setError(error);
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex flex-col min-h-full bg-white px-6 pb-6 justify-center items-center text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h1>
        <p className="text-sm text-gray-500 mb-8">
          We sent a confirmation link to {email}. Confirm it, then log in.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-[#2E5C8A] text-white py-4 rounded-2xl font-bold shadow-md"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-white px-6 pb-6 justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
        <p className="text-sm text-gray-500">Start saving your family's memories</p>
      </div>

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-2 block font-medium">Full name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ahmed Alsarraj"
            className="w-full bg-gray-50 p-4 rounded-2xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E5C8A] outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-2 block font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-gray-50 p-4 rounded-2xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E5C8A] outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-2 block font-medium">Mobile number</label>
          <input
            type="tel"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+973 3xxx xxxx"
            className="w-full bg-gray-50 p-4 rounded-2xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E5C8A] outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-2 block font-medium">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full bg-gray-50 p-4 rounded-2xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E5C8A] outline-none"
          />
        </div>

        {error && <div className="text-xs text-red-500 text-center">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2E5C8A] text-white py-4 rounded-2xl font-bold shadow-md mt-2 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <button
          onClick={() => navigate("/login")}
          className="text-[#2E5C8A] font-bold"
        >
          Log in
        </button>
      </p>
    </div>
  );
};

export const ForgotPasswordScreen = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col min-h-full bg-white px-6 pb-6 justify-center items-center text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h1>
        <p className="text-sm text-gray-500 mb-8">
          We sent a password reset link to {email}.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-[#2E5C8A] text-white py-4 rounded-2xl font-bold shadow-md"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-white px-6 pb-6 justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset password</h1>
        <p className="text-sm text-gray-500">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-2 block font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-gray-50 p-4 rounded-2xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E5C8A] outline-none"
          />
        </div>

        {error && <div className="text-xs text-red-500 text-center">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2E5C8A] text-white py-4 rounded-2xl font-bold shadow-md mt-2 disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <button onClick={() => navigate("/login")} className="text-[#2E5C8A] font-bold">
          Back to Login
        </button>
      </p>
    </div>
  );
};

export const ResetPasswordScreen = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-full bg-white px-6 pb-6 justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Set a new password</h1>
        <p className="text-sm text-gray-500">
          You clicked a valid reset link — enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-2 block font-medium">
            New password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full bg-gray-50 p-4 rounded-2xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E5C8A] outline-none"
          />
        </div>

        {error && <div className="text-xs text-red-500 text-center">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2E5C8A] text-white py-4 rounded-2xl font-bold shadow-md mt-2 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save New Password"}
        </button>
      </form>
    </div>
  );
};
