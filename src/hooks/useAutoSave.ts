import { useState, useEffect, useCallback, useRef } from 'react';
import { dataAccessLayer } from '../services/database';
import { DraftInput } from '../types';

/**
 * 自动保存 Hook
 * 用于将页面输入数据自动保存到 IndexedDB
 */
export function useAutoSave<T extends { trades?: any[]; symbol?: string; currentPrice?: number }>(
  pagePath: string,
  data: T,
  inputValues: Record<string, string> = {},
  debounceMs: number = 1000
) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const draftIdRef = useRef<string>(`${pagePath}-draft`);

  // 防抖保存函数
  const saveDraft = useCallback(async (currentData: T, currentInputValues: Record<string, string>) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const draft: Omit<DraftInput, 'createdAt' | 'updatedAt'> = {
        id: draftIdRef.current,
        pagePath,
        data: currentData,
        inputValues: currentInputValues,
        version: 1
      };

      await dataAccessLayer.saveDraft(draft);
      setLastSaved(new Date());
      console.log(`[AutoSave] Draft saved for ${pagePath}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error(`[AutoSave] Failed to save draft for ${pagePath}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [pagePath, isLoading]);

  // 防抖触发保存
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      saveDraft(data, inputValues);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [data, inputValues, saveDraft, debounceMs]);

  // 页面加载时恢复草稿
  const restoreDraft = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const draft = await dataAccessLayer.getDraft(draftIdRef.current);
      if (draft) {
        console.log(`[AutoSave] Draft restored for ${pagePath}`, draft);
        return {
          data: draft.data as T,
          inputValues: draft.inputValues || {}
        };
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error(`[AutoSave] Failed to restore draft for ${pagePath}:`, err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [pagePath]);

  // 手动保存
  const manualSave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    saveDraft(data, inputValues);
  }, [data, inputValues, saveDraft]);

  // 删除草稿
  const deleteDraft = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await dataAccessLayer.deleteDraft(draftIdRef.current);
      setLastSaved(null);
      console.log(`[AutoSave] Draft deleted for ${pagePath}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error(`[AutoSave] Failed to delete draft for ${pagePath}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [pagePath]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    lastSaved,
    error,
    restoreDraft,
    manualSave,
    deleteDraft
  };
}
