import { FileTextIcon, ImageIcon, UploadCloudIcon, XIcon } from "lucide-react";
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
  return <div className="bg-primary h-full rounded-full transition-[width] duration-700" style={style} />;
};

/**
 * 文件上传演示：本地拖拽、校验和模拟进度
 */
const Upload = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);

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
      window.setTimeout(() => {
        setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, progress: 100 } : entry)));
      }, 900);
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

  return (
    <div className="flex w-full max-w-5xl flex-col gap-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">文件上传</h1>
        <p className="text-muted-foreground mt-1 text-sm">支持拖拽、类型与大小校验，当前为本地模拟上传。</p>
      </div>

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
            ? "border-primary bg-primary/5 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 text-center transition-colors"
            : "border-border hover:border-primary/40 hover:bg-muted/20 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 text-center transition-colors"
        }
      >
        <div className="bg-muted flex size-11 items-center justify-center rounded-full">
          <UploadCloudIcon className="text-muted-foreground size-5" />
        </div>
        <p className="mt-4 text-sm font-medium">拖拽文件到这里，或点击选择</p>
        <p className="text-muted-foreground mt-1 text-xs">PNG / JPG / WEBP / PDF · 单个文件不超过 5 MB</p>
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
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-xs font-medium">上传队列</p>
          <span className="text-muted-foreground font-mono text-[10px]">{items.length} 个文件</span>
        </div>

        {items.length === 0 ? (
          <div className="text-muted-foreground px-4 py-12 text-center text-xs">还没有文件，先拖一个进来。</div>
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
                      <span className="text-muted-foreground font-mono text-[9px]">上传中</span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-0.5 font-mono text-[9px]">{formatSize(item.size)}</p>
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

      <div className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
        <ImageIcon className="size-3" />
        图片会生成本地预览，删除时自动释放 object URL。
      </div>
    </div>
  );
};

export { Upload };
