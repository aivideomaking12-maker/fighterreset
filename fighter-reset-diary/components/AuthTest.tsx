import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [note, setNote] = useState("teszt adat");

  // session figyelés
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user.id ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setMsg(error ? error.message : "Bejelentkezés OK");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMsg("Kijelentkezve");
  };

  const saveEntry = async () => {
    if (!userId) return setMsg("Előbb jelentkezz be");

    const { error } = await supabase.from("entries").insert({
      user_id: userId,
      data: { note, savedAt: new Date().toISOString() },
    });

    setMsg(error ? `Mentés hiba: ${error.message}` : "Mentés OK");
  };

  const loadLatest = async () => {
    if (!userId) return setMsg("Előbb jelentkezz be");

    const { data, error } = await supabase
      .from("entries")
      .select("id, created_at, data")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) return setMsg(`Betöltés hiba: ${error.message}`);

    const latest = data?.[0];
    setMsg(latest ? `Betöltve: ${JSON.stringify(latest.data)}` : "Nincs adat még");
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Auth + DB teszt</h3>

      <div style={{ marginBottom: 12 }}>
        <div>Bejelentkezett user: {userId ?? "nincs"}</div>
      </div>

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

      <button onClick={signIn}>Bejelentkezés</button>
      <span style={{ marginLeft: 8 }} />
      <button onClick={signOut}>Kijelentkezés</button>

      <hr />

      <input value={note} onChange={(e) => setNote(e.target.value)} />
      <span style={{ marginLeft: 8 }} />
      <button onClick={saveEntry}>Mentés DB-be</button>
      <span style={{ marginLeft: 8 }} />
      <button onClick={loadLatest}>Legutóbbi betöltése</button>

      <p>{msg}</p>
    </div>
  );
}
