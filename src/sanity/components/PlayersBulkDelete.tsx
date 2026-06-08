import { useEffect, useState, useCallback } from "react";
import { useClient } from "sanity";

/**
 * Custom Studio view: lista giocatori con checkbox per multi-select +
 * "Seleziona tutti" + "Cancella selezionati". Pensata per cleanup
 * massivo (es. ripulire roster di stagioni passate o test data).
 *
 * Sanity v3 di default NON ha multi-select nelle documentTypeList:
 * questo component fa una query GROQ diretta, mostra checkbox per
 * ogni player, e usa client.transaction().delete().commit() per
 * cancellare in batch.
 *
 * Sicurezza:
 * - confirm() nativo prima di eseguire la cancellazione
 * - Mostra count selezionati per evitare delete accidentali
 * - Refresh automatico della lista dopo il commit
 *
 * Limite noto: cancellare un giocatore non rimuove eventuali
 * reference da `match.lineupHome[]` o `match.lineupAway[]` (Sanity
 * non fa cascade), ma quei campi sono comunque opzionali.
 *
 * Stile: HTML/CSS standard inline per evitare deps @sanity/ui non
 * installato direttamente nel progetto (solo @sanity/client +
 * @sanity/vision sono in package.json). I colori si adattano al
 * tema chiaro/scuro tramite CSS custom property fallback.
 */
type PlayerRow = {
  _id: string;
  fullName: string;
  team: string | null;
  shirt: number | null;
};

const PLAYERS_QUERY = `*[_type == "player"] | order(coalesce(team->name, "zzz") asc, lastName asc, firstName asc){
  _id,
  "fullName": firstName + " " + lastName,
  "team": team->name,
  "shirt": shirtNumber
}`;

