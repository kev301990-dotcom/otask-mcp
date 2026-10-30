import { z } from "zod";
import { resolveWsSlug } from "../services/scope.js";
import { jsonToolResult, toolError } from "./helpers.js";
import type { ToolDeps } from "./types.js";

const schema = z.object({
  ws_slug: z.string().optional(),
  name: z.string().min(1),
  amount: z.number().nonnegative().optional(),
  end_at: z.string().optional(),
  client_id: z.number().int().nullable().optional(),
  is_regular_amount: z.boolean().optional(),
  status_id: z.union([z.literal(100), z.literal(300)]).optional(),
  tags: z.array(z.number().int()).optional(),
  members: z.array(z.number().int()).optional(),
  managers: z.array(z.number().int()).optional(),
});

export function createCreateProjectTool({ api, scope }: ToolDeps) {
  return {
    name: "otask_create_project",
    config: {
      title: "Create O!task Project",
      description: "Create a project in an authorized workspace.",
      inputSchema: schema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    handler: async (params: z.infer<typeof schema>) => {
      try {
        const { ws_slug, ...body } = params;
        const ws = await resolveWsSlug(ws_slug, scope, () => api.listWorkspaces());
        const result = await api.createProject(ws, body);
        return jsonToolResult(result, { project: result });
      } catch (error) {
        return toolError(error);
      }
    },
  };
}
