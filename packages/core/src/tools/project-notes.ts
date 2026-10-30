import { z } from "zod";
import { resolveProjectSlug, resolveWsSlug } from "../services/scope.js";
import { jsonToolResult, toolError } from "./helpers.js";
import type { ToolDeps } from "./types.js";

const schema = z.object({ ws_slug: z.string().optional(), project_slug: z.string().optional() });

export function createListProjectNotesTool({ api, scope }: ToolDeps) {
  return {
    name: "otask_list_project_notes",
    config: {
      title: "List O!task Project Notes",
      description: "Read project notebooks after checking workspace and project allowlists.",
      inputSchema: schema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    handler: async ({ ws_slug, project_slug }: z.infer<typeof schema>) => {
      try {
        const ws = await resolveWsSlug(ws_slug, scope, () => api.listWorkspaces());
        const slug = await resolveProjectSlug(project_slug, scope, () => api.listProjects(ws));
        const result = await api.listProjectNotes(ws, slug);
        return jsonToolResult(result, { notes: result });
      } catch (error) {
        return toolError(error);
      }
    },
  };
}

const updateSchema = schema.extend({
  note_slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
});

export function createUpdateProjectNoteTool({ api, scope }: ToolDeps) {
  return {
    name: "otask_update_project_note",
    config: {
      title: "Update O!task Project Note",
      description: "Replace an existing project notebook's name and description.",
      inputSchema: updateSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    handler: async ({
      ws_slug,
      project_slug,
      note_slug,
      name,
      description,
    }: z.infer<typeof updateSchema>) => {
      try {
        const ws = await resolveWsSlug(ws_slug, scope, () => api.listWorkspaces());
        const slug = await resolveProjectSlug(project_slug, scope, () => api.listProjects(ws));
        const result = await api.updateProjectNote(ws, slug, note_slug, { name, description });
        return jsonToolResult(result, { note: result });
      } catch (error) {
        return toolError(error);
      }
    },
  };
}
