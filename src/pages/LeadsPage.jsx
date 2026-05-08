import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { deleteLead, getLeads, createLead } from '../services/leadsService';
import StatusBadge from '../components/StatusBadge';
import { emptyLead, inferGeneralStatus } from '../utils/leadHelpers';

export default function LeadsPage() {
  const [params, setParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [q, setQ] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [jsonFileName, setJsonFileName] = useState('');
  const [importError, setImportError] = useState('');

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

  const parseJsonRecords = (rawInput) => {
    const cleaned = rawInput.trim();
    if (!cleaned) return [];

    const direct = cleaned.replace(/^```json\s*/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
    const chunks = direct.match(/\{[\s\S]*?\}/g);
    const candidate = chunks && chunks.length > 1 ? `[${chunks.join(',')}]` : direct;
    const parsed = JSON.parse(candidate);
    return Array.isArray(parsed) ? parsed : [parsed];
  };

  const mapImportedLead = (item) => {
    const lead = { ...emptyLead };
    Object.keys(lead).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        lead[key] = item[key] ?? '';
      }
    });
    lead.generalStatus = inferGeneralStatus(lead);
    return lead;
  };

  const handleImportJson = async () => {
    try {
      setImportError('');
      const records = parseJsonRecords(jsonInput);
      if (!records.length) {
        setImportError('Pegá al menos un objeto JSON para importar.');
        return;
      }

      for (const item of records) {
        await createLead(mapImportedLead(item));
      }
      setJsonInput('');
      await reload();
    } catch {
      setImportError('No se pudo interpretar el JSON. Verificá el formato y probá de nuevo.');
    }
  };

  const handleJsonFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      setJsonInput(content);
      setJsonFileName(file.name);
      setImportError('');
    } catch {
      setImportError('No se pudo leer el archivo seleccionado.');
      setJsonFileName('');
    } finally {
      event.target.value = '';
    }
  };

  return <section className="card">
    <h2>Leads</h2>
    <details>
      <summary>Importar lead(s) desde JSON</summary>
      <label>
        Adjuntar archivo JSON
        <input type="file" accept="application/json,.json,text/json" onChange={handleJsonFileChange} />
      </label>
      {jsonFileName && <p>Archivo cargado: <strong>{jsonFileName}</strong></p>}
      <label>
        Pegá uno o varios objetos JSON (o editá el contenido del archivo cargado)
        <textarea
          rows="8"
          placeholder='{"businessName":"Ejemplo","email":""}'
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />
      </label>
      {importError && <p role="alert">{importError}</p>}
      <button type="button" onClick={handleImportJson}>Importar JSON</button>
    </details>
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
