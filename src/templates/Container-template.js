export const container_layout = [
    {i:"Voltage",x:0,y:0, w: 2, h: 2 ,vis: 'Chart',key: 'voltage'},
    {i:"Current",x:2,y:0, w: 2, h: 2,vis: 'Dial',key: 'current'},
    {i:"Power",x:4,y:0, w: 2, h: 2, vis: 'Dial', key: 'power'},
    {i:"Faults",x:0,y:2, w: 2, h: 2, vis: 'Fault', key: 'faults'},
    {i:"Temperature", x:2,y:2, w: 2, h: 2, vis: 'Chart', key: 'temperature'},
    {i:"Frequency", x:4,y:2, w: 2, h: 2, vis:"Tile", key: 'frequency'},
    {i:"Capacity", x:0,y:4, w: 2, h: 2, vis: 'Dial', key: 'capacity'},
    {i:"SOC", x:2,y:4, w: 2, h: 2, vis: 'Chart', key: 'soc'},
    {i:"SOH", x:4,y:4, w: 2, h: 2, vis: 'Dial', key: 'soh'},
    {i:"Active Alarms", x:0,y:6, w: 2, h: 2, vis: 'Fault', key: 'activeAlarms'},
    {i:"Reactive Alarms", x:2,y:6, w: 2, h: 2, vis: 'Fault', key: 'reactiveAlarms'},
    {i:"Power Factor", x:4,y:6, w: 2, h: 2, vis: 'Tile', key: 'powerFactor'},
]

export default { container_layout };
