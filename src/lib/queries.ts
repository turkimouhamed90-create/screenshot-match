import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const pagesQuery = queryOptions({
  queryKey: ["pages"],
  queryFn: async () => {
    const { data, error } = await supabase.from("landing_pages").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const ordersQuery = queryOptions({
  queryKey: ["orders"],
  queryFn: async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});
