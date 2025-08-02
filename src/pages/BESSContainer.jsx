import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import GridLayout from "react-grid-layout";
import { container_layout } from "../templates/Container-template";
import "react-grid-layout/css/styles.css";
import {
  DialWidget,
  TileWidget,
  ChartWidget,
  FaultsWidget,
} from "../components/widget";

const BESSContainerPage = () => {
  const { containerId } = useParams();
  const gridParentRef = useRef(null);
  const [gridWidth, setGridWidth] = useState(1200);
  const [widgetData, setWidgetData] = useState({
    soh: 98,
    temperature: [
      { name: "A", value: 30 },
      { name: "B", value: 50 },
      { name: "C", value: 70 },
      { name: "D", value: 60 },
    ],
    frequency: 50,
    capacity: 75,
    soc: [
      { name: "t1", value: 30 },
      { name: "t2", value: 50 },
      { name: "t3", value: 70 },
      { name: "t4", value: 60 },
      { name: "t5", value: 70 },
      { name: "t6", value: 60 },
      { name: "t7", value: 70 },
    ],
    current: 55,
    power: "50kw",
    voltage: [
      { name: "A", value: 30 },
      { name: "B", value: 50 },
      { name: "C", value: 70 },
      { name: "D", value: 60 },
    ],
    faults: ["Fault 1", "Fault 2"],
    activeAlarms: ["Alarm 1", "Alarm 2"],
    reactiveAlarms: ["Alarm 3", "Alarm 4"],
    powerFactor: 2,
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
        soh: prev.soh + (Math.random() > 0.5 ? 1 : -1),
        temperature: prev.temperature.map((t) => ({
          ...t,
          value: t.value + (Math.random() > 0.5 ? 1 : -1),
        })),
        frequency: prev.frequency + (Math.random() > 0.5 ? 1 : -1),
        capacity: prev.capacity + (Math.random() > 0.5 ? 1 : -1),
        soc: prev.soc.map((s) => ({
          ...s,
          value: s.value + (Math.random() > 0.5 ? 1 : -1),
        })),
        current: prev.current + (Math.random() > 0.5 ? 1 : -1),
        power: `${prev.power.slice(0, -2) * (1 + Math.random() + 0.1)}kw`,
        voltage: prev.voltage.map((v) => ({
          ...v,
          value: v.value + (Math.random() > 0.5 ? 1 : -1),
        })),
        faults: Math.random() > 0.5 ? ["Fault 1", "Fault 2"] : [],
        activeAlarms: Math.random() > 0.5 ? ["Alarm 1", "Alarm 2"] : [],
        reactiveAlarms: Math.random() > 0.5 ? ["Alarm 3", "Alarm 4"] : [],
        powerFactor: prev.powerFactor + (Math.random() > 0.5 ? 0.01 : -0.01),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{ padding: 24 }}>
      <h2>Container: {containerId}</h2>
      {/* You can now fetch data related to this containerId */}
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
          layout={container_layout}
          cols={6}
          rowHeight={60}
          width={1200}
          draggableHandle=".draggable-card-header"
        >
          {container_layout.map((item) => (
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

export default BESSContainerPage;
