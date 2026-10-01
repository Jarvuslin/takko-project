// A late callback is evidence of a suspended/stalled event loop, not parent loss.
export function serviceLease(now: () => number, timeoutMs = 10000, lateMs = 4000) {
  let heartbeatAt = now();
  let checkedAt = heartbeatAt;
  let graceAt = heartbeatAt;
  return {
    heartbeat() { heartbeatAt = now(); },
    expired() {
      const time = now();
      const gap = time - checkedAt;
      checkedAt = time;
      if (gap > lateMs || gap < 0) {
        graceAt = time;
        if (gap < 0) heartbeatAt = time;
        return false;
      }
      return time - Math.max(heartbeatAt, graceAt) > timeoutMs;
    },
    heartbeatAge() { return Math.max(0, now() - heartbeatAt); },
  };
}
