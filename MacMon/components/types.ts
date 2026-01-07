export interface SystemStats {
    ts: number;
    cpu: number;
    ram: number;
    gpu: number;
    disk: number;       
    temp: number;
    battery: number;
    battery_status: string;
    battery_time: string;   
    uptime: string;
    network: {
      rx_speed: string;
      tx_speed: string;
      rx_total: string;
      tx_total: string;
    };
  }
  
  export interface Process {
    pid: number;
    name: string;
    cpu: number;
    ram: number;
  }