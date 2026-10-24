import { loadFont } from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const ANTON = "Anton";
const POPPINS = "Poppins";
loadFont({ family: ANTON, url: staticFile("fonts/Anton-Regular.ttf") });
[
  ["400", "Regular"],
  ["600", "SemiBold"],
  ["700", "Bold"],
].forEach(([weight, name]) =>
  loadFont({ family: POPPINS, url: staticFile(`fonts/Poppins-${name}.ttf`), weight }),
);
const MONO = "ui-monospace, Menlo, Consolas, monospace";

const C = {
  bg: "#161616",
  card: "#1f1f1f",
  border: "#2e2e2e",
  orange: "#E8775A",
  red: "#ef4444",
  green: "#22c55e",
  white: "#ffffff",
  grey: "#8a8a8a",
};

// 30s @ 30fps
const HOOK = 150;
const STEP = 150;
const CTA = 150;
export const SIN_AGENTE_FRAMES = HOOK + STEP * 4 + CTA;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useSpring = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

/* ---------- Background: dark grid + glow ---------- */
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.4) % 60;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.border}55 1px, transparent 1px), linear-gradient(90deg, ${C.border}55 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: `0 ${drift}px`,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 85% 0%, rgba(110,60,220,0.35), transparent 40%), radial-gradient(circle at 15% 100%, rgba(232,119,90,0.12), transparent 45%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- Word-by-word captions with orange highlight ---------- */
const Captions: React.FC<{ chunks: string[][]; duration: number }> = ({ chunks, duration }) => {
  const frame = useCurrentFrame();
  const per = duration / chunks.length;
  const idx = Math.min(chunks.length - 1, Math.floor(frame / per));
  const local = frame - idx * per;
  const words = chunks[idx];
  const wordLen = (per * 0.85) / words.length;
  const active = Math.min(words.length - 1, Math.floor(local / wordLen));
  return (
    <div
      style={{
        position: "absolute",
        top: 1380,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        gap: 18,
        flexWrap: "wrap",
        padding: "0 60px",
        fontFamily: POPPINS,
        fontWeight: 600,
        fontSize: 58,
      }}
    >
      {words.map((w, i) => {
        const on = i === active;
        return (
          <span
            key={i}
            style={{
              color: on ? "#1a1a1a" : i <= active ? C.white : C.grey,
              backgroundColor: on ? C.orange : "transparent",
              padding: "0 14px",
              borderRadius: 14,
              transform: `scale(${on ? 1.08 : 1})`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Small UI pieces ---------- */
const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: POPPINS,
      fontWeight: 700,
      fontSize: 26,
      letterSpacing: 4,
      color: C.white,
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}
  >
    <span style={{ width: 12, height: 12, borderRadius: 6, background: C.orange }} />
    {children}
  </div>
);

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; title?: string }> = ({
  children,
  style,
  title,
}) => (
  <div
    style={{
      background: C.card,
      border: `2px solid ${C.border}`,
      borderRadius: 28,
      padding: 36,
      boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
      ...style,
    }}
  >
    {title ? (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 14, height: 14, borderRadius: 7, background: "#444" }} />
        ))}
        <span style={{ fontFamily: MONO, color: C.grey, fontSize: 24, marginLeft: 12 }}>{title}</span>
      </div>
    ) : null}
    {children}
  </div>
);

const Stamp: React.FC<{ text: string; delay: number; color?: string; top: number; rotate?: number }> = ({
  text,
  delay,
  color = C.orange,
  top,
  rotate = -8,
}) => {
  const s = useSpring(delay, 9);
  return (
    <div
      style={{
        position: "absolute",
        top,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        opacity: s,
      }}
    >
      <div
        style={{
          fontFamily: ANTON,
          fontSize: 92,
          color,
          border: `8px solid ${color}`,
          borderRadius: 20,
          padding: "4px 36px",
          transform: `rotate(${rotate}deg) scale(${interpolate(s, [0, 1], [2.2, 1])})`,
          background: "rgba(22,22,22,0.85)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* ---------- Step header: "ERROR 1 DE 4" + progress + ghost number ---------- */
const StepHeader: React.FC<{ n: number; line1: string; line2: string }> = ({ n, line1, line2 }) => {
  const frame = useCurrentFrame();
  const t1 = useSpring(0);
  const t2 = useSpring(6);
  const fill = interpolate(frame, [0, STEP], [0, 1], clamp);
  return (
    <>
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: POPPINS, fontWeight: 700, color: C.grey, fontSize: 24, letterSpacing: 6 }}>
          ERROR {n} DE 4
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 18 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ width: 110, height: 6, borderRadius: 3, background: C.border, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  background: C.orange,
                  width: `${i < n ? 100 : i === n ? fill * 100 : 0}%`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 30,
          top: 150,
          fontFamily: ANTON,
          fontSize: 420,
          color: "transparent",
          WebkitTextStroke: `3px ${C.border}`,
          lineHeight: 1,
        }}
      >
        0{n}
      </div>
      <div style={{ position: "absolute", top: 250, left: 70 }}>
        <Tag>ERROR 0{n}</Tag>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 132,
            lineHeight: 1.02,
            marginTop: 20,
            color: C.white,
            transform: `translateX(${(1 - t1) * -80}px)`,
            opacity: t1,
          }}
        >
          {line1}
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 132,
            lineHeight: 1.02,
            color: C.orange,
            transform: `translateX(${(1 - t2) * -80}px)`,
            opacity: t2,
          }}
        >
          {line2}
        </div>
      </div>
    </>
  );
};

