import React, { useRef, useState, useEffect } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { bess_layout, cont_layout } from "../templates/BESS-template";
import {
  DialWidget,
  TileWidget,
  ChartWidget,
  FaultsWidget,
} from "../components/widget";

const BESS = () => {
  const gridParentRef = useRef(null);
  const [gridWidth, setGridWidth] = useState(1200);

  const [widgetData, setWidgetData] = useState({
    energyAvailable: 75,
    avgSOH: 85,
    activeContainer: "3/10",
    avgSOC: 65,
    avgVoltageData: [
      { name: "A", value: 30 },
      { name: "B", value: 50 },
      { name: "C", value: 70 },
      { name: "D", value: 60 },
    ],
    faults: ["Fault 1", "Fault 2"],
  });

  const renderWidget = (type, key, title) => {
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
  useEffect(() => {
    function updateWidth() {
      if (gridParentRef.current) {
        setGridWidth(gridParentRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWidgetData((prev) => ({
        ...prev,
        activeContainer: `Container ${Math.floor(Math.random() * 10) + 1}`,
        energyAvailable: (prev.energyAvailable + 1) % 100,
        avgSOC: 60 + Math.floor(Math.random() * 10),
        avgSOH: 80 + Math.floor(Math.random() * 20),
        avgVoltageData: [
          { name: "A", value: Math.random() * 100 },
          { name: "B", value: Math.random() * 100 },
          { name: "C", value: Math.random() * 100 },
          { name: "D", value: Math.random() * 100 },
        ],
        faults: Math.random() > 0.5 ? ["Fault 1", "Fault 2"] : [],
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h3>BESS Page</h3>
      {/* Scrollable container for cont_layout cards */}
      <div
        style={{
          border: "2px solid #3b3b3bff",
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          background: "#e3f2fd",
          width: "100%",
          maxWidth: 1200,
          marginLeft: "auto",
          marginRight: "auto",
          maxHeight: 400,
          overflowX: "auto",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            minWidth: 900,
          }}
        >
          {cont_layout.map((item) => (
            <div
              key={item.i}
              style={{
                minHeight: 150,
                minWidth: 200,
                border: "1px solid #ccc",
                borderRadius: 8,
                background: "#fff",
                padding: 12,
                textAlign: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <strong>{item.i}</strong>
              <div style={{ fontSize: 12, color: "#888" }}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive GridLayout */}
      <div
        ref={gridParentRef}
        style={{
          width: "100%",
          maxWidth: 1200,
          marginLeft: "auto",
          marginRight: "auto",
          maxHeight: 1000,
          overflowX: "auto",
          overflowY: "auto",
        }}
      >
        <GridLayout
          className="layout"
          layout={bess_layout}
          cols={6}
          rowHeight={60}
          width={gridWidth}
          draggableHandle=".draggable-card-header"
        >
          {bess_layout.map((item) => (
            <div
              key={item.i}
              data-grid={item}
              style={{
                border: "1px solid #ccc",
                borderRadius: 8,
                background: "#f9f9f9",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                className="draggable-card-header"
                style={{
                  cursor: "move",
                  padding: 8,
                  background: "#eee",
                  borderBottom: "1px solid #ccc",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {item.i}
              </div>
              {renderWidget(item.vis, item.key, item.i)}
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
};

export default BESS;
