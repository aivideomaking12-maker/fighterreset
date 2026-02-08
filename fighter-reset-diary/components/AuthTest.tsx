import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setMsg(error ? error.message : "Regisztráció OK");
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setMsg(error ? error.message : "Bejelentkezés OK");
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Auth teszt</h3>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <button onClick={signUp}>Regisztráció</button>
      <button onClick={signIn}>Bejelentkezés</button>

      <p>{msg}</p>
    </div>
  );
}
