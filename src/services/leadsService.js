import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { sampleLeads } from './seedData';

const fallbackKey = 'crm_leads_fallback';
const isFirebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);

const readFallback = () => {
  const data = JSON.parse(localStorage.getItem(fallbackKey) || 'null');
  if (!data) { writeFallback(sampleLeads); return sampleLeads; }
  return data;
};
const writeFallback = (data) => localStorage.setItem(fallbackKey, JSON.stringify(data));

export async function getLeads() {
  if (!isFirebaseConfigured) return readFallback();
  const snapshot = await getDocs(collection(db, 'leads'));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getLeadById(leadId) {
  if (!isFirebaseConfigured) return readFallback().find((l) => l.id === leadId);
  const snap = await getDoc(doc(db, 'leads', leadId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createLead(lead) {
  const payload = { ...lead, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (!isFirebaseConfigured) {
    const all = readFallback();
    const newLead = { id: crypto.randomUUID(), ...payload, domains: [] };
    writeFallback([newLead, ...all]);
    return newLead.id;
  }
  const ref = await addDoc(collection(db, 'leads'), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

export async function updateLead(leadId, partialLead) {
  if (!isFirebaseConfigured) {
    const all = readFallback().map((l) => (l.id === leadId ? { ...l, ...partialLead, updatedAt: new Date().toISOString() } : l));
    writeFallback(all);
    return;
  }
  await updateDoc(doc(db, 'leads', leadId), { ...partialLead, updatedAt: serverTimestamp() });
}

export async function deleteLead(leadId) {
  if (!isFirebaseConfigured) {
    writeFallback(readFallback().filter((l) => l.id !== leadId));
    return;
  }
  await deleteDoc(doc(db, 'leads', leadId));
}

export async function addDomain(leadId, domain) {
  if (!isFirebaseConfigured) {
    const all = readFallback();
    const lead = all.find((l) => l.id === leadId);
    lead.domains = lead.domains || [];
    lead.domains.push({ id: crypto.randomUUID(), leadId, ...domain });
    writeFallback(all);
    return;
  }
  await setDoc(doc(collection(db, 'leads', leadId, 'domains')), { leadId, ...domain });
}

export async function updateDomain(leadId, domainId, partial) {
  if (!isFirebaseConfigured) {
    const all = readFallback();
    const lead = all.find((l) => l.id === leadId);
    lead.domains = (lead.domains || []).map((d) => (d.id === domainId ? { ...d, ...partial } : d));
    if (partial.isSelected) {
      lead.finalDomainSelected = `${partial.domainName || ''}${partial.extension || ''}`;
    }
    writeFallback(all);
    return;
  }
  await updateDoc(doc(db, 'leads', leadId, 'domains', domainId), partial);
}

export async function deleteDomain(leadId, domainId) {
  if (!isFirebaseConfigured) {
    const all = readFallback();
    const lead = all.find((l) => l.id === leadId);
    lead.domains = (lead.domains || []).filter((d) => d.id !== domainId);
    writeFallback(all);
    return;
  }
  await deleteDoc(doc(db, 'leads', leadId, 'domains', domainId));
}
