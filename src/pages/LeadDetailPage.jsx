import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addDomain, deleteDomain, getLeadById, updateDomain, updateLead } from '../services/leadsService';
import { buildPromptTemplate } from '../utils/leadHelpers';

export default function LeadDetailPage() {
  const { leadId } = useParams();
  const [lead, setLead] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [domain, setDomain] = useState({ domainName: '', extension: '.com', isAvailable: true, price: '', provider: '', notes: '', isSelected: false });

  const load = () => getLeadById(leadId).then((d) => { setLead(d); setPrompt(d?.codexPrompt || ''); });
  useEffect(() => { load(); }, [leadId]);
  if (!lead) return <div className="card">Cargando...</div>;

  return <section className="stack">
    <article className="card"><h2>{lead.businessName}</h2><p>{lead.businessCategory} · {lead.city}</p><p>Estado: {lead.generalStatus}</p><p>Dominio final: {lead.finalDomainSelected || '-'}</p></article>
    <article className="card"><h3>Prompt de Codex</h3><textarea rows="10" value={prompt} onChange={(e)=>setPrompt(e.target.value)} />
      <div className="chips"><button onClick={async()=>{await updateLead(leadId,{codexPrompt:prompt,codexPromptReady:true}); load();}}>Guardar prompt</button><button onClick={()=>navigator.clipboard.writeText(prompt)}>Copiar prompt</button><button onClick={()=>setPrompt(buildPromptTemplate(lead))}>Generar plantilla</button></div>
      <small>Última actualización: {String(lead.updatedAt?.seconds ? new Date(lead.updatedAt.seconds*1000).toISOString() : lead.updatedAt || '')}</small>
    </article>
    <article className="card"><h3>Dominios posibles</h3>
      <div className="form-grid">{Object.keys(domain).map((k)=><label key={k}>{k}<input value={typeof domain[k]==='boolean'?'':domain[k]} onChange={(e)=>setDomain((p)=>({...p,[k]:e.target.value}))} /></label>)}<label><input type="checkbox" checked={domain.isAvailable} onChange={(e)=>setDomain((p)=>({...p,isAvailable:e.target.checked}))} />Disponible</label></div>
      <button onClick={async()=>{await addDomain(leadId,domain); setDomain({ domainName:'', extension:'.com', isAvailable:true, price:'', provider:'', notes:'', isSelected:false }); load();}}>Agregar dominio</button>
      <ul>{(lead.domains || []).map((d)=><li key={d.id}>{d.domainName}{d.extension} - {d.isAvailable ? 'Disponible':'No disponible'}
        <button onClick={async()=>{await updateDomain(leadId,d.id,{isSelected:true,domainName:d.domainName,extension:d.extension}); await updateLead(leadId,{finalDomainSelected:`${d.domainName}${d.extension}`}); load();}}>Seleccionar</button>
        <button onClick={async()=>{await updateDomain(leadId,d.id,{isAvailable:!d.isAvailable}); load();}}>Cambiar</button>
        <button onClick={async()=>{await deleteDomain(leadId,d.id); load();}}>Eliminar</button></li>)}</ul>
    </article>
  </section>;
}
