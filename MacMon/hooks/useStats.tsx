import { useState, useEffect } from 'react';

export interface Stats {
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

export function useStats(url: string) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!url) {
        setConnected(false);
        return;
    }

    let xhr: XMLHttpRequest | null = null;
    let seenBytes = 0;

    try {
        console.log(`Connecting to SSE at ${url}/stats`);
        xhr = new XMLHttpRequest();
        xhr.open('GET', `${url}/stats`, true);
        xhr.setRequestHeader('Accept', 'text/event-stream');
        xhr.setRequestHeader('Cache-Control', 'no-cache');

        // Keep connection alive
        xhr.timeout = 0;

        xhr.onreadystatechange = function() {
            if (xhr!.readyState === 3 || xhr!.readyState === 4) {
                if (xhr!.status === 200) {
                     if (!connected) {
                         setConnected(true);
                         setError(null);
                     }

                     const responseText = xhr!.responseText;
                     const newText = responseText.substring(seenBytes);

                     if (newText.length > 0) {
                         seenBytes = responseText.length;

                         // Process lines
                         const lines = newText.split('\n');
                         for (const line of lines) {
                             if (line.startsWith('data: ')) {
                                 const jsonStr = line.substring(6);
                                 try {
                                     const data = JSON.parse(jsonStr);
                                     setStats(data);
                                 } catch (e) {
                                     console.log('Error parsing JSON chunk', e);
                                 }
                             }
                         }
                     }
                } else if (xhr!.status !== 0) {
                    setError(`Error: ${xhr!.status}`);
                    setConnected(false);
                }
            }
        };

        xhr.onerror = function() {
            console.error("XHR Error");
            setError("Connection failed");
            setConnected(false);
        };

        xhr.send();

    } catch (e) {
        console.error("Failed to create XHR", e);
        setError("Failed to initialize connection");
    }

    return () => {
      if (xhr) {
        xhr.abort();
      }
    };
  }, [url]);

  return { stats, error, connected };
}
