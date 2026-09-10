import React, { useEffect, useRef, useState } from 'react';
import { CameraModule, CasePreview, camStyleFor } from './components/CasePreview';
import { EditableLayer } from './components/EditableLayer';
import { useDesign } from './hooks/useDesign';
import { backgrounds, stickerPacks, templates as staticTemplates, BASE_PRICE_CENTS } from './mock';
import { CANVAS_BASE, MODELS, phoneModels, platformOf, sizeForModel } from './lib/types';
import type { Platform, Template, TextLayer } from './lib/types';
import { hasSupabase, supabase } from './lib/supabase';

const money = (c: number) => `$${(c / 100).toFixed(2)}`;

type View = 'home' | 'editor';

export default function App() {
  const [view, setView] = useState<View>('home');
  const design = useDesign(phoneModels[0].id);

  const openBlank = (modelId?: string) => {
    design.startBlank(modelId);
    setView('editor');
  };
  const openTemplate = (t: Template) => {
    design.startFromTemplate(t);
    setView('editor');
  };

  return (
    <div className="page">
      {view === 'home' ? (
        <Home onBlank={openBlank} onTemplate={openTemplate} onModel={openBlank} />
      ) : (
        <Editor design={design} onBack={() => setView('home')} />
      )}
    </div>
  );
}

/* ───────────────────────── Home ───────────────────────── */

