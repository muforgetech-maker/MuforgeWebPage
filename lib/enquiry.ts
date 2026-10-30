export const enquiryServices = [
  "Custom Software Development",
  "Website Development",
  "Digital Marketing",
  "Product Photography & Video Editing",
  "SAP FICO Training",
  "SAP MM Training",
] as const;

export const enquiryBudgets = [
  "Under ₹25,000",
  "₹25,000 - ₹50,000",
  "₹50,000 - ₹1,00,000",
  "₹1,00,000 - ₹3,00,000",
  "₹3,00,000+",
  "Not sure yet",
] as const;

export const preferredContactMethods = ["Email", "Phone", "WhatsApp"] as const;

export type EnquiryData = {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  description: string;
  preferredContact: string;
  website: string;
};
