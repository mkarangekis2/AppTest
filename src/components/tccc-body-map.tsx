type Injury = {
  label: string;
  region: string;
  severity: string;
  type: string;
  visible_findings?: string[];
  hidden_findings?: string[];
};

type View = "front" | "back";
type Side = "left" | "right" | "center";
type Zone =
  | "head"
  | "neck"
  | "shoulder"
  | "upper_arm"
  | "forearm"
  | "hand"
  | "chest"
  | "upper_back"
  | "abdomen"
  | "lower_back"
  | "pelvis"
  | "groin"
  | "glute"
  | "thigh"
  | "knee"
  | "lower_leg"
  | "foot";

type Marker = {
  id: string;
  label: string;
  region: string;
  severity: string;
  view: View;
  side: Side;
  zone: Zone;
  x: number;
  y: number;
  tone: string;
};

const COORDS: Record<View, Record<Zone, Record<Side, { x: number; y: number }>>> = {
  front: {
    head: { left: { x: 48, y: 11 }, right: { x: 52, y: 11 }, center: { x: 50, y: 10 } },
    neck: { left: { x: 49, y: 17 }, right: { x: 51, y: 17 }, center: { x: 50, y: 17 } },
    shoulder: { left: { x: 62, y: 22 }, right: { x: 38, y: 22 }, center: { x: 50, y: 22 } },
    upper_arm: { left: { x: 67, y: 30 }, right: { x: 33, y: 30 }, center: { x: 50, y: 30 } },
    forearm: { left: { x: 73, y: 38 }, right: { x: 27, y: 38 }, center: { x: 50, y: 38 } },
    hand: { left: { x: 76, y: 45 }, right: { x: 24, y: 45 }, center: { x: 50, y: 45 } },
    chest: { left: { x: 56, y: 24 }, right: { x: 44, y: 24 }, center: { x: 50, y: 24 } },
    upper_back: { left: { x: 56, y: 24 }, right: { x: 44, y: 24 }, center: { x: 50, y: 24 } },
    abdomen: { left: { x: 55, y: 34 }, right: { x: 45, y: 34 }, center: { x: 50, y: 34 } },
    lower_back: { left: { x: 55, y: 34 }, right: { x: 45, y: 34 }, center: { x: 50, y: 34 } },
    pelvis: { left: { x: 55, y: 46 }, right: { x: 45, y: 46 }, center: { x: 50, y: 45 } },
    groin: { left: { x: 55, y: 49 }, right: { x: 45, y: 49 }, center: { x: 50, y: 49 } },
    glute: { left: { x: 56, y: 50 }, right: { x: 44, y: 50 }, center: { x: 50, y: 50 } },
    thigh: { left: { x: 57, y: 59 }, right: { x: 43, y: 59 }, center: { x: 50, y: 59 } },
    knee: { left: { x: 57, y: 70 }, right: { x: 43, y: 70 }, center: { x: 50, y: 70 } },
    lower_leg: { left: { x: 57, y: 80 }, right: { x: 43, y: 80 }, center: { x: 50, y: 80 } },
    foot: { left: { x: 57, y: 91 }, right: { x: 43, y: 91 }, center: { x: 50, y: 91 } }
  },
  back: {
    head: { left: { x: 48, y: 11 }, right: { x: 52, y: 11 }, center: { x: 50, y: 10 } },
    neck: { left: { x: 49, y: 17 }, right: { x: 51, y: 17 }, center: { x: 50, y: 17 } },
    shoulder: { left: { x: 62, y: 22 }, right: { x: 38, y: 22 }, center: { x: 50, y: 22 } },
    upper_arm: { left: { x: 67, y: 30 }, right: { x: 33, y: 30 }, center: { x: 50, y: 30 } },
    forearm: { left: { x: 73, y: 38 }, right: { x: 27, y: 38 }, center: { x: 50, y: 38 } },
    hand: { left: { x: 76, y: 45 }, right: { x: 24, y: 45 }, center: { x: 50, y: 45 } },
    chest: { left: { x: 56, y: 24 }, right: { x: 44, y: 24 }, center: { x: 50, y: 24 } },
    upper_back: { left: { x: 56, y: 24 }, right: { x: 44, y: 24 }, center: { x: 50, y: 24 } },
    abdomen: { left: { x: 55, y: 34 }, right: { x: 45, y: 34 }, center: { x: 50, y: 34 } },
    lower_back: { left: { x: 55, y: 34 }, right: { x: 45, y: 34 }, center: { x: 50, y: 34 } },
    pelvis: { left: { x: 55, y: 46 }, right: { x: 45, y: 46 }, center: { x: 50, y: 45 } },
    groin: { left: { x: 55, y: 49 }, right: { x: 45, y: 49 }, center: { x: 50, y: 49 } },
    glute: { left: { x: 56, y: 50 }, right: { x: 44, y: 50 }, center: { x: 50, y: 50 } },
    thigh: { left: { x: 57, y: 61 }, right: { x: 43, y: 61 }, center: { x: 50, y: 61 } },
    knee: { left: { x: 57, y: 71 }, right: { x: 43, y: 71 }, center: { x: 50, y: 71 } },
    lower_leg: { left: { x: 57, y: 81 }, right: { x: 43, y: 81 }, center: { x: 50, y: 81 } },
    foot: { left: { x: 57, y: 91 }, right: { x: 43, y: 91 }, center: { x: 50, y: 91 } }
  }
};

