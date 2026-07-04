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
  parent_id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string | null;
  event_date: string | null;
  message: string | null;
  status: "new" | "replied" | "booked" | "declined";
  created_at: string;
};

export type Message = {
  id: string;
  booking_request_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type EntertainerPhoto = {
  id: string;
  entertainer_id: string;
  photo_url: string;
  created_at: string;
};

export type Like = {
  id: string;
  parent_id: string;
  entertainer_id: string;
  created_at: string;
};

export type ParentNote = {
  id: string;
  parent_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type UnavailableDate = {
  id: string;
  entertainer_id: string;
  date: string;
  created_at: string;
};

export type BookingOffer = {
  id: string;
  booking_request_id: string;
  proposed_by: string;
  proposed_date: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};

export type EntertainerReview = {
  id: string;
  booking_request_id: string;
  entertainer_id: string;
  parent_id: string;
  rating: number;
  body: string | null;
  created_at: string;
};