function Home({
  onBlank,
  onTemplate,
  onModel,
}: {
  onBlank: () => void;
  onTemplate: (t: Template) => void;
  onModel: (modelId: string) => void;
}) {
  const [platform, setPlatform] = useState<Platform>('ios');
  const modelsForPlatform = phoneModels.filter((m) => platformOf(m) === platform);
  const [galleryTemplates, setGalleryTemplates] = useState<Template[]>(staticTemplates);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('templates')
      .select('*')
      .eq('active', true)
      .order('sort', { ascending: true })
      .then(({ data }) => {
        if (data && data.length) setGalleryTemplates(data as unknown as Template[]);
      });
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <div className="logo-dot">🐰</div>
          <span className="wordmark">casey</span>
        </div>
      </div>

      <div className="hero">
        <div className="hero-blob" />
        <span className="hero-pill">DIY PHONE CASE</span>
        <div className="hero-title">Design it.<br />Print it.<br />Love it.</div>
        <div className="hero-sub">100% you, 100% Casey 💗</div>
        <button className="btn soft" style={{ marginTop: 14 }} onClick={onBlank}>✨ Start designing</button>
        <div className="hero-bunny">🐰</div>
      </div>

      <div className="steps">
        {[
          { icon: '📱', label: 'Choose\nmodel' },
          { icon: '🖼️', label: 'Upload\n& design' },
          { icon: '📩', label: 'Send to\nCasey' },
          { icon: '📦', label: "We'll\nreach out" },
        ].map((s, i) => (
          <div className="step" key={s.label}>
            <div className="step-bubble">
              {s.icon}
              <span className="step-num">{i + 1}</span>
            </div>
            <span className="step-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Casey Case Gallery ✨</h2>
          <button className="section-action" onClick={onBlank}>Blank case</button>
        </div>
        <div className="hscroll">
          {galleryTemplates.map((t) => (
            <button key={t.id} className="tpl-card" onClick={() => onTemplate(t)}>
              <CasePreview
                modelId={phoneModels[0].id}
                background={t.background}
                layers={t.layers.map((l, i) => ({ ...l, id: `${t.id}_${i}`, z: (l as any).z ?? i + 1 })) as any}
                width={126}
              />
              <div>
                {t.tag && <span className="pill" style={{ background: t.accent }}>{t.tag}</span>}
                <div className="tpl-name">{t.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-header"><h2 className="section-title">Sticker packs 🎀</h2></div>
        <div className="hscroll">
          {stickerPacks.map((p) => (
            <button key={p.id} className="pack-card" onClick={onBlank}>
              <div style={{ fontSize: 30 }}>{p.cover}</div>
              <div className="pack-name">{p.name}</div>
              <div className="pack-count">{p.stickers.length} stickers</div>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-header"><h2 className="section-title">Pick your phone 📱</h2></div>
        <div className="seg-row">
          <button className={`seg ${platform === 'ios' ? 'active' : ''}`} onClick={() => setPlatform('ios')}>🍎 iPhone</button>
          <button className={`seg ${platform === 'android' ? 'active' : ''}`} onClick={() => setPlatform('android')}>🤖 Android</button>
        </div>
        <div className="chip-row">
          {modelsForPlatform.map((m) => (
            <button key={m.id} className="chip" onClick={() => onModel(m.id)}>{m.brand} {m.name}</button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-header"><h2 className="section-title">Base colors 🎨</h2></div>
        <div className="swatch-row">
          {backgrounds.map((b) => (
            <div className="swatch-col" key={b.id}>
              <div className="swatch" style={{ background: `linear-gradient(135deg, ${b.colors[0]}, ${b.colors[b.colors.length - 1]})` }} />
              <span className="swatch-name">{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-note">Love. Print. Stan. Repeat. 🐰<br />#CASEYCASE #DIYKC</div>

      <div className="fab">
        <button className="btn cool lg" onClick={onBlank}>🖌️ Design your case</button>
      </div>
    </>
  );
}

/* ───────────────────────── Editor ───────────────────────── */

type Tool = 'photo' | 'text' | 'stickers' | 'color' | 'model';
const TEXT_COLORS = ['#FFFFFF', '#141018', '#FF3E9A', '#D6006E', '#FFD400', '#7B61FF', '#3EC8A0', '#FF5470'];

function Editor({ design, onBack }: { design: ReturnType<typeof useDesign>; onBack: () => void }) {
  const { design: d, selectedId, select, setBackground, setModel, addSticker, addText, addImage, updateLayer, removeLayer, duplicateLayer, bringToFront } = design;
  const model = MODELS[d.modelId] ?? phoneModels[0];
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tool, setTool] = useState<Tool>('stickers');
  const [activePack, setActivePack] = useState(stickerPacks[0].id);
  const [textModal, setTextModal] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [sendModal, setSendModal] = useState(false);

  const { width: canvasW, height: canvasH } = sizeForModel(model, 300);
  const scale = canvasW / CANVAS_BASE;
  const radius = canvasW * 0.14;
  const selected = d.layers.find((l) => l.id === selectedId) ?? null;
  const ordered = [...d.layers].sort((a, b) => a.z - b.z);

  const pickImage = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const uri = reader.result as string;
      const img = new Image();
      img.onload = () => addImage(uri, img.naturalWidth || 1000, img.naturalHeight || 1000);
      img.src = uri;
    };
    reader.readAsDataURL(file);
  };

  const openTextEditor = () => {
    setDraftText(selected?.kind === 'text' ? selected.text : '');
    setTextModal(true);
  };
  const commitText = () => {
    const value = draftText.trim() || 'Casey';
    if (selected?.kind === 'text') updateLayer(selected.id, { text: value });
    else addText(value);
    setTextModal(false);
  };

  return (
    <>
      <div className="editor-topbar">
        <button className="icon-btn" onClick={onBack}>✕</button>
        <div>
          <p className="editor-title">Casey Studio</p>
          <p className="editor-subtitle">{model.brand} {model.name}</p>
        </div>
        <button className="send-btn" onClick={() => setSendModal(true)}>Send to Casey →</button>
      </div>

      <div className="price-tag">from {money(BASE_PRICE_CENTS)}</div>

      <div className="stage" onPointerDown={() => select(null)}>
        <div ref={canvasRef} className="canvas" style={{ width: canvasW, height: canvasH, borderRadius: radius }}>
          <div
            style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(135deg, ${d.background.colors[0]}, ${d.background.colors[d.background.colors.length - 1]})`,
            }}
          />
          {ordered.map((l) => (
            <EditableLayer key={l.id} layer={l} selected={l.id === selectedId} scale={scale} canvasRef={canvasRef} onSelect={select} onChange={updateLayer} />
          ))}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <CameraModule style={camStyleFor(model)} width={canvasW} height={canvasH} tint={d.background.colors[0]} />
          </div>
        </div>
        {d.layers.length === 0 && <p className="panel-hint" style={{ position: 'absolute', bottom: 8 }}>Add stickers, text or a photo 👇</p>}
      </div>

      {selected && (
        <div className="actions-row">
          {selected.kind === 'text' && <button className="action-btn" onClick={openTextEditor}>✏️ Edit</button>}
          <button className="action-btn" onClick={() => updateLayer(selected.id, { scale: Math.max(0.3, selected.scale / 1.15) })}>➖ Smaller</button>
          <button className="action-btn" onClick={() => updateLayer(selected.id, { scale: Math.min(6, selected.scale * 1.15) })}>➕ Bigger</button>
          <button className="action-btn" onClick={() => updateLayer(selected.id, { rotation: selected.rotation + Math.PI / 12 })}>🔄 Rotate</button>
          <button className="action-btn" onClick={() => duplicateLayer(selected.id)}>📄 Copy</button>
          <button className="action-btn" onClick={() => bringToFront(selected.id)}>⬆️ Front</button>
          <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => removeLayer(selected.id)}>🗑️ Delete</button>
        </div>
      )}

      <div className="panel-wrap">
        {tool === 'photo' && (
          <div className="panel">
            <button className="btn" onClick={pickImage}>☁️ Upload a photo</button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
            <p className="panel-hint">Add your bias, selfies or any pic. Drag the corner handle to resize & rotate.</p>
          </div>
        )}
        {tool === 'text' && (
          <div className="panel">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn" style={{ flex: 1 }} onClick={openTextEditor}>➕ Add text</button>
              {selected?.kind === 'text' && (
                <>
                  <button className="step-btn" onClick={() => updateLayer(selected.id, { fontSize: Math.max(12, (selected as TextLayer).fontSize - 4) })}>−</button>
                  <button className="step-btn" onClick={() => updateLayer(selected.id, { fontSize: Math.min(80, (selected as TextLayer).fontSize + 4) })}>+</button>
                </>
              )}
            </div>
            {selected?.kind === 'text' ? (
              <div className="hscroll">
                {TEXT_COLORS.map((c) => (
                  <button key={c} className={`color-dot ${selected.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => updateLayer(selected.id, { color: c })} />
                ))}
              </div>
            ) : (
              <p className="panel-hint">Add text, then tap it to change color & size.</p>
            )}
          </div>
        )}
        {tool === 'color' && (
          <div className="panel">
            <div className="hscroll">
              {backgrounds.map((b) => (
                <button key={b.id} className="swatch-col" style={{ background: 'none', border: 'none' }} onClick={() => setBackground(b)}>
                  <div className={`bg-swatch ${d.background.id === b.id ? 'active' : ''}`} style={{ background: `linear-gradient(135deg, ${b.colors[0]}, ${b.colors[b.colors.length - 1]})` }} />
                  <span className="swatch-name">{b.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {tool === 'model' && (
          <div className="panel">
            <ModelPicker modelId={d.modelId} onSetModel={setModel} />
          </div>
        )}
        {tool === 'stickers' && (
          <div className="panel">
            <div className="hscroll">
              {stickerPacks.map((p) => (
                <button key={p.id} className={`chip ${activePack === p.id ? 'active' : ''}`} onClick={() => setActivePack(p.id)}>{p.cover} {p.name}</button>
              ))}
            </div>
            <div className="hscroll">
              {stickerPacks.find((p) => p.id === activePack)?.stickers.map((s) => (
                <button key={s.id} className="sticker-btn" onClick={() => addSticker(s.emoji!)}>{s.emoji}</button>
              ))}
            </div>
          </div>
        )}

        <div className="tabbar">
          <TabBtn icon="🖼️" label="Photo" active={tool === 'photo'} onClick={() => setTool('photo')} />
          <TabBtn icon="🔤" label="Text" active={tool === 'text'} onClick={() => setTool('text')} />
          <TabBtn icon="😊" label="Stickers" active={tool === 'stickers'} onClick={() => setTool('stickers')} />
          <TabBtn icon="🎨" label="Color" active={tool === 'color'} onClick={() => setTool('color')} />
          <TabBtn icon="📱" label="Model" active={tool === 'model'} onClick={() => setTool('model')} />
        </div>
      </div>

      {textModal && (
        <div className="modal-backdrop" onClick={() => setTextModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{selected?.kind === 'text' ? 'Edit text' : 'Add text'}</h3>
            <textarea className="f" autoFocus rows={3} placeholder="Type something cute…" value={draftText} onChange={(e) => setDraftText(e.target.value)} />
            <button className="btn" style={{ marginTop: 12, width: '100%' }} onClick={commitText}>✓ Done</button>
          </div>
        </div>
      )}

      {sendModal && <SendModal design={d} onClose={() => setSendModal(false)} onSent={onBack} />}
    </>
  );
}

function TabBtn({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={`tab ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="tab-icon">{icon}</span>
      <span className="tab-label">{label}</span>
    </button>
  );
}

function ModelPicker({ modelId, onSetModel }: { modelId: string; onSetModel: (id: string) => void }) {
  const current = MODELS[modelId] ?? phoneModels[0];
  const [platform, setPlatform] = useState<Platform>(platformOf(current));
  const list = phoneModels.filter((m) => platformOf(m) === platform);

  const choosePlatform = (p: Platform) => {
    setPlatform(p);
    if (platformOf(current) !== p) {
      const first = phoneModels.find((m) => platformOf(m) === p);
      if (first) onSetModel(first.id);
    }
  };

  return (
    <>
      <div className="seg-row">
        <button className={`seg ${platform === 'ios' ? 'active' : ''}`} onClick={() => choosePlatform('ios')}>🍎 iPhone</button>
        <button className={`seg ${platform === 'android' ? 'active' : ''}`} onClick={() => choosePlatform('android')}>🤖 Android</button>
      </div>
      <div className="hscroll">
        {list.map((m) => (
          <button key={m.id} className={`chip ${modelId === m.id ? 'active' : ''}`} onClick={() => onSetModel(m.id)}>{m.brand} {m.name}</button>
        ))}
      </div>
    </>
  );
}

/* ───────────────────────── Send to Casey ───────────────────────── */

function SendModal({ design, onClose, onSent }: { design: ReturnType<typeof useDesign>['design']; onClose: () => void; onSent: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const valid = name.trim().length > 0 && email.includes('@');

  const submit = async () => {
    setSending(true);
    if (supabase) {
      await supabase.from('designs').insert({
        model_id: design.modelId,
        background: design.background,
        layers: design.layers,
        contact_name: name.trim(),
        contact_email: email.trim(),
        contact_phone: phone.trim() || null,
        note: note.trim() || null,
        status: 'new',
      });
    }
    setSending(false);
    setSent(true);
  };

  const finish = () => {
    onClose();
    onSent();
  };

  return (
    <div className="modal-backdrop" onClick={sent ? undefined : onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="success-box">
            <div className="success-emoji">🎉</div>
            <h3 className="modal-title">Sent to Casey!</h3>
            <p className="modal-sub">We'll reach out at {email} about printing and pickup/shipping. Thanks for designing with us 💗</p>
            <button className="btn" style={{ width: '100%' }} onClick={finish}>Done</button>
          </div>
        ) : (
          <>
            <h3 className="modal-title">Send your design ✨</h3>
            <p className="modal-sub">No payment here — we'll follow up with you directly to sort out printing and delivery.</p>
            {!hasSupabase && <div className="notice" style={{ margin: '0 0 10px' }}>🔌 Demo mode — this won't actually reach anyone yet.</div>}
            <label>Your name</label>
            <input className="f" value={name} onChange={(e) => setName(e.target.value)} placeholder="Casey Bunny" />
            <label>Email</label>
            <input className="f" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            <label>Phone (optional)</label>
            <input className="f" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="012 345 678" />
            <label>Note (optional)</label>
            <textarea className="f" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ship or pickup? Any special request?" />
            <button className="btn" style={{ width: '100%', marginTop: 14, opacity: valid ? 1 : 0.5 }} disabled={!valid || sending} onClick={submit}>
              {sending ? 'Sending…' : '📩 Send to Casey'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
