import { FileTextIcon, ImageIcon, Trash2Icon, UploadCloudIcon, XIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface UploadItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  progress: number;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

const formatSize = (size: number) =>
  size < 1024 * 1024 ? `${Math.ceil(size / 1024)} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;

const UploadProgress = ({ progress }: { progress: number }) => {
  const style = useMemo<CSSProperties>(() => ({ width: `${progress}%` }), [progress]);
  return <div className="bg-primary h-full rounded-full transition-[width] duration-700 ease-out" style={style} />;
};

/**
 * 文件上传演示：本地拖拽、校验和模拟进度
 */
const Upload = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const stats = useMemo(() => {
    const done = items.filter((item) => item.progress === 100).length;
    return {
      total: items.length,
      done,
      uploading: items.length - done,
      size: items.reduce((sum, item) => sum + item.size, 0),
    };
  }, [items]);

  const startProgress = (id: string) => {
    window.setTimeout(() => {
      setItems((current) => current.map((entry) => (entry.id === id ? { ...entry, progress: 38 } : entry)));
    }, 180);
    window.setTimeout(() => {
      setItems((current) => current.map((entry) => (entry.id === id ? { ...entry, progress: 74 } : entry)));
    }, 520);
    window.setTimeout(() => {
      setItems((current) => current.map((entry) => (entry.id === id ? { ...entry, progress: 100 } : entry)));
    }, 980);
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted: UploadItem[] = [];

    for (const file of files) {
      if (!ACCEPTED.includes(file.type)) {
        toast.add({ title: "文件类型不支持", description: file.name, type: "error" });
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast.add({ title: "文件超过 5 MB", description: file.name, type: "error" });
        continue;
      }

      const item: UploadItem = {
        id: `${file.name}-${crypto.randomUUID()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        progress: 0,
      };
      accepted.push(item);
      startProgress(item.id);
    }

    if (accepted.length > 0) {
      setItems((current) => [...accepted, ...current]);
      toast.add({ title: "文件已加入上传队列", description: `${accepted.length} 个文件`, type: "success" });
    }
  };

  const removeItem = (item: UploadItem) => {
    URL.revokeObjectURL(item.url);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
  };

  const handleClearCompleted = () => {
    setItems((current) => {
      for (const item of current) {
        if (item.progress === 100) URL.revokeObjectURL(item.url);
      }
      return current.filter((item) => item.progress < 100);
    });
  };

  const handleClearAll = () => {
    for (const item of items) URL.revokeObjectURL(item.url);
    setItems([]);
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">文件上传</h1>
          <p className="text-muted-foreground mt-1 text-sm">拖拽上传、类型校验与本地预览。当前使用模拟进度。</p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            <Trash2Icon />
            清空队列
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "队列文件", value: stats.total },
          { label: "上传中", value: stats.uploading },
          { label: "已完成", value: stats.done },
          { label: "总大小", value: formatSize(stats.size) },
        ].map((stat) => (
          <div key={stat.label} className="bg-muted/20 rounded-lg border p-3">
            <p className="text-muted-foreground font-mono text-[9px] tracking-[0.12em] uppercase">{stat.label}</p>
            <p className="mt-1 font-mono text-xl tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-5">
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(event.dataTransfer.files);
            }}
            className={
              dragging
                ? "border-primary bg-primary/5 ring-primary/10 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center ring-4 transition-all"
                : "border-border bg-card/40 hover:border-primary/40 hover:bg-muted/20 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition-all"
            }
          >
            <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
              <UploadCloudIcon className="size-5" />
            </div>
            <h2 className="mt-4 text-base font-medium">拖拽文件到这里</h2>
            <p className="text-muted-foreground mt-1 text-xs">或者点击选择文件，支持多选</p>
            <Button type="button" variant="outline" size="sm" className="mt-4">
              选择文件
            </Button>
            <p className="text-muted-foreground/70 mt-3 font-mono text-[9px]">PNG · JPG · WEBP · PDF / MAX 5 MB</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED.join(",")}
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </div>

          <div className="bg-card/60 overflow-hidden rounded-xl border">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium">上传队列</p>
                <span className="text-muted-foreground font-mono text-[10px]">{items.length}</span>
              </div>
              {stats.done > 0 && (
                <button
                  type="button"
                  onClick={handleClearCompleted}
                  className="text-muted-foreground hover:text-foreground text-[10px] transition-colors"
                >
                  清除已完成
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                <div className="bg-muted flex size-10 items-center justify-center rounded-full">
                  <FileTextIcon className="text-muted-foreground size-4" />
                </div>
                <p className="mt-3 text-xs font-medium">队列是空的</p>
                <p className="text-muted-foreground mt-1 text-[11px]">选择或拖入文件后会显示在这里。</p>
              </div>
            ) : (
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                      {item.type.startsWith("image/") ? (
                        <img src={item.url} alt="" className="size-full object-cover" />
                      ) : (
                        <FileTextIcon className="text-muted-foreground size-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs font-medium">{item.name}</p>
                        {item.progress === 100 ? (
                          <Badge variant="secondary">完成</Badge>
                        ) : (
                          <span className="text-primary font-mono text-[9px]">{item.progress}%</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-muted-foreground font-mono text-[9px]">{formatSize(item.size)}</p>
                        <p className="text-muted-foreground/60 font-mono text-[8px] uppercase">
                          {item.type.split("/")[1] ?? "file"}
                        </p>
                      </div>
                      <div className="bg-muted mt-2 h-1 overflow-hidden rounded-full">
                        <UploadProgress progress={item.progress} />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`移除 ${item.name}`}
                      onClick={() => removeItem(item)}
                    >
                      <XIcon />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="bg-card/60 h-fit rounded-xl border p-5">
          <div className="flex items-center gap-2">
            <ImageIcon className="text-muted-foreground size-4" />
            <h2 className="text-xs font-medium">上传规则</h2>
          </div>
          <dl className="mt-4 space-y-3 text-[11px]">
            {[
              ["格式", "PNG / JPG / WEBP / PDF"],
              ["单文件大小", "最大 5 MB"],
              ["预览", "图片自动生成缩略图"],
              ["存储", "仅本地 mock，不发送请求"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0"
              >
                <dt className="text-muted-foreground shrink-0">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground mt-4 text-[10px] leading-4">
            删除文件时会释放 object URL，避免浏览器内存泄漏。
          </p>
        </aside>
      </div>
    </div>
  );
};

export { Upload };
