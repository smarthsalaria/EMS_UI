import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Container } from '@mui/material';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';

const LiveMetricsMobile = () => {
  const [metrics, setMetrics] = useState([]);
  const [alarms, setAlarms] = useState([]);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const [metricsRes, alarmsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/metrics', config),
        axios.get('http://localhost:5000/api/alarms', config),
      ]);

      setMetrics(metricsRes.data);
      setAlarms(alarmsRes.data);
    } catch (error) {
      console.error('Error fetching metrics or alarms:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ paddingTop: 4, paddingBottom: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Live Metrics
      </Typography>

      <Grid container spacing={4}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{metric.operation_mode}</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" align="center">Active Power</Typography>
                    <CircularProgressbar
                      value={Math.abs(metric.active_power)}
                      maxValue={metric.max_active_power}
                      text={`${metric.active_power} kW`}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" align="center">Voltage</Typography>
                    <CircularProgressbar
                      value={metric.voltage}
                      maxValue={500}
                      text={`${metric.voltage} V`}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" align="center">Capacity</Typography>
                    <CircularProgressbar
                      value={metric.capacity}
                      maxValue={1000}
                      text={`${metric.capacity} kWh`}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" align="center" sx={{ marginTop: 6 }} gutterBottom>
        Alarms
      </Typography>

      <Grid container spacing={3}>
        {alarms.map((alarm, index) => (
          <Grid item xs={12} key={index}>
            <Card>
              <CardContent>
                <Typography variant="body1">{alarm.message}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Priority: {alarm.priority} | Acknowledged: {alarm.acknowledged ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Timestamp: {new Date(alarm.timestamp).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default LiveMetricsMobile;
