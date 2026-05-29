
export interface WebSocketMessage {
  type: string;
  event: string;
  data: any;
  timestamp: string;
  channel?: string;
}

export interface WebSocketSubscription {
  id: string;
  channel: string;
  callback: (data: any) => void;
}

