import { readable } from 'svelte/store'

export const time = readable(new Date(), set => {
  try {
    const interval = window.setInterval(() => set(new Date()), 1000)
    return () => window.clearInterval(interval)
  } catch (e) {
    console.log("No window.")
  }
})