import type { Review, Spec } from "./schema";

const maximumTests = 40;

export function mergeReview(base: Review, next: Review): Review {
  const tests = [...base.tests];
  const ids = new Set(base.tests.map((test) => test.id));
  for (const test of next.tests) {
    // Existing IDs name protected scenarios. Repairs can append new scenarios,
    // including other modes or lifecycle cases for an already-tested requirement.
    if (ids.has(test.id)) continue;
    tests.push(test);
    ids.add(test.id);
  }
  if (tests.length > maximumTests)
    throw Error(
      `Acceptance test catalog exceeds ${maximumTests} tests (${tests.length}). Preserve protected tests and return only additions that fit the remaining capacity.`,
    );
  return { issues: next.issues, tests };
}

export function validateReview(review: Review, spec: Spec, existing?: Review) {
  const requirements = new Set(
    spec.requirements.map((requirement) => requirement.id),
  );
  const errors: string[] = [];
  const checkIdentity = (candidate: Review, label: string) => {
    const ids = new Set<string>();
    for (const test of candidate.tests) {
      if (ids.has(test.id))
        errors.push(`${label} has duplicate test id: ${test.id}`);
      ids.add(test.id);
      if (!requirements.has(test.requirementId))
        errors.push(
          `${label} test ${test.id} references unknown requirementId: ${test.requirementId}`,
        );
    }
    for (const issue of candidate.issues)
      if (!requirements.has(issue.requirementId))
        errors.push(
          `${label} issue references unknown requirementId: ${issue.requirementId}`,
        );
  };
  // Validate the full incoming review even if a protected ID will win the merge.
  checkIdentity(review, "Review");
  if (existing)
    checkIdentity({ tests: existing.tests, issues: [] }, "Protected review");
  if (errors.length) throw Error([...new Set(errors)].join("\n"));

  const tests = existing ? mergeReview(existing, review).tests : review.tests;
  if (tests.length > maximumTests)
    throw Error(
      `Acceptance test catalog exceeds ${maximumTests} tests (${tests.length}).`,
    );
  const missing = spec.requirements
    .filter(
      (requirement) =>
        requirement.priority === "required" &&
        !tests.some(
          (test) =>
            test.requirementId === requirement.id &&
            /\bassert\s*\(/.test(test.source),
        ),
    )
    .map((requirement) => requirement.id);
  if (missing.length)
    throw Error(
      "Add executable acceptance tests with assert(...) for ALL these requirementIds: " +
        missing.join(", ") +
        ". Use a separate unique test id for each; preserve existing protected tests.",
    );
}
