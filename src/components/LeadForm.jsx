import { useState } from 'react';
import { GENERAL_STATUSES, RESPONSE_STATUSES } from '../utils/constants';
import { emptyLead, inferGeneralStatus } from '../utils/leadHelpers';

export default function LeadForm({ initialData = emptyLead, onSubmit }) {
  const [form, setForm] = useState({ ...emptyLead, ...initialData });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const handleToggle = (k) => {
    const next = { ...form, [k]: !form[k] };
    next.generalStatus = inferGeneralStatus(next);
    setForm(next);
  };

  return <form className="card form-grid" onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, generalStatus: inferGeneralStatus(form) }); }}>
    {['businessName','businessCategory','city','address','contactPerson','email','whatsapp','source','opportunityScore','googleMapsUrl','websiteUrl','instagramUrl','facebookUrl','githubRepoUrl','websitePreviewUrl','sentDate','paymentDate','paymentAmount'].map((field) => (
      <label key={field}>{field}<input value={form[field] ?? ''} onChange={(e) => set(field, e.target.value)} /></label>
    ))}
    <label>notes<textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} /></label>
    <label>painPoints<textarea value={form.painPoints} onChange={(e) => set('painPoints', e.target.value)} /></label>
    <label>clientResponse<textarea value={form.clientResponse} onChange={(e) => set('clientResponse', e.target.value)} /></label>
    <label>General Status<select value={form.generalStatus} onChange={(e) => set('generalStatus', e.target.value)}>{GENERAL_STATUSES.map((s)=><option key={s}>{s}</option>)}</select></label>
    <label>Client Response Status<select value={form.clientResponseStatus} onChange={(e) => set('clientResponseStatus', e.target.value)}>{RESPONSE_STATUSES.map((s)=><option key={s}>{s}</option>)}</select></label>
    {['isApproved','repoCreated','codexPromptReady','websiteCreated','projectSentToClient','clientPaid'].map((k)=><label key={k}><input type="checkbox" checked={form[k]} onChange={() => handleToggle(k)} /> {k}</label>)}
    <button type="submit">Save Lead</button>
  </form>;
}
