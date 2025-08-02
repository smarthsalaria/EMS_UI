import React from 'react';

// Dial Widget
export const DialWidget = ({ title, value = 0, min = 0, max = 100 }) => {
  const size = 100;
  const radius = 40;
  const stroke = 10;
  const percent = (Math.max(min, Math.min(max, value)) - min) / (max - min);
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#eee" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1976d2"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x={size / 2} y={size / 2 + 8} textAnchor="middle" fontSize="20" fill="#333">
          {value}
        </text>
      </svg>
      <div style={{ fontSize: 16, marginTop: 8 }}>{title}</div>
    </div>
  );
};

// Tile Widget
export const TileWidget = ({ title, value }) => (
  <div style={{ padding: 16, textAlign: 'center', position: 'relative' }}>
    <div style={{ fontWeight: 'bold', fontSize: 18, top: 0}}>{title}</div>
    <div style={{ fontSize: 24, color: '#1976d2', marginTop: 8 }}>{value}</div>
  </div>
)

// Faults Widget
export const FaultsWidget = ({ faults = [] }) => (
  <div style={{
    padding: 16,
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    minWidth: 220,
    maxHeight: 180,
    overflowY: 'auto'
  }}>
    <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8, color: '#d32f2f' }}>
      Active Faults: {faults.length}
    </div>
    <ul style={{ paddingLeft: 18, margin: 0 }}>
      {faults.map((fault, idx) => (
        <li key={idx} style={{ color: '#d32f2f', fontSize: 15, marginBottom: 4 }}>
          {fault}
        </li>
      ))}
      {faults.length === 0 && (
        <li style={{ color: '#388e3c', fontSize: 15 }}>No active faults</li>
      )}
    </ul>
  </div>
);

// Chart Widget (example, you can use chart.js or recharts here)
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const ChartWidget = ({ title, data, dataKey = "value" }) => (
  <div style={{ width: '100%', height: 180 }}>
    <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{title}</div>
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke="#1976d2" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const renderWidget = (type, key, title) => {
    const value = widgetData[key];

    switch (type) {
      case "Dial":
        return <DialWidget value={value} title={title} min={0} max={100} />;
      case "Chart":
        return <ChartWidget data={value} title={title} />;
      case "Tile":
        return <TileWidget value={value} title={title} />;
      case "Fault":
        return <FaultsWidget faults={value} />;
      default:
        return <div>Unknown widget</div>;
    }
  };