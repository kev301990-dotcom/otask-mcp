import { afterEach, describe, expect, mock, test } from "bun:test";
import { API_BASE_URL } from "../packages/core/src/constants.ts";
import { createOtaskClient } from "../packages/core/src/services/client.ts";

const originalFetch = globalThis.fetch;
const auth = async () => ({ Authorization: "Bearer test", "Content-Type": "application/json" });

afterEach(() => {
  globalThis.fetch = originalFetch;
  mock.restore();
});

function intercept() {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify({ success: true, data: { id: 123 } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  return calls;
}

describe("new O!task API client methods (mock transport; endpoints require live validation)", () => {
  test("createProject sends POST with project name and defaults", async () => {
    const calls = intercept();
    await createOtaskClient(auth).createProject("workspace", { name: "Свадьба" });
    expect(calls[0]?.url).toBe(`${API_BASE_URL}/api/v1/ws/workspace/projects/create`);
    expect(calls[0]?.init?.method).toBe("POST");
    expect(JSON.parse(String(calls[0]?.init?.body))).toMatchObject({ name: "Свадьба" });
  });

  test("listStorage uses authorized workspace", async () => {
    const calls = intercept();
    await createOtaskClient(auth).listStorage("workspace");
    expect(calls[0]?.url).toBe(`${API_BASE_URL}/api/v1/ws/workspace/storages`);
  });

  test("listProjectNotes encodes project slug", async () => {
    const calls = intercept();
    await createOtaskClient(auth).listProjectNotes("workspace", "a b");
    expect(calls[0]?.url).toBe(`${API_BASE_URL}/api/v1/ws/workspace/projects/a%20b/notes`);
  });

  test("updateProjectNote sends POST and payload", async () => {
    const calls = intercept();
    await createOtaskClient(auth).updateProjectNote("workspace", "project", "note", {
      name: "Блокнот",
      description: "Текст",
    });
    expect(calls[0]?.url).toBe(
      `${API_BASE_URL}/api/v1/ws/workspace/projects/project/notes/note/update`
    );
    expect(calls[0]?.init?.method).toBe("POST");
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      name: "Блокнот",
      description: "Текст",
    });
  });
});