/* ---------- Scenes ---------- */
const Hook: React.FC = () => {
  const a = useSpring(0);
  const b = useSpring(10);
  const c = useSpring(22, 10);
  const badge = useSpring(60);
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ position: "absolute", top: 380, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", opacity: a }}>
          <Tag>BIENES RAÍCES</Tag>
        </div>
        <div style={{ fontFamily: ANTON, fontSize: 170, lineHeight: 1, color: C.white, marginTop: 30, transform: `scale(${a})` }}>
          VENDER TU CASA
        </div>
        <div style={{ fontFamily: ANTON, fontSize: 170, lineHeight: 1, color: C.white, transform: `scale(${b})` }}>
          SIN AGENTE
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 10 }}>
          <div
            style={{
              fontFamily: ANTON,
              fontSize: 170,
              lineHeight: 1.05,
              color: "#1a1a1a",
              background: C.orange,
              padding: "0 30px",
              transform: `scale(${c}) rotate(-2deg)`,
            }}
          >
            ES UN ERROR
          </div>
          <div style={{ fontSize: 130, color: C.orange, transform: `rotate(${frame * 3}deg) scale(${c})` }}>✱</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 50, opacity: badge, transform: `translateY(${(1 - badge) * 30}px)` }}>
          <div
            style={{
              fontFamily: POPPINS,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: 4,
              border: `3px solid ${C.orange}`,
              color: C.orange,
              borderRadius: 40,
              padding: "10px 34px",
            }}
          >
            ⚠ 4 ERRORES CAROS
          </div>
        </div>
      </div>
      <Captions
        duration={HOOK}
        chunks={[["Vender", "tu", "casa"], ["sin", "agente"], ["es", "un", "error"], ["Te", "explico", "por", "qué"]]}
      />
    </AbsoluteFill>
  );
};

const Error1: React.FC = () => {
  const frame = useCurrentFrame();
  const card = useSpring(15);
  const days = Math.round(interpolate(frame, [30, 110], [0, 180], clamp));
  const bar = interpolate(frame, [30, 110], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <StepHeader n={1} line1="EL PRECIO" line2="“A OJO”" />
      <Card title="anuncio.casa" style={{ position: "absolute", top: 720, left: 70, right: 70, opacity: card, transform: `translateY(${(1 - card) * 80}px)` }}>
        <div style={{ fontFamily: POPPINS, color: C.grey, fontSize: 30 }}>Precio que tú pusiste</div>
        <div style={{ fontFamily: ANTON, fontSize: 110, color: C.white }}>$450,000 🤷</div>
        <div style={{ fontFamily: POPPINS, color: C.grey, fontSize: 30, marginTop: 20 }}>Días sin vender</div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 10 }}>
          <div style={{ flex: 1, height: 22, borderRadius: 11, background: C.border, overflow: "hidden" }}>
            <div style={{ width: `${bar * 100}%`, height: "100%", background: C.red }} />
          </div>
          <div style={{ fontFamily: MONO, fontSize: 48, color: C.red, width: 150 }}>{days}</div>
        </div>
      </Card>
      <Stamp text="0 OFERTAS" delay={100} color={C.red} top={1170} />
      <Captions duration={STEP} chunks={[["Pones", "el", "precio"], ["a", "ojo"], ["y", "pasan", "meses"], ["sin", "una", "oferta"]]} />
    </AbsoluteFill>
  );
};

