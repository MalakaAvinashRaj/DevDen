export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startSupervisor } = await import('./lib/supervisor')
    const { startHeartbeat } = await import('./lib/sse')
    startSupervisor()
    startHeartbeat()
  }
}
