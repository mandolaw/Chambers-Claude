"use client";
import { useCallback, useEffect, useState } from "react";

export type CellMember = { id: string; name: string; email: string; checkedIn: boolean };
export type CellPost = {
  id: string;
  author: string;
  authorId: string;
  text: string;
  type: string;
  createdAt: string;
  marks: { cross: number; flame: number };
  myMark: string | null;
};
export type Cell = { id: string; name: string; inviteCode: string };

// Fetches and mutates the current user's real, shared Cell — replaces the
// old per-device localStorage "brothers" array with server-backed state
// that every member of the Cell actually sees.
export function useCell(enabled: boolean) {
  const [cell, setCell] = useState<Cell | null>(null);
  const [members, setMembers] = useState<CellMember[]>([]);
  const [posts, setPosts] = useState<CellPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/cells/mine");
      if (!res.ok) throw new Error("Could not load your cell.");
      const data = await res.json();
      setCell(data.cell);
      setMembers(data.members || []);
      setPosts(data.posts || []);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCell = useCallback(
    async (name: string) => {
      const res = await fetch("/api/cells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create cell.");
      await refresh();
      return data.cell as Cell;
    },
    [refresh]
  );

  const joinCell = useCallback(
    async (code: string) => {
      const res = await fetch("/api/cells/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not join cell.");
      await refresh();
      return data.cell as Cell;
    },
    [refresh]
  );

  const checkIn = useCallback(async () => {
    if (!cell) return;
    await fetch(`/api/cells/${cell.id}/checkin`, { method: "POST" });
    await refresh();
  }, [cell, refresh]);

  const addPost = useCallback(
    async (text: string, type: string = "prayer") => {
      if (!cell) return;
      const res = await fetch(`/api/cells/${cell.id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type }),
      });
      const data = await res.json();
      if (res.ok) setPosts((p) => [data.post, ...p]);
    },
    [cell]
  );

  const react = useCallback(async (postId: string, kind: "cross" | "flame") => {
    const res = await fetch(`/api/posts/${postId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, marks: data.marks, myMark: data.myMark } : p)));
    }
  }, []);

  return { cell, members, posts, loading, error, createCell, joinCell, checkIn, addPost, react, refresh };
}
