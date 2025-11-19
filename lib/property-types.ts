// Property interface used throughout the application
// Maps to the structure in real_data.ts
export interface Property {
  id: string;
  price: number;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  propertyType: string;
  landSize: number;
  buildingArea: number;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  facilities: string[];
  yearBuilt: number;
  energyRating: string;
  maintenanceCostAnnual: number;
  estimatedRentalValueWeekly: number;
  medianPrice: number;
  agentName: string;
  agency: string;
  nearbySchools: number;
  nearbyTransport: number;

  // Optional extended fields from real_data.ts
  grannyFlat?: string;
  utilities?: string;
  nbnType?: string;
  securityFeatures?: string;
  airConditioning?: string;
  agencyContact?: string;
  propertyExternalId?: string;
  nearbySchoolsKm?: number;
  nearbyTransportKm?: number;
  maintenanceRatio?: number; // derived: maintenanceCostAnnual / price
  score?: number; // optional match score (0-100)
}
