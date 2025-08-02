import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import {
  Card, CardContent, Typography, CircularProgress
} from '@mui/material';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import IconButton from '@mui/material/IconButton';
import Tooltip_1 from '@mui/material/Tooltip';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { Flex } from 'antd';

const Home = () => {
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activePowerTrend, setActivePowerTrend] = useState([]);
  const [reactivePowerTrend, setReactivePowerTrend] = useState([]);
  const [socTrend, setSocTrend] = useState([]);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [timeline, setTimeline] = useState([]);

  const token = sessionStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const [locked, setLocked] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, alarmsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/metrics', config),
          axios.get('http://localhost:5000/api/alarms', config),
        ]);

        const metricsTimeline = metricsRes.data || [];
        setTimeline(metricsTimeline);
        setLogs(alarmsRes.data || []);

      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimelineIndex((prev) => {
        const nextIndex = (prev + 1) % timeline.length;
        const latest = timeline[nextIndex];

        setData({
          totalEnergy: latest?.capacity ? `${latest.capacity} MWh` : null,
          currentSOC: latest?.soc,
          status: latest?.operation_mode,
          powerFlow: latest?.active_power,
          voltage: latest?.voltage,
          frequency: latest?.frequency,
        });

        setSocTrend((prevData) => [...prevData.slice(-9), { time: `T${nextIndex + 1}`, soc: latest?.soc }]);
        setActivePowerTrend((prevData) => [...prevData.slice(-9), { time: `T${nextIndex + 1}`, value: latest?.active_power }]);
        setReactivePowerTrend((prevData) => [...prevData.slice(-9), { time: `T${nextIndex + 1}`, value: latest?.reactive_power }]);

        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [timeline]);

  if (!data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
        <CircularProgress />
      </div>
    );
  }

  const renderValue = (label, value, icon = null, unit = '') => {
    const isMissing = value === undefined || value === null || value === 'N/A';
    return (
      <>
        <Typography variant="subtitle2" color="textSecondary">
          {label}
        </Typography>
        <Typography variant="h6" display="flex" alignItems="center" gap={1}>
          {isMissing ? <span style={{ color: 'red' }}>*</span> : null}
          {value ?? 'N/A'} {unit} {icon}
        </Typography>
      </>
    );
  };

  const layout = [
    { i: 'totalEnergy', x: 0, y: 0, w: 2, h: 1 },
    { i: 'currentSOC', x: 2, y: 0, w: 2, h: 1 },
    { i: 'powerFlow', x: 4, y: 0, w: 2, h: 1 },
    { i: 'status', x: 6, y: 0, w: 2, h: 1 },
    { i: 'voltage', x: 8, y: 0, w: 2, h: 1 },
    { i: 'frequency', x: 10, y: 0, w: 2, h: 1 },
    { i: 'activeTrend', x: 0, y: 4, w: 6, h: 3 },
    { i: 'reactiveTrend', x: 6, y: 4, w: 6, h: 3 },
    { i: 'socTrend', x: 0, y: 8, w: 6, h: 3 },
    { i: 'logs', x: 6, y: 8, w: 6, h: 3 }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <Typography variant="h4">EMS Dashboard</Typography>
        <Tooltip_1 title={locked ? 'Locked Layout' : 'Unlocked Layout'}>
          <IconButton
            className="lock-toggle-btn"
            onClick={() => setLocked(!locked)}
            size="large"
          >
            {locked ? (
              <LockRoundedIcon color="primary" />
            ) : (
              <LockOpenRoundedIcon color="warning" />
            )}
          </IconButton>
        </Tooltip_1>

        
      </div>


      <GridLayout className="layout" layout={layout} cols={12} rowHeight={80} width={1100} isDraggable={!locked} isResizable={!locked}>
        <div key="totalEnergy"><Card><CardContent><div style={{display:"flex", flexDirection: "column", alignItems: "center"}}>{renderValue('Energy Discharged', data.totalEnergy, <TrendingUpIcon color="primary" />)}</div></CardContent></Card></div>
        <div key="currentSOC"><Card><CardContent><div style={{display:"flex", flexDirection: "column", alignItems: "center"}}>{renderValue('Current SOC', data.currentSOC, <BatteryChargingFullIcon color="success" />, '%')}</div></CardContent></Card></div>
        <div key="powerFlow"><Card><CardContent><div style={{display:"flex", flexDirection: "column", alignItems: "center"}}>{renderValue('Power Flow', data.powerFlow, <FlashOnIcon color="warning" />, 'kW')}</div></CardContent></Card></div>
        <div key="status"><Card><CardContent><div style={{display:"flex", flexDirection: "column", alignItems: "center"}}>{renderValue('EMS Status', data.status, <PowerSettingsNewIcon color="error" />)}</div></CardContent></Card></div>
        <div key="voltage"><Card><CardContent><div style={{display:"flex", flexDirection: "column", alignItems: "center"}}>{renderValue('Grid Voltage', data.voltage, null, 'V')}</div></CardContent></Card></div>
        <div key="frequency"><Card><CardContent><div style={{display:"flex", flexDirection: "column", alignItems: "center"}}>{renderValue('Grid Frequency', data.frequency, null, 'Hz')}</div></CardContent></Card></div>

        <div key="activeTrend" style={{ paddingTop: "20px"}}>
          <Card><CardContent><Typography variant="subtitle2">Active Power Trend</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={activePowerTrend}><XAxis dataKey="time" /><YAxis /><Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={2} /></LineChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </div>

        <div key="reactiveTrend" style={{ paddingTop: "20px"}}>
          <Card><CardContent><Typography variant="subtitle2">Reactive Power Trend</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={reactivePowerTrend}><XAxis dataKey="time" /><YAxis /><Tooltip />
                <Line type="monotone" dataKey="value" stroke="#43a047" strokeWidth={2} /></LineChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </div>

        <div key="socTrend" style={{ paddingTop: "20px"}}>
          <Card><CardContent><Typography variant="subtitle2">SOC Trend</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={socTrend}><XAxis dataKey="time" /><YAxis domain={[0, 100]} /><Tooltip />
                <Line type="monotone" dataKey="soc" stroke="#f57c00" strokeWidth={2} /></LineChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </div>

        <div key="logs" style={{ paddingTop: "20px"}}>
          <Card><CardContent><Typography variant="subtitle2">Recent Logs / Notifications <NotificationsActiveIcon fontSize="small" /></Typography>
            {logs.length === 0 ? <Typography variant="body2">No recent logs</Typography> :
              logs.map((log, index) => (
                <Typography key={index} variant="body2" style={{ marginBottom: '5px' }}>
                  • {new Date(log.timestamp).toLocaleString()} – {log.message}
                </Typography>
              ))}
          </CardContent></Card>
        </div>

      </GridLayout>
    </div>
  );
};

export default Home;
