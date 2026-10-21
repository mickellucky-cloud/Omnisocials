import {
  WorkspaceId,
  PostItem,
  ConversationThread,
  ConnectedAccount,
  PostStatus,
  ApprovalHistoryEntry,
} from "@/types";

const STORAGE_KEYS = {
  POSTS: "omnisocial_posts_v2",
  THREADS: "omnisocial_threads_v2",
  ACCOUNTS: "omnisocial_accounts_v1",
  ACTIVE_WORKSPACE: "omnisocial_active_ws",
  QUEUE_PAUSED: "omnisocial_queue_paused_",
};

// Auto-purge any legacy mock items from browser storage
if (typeof window !== "undefined") {
  try {
    const legacyPostKey = "omnisocial_posts_v1";
    const legacyThreadKey = "omnisocial_threads_v1";
    const rawPosts = localStorage.getItem(legacyPostKey);
    if (rawPosts && rawPosts.includes("post-1")) {
      localStorage.removeItem(legacyPostKey);
    }
    const rawThreads = localStorage.getItem(legacyThreadKey);
    if (rawThreads && rawThreads.includes("thread-1")) {
      localStorage.removeItem(legacyThreadKey);
    }
    const rawAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (rawAccounts && (rawAccounts.includes("acc-acme-x") || rawAccounts.includes("acc-lumina-ig"))) {
      localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    }
  } catch {
    // Ignore storage restrictions
  }
}

export function getStoredPosts(workspaceId: WorkspaceId): PostItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!data) return [];
    const parsed: PostItem[] = JSON.parse(data);
    return parsed.filter((p) => p.workspaceId === workspaceId);
  } catch (err) {
    console.error("Failed to load posts from storage:", err);
    return [];
  }
}

export function savePost(post: PostItem): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    let all: PostItem[] = raw ? JSON.parse(raw) : [];
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
    if (!raw) return;
    const all: PostItem[] = JSON.parse(raw);
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

export function deletePost(postId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!raw) return;
    const all: PostItem[] = JSON.parse(raw);
    const updated = all.filter((p) => p.id !== postId);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to delete post:", err);
  }
}

export function reorderQueue(workspaceId: WorkspaceId, orderedPostIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!raw) return;
    const all: PostItem[] = JSON.parse(raw);
    const wsPosts = all.filter((p) => p.workspaceId === workspaceId);
    const otherPosts = all.filter((p) => p.workspaceId !== workspaceId);

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
    return [];
  }
  try {
    const data = localStorage.getItem(STORAGE_KEYS.THREADS);
    if (!data) return [];
    const parsed: ConversationThread[] = JSON.parse(data);
    return parsed.filter((t) => t.workspaceId === workspaceId);
  } catch (err) {
    console.error("Failed to load threads:", err);
    return [];
  }
}

export function saveThread(thread: ConversationThread): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THREADS);
    let all: ConversationThread[] = raw ? JSON.parse(raw) : [];
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
    return [];
  }
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!data) return [];
    const parsed: ConnectedAccount[] = JSON.parse(data);
    return parsed.filter((a) => a.workspaceId === workspaceId);
  } catch (err) {
    console.error("Failed to load accounts:", err);
    return [];
  }
}

export function saveConnectedAccount(account: ConnectedAccount): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    const all: ConnectedAccount[] = raw ? JSON.parse(raw) : [];
    const filtered = all.filter(
      (a) => !(a.workspaceId === account.workspaceId && a.platform === account.platform)
    );
    const updated = [account, ...filtered];
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save connected account:", err);
  }
}

export function disconnectAccount(workspaceId: WorkspaceId, accountId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) return;
    const all: ConnectedAccount[] = JSON.parse(raw);
    const updated = all.filter((a) => a.id !== accountId);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to disconnect account:", err);
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
