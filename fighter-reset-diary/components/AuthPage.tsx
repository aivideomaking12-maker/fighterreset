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
      setMsg(error ? error.message : "Regisztráció OK (most lépj be)");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMsg(error ? error.message : "Belépés OK");
  };

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "40px auto" }}>
      <h2>Fighter Reset</h2>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setMode("login")} disabled={mode === "login"}>
          Belépés
        </button>
        <span style={{ marginLeft: 8 }} />
        <button onClick={() => setMode("signup")} disabled={mode === "signup"}>
          Regisztráció
        </button>
      </div>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        placeholder="Jelszó (min 6)"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <button onClick={submit} style={{ width: "100%" }}>
        {mode === "login" ? "Belépés" : "Regisztráció"}
      </button>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
