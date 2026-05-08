import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { deleteLead, getLeads, createLead } from '../services/leadsService';
import StatusBadge from '../components/StatusBadge';

export default function LeadsPage() {
  const [params, setParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [q, setQ] = useState('');
  useEffect(() => { getLeads().then(setLeads); }, []);
  const filtered = useMemo(() => leads.filter((l) => {
    const text = `${l.businessName} ${l.businessCategory} ${l.city} ${l.email} ${l.whatsapp}`.toLowerCase();
    const status = params.get('status');
    const paid = params.get('paid');
    return (!q || text.includes(q.toLowerCase())) && (!status || l.generalStatus === status) && (!paid || String(l.clientPaid) === paid);
  }).sort((a,b)=>(Number(b.opportunityScore)-Number(a.opportunityScore))), [leads,q,params]);

  const reload = () => getLeads().then(setLeads);
  return <section className="card">
    <h2>Leads</h2>
    <input placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} />
    <table><thead><tr><th>Business</th><th>Category</th><th>City</th><th>WhatsApp</th><th>Email</th><th>Status</th><th>Score</th><th>Paid</th><th>Actions</th></tr></thead>
      <tbody>{filtered.map((l)=><tr key={l.id}><td>{l.businessName}</td><td>{l.businessCategory}</td><td>{l.city}</td><td>{l.whatsapp}</td><td>{l.email}</td><td><StatusBadge>{l.generalStatus}</StatusBadge></td><td>{l.opportunityScore}</td><td>{l.clientPaid ? 'Yes' : 'No'}</td>
      <td><Link to={`/leads/${l.id}`}>View</Link> <Link to={`/leads/${l.id}/edit`}>Edit</Link> <button onClick={async()=>{if(confirm('Delete lead?')){await deleteLead(l.id); reload();}}}>Delete</button>
      <button onClick={async()=>{const {id,...copy}=l; await createLead({...copy,businessName:`${l.businessName} (Copy)`}); reload();}}>Duplicate</button>
      <button onClick={()=>navigator.clipboard.writeText(l.whatsapp || '')}>Copy WA</button><button onClick={()=>navigator.clipboard.writeText(l.email || '')}>Copy Email</button><button onClick={()=>navigator.clipboard.writeText(l.codexPrompt || '')}>Copy Prompt</button></td></tr>)}</tbody></table>
    <div className="chips"><button onClick={()=>setParams({paid:'true'})}>Paid</button><button onClick={()=>setParams({paid:'false'})}>Unpaid</button><button onClick={()=>setParams({})}>Clear</button></div>
  </section>;
}
