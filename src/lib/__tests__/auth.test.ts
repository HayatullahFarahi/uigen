import { describe, test, expect, vi, beforeEach } from "vitest";

const { mockGet, mockJwtVerify } = vi.hoisted(() => {
  const mockGet = vi.fn();
  const mockJwtVerify = vi.fn();
  return { mockGet, mockJwtVerify };
});

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ get: mockGet })),
}));

vi.mock("jose", () => ({
  SignJWT: vi.fn(),
  jwtVerify: mockJwtVerify,
}));

import { getSession } from "@/lib/auth";

describe("getSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns null when no auth cookie is present", async () => {
    mockGet.mockReturnValue(undefined);

    const session = await getSession();

    expect(session).toBeNull();
    expect(mockGet).toHaveBeenCalledWith("auth-token");
  });

  test("returns null when cookie value is empty", async () => {
    mockGet.mockReturnValue({ value: "" });

    const session = await getSession();

    expect(session).toBeNull();
  });

  test("returns session payload when token is valid", async () => {
    const expectedPayload = {
      userId: "user-123",
      email: "test@example.com",
      expiresAt: new Date("2026-03-21"),
    };

    mockGet.mockReturnValue({ value: "valid.jwt.token" });
    mockJwtVerify.mockResolvedValue({ payload: expectedPayload });

    const session = await getSession();

    expect(session).toEqual(expectedPayload);
    expect(mockJwtVerify).toHaveBeenCalledWith(
      "valid.jwt.token",
      expect.anything()
    );
  });

  test("returns null when token verification fails", async () => {
    mockGet.mockReturnValue({ value: "invalid.jwt.token" });
    mockJwtVerify.mockRejectedValue(new Error("Invalid signature"));

    const session = await getSession();

    expect(session).toBeNull();
  });

  test("returns null when token is expired", async () => {
    mockGet.mockReturnValue({ value: "expired.jwt.token" });
    mockJwtVerify.mockRejectedValue(new Error("Token expired"));

    const session = await getSession();

    expect(session).toBeNull();
  });
});
