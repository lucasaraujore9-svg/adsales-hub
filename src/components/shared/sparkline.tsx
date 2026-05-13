interface Props {
  data: number[];
  height?: number;
  color?: string;
  showArea?: boolean;
}

export function Sparkline({ data, height = 32, color = "var(--accent)", showArea = true }: Props) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = 100 / (data.length - 1 || 1);

  const points = data
    .map((v, i) => `${(i * stepX).toFixed(2)},${((1 - (v - min) / range) * 100).toFixed(2)}`)
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height, width: "100%" }}>
      {showArea && (
        <polygon
          fill={color}
          fillOpacity="0.12"
          points={`0,100 ${points} 100,100`}
        />
      )}
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function MiniBars({ data, height = 48, color = "var(--accent)" }: { data: number[]; height?: number; color?: string }) {
  if (data.length === 0) return null;
  const max = Math.max(...data) || 1;
  const barWidth = 100 / data.length - 1;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height, width: "100%" }}>
      {data.map((v, i) => {
        const h = (v / max) * 100;
        return (
          <rect
            key={i}
            x={i * (barWidth + 1)}
            y={100 - h}
            width={barWidth}
            height={h}
            fill={color}
            fillOpacity="0.8"
            rx={0.5}
          />
        );
      })}
    </svg>
  );
}
