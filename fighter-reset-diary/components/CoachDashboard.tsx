import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AppState } from "../types";

type Client = {
  id: string;
  email: string;
};

export default function CoachDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Client | null>(null);
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  // kliensek betöltése
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email")
        .neq("role", "admin");

      if (!error && data) setClients(data);
      setLoading(false);
    })();
  }, []);

  const loadClientState = async (client: Client) => {
    setSelected(client);
    setState(null);

    const { data, error } = await supabase
      .from("user_state")
      .select("data")
      .eq("user_id", client.id)
      .maybeSingle();

    if (!error && data) setState(data.data as AppState);
  };

  if (loading) return <div className="p-6">Betöltés…</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Edzői felület</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* kliens lista */}
        <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
          <h3 className="text-sm font-bold text-gray-400 mb-3">Kliensek</h3>
          <ul className="space-y-2">
            {clients.map((c) => (
              <li
                key={c.id}
                onClick={() => loadClientState(c)}
                className={`cursor-pointer px-3 py-2 rounded-lg text-sm ${
                  selected?.id === c.id
                    ? "bg-red-700 text-white"
                    : "bg-[#252525] hover:bg-[#333] text-gray-200"
                }`}
              >
                {c.email}
              </li>
            ))}
          </ul>
        </div>

        {/* kliens adatok */}
        <div className="md:col-span-2 bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
          {!selected && (
            <p className="text-gray-400 text-sm">
              Válassz ki egy klienst a bal oldalon.
            </p>
          )}

          {selected && !state && (
            <p className="text-gray-400 text-sm">
              Nincs még mentett adat ennél a kliensnél.
            </p>
          )}

          {state && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">
                {selected.email} – állapot
              </h3>

              {/* PÉLDA: hetek összefoglaló */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {state.weeks.map((w) => (
                  <div
                    key={w.weekNumber}
                    className="bg-[#252525] rounded-lg p-3 text-center"
                  >
                    <div className="text-sm font-bold text-white">
                      {w.weekNumber}. hét
                    </div>
                    <div className="text-xs text-gray-400">
                      {w.days.filter((d) => d.completed).length} /{" "}
                      {w.days.length} nap
                    </div>
                  </div>
                ))}
              </div>

              {/* DEBUG / RÉSZLETES NÉZET (később szépíthető) */}
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-gray-400">
                  Nyers adat (debug)
                </summary>
                <pre className="text-xs text-gray-300 overflow-auto max-h-96 mt-2">
                  {JSON.stringify(state, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