const ZONE_KEYWORDS: Array<{ zone: Zone; keywords: string[] }> = [
  { zone: "head", keywords: ["head", "scalp", "face", "skull"] },
  { zone: "neck", keywords: ["neck", "throat", "cervical"] },
  { zone: "shoulder", keywords: ["shoulder", "clavicle", "deltoid"] },
  { zone: "upper_arm", keywords: ["upper arm", "bicep", "tricep", "humerus", "arm"] },
  { zone: "forearm", keywords: ["forearm", "radius", "ulna"] },
  { zone: "hand", keywords: ["hand", "wrist", "palm", "finger"] },
  { zone: "chest", keywords: ["chest", "thorax", "rib", "anterior chest", "lateral chest"] },
  { zone: "upper_back", keywords: ["upper back", "scapular", "posterior chest"] },
  { zone: "abdomen", keywords: ["abdomen", "abdominal", "stomach", "flank"] },
  { zone: "lower_back", keywords: ["lower back", "lumbar"] },
  { zone: "pelvis", keywords: ["pelvis", "hip", "iliac"] },
  { zone: "groin", keywords: ["groin", "junctional"] },
  { zone: "glute", keywords: ["glute", "buttock"] },
  { zone: "thigh", keywords: ["thigh", "femur", "upper leg", "leg"] },
  { zone: "knee", keywords: ["knee", "patella"] },
  { zone: "lower_leg", keywords: ["shin", "calf", "tibia", "fibula", "lower leg"] },
  { zone: "foot", keywords: ["foot", "ankle", "heel", "toe"] }
];

