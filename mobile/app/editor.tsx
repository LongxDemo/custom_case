import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CANVAS_BASE, CameraModule, camStyleFor } from '../src/components/CasePreview';
import { EditableLayer } from '../src/components/EditableLayer';
import { Button, Chip } from '../src/components/ui';
import { backgrounds, phoneModels, platformOf, stickerPacks, Platform as PhonePlatform } from '../src/data/catalog';
import { phoneModels as models } from '../src/data/catalog';
import { TextLayer } from '../src/data/types';
import { useCart } from '../src/store/cart';
import { formatPrice } from '../src/store/cart';
import { BASE_PRICE_CENTS } from '../src/data/catalog';
import { useDesign } from '../src/store/design';
import { saveDesign } from '../src/lib/sync';
import { isCurrentUserAdmin, publishTemplate } from '../src/lib/templates';
import { colors, radii, shadow, spacing } from '../src/theme';

type Tool = 'photo' | 'text' | 'stickers' | 'color' | 'model';
const TEXT_COLORS = ['#FFFFFF', '#141018', '#FF3E9A', '#D6006E', '#FFD400', '#7B61FF', '#3EC8A0', '#FF5470'];

export default function Editor() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const [stageH, setStageH] = useState(0);

  const design = useDesign((s) => s.design);
  const selectedId = useDesign((s) => s.selectedId);
  const select = useDesign((s) => s.select);
  const setBackground = useDesign((s) => s.setBackground);
  const setModel = useDesign((s) => s.setModel);
  const addSticker = useDesign((s) => s.addSticker);
  const addText = useDesign((s) => s.addText);
  const addImage = useDesign((s) => s.addImage);
  const updateLayer = useDesign((s) => s.updateLayer);
  const removeLayer = useDesign((s) => s.removeLayer);
  const duplicateLayer = useDesign((s) => s.duplicateLayer);
  const bringToFront = useDesign((s) => s.bringToFront);
  const setPreview = useDesign((s) => s.setPreview);
  const addToCart = useCart((s) => s.add);

  const [tool, setTool] = useState<Tool>('stickers');
  const [activePack, setActivePack] = useState(stickerPacks[0].id);
  const [textModal, setTextModal] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [capturing, setCapturing] = useState(false);

  // Admin-only: design a case here, then publish it straight to the Casey
  // Case Gallery on the home screen — no separate tool needed.
  const [isAdmin, setIsAdmin] = useState(false);
  const [publishModal, setPublishModal] = useState(false);
  const [publishName, setPublishName] = useState('');
  const [publishTag, setPublishTag] = useState('');
  const [publishAccent, setPublishAccent] = useState(TEXT_COLORS[2]);
  const [publishing, setPublishing] = useState(false);
  React.useEffect(() => {
    isCurrentUserAdmin().then(setIsAdmin);
  }, []);

  const submitPublish = async () => {
    if (!publishName.trim()) return;
    setPublishing(true);
    const ok = await publishTemplate(design, {
      name: publishName.trim(),
      tag: publishTag.trim() || undefined,
      accent: publishAccent,
    });
    setPublishing(false);
    setPublishModal(false);
    if (ok) {
      Alert.alert('Published 🎉', `"${publishName.trim()}" is now live on the Casey Case Gallery.`);
      setPublishName('');
      setPublishTag('');
    } else {
      Alert.alert('Couldn’t publish', 'Something went wrong — please try again.');
    }
  };

  const canvasRef = useRef<View>(null);
  const [canvasOrigin, setCanvasOrigin] = useState({ x: 0, y: 0 });
  const measureCanvas = () => canvasRef.current?.measureInWindow?.((x, y) => setCanvasOrigin({ x, y }));

  const model = models.find((m) => m.id === design.modelId) ?? models[0];
  // Constrain by both the stage's measured width AND height so the whole case
  // (camera included) always fits on-screen — on a short/wide desktop window
  // the tall case would otherwise overflow past the visible viewport.
  const canvasWByWidth = Math.min(screenW - 48, 340);
  const canvasWByHeight = stageH > 0 ? (stageH - 24) * model.aspect : canvasWByWidth;
  const canvasW = Math.max(160, Math.min(canvasWByWidth, canvasWByHeight));
  const canvasH = canvasW / model.aspect;
  const scale = canvasW / CANVAS_BASE;
  const radius = canvasW * 0.14;

  const selected = design.layers.find((l) => l.id === selectedId) ?? null;
  const ordered = [...design.layers].sort((a, b) => a.z - b.z);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photos permission needed', 'Allow photo access to add your own pictures.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (!res.canceled && res.assets[0]) {
      const a = res.assets[0];
      addImage(a.uri, a.width ?? 1000, a.height ?? 1000);
    }
  };

  const openTextEditor = () => {
    if (selected?.kind === 'text') {
      setDraftText(selected.text);
    } else {
      setDraftText('');
    }
    setTextModal(true);
  };

  const commitText = () => {
    const value = draftText.trim() || 'Casey';
    if (selected?.kind === 'text') {
      updateLayer(selected.id, { text: value });
    } else {
      addText(value);
    }
    setTextModal(false);
  };

  const handleNext = async () => {
    try {
      setCapturing(true);
      select(null);
      await new Promise((r) => setTimeout(r, 60));
      const uri = await captureRef(canvasRef, { format: 'png', quality: 1 });
      setPreview(uri);
    } catch (e) {
      // capture can fail on web; proceed without preview
    } finally {
      setCapturing(false);
      const current = useDesign.getState().design;
      addToCart(current, 'ship');
      saveDesign(current); // collected in the admin dashboard (no-op in mock mode)
      router.push('/cart');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {/* Top bar */}
      <View style={[styles.topbar, { paddingTop: insets.top + 6 }]}>
        <Pressable style={styles.iconBtn} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <Ionicons name="close" size={22} color={colors.ink} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.title}>Casey Studio</Text>
          <Text style={styles.subtitle}>{model.brand} {model.name}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {isAdmin && (
            <Pressable style={styles.iconBtn} onPress={() => setPublishModal(true)}>
              <Ionicons name="star" size={20} color={colors.iris} />
            </Pressable>
          )}
          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextText}>Next</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </Pressable>
        </View>
      </View>

      {/* Canvas */}
      <View style={styles.stage} onLayout={(e) => setStageH(e.nativeEvent.layout.height)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => select(null)} />
        <View ref={canvasRef} collapsable={false} onLayout={measureCanvas} style={[styles.canvas, { width: canvasW, height: canvasH, borderRadius: radius }]}>
          <LinearGradient
            colors={design.background.colors.length > 1 ? (design.background.colors as [string, string]) : [design.background.colors[0], design.background.colors[0]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {ordered.map((l) => (
            <EditableLayer
              key={l.id}
              layer={l}
              selected={l.id === selectedId && !capturing}
              scale={scale}
              canvasOrigin={canvasOrigin}
              canvasW={canvasW}
              canvasH={canvasH}
              onSelect={select}
              onChange={updateLayer}
            />
          ))}
          {!capturing ? (
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <CameraModule style={camStyleFor(model)} width={canvasW} height={canvasH} />
            </View>
          ) : null}
        </View>

        {design.layers.length === 0 && (
          <View pointerEvents="none" style={styles.emptyHint}>
            <Text style={styles.emptyHintText}>Add stickers, text or a photo 👇</Text>
          </View>
        )}
      </View>

      {/* Selection actions */}
      {selected && (
        <View style={styles.actions}>
          {selected.kind === 'text' && (
            <ActionBtn icon="text" label="Edit" onPress={openTextEditor} />
          )}
          <ActionBtn icon="remove-circle-outline" label="Smaller" onPress={() => updateLayer(selected.id, { scale: Math.max(0.3, selected.scale / 1.15) })} />
          <ActionBtn icon="add-circle-outline" label="Bigger" onPress={() => updateLayer(selected.id, { scale: Math.min(6, selected.scale * 1.15) })} />
          <ActionBtn icon="refresh-outline" label="Rotate" onPress={() => updateLayer(selected.id, { rotation: selected.rotation + Math.PI / 12 })} />
          <ActionBtn icon="copy-outline" label="Copy" onPress={() => duplicateLayer(selected.id)} />
          <ActionBtn icon="arrow-up-outline" label="Front" onPress={() => bringToFront(selected.id)} />
          <ActionBtn icon="trash-outline" label="Delete" tint={colors.danger} onPress={() => removeLayer(selected.id)} />
        </View>
      )}

      {/* Tool panel */}
      <View style={[styles.panelWrap, { paddingBottom: insets.bottom + 8 }]}>
        <LinearGradient
          pointerEvents="none"
          colors={[colors.gradientCool[0], colors.gradientCool[1], 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.panelGlassEdge}
        />
        <ToolPanel
          tool={tool}
          activePack={activePack}
          setActivePack={setActivePack}
          onAddSticker={addSticker}
          onAddText={openTextEditor}
          onPickImage={pickImage}
          background={design.background.id}
          onSetBackground={setBackground}
          modelId={design.modelId}
          onSetModel={setModel}
          selectedText={selected?.kind === 'text' ? (selected as TextLayer) : null}
          onSetTextColor={(c) => selected && updateLayer(selected.id, { color: c })}
          onSetTextSize={(d) => selected?.kind === 'text' && updateLayer(selected.id, { fontSize: Math.max(12, Math.min(80, (selected as TextLayer).fontSize + d)) })}
        />

        {/* Tab bar */}
        <View style={styles.tabbar}>
          <ToolTab icon="image" label="Photo" active={tool === 'photo'} onPress={() => setTool('photo')} />
          <ToolTab icon="text" label="Text" active={tool === 'text'} onPress={() => setTool('text')} />
          <ToolTab icon="happy" label="Stickers" active={tool === 'stickers'} onPress={() => setTool('stickers')} />
          <ToolTab icon="color-palette" label="Color" active={tool === 'color'} onPress={() => setTool('color')} />
          <ToolTab icon="phone-portrait" label="Model" active={tool === 'model'} onPress={() => setTool('model')} />
        </View>
      </View>

      {/* Price hint */}
      <View pointerEvents="none" style={[styles.priceTag, { top: insets.top + 58 }]}>
        <Text style={styles.priceTagText}>{formatPrice(BASE_PRICE_CENTS)} / case</Text>
      </View>

      {/* Text modal */}
      <Modal visible={textModal} transparent animationType="fade" onRequestClose={() => setTextModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setTextModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{selected?.kind === 'text' ? 'Edit text' : 'Add text'}</Text>
            <TextInput
              value={draftText}
              onChangeText={setDraftText}
              placeholder="Type something cute…"
              placeholderTextColor={colors.inkFaint}
              style={styles.input}
              autoFocus
              multiline
            />
            <Button title="Done" icon="checkmark" onPress={commitText} style={{ marginTop: 12 }} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Publish to gallery modal (admin-only) */}
      <Modal visible={publishModal} transparent animationType="fade" onRequestClose={() => setPublishModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPublishModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Publish to Gallery ✨</Text>
            <Text style={styles.panelHint}>Live on the Casey Case Gallery for every customer to browse and tap-to-design.</Text>
            <TextInput
              value={publishName}
              onChangeText={setPublishName}
              placeholder="Style name (e.g. Stan 4 Life)"
              placeholderTextColor={colors.inkFaint}
              style={[styles.input, { marginTop: 12, minHeight: 44 }]}
              autoFocus
            />
            <TextInput
              value={publishTag}
              onChangeText={setPublishTag}
              placeholder="Tag (optional — e.g. Trending, New)"
              placeholderTextColor={colors.inkFaint}
              style={[styles.input, { marginTop: 10, minHeight: 44 }]}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 12 }}>
              {TEXT_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setPublishAccent(c)}
                  style={[styles.colorDot, { backgroundColor: c }, publishAccent === c && styles.colorDotActive]}
                />
              ))}
            </ScrollView>
            <Button
              title={publishing ? 'Publishing…' : 'Publish'}
              icon="star"
              loading={publishing}
              disabled={!publishName.trim() || publishing}
              onPress={submitPublish}
              style={{ marginTop: 4, opacity: publishName.trim() ? 1 : 0.5 }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ActionBtn({ icon, label, onPress, tint = colors.ink }: { icon: any; label: string; onPress: () => void; tint?: string }) {
  return (
    <Pressable style={styles.actionBtn} onPress={onPress}>
      <Ionicons name={icon} size={18} color={tint} />
      <Text style={[styles.actionLabel, { color: tint }]}>{label}</Text>
    </Pressable>
  );
}

function ToolTab({ icon, label, active, onPress }: { icon: any; label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.tab} onPress={onPress}>
      <View style={[styles.tabIcon, active && { backgroundColor: colors.blush }]}>
        <Ionicons name={active ? icon : (`${icon}-outline` as any)} size={22} color={active ? colors.primaryDark : colors.inkSoft} />
      </View>
      <Text style={[styles.tabLabel, active && { color: colors.primaryDark }]}>{label}</Text>
    </Pressable>
  );
}

