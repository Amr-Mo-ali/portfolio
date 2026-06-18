import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Portfolio Features", () => {
  describe("contact.submit", () => {
    it("accepts valid contact form submission", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.contact.submit({
        visitorName: "John Doe",
        visitorEmail: "john@example.com",
        message: "Great work on your projects!",
      });

      expect(result).toEqual({ success: true });
    });

    it("rejects submission with empty name", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.contact.submit({
          visitorName: "",
          visitorEmail: "john@example.com",
          message: "Test message",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("Name is required");
      }
    });

    it("rejects submission with invalid email", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.contact.submit({
          visitorName: "John Doe",
          visitorEmail: "not-an-email",
          message: "Test message",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("Valid email is required");
      }
    });

    it("rejects submission with empty message", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.contact.submit({
          visitorName: "John Doe",
          visitorEmail: "john@example.com",
          message: "",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("Message is required");
      }
    });
  });

  describe("chat.send", () => {
    it("accepts valid chat message", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const sessionId = "test-session-123";

      const result = await caller.chat.send({
        sessionId,
        message: "What are your main skills?",
      });

      expect(result).toHaveProperty("message");
      expect(typeof result.message).toBe("string");
      expect(result.message.length).toBeGreaterThan(0);
    });

    it("rejects chat message with empty sessionId", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.chat.send({
          sessionId: "",
          message: "Test message",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("sessionId");
      }
    });

    it("rejects chat message with empty message", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.chat.send({
          sessionId: "test-session",
          message: "",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("message");
      }
    });
  });

  describe("chat.getHistory", () => {
    it("returns empty array for new session", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const sessionId = "new-session-" + Date.now();

      const result = await caller.chat.getHistory({
        sessionId,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("rejects with empty sessionId", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.chat.getHistory({
          sessionId: "",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("sessionId");
      }
    });
  });

  describe("auth.me", () => {
    it("returns null for unauthenticated user", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeNull();
    });
  });
});
