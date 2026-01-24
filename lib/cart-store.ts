"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { addCartNotification } from "./action-notifications-store"

interface CartItem {
  id: number
  name: string
  price: number
  imageUrl: string
  slug: string
  quantity: number
  stockQuantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items
        const existingItem = items.find((i) => i.id === item.id)

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: Math.min(i.quantity + 1, item.stockQuantity) } : i,
            ),
          })
          // Notify for quantity increase
          addCartNotification(item.name, item.imageUrl)
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
          })
          // Notify for new item
          addCartNotification(item.name, item.imageUrl)
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity: Math.min(quantity, item.stockQuantity) } : item,
          ),
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
