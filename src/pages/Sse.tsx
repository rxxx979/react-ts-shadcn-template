import { cn } from "cn";
import { CircleAlertIcon, RotateCcwIcon, SparklesIcon, SquareIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockContent, CodeBlockCopyButton, CodeBlockLine } from "@/components/ui/code-block";
import { useHighlightedCode } from "@/hooks/use-highlighted-code";
import type { SSEStatus } from "@/hooks/use-sse";

import { STAGES, useDemoStream } from "./sse-demo/use-demo-stream";

const sources = import.meta.glob<string>("./sse-demo/*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});
const clientSource = sources["./sse-demo/client.ts"] ?? "";
const eventsSource = sources["./sse-demo/events.ts"] ?? "";
const hookSource = sources["./sse-demo/use-demo-stream.ts"] ?? "";

const STEPS = [
  {
    id: "events",
    number: "01",
    title: "Define events",
    file: "events.ts",
    language: "ts",
    description: "Zod 是运行时契约。discriminated union 让 event 与 data 建立类型联系。",
    code: eventsSource,
  },
  {
    id: "client",
    number: "02",
    title: "Open client",
    file: "client.ts",
    language: "ts",
    description: "sseClient 是最低层连接。它不依赖 React，适合放进 service 或事件处理器。",
    code: clientSource,
  },
  {
    id: "hook",
    number: "03",
    title: "Bind lifecycle",
    file: "use-demo-stream.ts",
    language: "ts",
    description: "useSSE 负责挂载、卸载、重连和状态。业务状态由 useDemoStream 聚合。",
    code: hookSource,
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

/**
 * SSE 状态
 *
 * @param props.status - 当前连接状态
 * @param props.complete - 是否已收到 done
 */
const StatusPill = ({ status, complete }: { status: SSEStatus; complete: boolean }) => {
  const label: Record<SSEStatus, string> = {
    idle: "idle",
    connecting: "connecting",
    open: "streaming",
    closed: complete ? "complete" : "closed",
  };
  const streaming = status === "open";
  const finished = status === "closed" && complete;
  const positive = streaming || finished;
  const connecting = status === "connecting";

  return (
    <span
      className={cn(
        "border-border/80 bg-background/60 inline-flex h-7 items-center gap-2 rounded-full border px-2.5 font-mono text-[10px] tracking-[0.12em] uppercase backdrop-blur",
        positive && "text-emerald-600 dark:text-emerald-400",
        connecting && "text-amber-600 dark:text-amber-400",
        !positive && !connecting && "text-muted-foreground",
      )}
    >
      <span className="relative flex size-1.5">
        {streaming && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:animate-none" />
        )}
        <span
          className={cn(
            "relative inline-flex size-1.5 rounded-full",
            positive && "bg-emerald-500",
            connecting && "bg-amber-500",
            !positive && !connecting && "bg-muted-foreground/50",
          )}
        />
      </span>
      {label[status]}
    </span>
  );
};

/**
 * SSE 演示：一个统一的工作台，左侧代码，右侧实时状态
 */
const Sse = () => {
  const { status, error, meta, content, metrics, done, lastFrame, counts, close, reconnect } = useDemoStream();
  const [activeStep, setActiveStep] = useState<StepId>("events");

  const active = STEPS.find((step) => step.id === activeStep) ?? STEPS[0];
  const codeLines = useHighlightedCode(active.code, active.language);
  const codeLineItems = codeLines.map((line, index) => ({ id: `line-${index}`, content: line }));

  const paragraphItems = content
    .split(/\n\n/)
    .filter(Boolean)
    .map((text, index) => ({ id: `paragraph-${index}`, text }));
  const streaming = status === "open" || status === "connecting";

  const handleReconnect = () => {
    reconnect();
  };

  const handleStop = () => {
    close();
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-5">
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">实时流</h1>

      <section className="bg-card/60 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-muted/20 flex min-h-12 shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/60 font-mono text-[9px] tracking-[0.16em] uppercase">channel</span>
            <code className="bg-background/70 rounded-md border px-2 py-0.5 font-mono text-[10px]">/api/sse-demo</code>
          </div>
          <span aria-hidden className="bg-border hidden h-3 w-px sm:block" />
          <span className="text-muted-foreground font-mono text-[10px]">
            {content.length} chars · {done ? `${done.elapsedMs}ms` : "live"}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <StatusPill status={status} complete={done !== null} />
            <Button variant="outline" size="sm" onClick={handleReconnect}>
              <RotateCcwIcon />
              重连
            </Button>
            <Button variant="ghost" size="sm" onClick={handleStop} disabled={status === "closed" || status === "idle"}>
              <SquareIcon />
              停止
            </Button>
          </div>
        </div>

        <div className="grid min-h-[640px] flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] xl:min-h-0 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:grid-rows-1">
          <div className="bg-muted/10 flex min-h-0 flex-col border-b xl:border-r xl:border-b-0">
            <div className="shrink-0 border-b px-3 py-2">
              <div className="flex flex-wrap items-center gap-1">
                {STEPS.map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStep(step.id)}
                    aria-pressed={activeStep === step.id}
                    className={cn(
                      "group inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors",
                      activeStep === step.id
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                        : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                    )}
                  >
                    <span className="text-muted-foreground/50 font-mono text-[9px]">{step.number}</span>
                    <span className="text-[11px] font-medium">{step.title}</span>
                  </button>
                ))}
                <CodeBlockCopyButton value={active.code} className="ml-auto" />
              </div>
              <p className="text-muted-foreground mt-2 px-1 text-[11px] leading-relaxed">{active.description}</p>
            </div>

            <CodeBlock className="h-0 min-h-0 flex-1 rounded-none border-0 bg-transparent">
              <CodeBlockContent lineNumbers className="max-h-none flex-1 text-[11px] leading-5">
                {codeLineItems.map((line) => (
                  <CodeBlockLine key={line.id}>{line.content}</CodeBlockLine>
                ))}
              </CodeBlockContent>
            </CodeBlock>

            <div className="text-muted-foreground flex h-8 shrink-0 items-center justify-between border-t px-3 font-mono text-[9px]">
              <span>{active.file}</span>
              <span>{active.language}</span>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-col">
            <header className="relative flex h-11 shrink-0 items-center justify-between border-b px-4">
              <span className="text-muted-foreground flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase">
                <SparklesIcon className="text-primary size-3.5" />
                live preview
              </span>
              <span className="text-muted-foreground/60 font-mono text-[10px]">
                {String(counts.token).padStart(3, "0")} tokens
              </span>
              {streaming && (
                <span className="via-primary absolute inset-x-0 top-0 h-px animate-pulse bg-linear-to-r from-transparent to-transparent motion-reduce:animate-none" />
              )}
            </header>

            <div className="grid shrink-0 grid-cols-4 divide-x border-b">
              {STAGES.map((stage) => {
                const activeStage = lastFrame?.event === stage;

                return (
                  <div key={stage} className={cn("px-3 py-2 transition-colors", activeStage && "bg-primary/5")}>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "font-mono text-[9px] tracking-widest uppercase",
                          activeStage ? "text-primary" : "text-muted-foreground/60",
                        )}
                      >
                        {stage}
                      </span>
                      <span className="text-muted-foreground/40 font-mono text-[9px]">{counts[stage]}</span>
                    </div>
                    <div className="bg-muted mt-1.5 h-0.5 overflow-hidden rounded-full">
                      <span
                        className={cn(
                          "block h-full rounded-full transition-all duration-500",
                          activeStage ? "bg-primary w-full" : counts[stage] > 0 ? "bg-primary/30 w-full" : "w-0",
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 scrollbar-thin space-y-5 overflow-y-auto p-5">
                {error && (
                  <div className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs">
                    <CircleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                    <span className="leading-relaxed">{error.message}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {meta ? (
                      meta.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border-border/70 bg-background/50 text-muted-foreground rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] uppercase"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="bg-muted h-4 w-24 animate-pulse rounded-full" />
                    )}
                  </div>
                  <h2 className="max-w-lg text-[26px] leading-[1.15] font-semibold tracking-tight sm:text-[30px]">
                    {meta?.title ?? "Waiting for the first frame…"}
                  </h2>
                  <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
                    {meta?.subtitle ?? "连接建立后，元信息和内容会按事件顺序到达。"}
                  </p>
                </div>

                <div className="bg-border/70 h-px w-full" />

                <div className="space-y-4 text-[15px] leading-7">
                  {paragraphItems.length > 0 ? (
                    paragraphItems.map((paragraph) => (
                      <p key={paragraph.id} className="animate-in fade-in duration-500">
                        {paragraph.text}
                      </p>
                    ))
                  ) : (
                    <div className="space-y-2.5">
                      <div className="bg-muted h-3 w-full animate-pulse rounded-full" />
                      <div className="bg-muted h-3 w-[86%] animate-pulse rounded-full" />
                      <div className="bg-muted h-3 w-[62%] animate-pulse rounded-full" />
                    </div>
                  )}
                  {streaming && (
                    <span
                      aria-hidden
                      className="bg-primary inline-block h-4 w-1 animate-pulse rounded-full align-middle motion-reduce:animate-none"
                    />
                  )}
                </div>
              </div>

              <div className="bg-card/95 grid shrink-0 grid-cols-3 divide-x border-t px-5 py-3">
                {["first", "second", "third"].map((slot, index) => {
                  const metric = index < metrics.length ? metrics[index] : undefined;

                  return metric ? (
                    <div key={slot} className="animate-in fade-in px-3 py-1 duration-500 first:pl-0 last:pr-0">
                      <p className="text-muted-foreground font-mono text-[8px] tracking-widest uppercase">
                        {metric.label}
                      </p>
                      <p className="mt-1 font-mono text-base tracking-tight">{metric.value}</p>
                      <p className="text-muted-foreground/60 mt-0.5 font-mono text-[8px]">{metric.hint}</p>
                    </div>
                  ) : (
                    <div key={slot} className="px-3 py-1 first:pl-0 last:pr-0">
                      <div className="bg-muted h-2 w-10 animate-pulse rounded-full" />
                      <div className="bg-muted mt-2 h-4 w-14 animate-pulse rounded-full" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export { Sse };
