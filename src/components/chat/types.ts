
export interface Webhook {
  id: string;
  name: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}