export function TcccBodyMap({ injuries }: { injuries: Injury[] }) {
  const markers = injuries.map((injury, index) => toMarker(injury, index));
  const frontMarkers = markers.filter((marker) => marker.view === "front");
  const backMarkers = markers.filter((marker) => marker.view === "back");

  return (
    <div className="stack">
      <div className="section-heading">
        <div className="eyebrow">TCCC Human View</div>
        <h3 style={{ margin: 0 }}>Injury map with region-matched X markers</h3>
        <div className="badge-row">
          <span className="badge">{frontMarkers.length} front</span>
          <span className="badge">{backMarkers.length} back</span>
          <span className="badge danger">Severe markers emphasized</span>
        </div>
      </div>
      <div className="grid two">
        <div className="packet-block">
          <div className="eyebrow">Front</div>
          <BodyFigure view="front" markers={frontMarkers} />
        </div>
        <div className="packet-block">
          <div className="eyebrow">Back</div>
          <BodyFigure view="back" markers={backMarkers} />
        </div>
      </div>
      <div className="packet-block">
        <div className="eyebrow">Marked findings</div>
        <div className="grid two">
          {markers.length ? (
            markers.map((marker, index) => (
              <div key={marker.id} className="command-card" style={{ gap: 8, padding: 12 }}>
                <div className="badge-row">
                  <span className="badge" style={{ borderColor: marker.tone, color: marker.tone }}>X{index + 1}</span>
                  <span className={`badge ${marker.severity === "severe" ? "danger" : marker.severity === "moderate" ? "warning" : ""}`}>
                    {marker.severity}
                  </span>
                  <span className="badge ghost">{marker.view} - {marker.side}</span>
                </div>
                <strong>{marker.label}</strong>
                <div className="muted">
                  {marker.region} · mapped to {formatZone(marker.zone)}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No injury findings available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function BodyFigure({ view, markers }: { view: View; markers: Marker[] }) {
  return (
    <svg viewBox="0 0 220 360" role="img" aria-label={`${view} TCCC body map`} style={{ width: "100%", maxWidth: 340 }}>
      <title>{view} body map</title>
      <rect x="1" y="1" width="218" height="358" rx="12" fill="rgba(255,255,255,0.34)" stroke="rgba(97,86,70,0.24)" />
      <circle cx="110" cy="38" r="20" fill="none" stroke="#7d7260" strokeWidth="2.2" />
      <path d="M 96 58 L 124 58 L 134 84 L 134 150 L 86 150 L 86 84 Z" fill="none" stroke="#7d7260" strokeWidth="2.2" />
      <path d="M 86 88 L 64 102 L 64 176 L 82 176" fill="none" stroke="#7d7260" strokeWidth="2.2" />
      <path d="M 134 88 L 156 102 L 156 176 L 138 176" fill="none" stroke="#7d7260" strokeWidth="2.2" />
      <path d="M 86 150 L 100 212 L 100 316" fill="none" stroke="#7d7260" strokeWidth="2.2" />
      <path d="M 134 150 L 120 212 L 120 316" fill="none" stroke="#7d7260" strokeWidth="2.2" />
      <path d="M 100 316 L 92 344" fill="none" stroke="#7d7260" strokeWidth="2.2" />
      <path d="M 120 316 L 128 344" fill="none" stroke="#7d7260" strokeWidth="2.2" />
      {markers.map((marker, index) => {
        const x = mapToCanvasX(marker.x);
        const y = mapToCanvasY(marker.y);
        const radius = marker.severity === "severe" ? 13 : marker.severity === "moderate" ? 11 : 10;

        return (
          <g key={marker.id}>
            <circle cx={x} cy={y} r={radius} fill="rgba(255,255,255,0.82)" stroke={marker.tone} strokeWidth={1.6} />
            <line x1={x - 7} y1={y - 7} x2={x + 7} y2={y + 7} stroke={marker.tone} strokeWidth="3" />
            <line x1={x + 7} y1={y - 7} x2={x - 7} y2={y + 7} stroke={marker.tone} strokeWidth="3" />
            <text x={x + radius + 4} y={y - 3} fill={marker.tone} fontSize="12" fontWeight="700">
              X{index + 1}
            </text>
          </g>
        );
      })}
      <text x="110" y="22" textAnchor="middle" fontSize="12" fill="#6a604f">
        {view === "front" ? "Front view" : "Back view"}
      </text>
    </svg>
  );
}

function toMarker(injury: Injury, index: number): Marker {
  const text = buildSearchText(injury);
  const side = detectSide(text);
  const view = detectView(text);
  const zone = detectZone(text);
  const coord = COORDS[view][zone][side];

  return {
    id: `${injury.label}-${index}`,
    label: injury.label,
    region: injury.region,
    severity: injury.severity,
    view,
    side,
    zone,
    x: coord.x,
    y: coord.y,
    tone: toneForSeverity(injury.severity)
  };
}

function buildSearchText(injury: Injury) {
  return [
    injury.label,
    injury.region,
    injury.type,
    ...(injury.visible_findings || []),
    ...(injury.hidden_findings || [])
  ]
    .join(" ")
    .toLowerCase();
}

function detectSide(text: string): Side {
  if (text.includes("bilateral") || text.includes("both")) {
    return "center";
  }
  if (hasWord(text, "left") || hasWord(text, "l")) {
    return "left";
  }
  if (hasWord(text, "right") || hasWord(text, "r")) {
    return "right";
  }
  return "center";
}

function detectView(text: string): View {
  if (text.includes("posterior") || text.includes("back") || text.includes("dorsal") || text.includes("glute")) {
    return "back";
  }
  return "front";
}

function detectZone(text: string): Zone {
  for (const option of ZONE_KEYWORDS) {
    if (option.keywords.some((keyword) => text.includes(keyword))) {
      return option.zone;
    }
  }
  return "chest";
}

function toneForSeverity(severity: string) {
  if (severity === "severe") {
    return "#9a2f22";
  }
  if (severity === "moderate") {
    return "#8a5e19";
  }
  return "#6f8a4b";
}

function hasWord(text: string, word: string) {
  const normalized = ` ${text.replace(/[^a-z0-9]+/g, " ")} `;
  return normalized.includes(` ${word} `);
}

function formatZone(zone: Zone) {
  return zone.replace("_", " ");
}

function mapToCanvasX(x: number) {
  return 20 + (x / 100) * 180;
}

function mapToCanvasY(y: number) {
  return 28 + (y / 100) * 300;
}
