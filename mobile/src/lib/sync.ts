import { Design } from '../data/types';
import { supabase } from './supabase';

/**
 * Persist a customer design to Supabase so it shows up in the admin dashboard.
 * No-op in local/mock mode (returns null). Guest designs are saved with a
 * null user_id; logged-in users get their id attached automatically.
 */
export async function saveDesign(design: Design): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('designs')
      .insert({
        user_id: userData.user?.id ?? null,
        model_id: design.modelId,
        background: design.background,
        layers: design.layers,
      })
      .select('id')
      .single();
    if (error) throw error;
    return data?.id ?? null;
  } catch (e) {
    console.warn('saveDesign failed', e);
    return null;
  }
}
