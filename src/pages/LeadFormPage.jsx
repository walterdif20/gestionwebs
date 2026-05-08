import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LeadForm from '../components/LeadForm';
import { createLead, getLeadById, updateLead } from '../services/leadsService';

export default function LeadFormPage({ mode }) {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  useEffect(() => { if (mode === 'edit') getLeadById(leadId).then(setLead); }, [mode, leadId]);

  const onSubmit = async (values) => {
    if (mode === 'edit') await updateLead(leadId, values);
    else await createLead(values);
    navigate('/leads');
  };

  if (mode === 'edit' && !lead) return <div className="card">Loading...</div>;
  return <section><h2>{mode === 'edit' ? 'Editar lead' : 'Crear lead'}</h2><LeadForm initialData={lead || undefined} onSubmit={onSubmit} /></section>;
}
