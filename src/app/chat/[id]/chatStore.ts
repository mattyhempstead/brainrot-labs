import { create } from 'zustand';

interface ChatStore {
  message: string;
  setMessage: (newMessage: string) => void;
}

const useChatStore = create<ChatStore>((set) => ({
  message: '',
  setMessage: (newMessage) => set({ message: newMessage }),
}));

export const useChat = () => {
  const chatStore = useChatStore();

  return {
    message: chatStore.message,
    setMessage: chatStore.setMessage,
  };
};
