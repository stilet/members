import { writable, get } from 'svelte/store'
import moment from 'moment'

export const queue = writable([], () => {
  if (process.browser) {
    const interval = window.setInterval(() => cleanup(), 100)
    return () => window.clearInterval(interval)
  }
})

let notificationId = 0
export function notify (type, message) {
  console.log("Adding:", type, message)


  queue.update(queue => {
    queue.push({
      id: notificationId++,
      time: Date.now(),
      type, message
    })
    return queue
  })

  console.log(get(queue))
}

export function remove (item) {
  queue.update(queue => queue.filter(notification => notification !== item))
}

function cleanup () {
  queue.update(queue => {
    const now = moment()

    return queue.filter(item => moment(item.time).add(3, 's').isAfter(now))
  })
}

