export const generatePartnershipDossierPDF = (formData?: any) => {
  const content = `
ETERNAL REPOS — INSTITUTIONAL PARTNERSHIP DOSSIER
==================================================
Organization: ${formData?.orgName || 'N/A'}
Contact Person: ${formData?.contactPerson || 'N/A'}
Role: ${formData?.role || 'N/A'}
Email: ${formData?.email || 'N/A'}
Phone: ${formData?.phone || 'N/A'}
City: ${formData?.city || 'India'}
Requirement: ${formData?.requirementType || 'Turnkey Mobility Solutions'}

Thank you for your interest in Eternal Repos Institutional Mobility.
Our executive team will contact you within 24 hours.
  `.trim();

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Eternal_Institutional_Dossier_${Date.now()}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateVehicleSpecsPDF = () => {
  const content = `
ETERNAL REPOS — VEHICLE SPECIFICATIONS SHEET
==================================================
Model: Eternal Ceremonial Sanctuary V1
Dimensions: 5,420mm (L) x 1,910mm (W) x 2,050mm (H)
Cooling System: Dual-compressor active sub-zero cooling (0°C to 4°C)
Lighting: 2700K Warm Ambient Soft LED Sanctuary Illumination
Privacy: Electrochromic Smart Glass (99.8% opacity on demand)
Suspension: Air-ride adaptive damping for vibration-free transport

For full engineering blueprints, contact our concierge at concierge@eternalrepos.com.
  `.trim();

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Eternal_Vehicle_Specifications_${Date.now()}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
