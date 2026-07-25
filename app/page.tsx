"use client";

import { useEffect, useState } from "react";

type State = "stable" | "deploying" | "degraded" | "rolling-back" | "recovered";
const events = [
  ["09:41:02", "Release v2.4.0 created", "build"],
  ["09:41:08", "Canary started · 10% traffic", "info"],
  ["09:41:26", "Error rate crossed 5.0% threshold", "bad"],
  ["09:41:27", "Automatic rollback triggered", "warn"],
];

function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = { arrow: "M5 12h14m-6-6 6 6-6 6", shield: "M12 3 5 6v5c0 4.4 3 8 7 10 4-2 7-5.6 7-10V6l-7-3Z", check: "m5 12 4 4L19 6", bolt: "m13 2-8 11h6l-1 9 8-12h-6l1-8", refresh: "M20 11a8.1 8.1 0 0 0-14.8-4L3 10m0-6v6h6M4 13a8.1 8.1 0 0 0 14.8 4L21 14m0 6v-6h-6", chart: "M4 19V5m0 14h17M8 16v-4m4 4V8m4 8v-6" };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name] || paths.arrow} /></svg>;
}

export default function Home() {
  const [state, setState] = useState<State>("stable");
  const [traffic, setTraffic] = useState(100);
  const [error, setError] = useState(0.08);
  const [latency, setLatency] = useState(118);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (state === "deploying") {
      const t = setTimeout(() => { setState("degraded"); setTraffic(10); setError(7.4); setLatency(840); setStep(2); }, 2400); return () => clearTimeout(t);
    }
    if (state === "rolling-back") {
      const t = setTimeout(() => { setState("recovered"); setTraffic(0); setError(0.08); setLatency(118); setStep(4); }, 2400); return () => clearTimeout(t);
    }
  }, [state]);

  const deploy = () => { if (state === "stable" || state === "recovered") { setState("deploying"); setTraffic(10); setError(0.12); setLatency(134); setStep(1); } };
  const injectFailure = () => { setState("degraded"); setTraffic(10); setError(7.4); setLatency(840); setStep(2); };
  const rollback = () => { setState("rolling-back"); setStep(3); };
  const active = state === "degraded" || state === "rolling-back";
  const label = state === "stable" ? "All systems operational" : state === "deploying" ? "Canary in progress" : state === "degraded" ? "Rollback recommended" : state === "rolling-back" ? "Restoring stable version" : "Rollback complete";

  return <main>
    <nav><div className="brand"><span className="brand-mark"><Icon name="shield" /></span><span>relay<span className="dot">.</span></span></div><div className="nav-right"><span className="live"><i /> LIVE ENVIRONMENT</span><span className="divider" /><span className="avatar">TK</span><span className="user">Tushar Khadde <small>⌄</small></span></div></nav>
    <section className="hero"><div><p className="eyebrow">RELEASE SAFETY CONSOLE</p><h1>Ship with confidence.</h1><p className="sub">Observe every release. Automatically protect your users when things go sideways.</p></div><div className="hero-status"><span className={active ? "status-dot amber" : "status-dot"} /><div><b>{label}</b><span>Production / us-east-1</span></div></div></section>
    <section className="toolbar"><div><span className="service-dot" /><b>checkout-api</b><span className="tag">PRODUCTION</span></div><div className="toolbar-actions"><a className="ghost" href="/api/metrics" target="_blank" rel="noreferrer"><Icon name="chart" /> View metrics</a><a className="ghost failure-link" href="/api/metrics?scenario=broken" target="_blank" rel="noreferrer">Test broken metrics</a><a className="ghost failure-link" href="/preview?scenario=broken" target="_blank" rel="noreferrer">Open broken app</a><button className="primary" onClick={deploy} disabled={state === "deploying" || state === "rolling-back"}><Icon name="bolt" /> Deploy v2.4.0</button><button className="failure-button" onClick={injectFailure} disabled={state === "rolling-back" || state === "degraded"}>Inject failure</button></div></section>
    <section className="grid">
      <div className="panel release"><div className="panel-head"><div><p className="eyebrow">CURRENT RELEASE</p><h2><span className="version">v1.8.3</span> Stable</h2></div><span className="pill green"><i /> SERVING 100%</span></div><div className="release-body"><div className="commit"><span className="commit-icon">⌘</span><div><b>fix: prevent duplicate charges</b><span>deployed 3 days ago by <strong>tushar</strong></span></div></div><div className="release-meta"><span>SHA <b>8f3a2c1</b></span><span>BUILD <b>#1284</b></span><span>UPTIME <b>99.99%</b></span></div></div><div className="next-release"><div><span className="eyebrow">NEXT RELEASE</span><b>v2.4.0 <span>· ready to deploy</span></b></div><span className="pill neutral">CANARY 10%</span></div></div>
      <div className="panel protection"><div className="panel-head"><div><p className="eyebrow">AUTO-PROTECTION</p><h2>Guardrails</h2></div><span className="toggle"><i /></span></div><div className="guard"><span className="guard-icon"><Icon name="shield" /></span><div><b>Automatic rollback</b><span>Enabled for this service</span></div><span className="check"><Icon name="check" /></span></div><div className="threshold"><div><span>Error rate</span><b>&gt; 5.0%</b></div><div><span>p95 latency</span><b>&gt; 500 ms</b></div><div><span>Evaluation window</span><b>60 seconds</b></div></div></div>
      <div className="panel metrics"><div className="panel-head"><div><p className="eyebrow">LIVE SIGNALS</p><h2>Production health</h2></div><span className="updated"><i /> updated just now</span></div><div className="metric-row"><Metric label="ERROR RATE" value={error.toFixed(2) + "%"} good={error < 5} data={error < 5 ? "0,70 18,70 35,68 52,72 70,69 88,70 106,67 124,69 142,68 160,70 178,69 196,70" : "0,66 18,69 35,65 52,50 70,56 88,28 106,38 124,18 142,35 160,12 178,26 196,8"} /><Metric label="P95 LATENCY" value={latency + " ms"} good={latency < 500} data={latency < 500 ? "0,55 22,53 44,56 66,54 88,57 110,52 132,55 154,53 176,55 196,54" : "0,54 22,53 44,50 66,45 88,47 110,30 132,38 154,14 176,26 196,10"} /></div></div>
      <div className="panel traffic"><div className="panel-head"><div><p className="eyebrow">TRAFFIC ROUTING</p><h2>Version distribution</h2></div><span className="pill neutral">LIVE</span></div><div className="traffic-bar"><span style={{width: `${100 - traffic}%`}} /><span style={{width: `${traffic}%`}} /></div><div className="traffic-legend"><div><i className="blue" /><span>v1.8.3 <small>Stable</small></span><b>{100 - traffic}%</b></div><div><i className="purple" /><span>v2.4.0 <small>{active ? "Degraded" : "Canary"}</small></span><b>{traffic}%</b></div></div></div>
      <div className="panel timeline"><div className="panel-head"><div><p className="eyebrow">RELEASE ACTIVITY</p><h2>Deployment timeline</h2></div><button className="text-btn">View all <Icon name="arrow" /></button></div><div className="events">{events.map((e, i) => <div className={(step >= i + 1 ? "event active " : "event ") + (i === 2 ? "alert" : "")} key={e[0]}><span className="event-time">{e[0]}</span><span className="event-line"><i /></span><span className="event-copy"><b>{e[1]}</b><small>{i === 0 ? "v2.4.0 · tushar" : i === 1 ? "traffic split configured" : i === 2 ? "threshold: error_rate > 5.0%" : "v1.8.3 restored · 100% traffic"}</small></span></div>)}</div></div>
    </section>
    {state === "degraded" && <div className="toast"><span className="toast-icon">!</span><div><b>Release v2.4.0 is unhealthy</b><span>Error rate exceeded threshold. Rollback is ready.</span></div><button onClick={rollback}>ROLL BACK <Icon name="refresh" /></button></div>}
    {state === "rolling-back" && <div className="toast"><span className="spinner" /><div><b>Rolling back to v1.8.3</b><span>Draining canary traffic and restoring stable pods…</span></div></div>}
    {state === "recovered" && <div className="toast success"><span className="toast-icon"><Icon name="check" /></span><div><b>Rollback complete</b><span>v1.8.3 is serving 100% of production traffic.</span></div><button onClick={() => setState("stable")}>DISMISS</button></div>}
  </main>;
}

function Metric({ label, value, good, data }: { label: string; value: string; good: boolean; data: string }) { return <div className="metric"><div className="metric-label"><span>{label}</span><b className={good ? "good" : "bad"}>{value}</b></div><svg viewBox="0 0 196 78" preserveAspectRatio="none"><path d={`M${data}`} fill="none" stroke={good ? "#9ba5b5" : "#e2a344"} strokeWidth="2" /></svg><span className={good ? "threshold-line" : "threshold-line show"}>threshold</span></div> }
