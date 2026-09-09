export interface PollingOptions {
  intervalMs: number
  immediate?: boolean
}

export function usePolling(callback: () => Promise<void>, options: PollingOptions) {
  let timerId: ReturnType<typeof setInterval> | null = null

  async function run(): Promise<void> {
    await callback()
  }

  function start(): void {
    if (timerId !== null) return
    if (options.immediate === true) void run()
    timerId = setInterval(() => void run(), options.intervalMs)
  }

  function stop(): void {
    if (timerId !== null) clearInterval(timerId)
    timerId = null
  }

  onBeforeUnmount(stop)
  return { start, stop, run }
}
