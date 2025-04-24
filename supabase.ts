export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string;
          content: string;
          sender_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          sender_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          sender_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
