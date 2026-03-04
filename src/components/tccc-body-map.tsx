type Injury = {
  label: string;
  region: string;
  severity: string;
  type: string;
};

type Marker = {
  id: string;
  label: string;
  region: string;
  severity: string;
  view: "front" | "back";
  x: number;
  y: number;
};

const FRONT: ReadonlyArray<{ part: string; x: number; y: number }> = [
  { part: "head", x: 50, y: 10 },
  { part: "neck", x: 50, y: 17 },
  { part: "chest", x: 50, y: 24 },
  { part: "abdomen", x: 50, y: 34 },
  { part: "pelvis", x: 50, y: 45 },
  { part: "right shoulder", x: 36, y: 22 },
  { part: "left shoulder", x: 64, y: 22 },
  { part: "right arm", x: 30, y: 30 },
  { part: "left arm", x: 70, y: 30 },
  { part: "right forearm", x: 26, y: 38 },
  { part: "left forearm", x: 74, y: 38 },
  { part: "right hand", x: 24, y: 45 },
  { part: "left hand", x: 76, y: 45 },
  { part: "right thigh", x: 43, y: 58 },
  { part: "left thigh", x: 57, y: 58 },
  { part: "right knee", x: 43, y: 69 },
  { part: "left knee", x: 57, y: 69 },
  { part: "right lower leg", x: 43, y: 79 },
  { part: "left lower leg", x: 57, y: 79 },
  { part: "right foot", x: 43, y: 90 },
  { part: "left foot", x: 57, y: 90 }
];

const BACK: ReadonlyArray<{ part: string; x: number; y: number }> = [
  { part: "head", x: 50, y: 10 },
  { part: "neck", x: 50, y: 17 },
  { part: "upper back", x: 50, y: 24 },
  { part: "lower back", x: 50, y: 34 },
  { part: "pelvis", x: 50, y: 45 },
  { part: "right shoulder", x: 36, y: 22 },
  { part: "left shoulder", x: 64, y: 22 },
  { part: "right arm", x: 30, y: 30 },
  { part: "left arm", x: 70, y: 30 },
  { part: "right forearm", x: 26, y: 38 },
  { part: "left forearm", x: 74, y: 38 },
  { part: "right hand", x: 24, y: 45 },
  { part: "left hand", x: 76, y: 45 },
  { part: "right glute", x: 44, y: 50 },
  { part: "left glute", x: 56, y: 50 },
  { part: "right thigh", x: 43, y: 60 },
  { part: "left thigh", x: 57, y: 60 },
  { part: "right knee", x: 43, y: 70 },
  { part: "left knee", x: 57, y: 70 },
  { part: "right lower leg", x: 43, y: 80 },
  { part: "left lower leg", x: 57, y: 80 },
  { part: "right foot", x: 43, y: 90 },
  { part: "left foot", x: 57, y: 90 }
];

export function TcccBodyMap({ injuries }: { injuries: Injury[] }) {
  const markers = injuries.map((injury, index) => toMarker(injury, index));
  const frontMarkers = markers.filter((marker) => marker.view === "front");
  const backMarkers = markers.filter((marker) => marker.view === "back");

  return (
    <div className="stack">
      <div className="section-heading">
        <div className="eyebrow">TCCC Human View</div>
        <h3 style={{ margin: 0 }}>Injury map (marking with X)</h3>
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
        <ul className="list-tight">
          {markers.length ? (
            markers.map((marker, index) => (
              <li key={marker.id}>
                X{index + 1}: {marker.label} ({marker.region}) - {marker.severity}
              </li>
            ))
          ) : (
            <li>No injury findings available.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function BodyFigure({ view, markers }: { view: "front" | "back"; markers: Marker[] }) {
  return (
    <svg viewBox="0 0 220 360" role="img" aria-label={`${view} TCCC body map`} style={{ width: "100%", maxWidth: 320 }}>
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
        return (
          <g key={marker.id}>
            <line x1={x - 7} y1={y - 7} x2={x + 7} y2={y + 7} stroke="#9a2f22" strokeWidth="3" />
            <line x1={x + 7} y1={y - 7} x2={x - 7} y2={y + 7} stroke="#9a2f22" strokeWidth="3" />
            <circle cx={x} cy={y} r="10" fill="none" stroke="rgba(154,47,34,0.4)" strokeWidth="1" />
            <text x={x + 11} y={y - 3} fill="#9a2f22" fontSize="12" fontWeight="700">
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
  const region = injury.region.toLowerCase();
  const front = pickPoint(region, FRONT);
  const back = pickPoint(region, BACK);
  const view = region.includes("back") || region.includes("posterior") || region.includes("glute") ? "back" : "front";
  const point = view === "front" ? front : back;

  return {
    id: `${injury.label}-${index}`,
    label: injury.label,
    region: injury.region,
    severity: injury.severity,
    view,
    x: point.x,
    y: point.y
  };
}

function pickPoint(region: string, points: ReadonlyArray<{ part: string; x: number; y: number }>) {
  const keyed = points.find((entry) => region.includes(entry.part));
  if (keyed) {
    return keyed;
  }
  if (region.includes("groin")) {
    return { part: "pelvis", x: 50, y: 47 };
  }
  if (region.includes("junctional")) {
    return { part: "pelvis", x: region.includes("right") ? 44 : region.includes("left") ? 56 : 50, y: 48 };
  }
  if (region.includes("torso") || region.includes("trunk")) {
    return { part: "chest", x: 50, y: 28 };
  }
  if (region.includes("extremity") || region.includes("leg")) {
    return { part: "thigh", x: region.includes("right") ? 43 : region.includes("left") ? 57 : 50, y: 60 };
  }
  return { part: "chest", x: 50, y: 28 };
}

function mapToCanvasX(x: number) {
  return 20 + (x / 100) * 180;
}

function mapToCanvasY(y: number) {
  return 28 + (y / 100) * 300;
}
