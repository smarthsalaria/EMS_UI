
export const bess_layout = [
  { i: 'Energy Available', x: 0, y: 0, w: 2, h: 3, vis: 'Dial', key: 'energyAvailable' },
  { i: 'Avg SOH', x: 2, y: 0, w: 2, h: 3, vis: 'Dial', key: 'avgSOH' },
  { i: 'Active Container', x: 4, y: 0, w: 2, h: 3, vis: 'Tile', key: 'activeContainer' },
  { i: 'Active Faults', x: 0, y: 2, w: 2, h: 3, vis: 'Fault', key: 'faults' },
  { i: 'Avg Voltage vs Time', x: 2, y: 2, w: 2, h: 3, vis: 'Chart', key: 'avgVoltageData' },
  { i: 'Avg SOC', x: 4, y: 2, w: 2, h: 3, vis: 'Dial', key: 'avgSOC' },

];

export const cont_layout = [
    { i: 'PESSPL-1',x:0,y:0, w: 2, h: 1 },
    { i: 'PESSPL-2',x:2,y:0, w: 2, h: 1 },
    { i: 'PESSPL-3', w: 2, h: 1 },
    { i: 'PESSPL-4', w: 2, h: 1 },
    { i: 'PESSPL-5', w: 2, h: 1 },
    { i: 'PESSPL-6', w: 2, h: 1 },
    { i: 'PESSPL-7', w: 2, h: 1 },
    { i: 'PESSPL-8', w: 2, h: 1 },
    { i: 'PESSPL-9', w: 2, h: 1 },
    { i: 'PESSPL-10', w: 2, h: 1 },
    { i: 'PESSPL-11', w: 2, h: 1 },
    { i: 'PESSPL-12', w: 2, h: 1 },
    { i: 'PESSPL-13', w: 2, h: 1 },
    { i: 'PESSPL-14', w: 2, h: 1 },
    { i: 'PESSPL-15', w: 2, h: 1 },
    { i: 'PESSPL-16', w: 2, h: 1 }
    
]

// export { bess_layout, cont_layout };
export default {bess_layout, cont_layout};