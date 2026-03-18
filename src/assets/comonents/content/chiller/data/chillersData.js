export const initialChillerData = [
  {
    id: "CHILL 1",
    status: "OFF",
    tempIn: 30,
    tempOut: 40,
    pressure: 1.1,
    kaldaja: { id: "KALDAJA 1", tempSupply: 6, tempReturn: 4, inverter: { id: "INV 1", power: 70 } }
  },
  {
    id: "CHILL 2",
    status: "ON",
    tempIn: 31,
    tempOut: 38,
    pressure: 1.2,
    kaldaja: { id: "KALDAJA 2", tempSupply: 7, tempReturn: 5, inverter: { id: "INV 2", power: 60 } }
  },
  {
    id: "CHILL 3",
    status: "OFF",
    tempIn: 31,
    tempOut: 38,
    pressure: 1.2,
    kaldaja: { id: "KALDAJA 2", tempSupply: 7, tempReturn: 5, inverter: { id: "INV 2", power: 60 } }
  },
  {
    id: "CHILL 4",
    status: "ON",
    tempIn: 31,
    tempOut: 38,
    pressure: 1.2,
    kaldaja: { id: "KALDAJA 2", tempSupply: 7, tempReturn: 5, inverter: { id: "INV 2", power: 60 } }
  }
];