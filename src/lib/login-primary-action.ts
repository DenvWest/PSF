export type LoginPrimaryAction = "login" | "intake";

export function resolveLoginPrimaryAction(options: {
  fromIntake: boolean;
  hasIntakeSession: boolean;
  emailEligibleForLogin: boolean | null;
  emailValid: boolean;
}): LoginPrimaryAction {
  if (options.fromIntake || options.hasIntakeSession) {
    return "login";
  }
  if (options.emailValid && options.emailEligibleForLogin === true) {
    return "login";
  }
  return "intake";
}