function ToolPanel(props: {
  tool: Tool;
  activePack: string;
  setActivePack: (id: string) => void;
  onAddSticker: (emoji: string) => void;
  onAddText: () => void;
  onPickImage: () => void;
  background: string;
  onSetBackground: (bg: any) => void;
  modelId: string;
  onSetModel: (id: string) => void;
  selectedText: TextLayer | null;
  onSetTextColor: (c: string) => void;
  onSetTextSize: (delta: number) => void;
}) {
  const { tool } = props;

  if (tool === 'photo') {
    return (
      <View style={styles.panel}>
        <Button title="Upload a photo" icon="cloud-upload" onPress={props.onPickImage} />
        <Text style={styles.panelHint}>Add your bias, selfies or any pic. Pinch to resize, twist to rotate.</Text>
      </View>
    );
  }

  if (tool === 'text') {
    return (
      <View style={styles.panel}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Button title="Add text" icon="add" onPress={props.onAddText} style={{ flex: 1 }} />
          {props.selectedText && (
            <>
              <Pressable style={styles.stepBtn} onPress={() => props.onSetTextSize(-4)}>
                <Ionicons name="remove" size={20} color={colors.primaryDark} />
              </Pressable>
              <Pressable style={styles.stepBtn} onPress={() => props.onSetTextSize(4)}>
                <Ionicons name="add" size={20} color={colors.primaryDark} />
              </Pressable>
            </>
          )}
        </View>
        {props.selectedText ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 10 }}>
            {TEXT_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => props.onSetTextColor(c)}
                style={[styles.colorDot, { backgroundColor: c }, props.selectedText?.color === c && styles.colorDotActive]}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.panelHint}>Add text, then tap it to change color & size.</Text>
        )}
      </View>
    );
  }

  if (tool === 'color') {
    return (
      <View style={styles.panel}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {backgrounds.map((b) => (
            <Pressable key={b.id} onPress={() => props.onSetBackground(b)} style={{ alignItems: 'center' }}>
              <LinearGradient
                colors={b.colors as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.bgSwatch, props.background === b.id && styles.bgSwatchActive]}
              />
              <Text style={styles.swatchLabel}>{b.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (tool === 'model') {
    return <ModelPanel modelId={props.modelId} onSetModel={props.onSetModel} />;
  }

  // stickers
  return (
    <View style={styles.panel}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 10 }}>
        {stickerPacks.map((p) => (
          <Chip key={p.id} emoji={p.cover} label={p.name} active={props.activePack === p.id} onPress={() => props.setActivePack(p.id)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {stickerPacks.find((p) => p.id === props.activePack)?.stickers.map((s) => (
          <Pressable key={s.id} style={styles.stickerBtn} onPress={() => props.onAddSticker(s.emoji!)}>
            <Text style={{ fontSize: 30 }}>{s.emoji}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function ModelPanel({ modelId, onSetModel }: { modelId: string; onSetModel: (id: string) => void }) {
  const current = phoneModels.find((m) => m.id === modelId) ?? phoneModels[0];
  const [platform, setPlatform] = useState<PhonePlatform>(platformOf(current));
  const list = phoneModels.filter((m) => platformOf(m) === platform);

  const choosePlatform = (p: PhonePlatform) => {
    setPlatform(p);
    // jump to the first model of the new platform so the case shape updates
    if (platformOf(current) !== p) {
      const first = phoneModels.find((m) => platformOf(m) === p);
      if (first) onSetModel(first.id);
    }
  };

  return (
    <View style={styles.panel}>
      <View style={styles.segRow}>
        <Pressable style={[styles.seg, platform === 'ios' && styles.segActive]} onPress={() => choosePlatform('ios')}>
          <Ionicons name="logo-apple" size={16} color={platform === 'ios' ? colors.white : colors.inkSoft} />
          <Text style={[styles.segText, platform === 'ios' && { color: colors.white }]}>iPhone</Text>
        </Pressable>
        <Pressable style={[styles.seg, platform === 'android' && styles.segActive]} onPress={() => choosePlatform('android')}>
          <Ionicons name="logo-android" size={16} color={platform === 'android' ? colors.white : colors.inkSoft} />
          <Text style={[styles.segText, platform === 'android' && { color: colors.white }]}>Android</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {list.map((m) => (
          <Chip key={m.id} label={`${m.brand} ${m.name}`} active={modelId === m.id} onPress={() => onSetModel(m.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  title: { fontSize: 16, fontWeight: '900', color: colors.primaryDark },
  subtitle: { fontSize: 11, fontWeight: '600', color: colors.inkFaint },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingVertical: 9, paddingHorizontal: 16, borderRadius: radii.pill, ...shadow.glow },
  nextText: { color: colors.white, fontWeight: '800', fontSize: 14 },

  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', userSelect: 'none' },
  canvas: { overflow: 'hidden', borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)', ...shadow.float },
  emptyHint: { position: 'absolute', bottom: 18 },
  emptyHintText: { color: colors.inkFaint, fontWeight: '700' },

  actions: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap', paddingHorizontal: spacing.lg },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.white, paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.pill, ...shadow.soft },
  actionLabel: { fontWeight: '700', fontSize: 13 },

  panelWrap: { backgroundColor: colors.white, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, paddingTop: 14, ...shadow.float },
  panelGlassEdge: { position: 'absolute', top: 0, left: 24, right: 24, height: 3, borderRadius: 2 },
  panel: { minHeight: 92, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  panelHint: { color: colors.inkFaint, fontWeight: '600', marginTop: 10, fontSize: 13 },
  stickerBtn: { width: 52, height: 52, borderRadius: radii.md, backgroundColor: colors.petal, alignItems: 'center', justifyContent: 'center' },
  segRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  seg: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: radii.pill, backgroundColor: colors.petal, borderWidth: 1.5, borderColor: colors.line },
  segActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segText: { fontWeight: '800', color: colors.inkSoft, fontSize: 14 },
  stepBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center' },
  colorDot: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: colors.line },
  colorDotActive: { borderColor: colors.primary, borderWidth: 3 },
  bgSwatch: { width: 50, height: 50, borderRadius: radii.md, borderWidth: 2, borderColor: colors.white },
  bgSwatchActive: { borderColor: colors.primary, borderWidth: 3 },
  swatchLabel: { fontSize: 10, fontWeight: '600', color: colors.inkSoft, marginTop: 4 },

  tabbar: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10, paddingHorizontal: spacing.sm, borderTopWidth: 1, borderTopColor: colors.petal, marginTop: 12 },
  tab: { alignItems: 'center', gap: 3, flex: 1 },
  tabIcon: { width: 46, height: 34, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, fontWeight: '700', color: colors.inkSoft },

  priceTag: { position: 'absolute', right: spacing.lg, backgroundColor: colors.ink, paddingVertical: 5, paddingHorizontal: 12, borderRadius: radii.pill, ...shadow.glow },
  priceTagText: { color: colors.white, fontWeight: '800', fontSize: 12 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(20,16,24,0.4)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  modalCard: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.xl },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.ink, marginBottom: 12 },
  input: { backgroundColor: colors.petal, borderRadius: radii.md, padding: 14, fontSize: 18, fontWeight: '700', color: colors.ink, minHeight: 60 },
});
