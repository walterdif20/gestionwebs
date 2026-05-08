import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeads } from '../services/leadsService';

const metrics = [
  ['total leads', (l) => l.length], ['approved leads', (l) => l.filter((x) => x.isApproved).length], ['repos created', (l) => l.filter((x) => x.repoCreated).length],
  ['prompts ready', (l) => l.filter((x) => x.codexPromptReady).length], ['websites created', (l) => l.filter((x) => x.websiteCreated).length], ['projects sent', (l) => l.filter((x) => x.projectSentToClient).length],
  ['accepted leads', (l) => l.filter((x) => x.clientResponseStatus === 'Accepted').length], ['paid clients', (l) => l.filter((x) => x.clientPaid).length], ['rejected leads', (l) => l.filter((x) => x.clientResponseStatus === 'Rejected').length],
];

export default function DashboardPage() {
  const [leads, setLeads] = useState([]);
  useEffect(() => { getLeads().then(setLeads); }, []);
  const statuses = useMemo(() => [...new Set(leads.map((l) => l.generalStatus))], [leads]);
  return <section>
    <div className="grid">{metrics.map(([name, fn]) => <article className="card" key={name}><h3>{name}</h3><p>{fn(leads)}</p></article>)}</div>
    <div className="card"><h3>Quick Filters</h3><div className="chips">{statuses.map((s)=><Link key={s} to={`/leads?status=${encodeURIComponent(s)}`}>{s}</Link>)}</div></div>
  </section>;
}
