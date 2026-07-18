/**
 * Future hobby overlay (L1.5) — types only, not wired in v1.
 * See LEEFSTIJLPLAN_HANDBOOK.md § Hobby overlay (DEFER).
 */

export type MovementHobbyId =
  | "none"
  | "wandelen"
  | "fietsen"
  | "zwemmen"
  | "teamsport"
  | "gym"
  | "golf"
  | "tennis"
  | "overig";

export type HobbyPrescription = {
  hobbyId: MovementHobbyId;
  mainActivities: readonly string[];
  accessoryStrength: readonly string[];
  mobility: readonly string[];
};
