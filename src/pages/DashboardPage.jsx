import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeads } from '../services/leadsService';

const metrics = [
  ['Total leads', (l) => l.length], ['Leads aprobados', (l) => l.filter((x) => x.isApproved).length], ['Repos creados', (l) => l.filter((x) => x.repoCreated).length],
  ['Prompts listos', (l) => l.filter((x) => x.codexPromptReady).length], ['Websites creados', (l) => l.filter((x) => x.websiteCreated).length], ['Proyectos enviados', (l) => l.filter((x) => x.projectSentToClient).length],
  ['Leads aceptados', (l) => l.filter((x) => x.clientResponseStatus === 'Accepted').length], ['Clientes pagos', (l) => l.filter((x) => x.clientPaid).length], ['Leads rechazados', (l) => l.filter((x) => x.clientResponseStatus === 'Rejected').length],
];

export default function DashboardPage() {
  const [leads, setLeads] = useState([]);
  useEffect(() => { getLeads().then(setLeads); }, []);
  const statuses = useMemo(() => [...new Set(leads.map((l) => l.generalStatus))], [leads]);
  return <section>
    <div className="grid">{metrics.map(([name, fn]) => <article className="card" key={name}><h3>{name}</h3><p>{fn(leads)}</p></article>)}</div>
    <div className="card"><h3>Filtros rápidos</h3><div className="chips">{statuses.map((s)=><Link key={s} to={`/leads?status=${encodeURIComponent(s)}`}>{s}</Link>)}</div></div>
  </section>;
}
