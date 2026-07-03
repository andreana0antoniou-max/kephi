export type Entertainer = {
  id: string;
  business_name: string;
  entertainer_type: string;
  bio: string | null;
  price_from: number | null;
  price_unit: string | null;
  town: string;
  region: string | null;
  contact_email: string;
  contact_phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingRequest = {
  id: string;
  entertainer_id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string | null;
  event_date: string | null;
  message: string | null;
  status: "new" | "replied" | "booked" | "declined";
  created_at: string;
};
