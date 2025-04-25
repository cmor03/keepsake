import { create } from 'zustand';

// NOTE: Storing File objects in global state works for client-side navigation 
// but they will be lost on a full page refresh. This is usually acceptable
// for a checkout flow, but be aware of this limitation.

export const useFileStore = create((set) => ({
  files: [], // Array to hold the actual File objects
  orderId: null,
  clientSecret: null,
  totalAmount: 0,
  
  setFiles: (newFiles) => set({ files: newFiles }),
  setOrderDetails: (details) => set({ 
    orderId: details.orderId,
    clientSecret: details.clientSecret,
    totalAmount: details.amount
  }),
  clearFiles: () => set({ files: [] }),
  clearOrder: () => set({ orderId: null, clientSecret: null, totalAmount: 0, files: [] }), // Clear everything
})); 