export function PlayersBulkDelete() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState("");

  const refresh = useCallback(
    (signal?: AbortSignal) => {
      setLoading(true);
      client
        .fetch<PlayerRow[]>(PLAYERS_QUERY, {}, { signal })
        .then((data) => {
          if (signal?.aborted) return;
          setPlayers(data ?? []);
          setSelected(new Set());
        })
        .catch((err) => {
          if (signal?.aborted) return;
          console.error("[PlayersBulkDelete] fetch error", err);
        })
        .finally(() => {
          if (signal?.aborted) return;
          setLoading(false);
        });
    },
    [client],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    // rAF per evitare cascading renders (regola react-hooks/set-state-in-effect):
    // refresh() chiama setLoading(true) sincrono, deferiamo al frame successivo.
    const raf = requestAnimationFrame(() => refresh(ctrl.signal));
    return () => {
      cancelAnimationFrame(raf);
      ctrl.abort();
    };
  }, [refresh]);

  const filtered = filter.trim()
    ? players.filter((p) => {
        const q = filter.trim().toLowerCase();
        return (
          p.fullName.toLowerCase().includes(q) ||
          (p.team ?? "").toLowerCase().includes(q)
        );
      })
    : players;

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((p) => selected.has(p._id));

  const toggleAll = () => {
    const next = new Set(selected);
    if (allFilteredSelected) {
      filtered.forEach((p) => next.delete(p._id));
    } else {
      filtered.forEach((p) => next.add(p._id));
    }
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    const confirmed = window.confirm(
      `Sei sicuro di voler cancellare ${selected.size} giocator${
        selected.size === 1 ? "e" : "i"
      }?\n\nL'operazione NON e' annullabile.\nI giocatori verranno rimossi DEFINITIVAMENTE.`,
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      const tx = client.transaction();
      for (const id of selected) {
        tx.delete(id);
      }
      await tx.commit();
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      window.alert(`Errore durante la cancellazione:\n${msg}`);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div>
        <h2 style={styles.title}>Cancellazione giocatori in blocco</h2>
        <p style={styles.subtitle}>
          Spunta i giocatori da rimuovere e premi &laquo;Cancella
          selezionati&raquo;. Usa il filtro per restringere la lista.
          L&apos;operazione &egrave; irreversibile.
        </p>
      </div>

      <input
        type="text"
        placeholder="Filtra per nome o squadra..."
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
        style={styles.input}
      />

      <div style={styles.toolbar}>
        <button
          type="button"
          onClick={toggleAll}
          disabled={filtered.length === 0}
          style={styles.btnGhost}
        >
          {allFilteredSelected
            ? `Deseleziona tutti${filter.trim() ? " (filtrati)" : ""}`
            : `Seleziona tutti${filter.trim() ? " (filtrati)" : ""}`}
        </button>
        <button
          type="button"
          onClick={deleteSelected}
          disabled={selected.size === 0 || deleting}
          style={{
            ...styles.btnDanger,
            opacity: selected.size === 0 || deleting ? 0.5 : 1,
            cursor:
              selected.size === 0 || deleting ? "not-allowed" : "pointer",
          }}
        >
          {deleting
            ? "Cancellazione..."
            : `🗑️ Cancella ${selected.size} selezionat${
                selected.size === 1 ? "o" : "i"
              }`}
        </button>
        <div style={{ flex: 1 }} />
        <span style={styles.counter}>
          {filtered.length} su {players.length} mostrati &middot;{" "}
          {selected.size} selezionati
        </span>
      </div>

      <div style={styles.list}>
        {filtered.length === 0 && (
          <div style={styles.emptyState}>
            Nessun giocatore corrisponde al filtro.
          </div>
        )}
        {filtered.map((p) => {
          const isSelected = selected.has(p._id);
          return (
            <div
              key={p._id}
              onClick={() => toggleOne(p._id)}
              style={{
                ...styles.row,
                background: isSelected
                  ? "rgba(239, 68, 68, 0.12)"
                  : "transparent",
                borderColor: isSelected
                  ? "rgba(239, 68, 68, 0.5)"
                  : "rgba(125, 125, 125, 0.2)",
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleOne(p._id)}
                onClick={(e) => e.stopPropagation()}
                style={styles.checkbox}
              />
              <div style={{ flex: 1 }}>
                <div style={styles.rowName}>
                  {p.shirt != null ? `#${p.shirt} · ` : ""}
                  {p.fullName}
                </div>
                {p.team && <div style={styles.rowTeam}>{p.team}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    padding: 24,
    maxWidth: 800,
    margin: "0 auto",
  },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },
  spinner: {
    width: 28,
    height: 28,
    border: "3px solid rgba(125,125,125,0.3)",
    borderTopColor: "currentColor",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 6,
    marginBottom: 0,
    lineHeight: 1.5,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    border: "1px solid rgba(125,125,125,0.3)",
    borderRadius: 6,
    background: "transparent",
    color: "inherit",
    boxSizing: "border-box",
  },
  toolbar: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  btnGhost: {
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 500,
    background: "transparent",
    color: "inherit",
    border: "1px solid rgba(125,125,125,0.4)",
    borderRadius: 6,
    cursor: "pointer",
  },
  btnDanger: {
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    background: "#dc2626",
    color: "white",
    border: "1px solid #b91c1c",
    borderRadius: 6,
  },
  counter: {
    fontSize: 12,
    opacity: 0.7,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  emptyState: {
    padding: 16,
    textAlign: "center",
    fontSize: 13,
    opacity: 0.6,
    border: "1px dashed rgba(125,125,125,0.3)",
    borderRadius: 6,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    border: "1px solid",
    borderRadius: 6,
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s",
  },
  checkbox: {
    width: 18,
    height: 18,
    cursor: "pointer",
    margin: 0,
  },
  rowName: {
    fontSize: 14,
    fontWeight: 500,
  },
  rowTeam: {
    fontSize: 12,
    opacity: 0.65,
    marginTop: 2,
  },
};
