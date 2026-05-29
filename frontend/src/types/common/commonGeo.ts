
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Geographic and Regional Types
export type IndianState =
  | "Andhra Pradesh"
  | "Arunachal Pradesh"
  | "Assam"
  | "Bihar"
  | "Chhattisgarh"
  | "Goa"
  | "Gujarat"
  | "Haryana"
  | "Himachal Pradesh"
  | "Jharkhand"
  | "Karnataka"
  | "Kerala"
  | "Madhya Pradesh"
  | "Maharashtra"
  | "Manipur"
  | "Meghalaya"
  | "Mizoram"
  | "Nagaland"
  | "Odisha"
  | "Punjab"
  | "Rajasthan"
  | "Sikkim"
  | "Tamil Nadu"
  | "Telangana"
  | "Tripura"
  | "Uttar Pradesh"
  | "Uttarakhand"
  | "West Bengal"
  | "Delhi"
  | "Jammu and Kashmir"
  | "Ladakh"
  | "Chandigarh"
  | "Dadra and Nagar Haveli"
  | "Daman and Diu"
  | "Lakshadweep"
  | "Puducherry"
  | "Andaman and Nicobar Islands";

export type Region =
  | "North"
  | "South"
  | "East"
  | "West"
  | "Central"
  | "Northeast";

export type UrbanClassification =
  | "metropolitan"
  | "urban"
  | "semi_urban"
  | "rural"
  | "remote";

