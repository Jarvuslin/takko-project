import type { Project } from "./schema";

/** Shared admission across projects. Call after the production gateway saves its
 * pending reservation, before transport. Unknown charges retain their hold. */
export function evaluationAdmission(projects: Pick<Project, "charges" | "reservedMicros">[], capMicros: number, providerSpentMicros = 0) {
  if (!Number.isSafeInteger(capMicros) || capMicros <= 0 || !Number.isSafeInteger(providerSpentMicros) || providerSpentMicros < 0) throw Error("Invalid evaluation budget");
  const chargedMicros = projects.reduce((sum, p) => sum + p.charges.reduce((n, c) => n + c.chargedMicros, 0), 0);
  const reservedMicros = projects.reduce((sum, p) => sum + p.reservedMicros, 0);
  const liabilityMicros = Math.max(chargedMicros, providerSpentMicros) + reservedMicros;
  if (![chargedMicros, reservedMicros, liabilityMicros].every(n => Number.isSafeInteger(n) && n >= 0)) throw Error("Invalid evaluation liability");
  if (liabilityMicros > capMicros) throw Error("Aggregate evaluation cap exhausted before dispatch");
  return { chargedMicros, reservedMicros, providerSpentMicros, liabilityMicros, remainingMicros: capMicros - liabilityMicros };
}
