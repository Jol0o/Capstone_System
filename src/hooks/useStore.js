// store.js
import { create } from 'zustand'

export const useStore = create((set) => {
    let storedUserEmail = "";
    if (typeof window !== "undefined") {
        // Retrieve the state from localStorage when the store is initialized
        storedUserEmail = localStorage.getItem('userEmail') || "";
    }

    return {
        userEmail: storedUserEmail,
        setUser: (email) => {
            set({ userEmail: email });
            if (typeof window !== "undefined") {
                localStorage.setItem('userEmail', email); // Update localStorage whenever the state changes
            }
        },
        removeAllUser: () => {
            set({ userEmail: "" });
            if (typeof window !== "undefined") {
                localStorage.removeItem('userEmail'); // Remove from localStorage when the state is reset
            }
        }
    };
});