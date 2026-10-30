import { z } from "zod";
import { resolveWsSlug } from "../services/scope.js";
import { jsonToolResult, toolError } from "./helpers.js";
import type { ToolDeps } from "./types.js";

const schema = z.object({ ws_slug: z.string().optional() });

export function createListStorageTool({ api, scope }: ToolDeps) {
  return {
    name: "otask_list_storage",
    config: {
      title: "List O!task Storage",
      description: "List storage in an authorized workspace.",
      inputSchema: schema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    handler: async ({ ws_slug }: z.infer<typeof schema>) => {
      try {
        const ws = await resolveWsSlug(ws_slug, scope, () => api.listWorkspaces());
        const result = await api.listStorage(ws);
        return jsonToolResult(result, { storage: result });
      } catch (error) {
        return toolError(error);
      }
    },
  };
}
