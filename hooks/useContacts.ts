"use client";
import { useCallback, useEffect, useState } from "react";

export type Contact = { id: string; name: string; role: string; phone: string; email: string };

// Personal contacts (pastor, prayer partner) — synced per-account via the
// server instead of per-device localStorage.
export function useContacts(enabled: boolean) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/contacts");
    if (res.ok) {
      const data = await res.json();
      setContacts(data.contacts || []);
    }
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addContact = useCallback(async (c: Omit<Contact, "id">) => {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    });
    const data = await res.json();
    if (res.ok) setContacts((p) => [...p, data.contact]);
    return data.contact as Contact;
  }, []);

  const updateContact = useCallback(async (id: string, c: Omit<Contact, "id">) => {
    const res = await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    });
    const data = await res.json();
    if (res.ok) setContacts((p) => p.map((x) => (x.id === id ? data.contact : x)));
  }, []);

  const removeContact = useCallback(async (id: string) => {
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    setContacts((p) => p.filter((x) => x.id !== id));
  }, []);

  return { contacts, loading, refresh, addContact, updateContact, removeContact };
}
