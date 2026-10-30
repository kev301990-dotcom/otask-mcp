import type {
  CreateTaskBody,
  ListBoardQuery,
  ListBoardResult,
  ListProjectTasksResult,
  ListWorkspaceTasksQuery,
  ListWorkspaceTasksResult,
  OtaskProjectSummary,
  OtaskTask,
  UpdateTaskBody,
  UpdateTaskResult,
} from "../types.js";
import {
  addComment,
  archiveTask,
  createProject,
  createTask,
  getMe,
  getTask,
  listBoard,
  listComments,
  listMembers,
  listProjectNotes,
  listProjects,
  listProjectTasks,
  listStorage,
  listTags,
  listTeams,
  listWorkspaceTasks,
  type OtaskWorkspaceSummary,
  updateProjectNote,
  updateTask,
} from "./api.js";
import type { OtaskAuthResolver } from "./auth.js";

/** O!task API bound to a single auth resolver (per MCP server / HTTP request). */
export interface OtaskClient {
  getMe(): Promise<unknown>;
  listWorkspaces(): Promise<OtaskWorkspaceSummary[]>;
  getTask(wsSlug: string, taskSlug: string): Promise<OtaskTask>;
  updateTask(wsSlug: string, taskSlug: string, body: UpdateTaskBody): Promise<UpdateTaskResult>;
  listProjects(wsSlug: string): Promise<OtaskProjectSummary[]>;
  createProject(
    wsSlug: string,
    body: {
      name: string;
      amount?: number;
      end_at?: string;
      client_id?: number | null;
      is_regular_amount?: boolean;
      status_id?: 100 | 300;
      tags?: number[];
      members?: number[];
      managers?: number[];
    }
  ): Promise<unknown>;
  listStorage(wsSlug: string): Promise<unknown>;
  listProjectNotes(wsSlug: string, projectSlug: string): Promise<unknown>;
  updateProjectNote(
    wsSlug: string,
    projectSlug: string,
    noteSlug: string,
    body: { name: string; description: string }
  ): Promise<unknown>;
  listProjectTasks(
    wsSlug: string,
    projectSlug: string,
    query?: Record<string, string | number | undefined>
  ): Promise<ListProjectTasksResult>;
  listWorkspaceTasks(
    wsSlug: string,
    query?: ListWorkspaceTasksQuery
  ): Promise<ListWorkspaceTasksResult>;
  listBoard(wsSlug: string, projectSlug: string, query?: ListBoardQuery): Promise<ListBoardResult>;
  listMembers(wsSlug: string): Promise<unknown[]>;
  listTags(wsSlug: string): Promise<unknown[]>;
  listComments(wsSlug: string, taskSlug: string, body?: object): Promise<unknown>;
  addComment(
    wsSlug: string,
    taskSlug: string,
    comment: string,
    parentId?: number
  ): Promise<unknown>;
  createTask(wsSlug: string, body: CreateTaskBody): Promise<OtaskTask>;
  archiveTask(wsSlug: string, taskSlug: string): Promise<OtaskTask>;
}

export function createOtaskClient(auth: OtaskAuthResolver): OtaskClient {
  return {
    getMe: () => getMe(auth),
    listWorkspaces: () => listTeams(auth),
    getTask: (wsSlug, taskSlug) => getTask(wsSlug, taskSlug, auth),
    updateTask: (wsSlug, taskSlug, body) => updateTask(wsSlug, taskSlug, body, auth),
    listProjects: (wsSlug) => listProjects(wsSlug, auth),
    createProject: (wsSlug, body) => createProject(wsSlug, body, auth),
    listStorage: (wsSlug) => listStorage(wsSlug, auth),
    listProjectNotes: (wsSlug, projectSlug) => listProjectNotes(wsSlug, projectSlug, auth),
    updateProjectNote: (wsSlug, projectSlug, noteSlug, body) =>
      updateProjectNote(wsSlug, projectSlug, noteSlug, body, auth),
    listProjectTasks: (wsSlug, projectSlug, query) =>
      listProjectTasks(wsSlug, projectSlug, query, auth),
    listWorkspaceTasks: (wsSlug, query) => listWorkspaceTasks(wsSlug, query, auth),
    listBoard: (wsSlug, projectSlug, query) => listBoard(wsSlug, projectSlug, query, auth),
    listMembers: (wsSlug) => listMembers(wsSlug, auth),
    listTags: (wsSlug) => listTags(wsSlug, auth),
    listComments: (wsSlug, taskSlug, body) => listComments(wsSlug, taskSlug, body, auth),
    addComment: (wsSlug, taskSlug, comment, parentId) =>
      addComment(wsSlug, taskSlug, comment, parentId, auth),
    createTask: (wsSlug, body) => createTask(wsSlug, body, auth),
    archiveTask: (wsSlug, taskSlug) => archiveTask(wsSlug, taskSlug, auth),
  };
}
