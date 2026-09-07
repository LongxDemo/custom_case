import { Design, LayerSpec, Template } from '../data/types';
import { supabase } from './supabase';

type TemplateRow = {
  id: string;
  name: string;
  tag: string | null;
  accent: string | null;
  background: Template['background'];
  layers: LayerSpec[];
  uses_count: number;
};

function fromRow(row: TemplateRow): Template {
  return {
    id: row.id,
    name: row.name,
    tag: row.tag ?? undefined,
    accent: row.accent ?? '#FF3E9A',
    background: row.background,
    layers: row.layers,
    usesCount: row.uses_count,
    active: true,
  };
}

/**
 * Gallery templates from Supabase. Returns null (not []) when there's no
 * backend so callers can fall back to the bundled catalog.ts defaults —
 * mirrors the local/mock-mode convention used throughout src/lib/sync.ts.
 */
export async function fetchTemplates(): Promise<Template[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('id, name, tag, accent, background, layers, uses_count')
      .eq('active', true)
      .order('sort', { ascending: true });
    if (error) throw error;
    return (data as TemplateRow[]).map(fromRow);
  } catch (e) {
    console.warn('fetchTemplates failed', e);
    return null;
  }
}

/** Fire-and-forget popularity ping — a customer tapped this template to start designing. */
export function recordTemplateUse(templateId: string): void {
  if (!supabase) return;
  supabase.rpc('increment_template_uses', { p_template_id: templateId }).then(({ error }) => {
    if (error) console.warn('recordTemplateUse failed', error);
  });
}

/** Whether the signed-in user is a Casey admin (always false without a backend/session). */
export async function isCurrentUserAdmin(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;
    const { data, error } = await supabase.rpc('am_i_admin');
    if (error) throw error;
    return Boolean(data);
  } catch (e) {
    console.warn('isCurrentUserAdmin failed', e);
    return false;
  }
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);

/**
 * Admin-only: publish the current design to the Casey Case Gallery. RLS
 * enforces admin-write server-side regardless of what the client sends.
 */
export async function publishTemplate(
  design: Design,
  meta: { name: string; tag?: string; accent: string }
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const id = `t-${slugify(meta.name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase.from('templates').insert({
      id,
      name: meta.name,
      tag: meta.tag || null,
      accent: meta.accent,
      background: design.background,
      layers: design.layers.map(({ id: _id, ...rest }) => rest),
      active: true,
    });
    if (error) throw error;
    return true;
  } catch (e) {
    console.warn('publishTemplate failed', e);
    return false;
  }
}
