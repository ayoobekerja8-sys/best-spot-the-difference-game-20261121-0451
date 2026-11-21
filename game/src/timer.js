// The countdown clock: one number and one bar. The timer owns the remaining seconds; the UI reads
// the fraction and the label, and the loop asks tick() once a frame whether the level is over.
export function createTimer(seconds) {
  return {
    total: seconds,
    remaining: seconds,
    /** Advance by dt seconds; true once the clock has run out. */
    tick(dt) {
      this.remaining = Math.max(0, this.remaining - dt);
      return this.remaining <= 0;
    },
    fraction() {
      return this.total <= 0 ? 0 : Math.max(0, Math.min(1, this.remaining / this.total));
    },
    /** True in the last quarter, when the bar turns warm and the label blinks. */
    urgent() {
      return this.fraction() <= 0.25;
    },
    label() {
      const whole = Math.ceil(this.remaining);
      const minutes = Math.floor(whole / 60);
      const secs = whole % 60;
      return `${minutes}:${String(secs).padStart(2, '0')}`;
    },
  };
}
