import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async () => {
    setMsg("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setMsg(error ? error.message : "Regisztráció OK. Most lépj be!");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMsg(error ? error.message : "Belépés OK");
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1a1a1a] border border-[#252525] rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Fighter Reset</h1>
        <p className="text-gray-400 text-sm mt-1">
          Jelentkezz be, hogy a saját naplódat lásd.
        </p>

        <div className="mt-5 flex gap-2">
          <button
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold border ${
              mode === "login"
                ? "bg-red-700 border-red-700 text-white"
                : "bg-[#252525] border-[#333] text-gray-200"
            }`}
            onClick={() => setMode("login")}
          >
            Belépés
          </button>
          <button
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold border ${
              mode === "signup"
                ? "bg-red-700 border-red-700 text-white"
                : "bg-[#252525] border-[#333] text-gray-200"
            }`}
            onClick={() => setMode("signup")}
          >
            Regisztráció
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <input
            className="w-full px-3 py-2 rounded-lg bg-[#0f0f0f] border border-[#333] text-white"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 rounded-lg bg-[#0f0f0f] border border-[#333] text-white"
            placeholder="Jelszó (min. 6 karakter)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full px-3 py-2 rounded-lg bg-[#252525] hover:bg-[#333] text-white text-sm font-bold border border-[#333]"
            onClick={submit}
          >
            {mode === "login" ? "Belépés" : "Regisztráció"}
          </button>

          {msg && <p className="text-xs text-gray-300">{msg}</p>}

          <p className="text-[11px] text-gray-500">
            Ha “email rate limit exceeded”-et látsz regisztrációnál, akkor túl sok auth email ment ki.
            Ilyenkor pár perc múlva újra próbáld, vagy Supabase-ben kézzel add hozzá a usert, ahogy már csináltad.
          </p>
        </div>
      </div>
    </div>
  );
}
