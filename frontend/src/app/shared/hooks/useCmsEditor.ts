import { useState, useEffect, useCallback } from "react";
import {
  getDraftContent,
  saveDraft as apiSaveDraft,
  publishContent,
  type SiteContentTree,
} from "../../../lib/api/siteContent";
import { DEFAULT_CONTENT } from "./useSiteContent";

export interface UseCmsEditorReturn {
  content: SiteContentTree | null;
  loading: boolean;
  error: string;
  isDirty: boolean;
  saving: boolean;
  publishing: boolean;
  updateGroup: <K extends keyof SiteContentTree>(
    group: K,
    data: SiteContentTree[K],
  ) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  saveAndPreview: () => Promise<void>;
}

export function useCmsEditor(): UseCmsEditorReturn {
  const [content, setContent] = useState<SiteContentTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getDraftContent()
      .then((data) => {
        if (!cancelled) {
          // Older drafts may predate newer groups (e.g. testimonials).
          setContent({ ...DEFAULT_CONTENT, ...data });
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Tải bản nháp thất bại.",
          );
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateGroup = useCallback(
    <K extends keyof SiteContentTree>(group: K, data: SiteContentTree[K]) => {
      setContent((prev) => {
        if (!prev) return prev;
        return { ...prev, [group]: data };
      });
      setIsDirty(true);
    },
    [],
  );

  const saveDraft = useCallback(async () => {
    if (!content) return;
    setSaving(true);
    setError("");
    try {
      await apiSaveDraft(content);
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu nháp thất bại.");
    } finally {
      setSaving(false);
    }
  }, [content]);

  const publish = useCallback(async () => {
    if (!content) return;
    setPublishing(true);
    setError("");
    try {
      // Always save draft first so the DB has the latest form state
      await apiSaveDraft(content);
      await publishContent();
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xuất bản thất bại.");
    } finally {
      setPublishing(false);
    }
  }, [content]);

  const saveAndPreview = useCallback(async () => {
    if (!content) return;
    setSaving(true);
    setError("");
    try {
      await apiSaveDraft(content);
      setIsDirty(false);
      window.open("/?preview=true", "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu nháp thất bại.");
    } finally {
      setSaving(false);
    }
  }, [content]);

  return {
    content,
    loading,
    error,
    isDirty,
    saving,
    publishing,
    updateGroup,
    saveDraft,
    publish,
    saveAndPreview,
  };
}
