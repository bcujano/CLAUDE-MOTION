import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// 30s @ 30fps = 900 frames. Each scene: [text, sub, emoji, background]
const SCENES: { title: string; sub?: string; emoji: string; bg: string }[] = [
  { title: "¿Vender tu casa SIN agente?", sub: "Qué gran idea... 🙄", emoji: "🏠", bg: "#111827" },
  { title: "Le pones un precio “a ojo”", sub: "y nadie la visita en 6 meses", emoji: "🎯", bg: "#7f1d1d" },
  { title: "Fotos con tu celular a oscuras", sub: "con la ropa sucia de fondo", emoji: "📸", bg: "#78350f" },
  { title: "Contestas 200 llamadas", sub: "de curiosos que solo quieren chismear", emoji: "📞", bg: "#1e3a8a" },
  { title: "Negocias tú solo", sub: "y regalas miles de dólares", emoji: "💸", bg: "#14532d" },
  { title: "Contratos, papeles, abogados…", sub: "un error = un problema legal", emoji: "📄", bg: "#4c1d95" },
  { title: "¿Ahorrarte la comisión?", sub: "Terminas perdiendo MÁS dinero", emoji: "🤦", bg: "#831843" },
  { title: "Contrata un agente inmobiliario", sub: "Vende más rápido. Vende mejor.", emoji: "✅", bg: "#0f766e" },
];
const SCENE_LEN = 900 / SCENES.length; // 112.5 frames

const Scene: React.FC<(typeof SCENES)[number]> = ({ title, sub, emoji, bg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12 } });
  const subIn = spring({ frame: frame - 15, fps, config: { damping: 14 } });
  const fadeOut = interpolate(frame, [SCENE_LEN - 10, SCENE_LEN], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wobble = Math.sin(frame / 6) * 6;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
        color: "white",
        textAlign: "center",
        padding: 80,
        opacity: fadeOut,
      }}
    >
      <div style={{ fontSize: 260, transform: `scale(${pop}) rotate(${wobble}deg)` }}>
        {emoji}
      </div>
      <div
        style={{
          fontSize: 110,
          fontWeight: 900,
          lineHeight: 1.1,
          marginTop: 40,
          transform: `scale(${pop})`,
          textShadow: "0 8px 30px rgba(0,0,0,0.5)",
        }}
      >
        {title}
      </div>
      {sub ? (
        <div
          style={{
            fontSize: 64,
            marginTop: 40,
            opacity: subIn,
            transform: `translateY(${(1 - subIn) * 60}px)`,
            color: "#fde68a",
          }}
        >
          {sub}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const SinAgente: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    {SCENES.map((s, i) => (
      <Sequence
        key={i}
        from={Math.round(i * SCENE_LEN)}
        durationInFrames={Math.round(SCENE_LEN)}
      >
        <Scene {...s} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
