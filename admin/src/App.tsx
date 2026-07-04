import { useEffect, useMemo, useState } from 'react';
import { CasePreview } from './components/CasePreview';
import { hasSupabase, supabase } from './lib/supabase';
import { MODELS } from './lib/types';
import type { DesignRow, FrontPage, OrderRow } from './lib/types';
import { mockDesigns, mockFrontPage, mockOrders } from './mock';

type Page = 'overview' | 'front' | 'designs' | 'orders';
const ORDER_STATUSES = ['pending', 'paid', 'printing', 'shipped', 'ready_pickup', 'completed', 'cancelled'];
const money = (c: number) => `$${(c / 100).toFixed(2)}`;

export default function App() {
  const [session, setSession] = useState<boolean>(!hasSupabase); // demo mode = logged in
  const [ready, setReady] = useState<boolean>(!hasSupabase);
  const [page, setPage] = useState<Page>('overview');
  const [email, setEmail] = useState<string>('demo mode');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
      setEmail(data.session?.user.email ?? '');
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(!!s);
      setEmail(s?.user.email ?? '');
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return <div className="login-wrap"><div className="login-card"><h1>casey</h1><p>Loading…</p></div></div>;
  if (!session) return <Login />;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span className="logo">🐰</span><span className="word">casey</span></div>
        <NavItem icon="📊" label="Overview" active={page === 'overview'} onClick={() => setPage('overview')} />
        <NavItem icon="🏠" label="Front Page" active={page === 'front'} onClick={() => setPage('front')} />
        <NavItem icon="🎨" label="Designs" active={page === 'designs'} onClick={() => setPage('designs')} />
        <NavItem icon="📦" label="Orders" active={page === 'orders'} onClick={() => setPage('orders')} />
        <div className="nav-spacer" />
        <div className="nav-user">{email}</div>
        {supabase && <button className="nav-item" onClick={() => supabase!.auth.signOut()}>↩︎ Sign out</button>}
      </aside>
      <main className="main">
        {!hasSupabase && <div className="notice">🔌 Demo mode — showing sample data. Add <code>VITE_SUPABASE_URL</code> &amp; <code>VITE_SUPABASE_ANON_KEY</code> in <code>admin/.env</code> to connect the live backend.</div>}
        {page === 'overview' && <Overview />}
        {page === 'front' && <FrontPageEditor />}
        {page === 'designs' && <Designs />}
        {page === 'orders' && <Orders />}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}><span>{icon}</span>{label}</button>;
}

/* ───────────────────────── Login ───────────────────────── */
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!supabase) return;
    setLoading(true); setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setErr(error.message);
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>casey</h1>
        <p>Admin dashboard — sign in to continue 💗</p>
        <input className="f" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="f" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p style={{ color: '#ff5470' }}>{err}</p>}
        <button className="btn" style={{ width: '100%', justifyContent: 'center' }} disabled={loading} onClick={submit}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Overview ───────────────────────── */
