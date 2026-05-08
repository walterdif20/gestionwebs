import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { deleteLead, getLeads, createLead } from '../services/leadsService';
import StatusBadge from '../components/StatusBadge';

export default function LeadsPage() {
  const [params, setParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => { getLeads().then(setLeads); }, []);

  const filtered = useMemo(() => leads
    .filter((l) => {
      const text = `${l.businessName} ${l.businessCategory} ${l.city} ${l.email} ${l.whatsapp}`.toLowerCase();
      const status = params.get('status');
      const paid = params.get('paid');
      return (!q || text.includes(q.toLowerCase())) && (!status || l.generalStatus === status) && (!paid || String(l.clientPaid) === paid);
    })
    .sort((a, b) => Number(b.opportunityScore) - Number(a.opportunityScore)), [leads, q, params]);

  const reload = () => getLeads().then(setLeads);

  return <section className="card">
    <h2>Leads</h2>
    <input placeholder="Buscar por negocio, categoría, ciudad, email o WhatsApp" value={q} onChange={(e) => setQ(e.target.value)} />
    <table><thead><tr><th>Negocio</th><th>Categoría</th><th>Ciudad</th><th>WhatsApp</th><th>Email</th><th>Estado</th><th>Score</th><th>Pagado</th><th>Acciones</th></tr></thead>
      <tbody>{filtered.map((l) => <tr key={l.id}><td>{l.businessName}</td><td>{l.businessCategory}</td><td>{l.city}</td><td>{l.whatsapp}</td><td>{l.email}</td><td><StatusBadge>{l.generalStatus}</StatusBadge></td><td>{l.opportunityScore}</td><td>{l.clientPaid ? 'Sí' : 'No'}</td>
        <td>
          <details>
            <summary>Acciones</summary>
            <div className="chips">
              <Link to={`/leads/${l.id}`}>Ver</Link>
              <Link to={`/leads/${l.id}/edit`}>Editar</Link>
              <button onClick={async () => { if (confirm('¿Eliminar lead?')) { await deleteLead(l.id); reload(); } }}>Eliminar</button>
              <button onClick={async () => { const { id, ...copy } = l; await createLead({ ...copy, businessName: `${l.businessName} (Copia)` }); reload(); }}>Duplicar</button>
              <button onClick={() => navigator.clipboard.writeText(l.whatsapp || '')}>Copiar WPP</button>
              <button onClick={() => navigator.clipboard.writeText(l.email || '')}>Copiar email</button>
              <button onClick={() => navigator.clipboard.writeText(l.codexPrompt || '')}>Copiar prompt</button>
            </div>
          </details>
        </td></tr>)}</tbody></table>
    <div className="chips"><button onClick={() => setParams({ paid: 'true' })}>Pagados</button><button onClick={() => setParams({ paid: 'false' })}>No pagados</button><button onClick={() => setParams({})}>Limpiar filtros</button></div>
  </section>;
}