const Error2: React.FC = () => {
  const frame = useCurrentFrame();
  const card = useSpring(15);
  const flash = interpolate(frame, [40, 44, 52], [0, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <StepHeader n={2} line1="FOTOS CON" line2="TU CELULAR" />
      <Card title="IMG_0042.jpg" style={{ position: "absolute", top: 720, left: 70, right: 70, opacity: card, transform: `translateY(${(1 - card) * 80}px)` }}>
        <div
          style={{
            height: 380,
            borderRadius: 18,
            background: "linear-gradient(160deg, #3a3326, #1a1712)",
            filter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 150,
            transform: "rotate(-4deg)",
          }}
        >
          🛋️🧺
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: POPPINS, fontSize: 30, color: C.grey, marginTop: 20 }}>
          <span>👁 12 vistas</span>
          <span>❤ 0</span>
          <span>📩 0 mensajes</span>
        </div>
      </Card>
      <AbsoluteFill style={{ background: "white", opacity: flash * 0.8 }} />
      <Stamp text="NADIE LLAMA" delay={95} top={1180} />
      <Captions duration={STEP} chunks={[["Fotos", "oscuras"], ["con", "la", "ropa"], ["sucia", "de", "fondo"], ["y", "nadie", "llama"]]} />
    </AbsoluteFill>
  );
};

const Bubble: React.FC<{ text: string; mine?: boolean; delay: number }> = ({ text, mine, delay }) => {
  const s = useSpring(delay);
  return (
    <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", opacity: s, transform: `scale(${s})`, transformOrigin: mine ? "right" : "left" }}>
      <div
        style={{
          fontFamily: POPPINS,
          fontSize: 36,
          padding: "18px 28px",
          borderRadius: 26,
          maxWidth: 640,
          background: mine ? C.orange : "#2c2c2c",
          color: mine ? "#1a1a1a" : C.white,
          fontWeight: mine ? 600 : 400,
          marginBottom: 18,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Error3: React.FC = () => {
  const card = useSpring(10);
  return (
    <AbsoluteFill>
      <StepHeader n={3} line1="NEGOCIAS" line2="TÚ SOLO" />
      <Card title="comprador · en línea" style={{ position: "absolute", top: 720, left: 70, right: 70, opacity: card }}>
        <Bubble text="¿Me la deja en $380,000? 😏" delay={20} />
        <Bubble text="Mmm… no sé 😅" mine delay={45} />
        <Bubble text="Es mi última oferta" delay={65} />
        <Bubble text="Ok, va 😭" mine delay={85} />
      </Card>
      <Stamp text="-$70,000" delay={105} color={C.red} top={1200} rotate={6} />
      <Captions duration={STEP} chunks={[["Negocias", "tú", "solo"], ["sin", "experiencia"], ["y", "regalas"], ["miles", "de", "dólares"]]} />
    </AbsoluteFill>
  );
};

const CheckRow: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const s = useSpring(delay);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 38, marginBottom: 20, opacity: s, transform: `translateX(${(1 - s) * 40}px)` }}>
      <span style={{ color: C.white }}>
        <span style={{ color: C.orange }}>- </span>
        {text}
      </span>
      <span style={{ color: C.red, transform: `scale(${s})` }}>✗</span>
    </div>
  );
};