function Overview() {
  const [designs, setDesigns] = useState<DesignRow[]>(mockDesigns);
  const [orders, setOrders] = useState<OrderRow[]>(mockOrders);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('designs').select('*').then(({ data }) => data && setDesigns(data as DesignRow[]));
    supabase.from('orders').select('*').then(({ data }) => data && setOrders(data as OrderRow[]));
  }, []);

  const revenue = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'pending').reduce((a, o) => a + o.total_cents, 0);
  const pending = orders.filter((o) => ['paid', 'printing'].includes(o.status)).length;

  return (
    <>
      <h1 className="page-title">Overview</h1>
      <p className="page-sub">Your Casey store at a glance ✨</p>
      <div className="stat-row">
        <Stat n={String(designs.length)} l="Designs collected" />
        <Stat n={String(orders.length)} l="Total orders" />
        <Stat n={money(revenue)} l="Revenue" />
        <Stat n={String(pending)} l="To fulfill" />
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Latest designs</h3>
        <div className="design-grid">
          {designs.slice(0, 6).map((d) => (
            <div className="design-cell" key={d.id}>
              <CasePreview modelId={d.model_id} background={d.background} layers={d.layers} width={130} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return <div className="stat"><div className="n">{n}</div><div className="l">{l}</div></div>;
}

/* ───────────────────────── Front Page editor ───────────────────────── */
function FrontPageEditor() {
  const [fp, setFp] = useState<FrontPage>(mockFrontPage);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('front_page').select('*').eq('id', 1).single().then(({ data }) => data && setFp(data as FrontPage));
  }, []);

  const save = async () => {
    if (supabase) await supabase.from('front_page').update({ ...fp, updated_at: new Date().toISOString() }).eq('id', 1);
    setSaved(true); setTimeout(() => setSaved(false), 1800);
  };

  const set = (patch: Partial<FrontPage>) => setFp((f) => ({ ...f, ...patch }));

  return (
    <>
      <h1 className="page-title">Front Page</h1>
      <p className="page-sub">Control what customers see when they open the app.</p>
      <div className="card" style={{ maxWidth: 620 }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <div><label>Hero title</label><textarea className="f" rows={2} value={fp.hero_title} onChange={(e) => set({ hero_title: e.target.value })} /></div>
          <div><label>Hero subtitle</label><input className="f" value={fp.hero_subtitle} onChange={(e) => set({ hero_subtitle: e.target.value })} /></div>
          <div><label>CTA button text</label><input className="f" value={fp.hero_cta} onChange={(e) => set({ hero_cta: e.target.value })} /></div>
          <div><label>Promo banner (optional)</label><input className="f" value={fp.banner_text ?? ''} onChange={(e) => set({ banner_text: e.target.value })} /></div>
          <div>
            <label>Featured templates</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['t-stan', 't-love', 't-bunny', 't-idol'].map((id) => {
                const on = fp.featured_template_ids.includes(id);
                return (
                  <button key={id} className={`chip-pick ${on ? 'on' : ''}`} onClick={() => set({ featured_template_ids: on ? fp.featured_template_ids.filter((x) => x !== id) : [...fp.featured_template_ids, id] })}>
                    {on ? '✓ ' : ''}{id.replace('t-', '')}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn" onClick={save}>Save changes</button>
            {saved && <span style={{ color: 'var(--success)', fontWeight: 700 }}>Saved ✓</span>}
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────────────────────── Designs ───────────────────────── */
function Designs() {
  const [designs, setDesigns] = useState<DesignRow[]>(mockDesigns);
  useEffect(() => {
    if (!supabase) return;
    supabase.from('designs').select('*').order('created_at', { ascending: false }).then(({ data }) => data && setDesigns(data as DesignRow[]));
  }, []);

  return (
    <>
      <h1 className="page-title">Customer Designs</h1>
      <p className="page-sub">Every case your customers have created — {designs.length} collected.</p>
      {designs.length === 0 ? (
        <div className="empty">No designs yet 🐰</div>
      ) : (
        <div className="design-grid">
          {designs.map((d) => (
            <div className="design-cell" key={d.id}>
              <CasePreview modelId={d.model_id} background={d.background} layers={d.layers} width={150} />
              <div className="design-meta">
                {MODELS[d.model_id ?? '']?.name ?? d.model_id}<br />
                {d.user_id ? '👤 member' : '👻 guest'} · {new Date(d.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ───────────────────────── Orders ───────────────────────── */
function Orders() {
  const [orders, setOrders] = useState<OrderRow[]>(mockOrders);
  useEffect(() => {
    if (!supabase) return;
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => data && setOrders(data as OrderRow[]));
  }, []);

  const setStatus = async (id: string, status: string) => {
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
    if (supabase) await supabase.from('orders').update({ status }).eq('id', id);
  };

  const total = useMemo(() => orders.reduce((a, o) => a + o.total_cents, 0), [orders]);

  return (
    <>
      <h1 className="page-title">Orders</h1>
      <p className="page-sub">{orders.length} orders · {money(total)} lifetime</p>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Fulfillment</th><th>Total</th><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 800 }}>{o.order_no}</td>
                <td>{o.full_name}<br /><span style={{ color: 'var(--ink-faint)', fontWeight: 500 }}>{o.email}</span></td>
                <td><span className="badge">{o.fulfillment === 'ship' ? '📦 Ship' : '🏬 Pickup'}</span></td>
                <td style={{ fontWeight: 800, color: 'var(--pink-dark)' }}>{money(o.total_cents)}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  <select className="status" value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
