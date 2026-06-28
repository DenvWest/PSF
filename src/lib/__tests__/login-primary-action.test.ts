import { describe, expect, it } from "vitest";
import { resolveLoginPrimaryAction } from "@/lib/login-primary-action";

describe("resolveLoginPrimaryAction", () => {
  it("prefers login after intake result", () => {
    expect(
      resolveLoginPrimaryAction({
        fromIntake: true,
        hasIntakeSession: false,
        emailEligibleForLogin: null,
        emailValid: false,
      }),
    ).toBe("login");
  });

  it("prefers login with active intake session", () => {
    expect(
      resolveLoginPrimaryAction({
        fromIntake: false,
        hasIntakeSession: true,
        emailEligibleForLogin: null,
        emailValid: false,
      }),
    ).toBe("login");
  });

  it("switches to login when email has an account", () => {
    expect(
      resolveLoginPrimaryAction({
        fromIntake: false,
        hasIntakeSession: false,
        emailEligibleForLogin: true,
        emailValid: true,
      }),
    ).toBe("login");
  });

  it("defaults to intake without session or known account", () => {
    expect(
      resolveLoginPrimaryAction({
        fromIntake: false,
        hasIntakeSession: false,
        emailEligibleForLogin: null,
        emailValid: false,
      }),
    ).toBe("intake");
    expect(
      resolveLoginPrimaryAction({
        fromIntake: false,
        hasIntakeSession: false,
        emailEligibleForLogin: false,
        emailValid: true,
      }),
    ).toBe("intake");
  });
});