const Error4: React.FC = () => {
  const card = useSpring(10);
  return (
    <AbsoluteFill>
      <StepHeader n={4} line1="EL PAPELEO" line2="LEGAL" />
      <Card title="checklist.md" style={{ position: "absolute", top: 720, left: 70, right: 70, opacity: card }}>
        <div style={{ fontFamily: MONO, fontSize: 40, color: C.white, marginBottom: 26 }}>{"# Cierre de venta"}</div>
        <CheckRow text="contrato de compraventa" delay={20} />
        <CheckRow text="escrituras" delay={32} />
        <CheckRow text="impuestos" delay={44} />
        <CheckRow text="avalúo e inspección" delay={56} />
      </Card>
      <Stamp text="DEMANDA ⚖" delay={95} color={C.red} top={1200} />
      <Captions duration={STEP} chunks={[["Contratos", "escrituras"], ["impuestos…"], ["un", "solo", "error"], ["y", "terminas", "demandado"]]} />
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const a = useSpring(0);
  const b = useSpring(10, 10);
  const pills = useSpring(35);
  const stamp = useSpring(70, 9);
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ position: "absolute", top: 360, textAlign: "center" }}>
        <div style={{ fontFamily: ANTON, fontSize: 160, lineHeight: 1, color: C.white, transform: `scale(${a})` }}>CONTRATA UN</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 14 }}>
          <div
            style={{
              fontFamily: ANTON,
              fontSize: 150,
              lineHeight: 1.05,
              color: "#1a1a1a",
              background: C.orange,
              padding: "0 28px",
              transform: `scale(${b}) rotate(-2deg)`,
            }}
          >
            AGENTE
          </div>
          <div style={{ fontSize: 120, color: C.orange, transform: `rotate(${frame * 3}deg) scale(${b})` }}>✱</div>
        </div>
        <div style={{ fontFamily: ANTON, fontSize: 130, lineHeight: 1.1, color: C.white, transform: `scale(${b})` }}>INMOBILIARIO</div>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 50, opacity: pills, transform: `translateY(${(1 - pills) * 30}px)` }}>
          {["✓ Precio correcto", "✓ Más rápido", "✓ Sin riesgos"].map((t) => (
            <div key={t} style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 32, color: C.white, background: C.card, border: `2px solid ${C.border}`, borderRadius: 40, padding: "12px 26px" }}>
              {t}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 70, opacity: stamp, transform: `rotate(-6deg) scale(${interpolate(stamp, [0, 1], [2, 1])})`, display: "inline-block" }}>
          <div style={{ fontFamily: ANTON, fontSize: 90, color: C.orange, border: `8px solid ${C.orange}`, borderRadius: 20, padding: "4px 36px" }}>
            VENDE MEJOR
          </div>
        </div>
      </div>
      <Captions duration={CTA} chunks={[["No", "arriesgues"], ["tu", "patrimonio"], ["contrata", "un", "agente"], ["y", "vende", "mejor"]]} />
    </AbsoluteFill>
  );
};

/* ---------- Transition wrapper: quick zoom/fade in & out ---------- */
const Shot: React.FC<{ children: React.ReactNode; duration: number }> = ({ children, duration }) => {
  const frame = useCurrentFrame();
  const inn = interpolate(frame, [0, 8], [0, 1], clamp);
  const out = interpolate(frame, [duration - 8, duration], [1, 0], clamp);
  const scale = interpolate(frame, [0, 8], [1.06, 1], clamp) * interpolate(frame, [duration - 8, duration], [1, 0.96], clamp);
  return <AbsoluteFill style={{ opacity: Math.min(inn, out), transform: `scale(${scale})` }}>{children}</AbsoluteFill>;
};

const SCENES: { C: React.FC; d: number }[] = [
  { C: Hook, d: HOOK },
  { C: Error1, d: STEP },
  { C: Error2, d: STEP },
  { C: Error3, d: STEP },
  { C: Error4, d: STEP },
  { C: Cta, d: CTA },
];

export const SinAgente: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill>
      <Background />
      {SCENES.map(({ C: Scene, d }, i) => {
        const start = from;
        from += d;
        return (
          <Sequence key={i} from={start} durationInFrames={d}>
            <Shot duration={d}>
              <Scene />
            </Shot>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
