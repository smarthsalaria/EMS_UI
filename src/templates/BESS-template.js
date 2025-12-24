
export const bess_layout = [
  { i: 'Energy Available', x: 0, y: 0, w: 2, h: 3, vis: 'Dial', key: 'energyAvailable' },
  { i: 'Avg SOH', x: 2, y: 0, w: 2, h: 3, vis: 'Dial', key: 'avgSOH' },
  { i: 'Active Container', x: 4, y: 0, w: 2, h: 3, vis: 'Tile', key: 'activeContainer' },
  { i: 'Active Faults', x: 0, y: 2, w: 2, h: 3, vis: 'Fault', key: 'faults' },
  { i: 'Avg Voltage vs Time', x: 2, y: 2, w: 2, h: 3, vis: 'Chart', key: 'avgVoltageData' },
  { i: 'Avg SOC', x: 4, y: 2, w: 2, h: 3, vis: 'Dial', key: 'avgSOC' },

];

export const cont_layout = [
    { i: 'Container-1',x:0,y:0, w: 2, h: 1 },
    { i: 'Container-2',x:2,y:0, w: 2, h: 1 },
    { i: 'Container-3', w: 2, h: 1 },
    { i: 'Container-4', w: 2, h: 1 },
    { i: 'Container-5', w: 2, h: 1 },
    { i: 'Container-6', w: 2, h: 1 },
    { i: 'Container-7', w: 2, h: 1 },
    { i: 'Container-8', w: 2, h: 1 },
    { i: 'Container-9', w: 2, h: 1 },
    { i: 'Container-10', w: 2, h: 1 },
    { i: 'Container-11', w: 2, h: 1 },
    { i: 'Container-12', w: 2, h: 1 },
    { i: 'Container-13', w: 2, h: 1 },
    { i: 'Container-14', w: 2, h: 1 },
    { i: 'Container-15', w: 2, h: 1 },
    { i: 'Container-16', w: 2, h: 1 }
    
]

// export { bess_layout, cont_layout };
export default {bess_layout, cont_layout};