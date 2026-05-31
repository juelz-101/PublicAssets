import { getGoogleAuthHeaders } from './google-auth';

export interface GoogleTaskList {
  id: string;
  title: string;
  updated: string;
}

export interface GoogleTask {
  id?: string;
  title?: string;
  notes?: string;
  status?: 'needsAction' | 'completed';
  due?: string;
  parent?: string;
  position?: string;
}

export const listGoogleTaskLists = async (accessToken: string, maxResults: number = 20): Promise<GoogleTaskList[]> => {
  const url = `https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=${maxResults}`;
  const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
  if (!response.ok) throw new Error(`Tasks list tasklists error: ${response.statusText}`);
  const data = await response.json();
  return data.items || [];
};

export const getGoogleTaskList = async (accessToken: string, taskListId: string): Promise<GoogleTaskList> => {
  const url = `https://tasks.googleapis.com/tasks/v1/users/@me/lists/${encodeURIComponent(taskListId)}`;
  const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
  if (!response.ok) throw new Error(`Tasks get tasklist error: ${response.statusText}`);
  return await response.json();
};

export const createGoogleTaskList = async (accessToken: string, title: string): Promise<GoogleTaskList> => {
  const url = `https://tasks.googleapis.com/tasks/v1/users/@me/lists`;
  const response = await fetch(url, {
      method: 'POST',
      headers: getGoogleAuthHeaders(accessToken),
      body: JSON.stringify({ title })
  });
  if (!response.ok) throw new Error(`Tasks create tasklist error: ${response.statusText}`);
  return await response.json();
};

export const updateGoogleTaskList = async (accessToken: string, taskListId: string, title: string): Promise<GoogleTaskList> => {
    const url = `https://tasks.googleapis.com/tasks/v1/users/@me/lists/${encodeURIComponent(taskListId)}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify({ id: taskListId, title })
    });
    if (!response.ok) throw new Error(`Tasks update tasklist error: ${response.statusText}`);
    return await response.json();
};

export const deleteGoogleTaskList = async (accessToken: string, taskListId: string): Promise<void> => {
    const url = `https://tasks.googleapis.com/tasks/v1/users/@me/lists/${encodeURIComponent(taskListId)}`;
    const response = await fetch(url, { method: 'DELETE', headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Tasks delete tasklist error: ${response.statusText}`);
};

export const listGoogleTasks = async (accessToken: string, taskListId: string, maxResults: number = 20, showCompleted: boolean = true): Promise<GoogleTask[]> => {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks?maxResults=${maxResults}&showCompleted=${showCompleted}`;
  const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
  if (!response.ok) throw new Error(`Tasks list tasks error: ${response.statusText}`);
  const data = await response.json();
  return data.items || [];
};

export const getGoogleTask = async (accessToken: string, taskListId: string, taskId: string): Promise<GoogleTask> => {
    const url = `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(taskId)}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Tasks get task error: ${response.statusText}`);
    return await response.json();
};

export const createGoogleTask = async (accessToken: string, taskListId: string, task: GoogleTask): Promise<GoogleTask> => {
    const url = `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error(`Tasks create task error: ${response.statusText}`);
    return await response.json();
};

export const updateGoogleTask = async (accessToken: string, taskListId: string, taskId: string, task: GoogleTask): Promise<GoogleTask> => {
    const url = `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(taskId)}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error(`Tasks update task error: ${response.statusText}`);
    return await response.json();
};

export const deleteGoogleTask = async (accessToken: string, taskListId: string, taskId: string): Promise<void> => {
    const url = `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(taskId)}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: getGoogleAuthHeaders(accessToken)
    });
    if (!response.ok) throw new Error(`Tasks delete task error: ${response.statusText}`);
};

export const clearCompletedGoogleTasks = async (accessToken: string, taskListId: string): Promise<void> => {
    const url = `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/clear`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken)
    });
    if (!response.ok) throw new Error(`Tasks clear completed error: ${response.statusText}`);
};

export const moveGoogleTask = async (accessToken: string, taskListId: string, taskId: string, parent?: string, previous?: string): Promise<GoogleTask> => {
    let url = `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(taskId)}/move`;
    const params = new URLSearchParams();
    if (parent) params.append('parent', parent);
    if (previous) params.append('previous', previous);
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken)
    });
    if (!response.ok) throw new Error(`Tasks move task error: ${response.statusText}`);
    return await response.json();
};
