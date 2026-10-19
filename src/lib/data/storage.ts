import {
  WorkspaceId,
  PostItem,
  ConversationThread,
  ConnectedAccount,
  PostStatus,
  ApprovalHistoryEntry,
} from "@/types";
import { initialPosts, initialThreads } from "./mockData";
import { initialConnectedAccounts } from "./workspaces";

const STORAGE_KEYS = {
  POSTS: "omnisocial_posts_v1",
  THREADS: "omnisocial_threads_v1",
  ACCOUNTS: "omnisocial_accounts_v1",
  ACTIVE_WORKSPACE: "omnisocial_active_ws",
  QUEUE_PAUSED: "omnisocial_queue_paused_",
};

export function getStoredPosts(workspaceId: WorkspaceId): PostItem[] {
  if (typeof window === "undefined") {
    return initialPosts.filter((p) => p.workspaceId === workspaceId);
  }
  try {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(initialPosts));
      return initialPosts.filter((p) => p.workspaceId === workspaceId);
    }
    const parsed: PostItem[] = JSON.parse(data);
    const filtered = parsed.filter((p) => p.workspaceId === workspaceId);
    if (filtered.length === 0) {
      // Re-seed if empty for this workspace
      const seeds = initialPosts.filter((p) => p.workspaceId === workspaceId);
      const combined = [...parsed, ...seeds];
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(combined));
      return seeds;
    }
    return filtered;
  } catch (err) {
    console.error("Failed to load posts from storage:", err);
    return initialPosts.filter((p) => p.workspaceId === workspaceId);
  }
}

export function savePost(post: PostItem): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    let all: PostItem[] = raw ? JSON.parse(raw) : [...initialPosts];
    const index = all.findIndex((p) => p.id === post.id);
    if (index >= 0) {
      all[index] = post;
    } else {
      all = [post, ...all];
    }
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(all));
  } catch (err) {
    console.error("Failed to save post:", err);
  }
}

export function updatePostStatus(
  postId: string,
  newStatus: PostStatus,
  historyEntry?: ApprovalHistoryEntry
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    let all: PostItem[] = raw ? JSON.parse(raw) : [...initialPosts];
    const post = all.find((p) => p.id === postId);
    if (post) {
      post.status = newStatus;
      if (historyEntry) {
        post.approvalHistory = [...(post.approvalHistory || []), historyEntry];
      }
      if (newStatus === "published") {
        post.publishedAt = new Date().toISOString();
      }
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(all));
    }
  } catch (err) {
    console.error("Failed to update post status:", err);
  }
}

export function reorderQueue(workspaceId: WorkspaceId, orderedPostIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    let all: PostItem[] = raw ? JSON.parse(raw) : [...initialPosts];
    const wsPosts = all.filter((p) => p.workspaceId === workspaceId);
    const otherPosts = all.filter((p) => p.workspaceId !== workspaceId);

    // Map order
    const ordered = orderedPostIds
      .map((id) => wsPosts.find((p) => p.id === id))
      .filter((p): p is PostItem => p !== undefined);

    const remaining = wsPosts.filter((p) => !orderedPostIds.includes(p.id));
    const combined = [...ordered, ...remaining, ...otherPosts];
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(combined));
  } catch (err) {
    console.error("Failed to reorder queue:", err);
  }
}

export function getStoredThreads(workspaceId: WorkspaceId): ConversationThread[] {
  if (typeof window === "undefined") {
    return initialThreads.filter((t) => t.workspaceId === workspaceId);
  }
  try {
    const data = localStorage.getItem(STORAGE_KEYS.THREADS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(initialThreads));
      return initialThreads.filter((t) => t.workspaceId === workspaceId);
    }
    const parsed: ConversationThread[] = JSON.parse(data);
    const filtered = parsed.filter((t) => t.workspaceId === workspaceId);
    if (filtered.length === 0) {
      const seeds = initialThreads.filter((t) => t.workspaceId === workspaceId);
      const combined = [...parsed, ...seeds];
      localStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(combined));
      return seeds;
    }
    return filtered;
  } catch (err) {
    console.error("Failed to load threads:", err);
    return initialThreads.filter((t) => t.workspaceId === workspaceId);
  }
}

export function saveThread(thread: ConversationThread): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THREADS);
    let all: ConversationThread[] = raw ? JSON.parse(raw) : [...initialThreads];
    const index = all.findIndex((t) => t.id === thread.id);
    if (index >= 0) {
      all[index] = thread;
    } else {
      all = [thread, ...all];
    }
    localStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(all));
  } catch (err) {
    console.error("Failed to save thread:", err);
  }
}

export function getStoredAccounts(workspaceId: WorkspaceId): ConnectedAccount[] {
  if (typeof window === "undefined") {
    return initialConnectedAccounts.filter((a) => a.workspaceId === workspaceId);
  }
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(initialConnectedAccounts));
      return initialConnectedAccounts.filter((a) => a.workspaceId === workspaceId);
    }
    const parsed: ConnectedAccount[] = JSON.parse(data);
    return parsed.filter((a) => a.workspaceId === workspaceId);
  } catch (err) {
    console.error("Failed to load accounts:", err);
    return initialConnectedAccounts.filter((a) => a.workspaceId === workspaceId);
  }
}

export function isQueuePaused(workspaceId: WorkspaceId): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.QUEUE_PAUSED + workspaceId) === "true";
}

export function setQueuePaused(workspaceId: WorkspaceId, paused: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.QUEUE_PAUSED + workspaceId, paused ? "true" : "false");
}
