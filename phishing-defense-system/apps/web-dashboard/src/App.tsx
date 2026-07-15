import { Activity, MailQuestion, MailWarning, RefreshCw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { TrackedEmail } from "@phishing-defense/shared";
import { getTrackedEmails } from "./api";

export function App() {
  const [emails, setEmails] = useState<TrackedEmail[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const load = useCallback(async () => {
    setState("loading");
    try { setEmails(await getTrackedEmails()); setState("ready"); }
    catch { setState("error"); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const unknown = emails.filter((email) => email.senderName.toLowerCase().includes("unknown")).length;
  const highRisk = emails.filter((email) => email.riskLevel === "high").length;
  const opens = emails.reduce((sum, email) => sum + email.visitCount, 0);
  return <main>
    <header><div className="brand"><ShieldCheck size={24} /> Sentinel</div><span className="prototype">Rule-based prototype</span></header>
    <section className="hero"><div><p className="eyebrow">SECURITY OVERVIEW</p><h1>Tracked email activity</h1><p>Transparent email risk signals and visit activity from the extension.</p></div><button onClick={() => void load()} disabled={state === "loading"}><RefreshCw size={16}/> Refresh</button></section>
    <section className="metrics">
      <Metric icon={<MailWarning />} label="Tracked Emails" value={emails.length} />
      <Metric icon={<MailQuestion />} label="Unknown Senders" value={unknown} />
      <Metric icon={<ShieldCheck />} label="High-Risk Emails" value={highRisk} />
      <Metric icon={<Activity />} label="Total Email Opens" value={opens} />
    </section>
    <section className="panel"><div className="panel-title"><div><h2>Tracked emails</h2><p>Scores are temporary rules and never use visit count as a phishing signal.</p></div></div>
      {state === "loading" && <div role="status" className="state"><span className="spinner"/>Loading tracked emails…</div>}
      {state === "error" && <div role="alert" className="state error"><h3>Couldn’t load tracked emails</h3><p>Start the FastAPI backend and verify the dashboard API URL.</p><button onClick={() => void load()}>Try again</button></div>}
      {state === "ready" && emails.length === 0 && <div className="state"><MailWarning size={32}/><h3>No tracked emails yet</h3><p>Use “Analyze Test Email” in the unpacked extension, then refresh.</p></div>}
      {state === "ready" && emails.length > 0 && <div className="table-wrap"><table><thead><tr><th>Sender</th><th>Subject</th><th>Visit Count</th><th>Email Risk Score</th><th>Risk Level</th><th>Score Source</th><th>Last Opened</th></tr></thead><tbody>{emails.map(email => <tr key={email.messageId}><td><strong>{email.senderName}</strong><small>{email.senderEmail}</small></td><td>{email.subject}</td><td>{email.visitCount}</td><td>{email.emailRiskScore}%</td><td><RiskBadge level={email.riskLevel}/></td><td><span className="source">{email.scoreSource}</span></td><td>{formatDate(email.lastOpenedAt)}</td></tr>)}</tbody></table></div>}
    </section>
  </main>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <article className="metric"><div className="icon">{icon}</div><div><p>{label}</p><strong>{value}</strong></div></article>; }
function RiskBadge({ level }: { level: TrackedEmail["riskLevel"] }) { return <span className={`badge ${level}`}>{level[0].toUpperCase() + level.slice(1)}</span>; }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
