import { randomUUID } from "node:crypto";
// Monetary values use integer microdollars, never rounded dollar floats.
export class Budget {
  spent = 0;
  private reservations = new Map<string, number>();
  constructor(public limit: number) {
    this.check(limit);
  }
  private check(n: number) {
    if (!Number.isSafeInteger(n) || n < 0) throw Error("Invalid budget amount");
  }
  get available() {
    return Math.max(
      0,
      this.limit -
        this.spent -
        [...this.reservations.values()].reduce((a, b) => a + b, 0),
    );
  }
  reserve(amount: number) {
    this.check(amount);
    if (amount > this.available) throw Error("Budget exhausted");
    const id = randomUUID();
    this.reservations.set(id, amount);
    return id;
  }
  settle(id: string, actual: number | null) {
    const held = this.reservations.get(id);
    if (held === undefined) throw Error("Unknown reservation");
    if (actual !== null) this.check(actual);
    this.spent += actual ?? held;
    this.reservations.delete(id);
  }
}
