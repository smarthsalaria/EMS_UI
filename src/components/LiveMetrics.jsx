import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Divider, Modal } from '@mui/material';
import { CircularProgressbar } from 'react-circular-progressbar';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import 'react-circular-progressbar/dist/styles.css';
import './LiveMetrics.css';
import OperationMode from './OperationMode';

const LiveMetrics = ({ theme }) => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const navigate = useNavigate();

  const defaultLayout = [
    'activePower', 'reactivePower', 'powerFactor',
    'voltage', 'frequency', 'capacity',
    'soc', 'soh'
  ];

  const [metrics, setMetrics] = useState({});
  const [alarms, setAlarms] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [layout, setLayout] = useState(() => {
    const saved = sessionStorage.getItem('liveMetricsLayout');
    return saved ? JSON.parse(saved) : defaultLayout;
  });

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    console.log("🔐 Received token:", token);
    if (!token) return;

    const config = { headers: { Authorization: `Bearer ${token}` } };
    let timeline = [];
    let index = 0;
    let intervalId;

    axios.get('http://localhost:5000/api/metrics', config)
      .then((res) => {
        timeline = res.data || [];
        if (timeline.length > 0) setMetrics(timeline[0]);

        intervalId = setInterval(() => {
          if (timeline.length > 0) {
            setMetrics(timeline[index]);
            index = (index + 1) % timeline.length;
          }
        }, 5000);
      })
      .catch((err) => {
        console.error('Error fetching metrics:', err);
      });

    axios.get('http://localhost:5000/api/alarms', config)
      .then((res) => setAlarms(res.data || []))
      .catch((err) => console.error('Error fetching alarms:', err));

    return () => clearInterval(intervalId);
  }, []);

  const onDragEnd = ({ source, destination }) => {
    if (!destination || source.index === destination.index) return;
    const newLayout = Array.from(layout);
    const [movedItem] = newLayout.splice(source.index, 1);
    newLayout.splice(destination.index, 0, movedItem);
    setLayout(newLayout);
    sessionStorage.setItem('liveMetricsLayout', JSON.stringify(newLayout));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const handleAlarmClick = () => navigate('/dashboard/alarms');

  const metricValueMap = useMemo(() => ({
    activePower: { label: 'Active Power (P)', value: metrics.active_power, max: metrics.maxActivePower || 100, unit: 'kW' },
    reactivePower: { label: 'Reactive Power (Q)', value: metrics.reactive_power, max: metrics.maxReactivePower || 100, unit: 'kVAR' },
    powerFactor: { label: 'Power Factor', textOnly: metrics.power_factor },
    voltage: { label: 'Voltage (V)', textOnly: metrics.voltage },
    frequency: { label: 'Frequency (Hz)', textOnly: metrics.frequency },
    capacity: { label: 'Overall Capacity', textOnly: metrics.capacity },
    soc: { label: 'State of Charge (SOC)', value: metrics.soc, max: 100, unit: '%' },
    soh: { label: 'State of Health (SOH)', value: metrics.soh, max: 100, unit: '%' },
  }), [metrics]);

  const renderCard = (type) => {
  const card = metricValueMap[type];
  if (!card) return null;

  const isMissing = card.value === null || card.value === undefined;
  return (
    <Box className="metric-card" sx={{ position: 'relative' }}>
      <Typography variant="body2">{card.label}</Typography>
      
      {isMissing && (
        <div style={{
          position: 'absolute',
          top: 4,
          right: 6,
          color: 'red',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>*</div>
      )}

      {card.textOnly !== undefined ? (
        <Typography variant="h6">
          {(card.textOnly !== null && card.textOnly !== undefined)
            ? `${card.textOnly} ${card.unit || ''}`
            : 'N/A'}
        </Typography>
      ) : (
        <CircularProgressbar
          value={Math.abs(card.value) || 0}
          maxValue={card.max}
          text={`${Math.abs(card.value) || 0} ${card.unit}`}
          strokeWidth={8}
          className={(card.value || 0) < 0 ? 'negative-gauge' : 'positive-gauge'}
        />
      )}
    </Box>
  );
};


  return (
    <div className={`live-metrics-container ${theme}`}>
      <Typography variant="h5" gutterBottom className="title">Live Metrics</Typography>

      <Box onClick={() => setOpenModal(true)} className="operation-mode-card locked">
        <Typography variant="body1" className="operation-mode-text">Operation Mode</Typography>
        <Typography variant="h6" className="operation-mode-value">{metrics.operation_mode || 'N/A'}</Typography>
      </Box>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <div className="operation-mode-modal">
          <div className="operation-mode-modal-content">
            <Typography className="operation-mode-modal-header">Operation Mode Details</Typography>
            <div className="operation-mode-modal-body">
              <OperationMode />
            </div>
            <div className="operation-mode-modal-actions">
              <button className="operation-mode-button" onClick={() => setOpenModal(false)}>Close</button>
            </div>
          </div>
        </div>
      </Modal>
      <div className="metrics-section">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="singleContainer" direction="vertical" type="grid">
            {(provided) => (
              <div className="metrics-row" ref={provided.innerRef} {...provided.droppableProps}>
                {layout.map((metricType, index) => (
                  <Draggable key={metricType} draggableId={metricType} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`draggable-wrapper ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        {renderCard(metricType)}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <Divider sx={{ my: 2 }} />
      <Typography variant="h5" gutterBottom className="title">Active Alarms</Typography>
      <div className="alarm-list scrollable">
        {alarms.length === 0 ? (
          <Typography variant="body2">No active alarms</Typography>
        ) : (
          alarms.map((alarm, idx) => (
            <Box
              key={idx}
              className="alarm-item"
              onClick={handleAlarmClick}
              sx={{ cursor: 'pointer' }}
            >
              <span
                className={`alarm-dot ${alarm.priority}`}
                style={{ backgroundColor: getPriorityColor(alarm.priority) }}
              />
              <Typography variant="body2">{alarm.message}</Typography>
            </Box>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveMetrics;
