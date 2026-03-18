export const initialUtaData = [
  {
    id: "UTA 1234",
    status: "ON",
    tempAirSupply: 22,
    tempReturn: 19,
    pressure: 1.2,
    inverterAirSupply: 80,
    inverterAirReturn: 75,
    chiller: {
      id: "CHILL 1",
      status: "OFF",       // <- status chiller adaugat aici
      tempIn: 30,
      tempOut: 40,
      pressure: 1.1,
      kaldaja: {
        id: "KALDAJA 1",
        tempSupply: 6,
        tempReturn: 4,
        inverter: {
          id: "INV 1",
          power: 70
        }
      }
    }
  },
  {
    id: "UTA 4567",
    status: "OFF",
    tempAirSupply: 23,
    tempReturn: 20,
    pressure: 1.1,
    inverterAirSupply: 70,
    inverterAirReturn: 68,
    chiller: {
      id: "CHILL 2",
      status: "ON",
      tempIn: 31,
      tempOut: 38,
      pressure: 1.2,
      kaldaja: {
        id: "KALDAJA 2",
        tempSupply: 7,
        tempReturn: 5,
        inverter: {
          id: "INV 2",
          power: 60
        }
      }
    }
  },
  {
    id: "UTA 4537",
    status: "OFF",
    tempAirSupply: 23,
    tempReturn: 20,
    pressure: 1.1,
    inverterAirSupply: 70,
    inverterAirReturn: 68,
    chiller: {
      id: "CHILL 3",
      status: "OFF",
      tempIn: 31,
      tempOut: 38,
      pressure: 1.2,
      kaldaja: {
        id: "KALDAJA 2",
        tempSupply: 7,
        tempReturn: 5,
        inverter: {
          id: "INV 2",
          power: 60
        }
      }
    }
  },
  {
    id: "UTA 4067",
    status: "ON",
    tempAirSupply: 23,
    tempReturn: 20,
    pressure: 1.1,
    inverterAirSupply: 70,
    inverterAirReturn: 68,
    chiller: {
      id: "CHILL 4",
      status: "ON",
      tempIn: 31,
      tempOut: 38,
      pressure: 1.2,
      kaldaja: {
        id: "KALDAJA 2",
        tempSupply: 7,
        tempReturn: 5,
        inverter: {
          id: "INV 2",
          power: 60
        }
      }
    }
  }
];