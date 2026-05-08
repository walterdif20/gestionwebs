export const emptyLead = {
  businessName: '', businessCategory: '', city: '', address: '', googleMapsUrl: '', websiteUrl: '', instagramUrl: '', facebookUrl: '',
  email: '', whatsapp: '', contactPerson: '', notes: '', painPoints: '', opportunityScore: 0, source: '',
  isApproved: false, repoCreated: false, githubRepoUrl: '', codexPromptReady: false, codexPrompt: '', websiteCreated: false,
  websitePreviewUrl: '', projectSentToClient: false, sentDate: '', clientResponse: '', clientResponseStatus: 'No response yet',
  clientPaid: false, paymentDate: '', paymentAmount: '', finalDomainSelected: '', generalStatus: 'New'
};

export function inferGeneralStatus(lead) {
  if (lead.clientPaid) return 'Paid';
  if (lead.clientResponseStatus === 'Accepted') return 'Accepted';
  if (lead.clientResponseStatus === 'Rejected') return 'Rejected';
  if (lead.projectSentToClient) return 'Sent to Client';
  if (lead.websiteCreated) return 'Website Created';
  if (lead.codexPromptReady) return 'Prompt Ready';
  if (lead.repoCreated) return 'Repo Created';
  if (lead.isApproved) return 'Approved';
  return lead.generalStatus || 'New';
}

export function buildPromptTemplate(lead) {
  return `Create a modern, responsive local business website.\n\nBusiness: ${lead.businessName}\nCategory: ${lead.businessCategory}\nCity: ${lead.city}\nAddress: ${lead.address}\nContact channels: WhatsApp ${lead.whatsapp}, Email ${lead.email}, Instagram ${lead.instagramUrl}\nPain points: ${lead.painPoints}\nSEO goal: rank for local intent and increase lead generation\nWhatsApp CTA: Add a sticky button with click-to-chat action\nLocal SEO keywords: \"${lead.businessCategory} in ${lead.city}\", \"best ${lead.businessCategory} ${lead.city}\"\nRequired sections: Hero, Services, Social proof/testimonials, About, FAQ, Contact with map and WhatsApp CTA.`;
}
