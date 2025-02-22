import { create } from 'zustand';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  images?: string[];
}

interface ChatStore {
  messages: ChatMessage[];
  message: string;
  setMessage: (newMessage: string) => void;
  addMessage: (message: ChatMessage) => void;
}

const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  message: '',
  setMessage: (newMessage) => set({ message: newMessage }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
}));

export const useChat = () => {
  const chatStore = useChatStore();

  return {
    messages: chatStore.messages,
    message: chatStore.message,
    setMessage: chatStore.setMessage,
    addMessage: chatStore.addMessage,
  };
};
