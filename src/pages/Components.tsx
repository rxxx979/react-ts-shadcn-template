import { cn } from "cn";
import {
  ArrowDownIcon,
  BellIcon,
  BoldIcon,
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  FileTextIcon,
  InboxIcon,
  ItalicIcon,
  Loader2Icon,
  MailIcon,
  PaletteIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  UnderlineIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { ThemePanel } from "@/components/theme/ThemePanel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/components/ui/code-block";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DirectionProvider } from "@/components/ui/direction";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { Message, MessageAvatar, MessageContent, MessageGroup, MessageHeader } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnaireProgress,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trace, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";
import { useThemeStore } from "@/stores/theme";

const boldValues = ["bold"];
const accordionValues = ["item-1"];
const collapsibleTrigger = (
  <Button variant="outline" className="w-full">
    展开更多
  </Button>
);
const tooltipTrigger = <Button variant="outline">悬停提示</Button>;
const popoverTrigger = <Button variant="outline">Popover</Button>;
const hoverCardTrigger = <Button variant="outline">HoverCard</Button>;
const dropdownTrigger = <Button variant="outline">下拉菜单</Button>;
const contextMenuTrigger = (
  <div className="text-muted-foreground flex h-9 items-center rounded-lg border border-dashed px-3 text-sm">
    在此右键
  </div>
);
const dialogTrigger = <Button variant="outline">打开 Dialog</Button>;
const alertDialogTrigger = <Button variant="destructive">删除…</Button>;
const sheetTrigger = <Button variant="outline">打开 Sheet</Button>;
const drawerTrigger = <Button variant="outline">打开 Drawer</Button>;
const drawerCloseButton = (
  <Button variant="outline" className="w-full">
    关闭
  </Button>
);
const chartTooltipContent = <ChartTooltipContent />;

const firstValue = (value: number | readonly number[]) => (typeof value === "number" ? value : value[0]);

const chartData = [
  { month: "1月", desktop: 168, mobile: 120 },
  { month: "2月", desktop: 240, mobile: 160 },
  { month: "3月", desktop: 196, mobile: 140 },
  { month: "4月", desktop: 320, mobile: 210 },
  { month: "5月", desktop: 286, mobile: 190 },
];

const chartConfig = {
  desktop: { label: "桌面", color: "var(--chart-1)" },
  mobile: { label: "移动", color: "var(--chart-2)" },
} satisfies ChartConfig;

const frameworks = ["React", "Vue", "Svelte", "Solid", "Angular"];

// 模块级求值一次，满足 React Compiler 的渲染纯度要求
const TODAY = new Date();

const questionnaireItems = [{ name: "focus", choices: [{ value: "design" }, { value: "code" }] }] as const;

/**
 * 展示卡片
 */
const Demo = ({
  title,
  children,
  className,
  contentClassName,
  span = 1,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  span?: 1 | 2 | "full";
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // 视口附近才挂载组件，避免一进入组件库就把 60+ 个重型 demo 全部渲染
  useEffect(() => {
    const element = ref.current;
    let observer: IntersectionObserver | undefined;

    if (!mounted && element) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          setMounted(true);
          observer?.disconnect();
        },
        { rootMargin: "800px 0px" },
      );

      observer.observe(element);
    }

    return () => observer?.disconnect();
  }, [mounted]);

  const spanClass = cn(span === 2 && "@lg:col-span-2", span === "full" && "col-span-full");

  if (!mounted) {
    return (
      <div
        ref={ref}
        className={cn("bg-card flex h-full min-h-40 flex-col gap-3 rounded-xl border p-4", spanClass, className)}
      >
        <span className="text-muted-foreground text-xs font-medium">{title}</span>
        <div className="bg-muted/40 h-20 animate-pulse rounded-lg motion-reduce:animate-none" />
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("bg-card flex h-full flex-col gap-3 rounded-xl border p-4", spanClass, className)}>
      <span className="text-muted-foreground text-xs font-medium">{title}</span>
      <div className={cn("flex flex-wrap items-center gap-2", contentClassName)}>{children}</div>
    </div>
  );
};

/**
 * 画廊分区
 */
const Section = ({ title, description, children }: { title: string; description?: string; children: ReactNode }) => (
  <section className="scroll-mt-24 space-y-4">
    <div className="space-y-1">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
    </div>
    <div className="grid grid-flow-row-dense grid-cols-1 gap-4 @lg:grid-cols-2 @3xl:grid-cols-3 @6xl:grid-cols-4">
      {children}
    </div>
  </section>
);

/**
 * 右侧主题配置栏：复用外观面板，桌面端常驻
 */
const ThemeRail = () => (
  <aside className="hidden w-90 shrink-0 xl:block">
    <div className="bg-card sticky top-0 flex h-[calc(100svh-var(--header-height)-var(--footer-height)-2rem)] flex-col overflow-hidden rounded-xl border shadow-sm">
      <div className="after:from-border/70 after:via-border/40 relative flex items-center gap-2 px-4 py-3 after:pointer-events-none after:absolute after:right-2 after:bottom-0 after:left-0 after:h-px after:bg-linear-to-r after:to-transparent">
        <PaletteIcon className="text-muted-foreground size-4" />
        <div>
          <h2 className="text-sm font-semibold">外观与布局</h2>
          <p className="text-muted-foreground text-[11px]">品牌、主题与布局实时生效</p>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <ThemePanel />
      </div>
    </div>
  </aside>
);

/**
 * 组件总览页：全量 shadcn 组件 + 常驻主题配置栏
 */
const Components = () => {
  const [date, setDate] = useState<Date | undefined>(TODAY);
  const [slider, setSlider] = useState([64]);
  const setPanelOpen = useThemeStore((state) => state.setPanelOpen);

  return (
    <>
      <div className="flex flex-col gap-6 pb-10 xl:flex-row">
        <div className="@container min-w-0 flex-1 space-y-10">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-[-0.03em]">组件库</h1>
            <Button variant="outline" size="sm" className="xl:hidden" onClick={() => setPanelOpen(true)}>
              <PaletteIcon />
              主题配置
            </Button>
          </div>

          <Section title="按钮与标识" description="交互基础元素与状态徽标。">
            <Demo title="Button" contentClassName="gap-2">
              <Button>主按钮</Button>
              <Button variant="secondary">次要</Button>
              <Button variant="outline">描边</Button>
              <Button variant="ghost">幽灵</Button>
              <Button variant="destructive">危险</Button>
              <Button size="sm">
                <PlusIcon /> 新建
              </Button>
            </Demo>
            <Demo title="ButtonGroup / Toggle / ToggleGroup">
              <ButtonGroup>
                <Button variant="outline">左</Button>
                <Button variant="outline">中</Button>
                <Button variant="outline">右</Button>
              </ButtonGroup>
              <Toggle aria-label="粗体">
                <BoldIcon />
              </Toggle>
              <Toggle aria-label="斜体" variant="outline">
                <ItalicIcon />
              </Toggle>
              <ToggleGroup defaultValue={boldValues}>
                <ToggleGroupItem value="bold" aria-label="粗体">
                  <BoldIcon />
                </ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="斜体">
                  <ItalicIcon />
                </ToggleGroupItem>
                <ToggleGroupItem value="underline" aria-label="下划线">
                  <UnderlineIcon />
                </ToggleGroupItem>
              </ToggleGroup>
            </Demo>
            <Demo title="Badge / Kbd / Spinner">
              <Badge>默认</Badge>
              <Badge variant="secondary">次要</Badge>
              <Badge variant="outline">描边</Badge>
              <Badge variant="destructive">危险</Badge>
              <Kbd>⌘K</Kbd>
              <Spinner />
            </Demo>
            <Demo title="Avatar / Skeleton">
              <Avatar>
                <AvatarFallback>管</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>理</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </Demo>
          </Section>

          <Section title="表单控件" description="输入、选择、开关与复合字段。">
            <Demo title="Input / Textarea / Label" contentClassName="w-full flex-col items-stretch">
              <div className="grid gap-1.5">
                <Label htmlFor="demo-name">名称</Label>
                <Input id="demo-name" placeholder="输入名称" />
              </div>
              <Textarea placeholder="备注..." />
            </Demo>
            <Demo title="Checkbox / Switch / RadioGroup" contentClassName="w-full flex-col items-stretch">
              <div className="flex items-center gap-2">
                <Checkbox defaultChecked id="demo-check" />
                <Label htmlFor="demo-check">启用通知</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked id="demo-switch" />
                <Label htmlFor="demo-switch">自动保存</Label>
              </div>
              <RadioGroup defaultValue="a" className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="a" /> 选项 A
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="b" /> 选项 B
                </label>
              </RadioGroup>
            </Demo>
            <Demo title="Select / NativeSelect" contentClassName="w-full flex-col items-start">
              <Select defaultValue="a">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">选项 A</SelectItem>
                  <SelectItem value="b">选项 B</SelectItem>
                </SelectContent>
              </Select>
              <NativeSelect defaultValue="a" className="w-full">
                <NativeSelectOption value="a">原生选项 A</NativeSelectOption>
                <NativeSelectOption value="b">原生选项 B</NativeSelectOption>
              </NativeSelect>
            </Demo>
            <Demo title="Slider" contentClassName="w-full flex-col items-stretch">
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>音量</span>
                <span>{slider[0]}%</span>
              </div>
              <Slider value={slider} onValueChange={(value) => setSlider([firstValue(value)])} />
            </Demo>
            <Demo title="InputOTP" contentClassName="w-full flex-col items-start">
              <InputOTP maxLength={6}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }, (_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </Demo>
            <Demo title="InputGroup" contentClassName="w-full flex-col items-stretch">
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput placeholder="搜索组件…" />
                <InputGroupAddon align="inline-end">
                  <Kbd>⌘K</Kbd>
                </InputGroupAddon>
              </InputGroup>
            </Demo>
            <Demo title="Combobox" contentClassName="w-full flex-col items-start">
              <Combobox items={frameworks}>
                <ComboboxInput placeholder="选择框架…" className="w-full" />
                <ComboboxContent>
                  <ComboboxEmpty>无匹配项</ComboboxEmpty>
                  <ComboboxList>
                    {(item: string) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Demo>
            <Demo title="Field / FieldGroup" contentClassName="w-full flex-col items-stretch">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="demo-field">项目名称</FieldLabel>
                  <Input id="demo-field" placeholder="给项目起个名字" />
                  <FieldDescription>会显示在侧边栏与页面标题中。</FieldDescription>
                </Field>
              </FieldGroup>
            </Demo>
          </Section>

          <Section title="反馈与状态" description="提示、进度、空状态与 Toast。">
            <Demo title="Alert">
              <Alert>
                <InboxIcon />
                <AlertTitle>提示</AlertTitle>
                <AlertDescription>这是一条使用主题 token 的信息提示。</AlertDescription>
              </Alert>
            </Demo>
            <Demo title="Progress" contentClassName="w-full flex-col items-stretch">
              <Progress value={64} />
            </Demo>
            <Demo title="Empty">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <InboxIcon />
                  </EmptyMedia>
                  <EmptyTitle>暂无内容</EmptyTitle>
                  <EmptyDescription>创建第一个项目后，这里会显示数据。</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button size="sm">
                    <PlusIcon /> 新建项目
                  </Button>
                </EmptyContent>
              </Empty>
            </Demo>
            <Demo title="Toast" contentClassName="w-full flex-col items-start">
              <Button
                variant="outline"
                onClick={() => {
                  toast.add({ title: "保存成功", description: "主题配置已更新。" });
                }}
              >
                显示 Toast
              </Button>
            </Demo>
          </Section>

          <Section title="卡片与布局" description="容器、列表、折叠与数据表格。">
            <Demo title="Card" span={2}>
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>项目概览</CardTitle>
                  <CardDescription>卡片自动继承主题表面色、边框与圆角。</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">12 个任务 · 3 位成员</CardContent>
              </Card>
            </Demo>
            <Demo title="ItemGroup / Item" span={2} contentClassName="w-full flex-col items-stretch">
              <ItemGroup>
                <Item variant="outline">
                  <ItemMedia>
                    <Avatar className="size-8">
                      <AvatarFallback>张</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>张三</ItemTitle>
                    <ItemDescription>管理员</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button size="xs" variant="outline">
                      查看
                    </Button>
                  </ItemActions>
                </Item>
                <Item variant="outline">
                  <ItemMedia>
                    <Avatar className="size-8">
                      <AvatarFallback>李</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>李四</ItemTitle>
                    <ItemDescription>成员</ItemDescription>
                  </ItemContent>
                </Item>
              </ItemGroup>
            </Demo>
            <Demo title="AspectRatio / Separator">
              <AspectRatio ratio={16 / 9} className="bg-muted w-full max-w-xs rounded-lg">
                <div className="flex h-full items-center justify-center text-sm">16 : 9</div>
              </AspectRatio>
              <Separator orientation="vertical" className="h-8" />
              <span className="text-muted-foreground text-sm">分隔线</span>
            </Demo>
            <Demo title="ScrollArea" span={2}>
              <ScrollArea className="h-40 w-full rounded-lg border">
                <div className="space-y-2 p-3 text-sm">
                  {Array.from({ length: 12 }, (_, index) => (
                    <p key={index}>可滚动内容 {index + 1}</p>
                  ))}
                </div>
              </ScrollArea>
            </Demo>
            <Demo title="Resizable" span={2}>
              <ResizablePanelGroup orientation="horizontal" className="h-40 w-full rounded-lg border">
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-full items-center justify-center text-sm">左侧面板</div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-full items-center justify-center text-sm">右侧面板</div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </Demo>
            <Demo title="Tabs">
              <Tabs defaultValue="a" className="w-full">
                <TabsList>
                  <TabsTrigger value="a">概览</TabsTrigger>
                  <TabsTrigger value="b">设置</TabsTrigger>
                </TabsList>
                <TabsContent value="a" className="text-muted-foreground text-sm">
                  概览内容
                </TabsContent>
                <TabsContent value="b" className="text-muted-foreground text-sm">
                  设置内容
                </TabsContent>
              </Tabs>
            </Demo>
            <Demo title="Accordion / Collapsible" span={2}>
              <Accordion defaultValue={accordionValues} className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>什么是主题 token？</AccordionTrigger>
                  <AccordionContent>颜色、圆角与阴影都由 CSS 变量驱动。</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>支持暗色吗？</AccordionTrigger>
                  <AccordionContent>支持，且可跟随系统。</AccordionContent>
                </AccordionItem>
              </Accordion>
              <Collapsible className="w-full">
                <CollapsibleTrigger render={collapsibleTrigger} />
                <CollapsibleContent className="text-muted-foreground pt-2 text-sm">折叠内容</CollapsibleContent>
              </Collapsible>
            </Demo>
            <Demo title="Table" span="full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>成员</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead className="text-right">状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>张三</TableCell>
                    <TableCell>管理员</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">在线</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>李四</TableCell>
                    <TableCell>成员</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">离线</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Demo>
          </Section>

          <Section title="导航" description="面包屑、分页与菜单导航。">
            <Demo title="Breadcrumb" span={2}>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">首页</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">项目</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>组件库</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Demo>
            <Demo title="Pagination">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </Demo>
            <Demo title="NavigationMenu">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>产品</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-44 gap-1 p-2">
                        <NavigationMenuLink href="#">概览</NavigationMenuLink>
                        <NavigationMenuLink href="#">更新记录</NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </Demo>
            <Demo title="Menubar">
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger>文件</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>新建</MenubarItem>
                    <MenubarItem>打开</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>编辑</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>撤销</MenubarItem>
                    <MenubarItem>重做</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </Demo>
          </Section>

          <Section title="浮层" description="提示、菜单、对话框与抽屉。">
            <Demo title="Tooltip / Popover / HoverCard" span={2}>
              <Tooltip>
                <TooltipTrigger render={tooltipTrigger} />
                <TooltipContent>这是 Tooltip</TooltipContent>
              </Tooltip>
              <Popover>
                <PopoverTrigger render={popoverTrigger} />
                <PopoverContent className="w-64 text-sm">浮层内容，使用 popover 表面色。</PopoverContent>
              </Popover>
              <HoverCard>
                <HoverCardTrigger render={hoverCardTrigger} />
                <HoverCardContent className="w-64 text-sm">悬停后出现的卡片。</HoverCardContent>
              </HoverCard>
            </Demo>
            <Demo title="DropdownMenu / ContextMenu" span={2}>
              <DropdownMenu>
                <DropdownMenuTrigger render={dropdownTrigger} />
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>编辑</DropdownMenuItem>
                  <DropdownMenuItem>复制</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ContextMenu>
                <ContextMenuTrigger render={contextMenuTrigger} />
                <ContextMenuContent>
                  <ContextMenuItem>复制</ContextMenuItem>
                  <ContextMenuItem>粘贴</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </Demo>
            <Demo title="Dialog / AlertDialog" span={2}>
              <Dialog>
                <DialogTrigger render={dialogTrigger} />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>对话框</DialogTitle>
                    <DialogDescription>遮罩层与卡片表面已接入主题 token。</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger render={alertDialogTrigger} />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认删除？</AlertDialogTitle>
                    <AlertDialogDescription>此操作不可撤销。</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction>确认删除</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Demo>
            <Demo title="Sheet / Drawer" span={2}>
              <Sheet>
                <SheetTrigger render={sheetTrigger} />
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>侧边面板</SheetTitle>
                    <SheetDescription>从右侧滑入的 Sheet。</SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
              <Drawer>
                <DrawerTrigger render={drawerTrigger} />
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>底部抽屉</DrawerTitle>
                    <DrawerDescription>从底部滑入，支持拖拽关闭。</DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <DrawerClose render={drawerCloseButton} />
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </Demo>
          </Section>

          <Section title="数据展示" description="图表与日历。">
            <Demo title="Chart" span={2}>
              <ChartContainer config={chartConfig} className="h-56 w-full">
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <ChartTooltip content={chartTooltipContent} />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={6} />
                  <Bar dataKey="mobile" fill="var(--color-mobile)" radius={6} />
                </BarChart>
              </ChartContainer>
            </Demo>
            <Demo title="Calendar" span={2}>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(next) => setDate(next)}
                className="rounded-lg border"
              />
            </Demo>
          </Section>

          <Section title="组合与命令" description="轮播、命令面板与代码块。">
            <Demo title="Carousel" span={2}>
              <Carousel className="w-full">
                <CarouselContent>
                  {["主题 token 驱动全部组件", "9 套品牌色板 + 自定义主色", "界面色调与强调色独立可调"].map((text) => (
                    <CarouselItem key={text}>
                      <div className="bg-muted flex h-28 items-center justify-center rounded-lg px-6 text-center text-sm">
                        {text}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </Demo>
            <Demo title="Command" span={2}>
              {/* defaultValue 指向不存在的值，避免 cmdk 挂载时把首项滚入视口导致整页跳动 */}
              <Command defaultValue="__none__" className="w-full rounded-lg border">
                <CommandInput placeholder="搜索命令…" />
                <CommandList>
                  <CommandEmpty>没有结果</CommandEmpty>
                  <CommandGroup heading="建议">
                    <CommandItem>
                      <SearchIcon /> 搜索组件
                    </CommandItem>
                    <CommandItem>
                      <SettingsIcon /> 打开设置
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </Demo>
            <Demo title="CodeBlock" span={2}>
              <CodeBlock>
                <CodeBlockHeader>
                  <CodeBlockTitle>theme.ts</CodeBlockTitle>
                  <CodeBlockActions>
                    <CodeBlockCopyButton value='const primary = "oklch(0.55 0.2 260)";' />
                  </CodeBlockActions>
                </CodeBlockHeader>
                <CodeBlockContent lineNumbers>
                  <CodeBlockLine>const primary = &quot;oklch(0.55 0.2 260)&quot;;</CodeBlockLine>
                  <CodeBlockLine variant="added">const surface = &quot;var(--surface-c)&quot;;</CodeBlockLine>
                  <CodeBlockLine variant="removed">const accent = &quot;#ff00ff&quot;;</CodeBlockLine>
                </CodeBlockContent>
              </CodeBlock>
            </Demo>
          </Section>

          <Section title="AI 与消息" description="对话气泡、附件、追踪与问卷。">
            <Demo title="Message / Bubble" span={2}>
              <MessageGroup className="w-full max-w-lg">
                <Message align="start">
                  <MessageAvatar>
                    <Avatar className="size-7">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  </MessageAvatar>
                  <MessageContent>
                    <MessageHeader>助手</MessageHeader>
                    <BubbleGroup>
                      <Bubble>
                        <BubbleContent>已为你生成主题方案，右侧可以实时预览。</BubbleContent>
                      </Bubble>
                    </BubbleGroup>
                  </MessageContent>
                </Message>
                <Message align="end">
                  <MessageContent>
                    <Bubble align="end" variant="secondary">
                      <BubbleContent>收到，谢谢。</BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              </MessageGroup>
            </Demo>
            <Demo title="Attachment" contentClassName="w-full flex-col items-start">
              <Attachment>
                <AttachmentMedia>
                  <FileTextIcon />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>主题规范.pdf</AttachmentTitle>
                  <AttachmentDescription>1.2 MB</AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions>
                  <AttachmentAction aria-label="下载">
                    <ArrowDownIcon />
                  </AttachmentAction>
                </AttachmentActions>
              </Attachment>
            </Demo>
            <Demo title="Marker" contentClassName="w-full flex-col items-stretch">
              <Marker>
                <MarkerIcon>
                  <CalendarIcon />
                </MarkerIcon>
                <MarkerContent>今天</MarkerContent>
              </Marker>
              <Marker variant="separator">
                <MarkerContent>更早</MarkerContent>
              </Marker>
            </Demo>
            <Demo title="Trace" contentClassName="w-full flex-col items-stretch">
              <Trace>
                <TraceLine status="running">
                  <TraceIcon>
                    <Loader2Icon className="animate-spin" />
                  </TraceIcon>
                  <TraceTitle>检索资料</TraceTitle>
                  <TraceDescription>1.2s</TraceDescription>
                </TraceLine>
                <TraceLine>
                  <TraceIcon>
                    <CheckIcon />
                  </TraceIcon>
                  <TraceTitle>生成主题方案</TraceTitle>
                  <TraceDescription>完成</TraceDescription>
                </TraceLine>
              </Trace>
            </Demo>
            <Demo title="MessageScroller" span={2} contentClassName="w-full">
              <div className="h-48 w-full overflow-hidden rounded-lg border">
                <MessageScrollerProvider>
                  <MessageScroller>
                    <MessageScrollerViewport>
                      <MessageScrollerContent className="p-3">
                        {Array.from({ length: 8 }, (_, index) => (
                          <MessageScrollerItem key={index} className="text-muted-foreground text-sm">
                            历史消息 {index + 1}
                          </MessageScrollerItem>
                        ))}
                      </MessageScrollerContent>
                    </MessageScrollerViewport>
                    <MessageScrollerButton />
                  </MessageScroller>
                </MessageScrollerProvider>
              </div>
            </Demo>
            <Demo title="Questionnaire" span={2} contentClassName="w-full">
              <Questionnaire items={questionnaireItems}>
                <QuestionnaireProgress />
                <QuestionnaireItem name="focus">
                  <QuestionnaireTitle>你更关注哪一部分？</QuestionnaireTitle>
                  <QuestionnaireChoices>
                    <QuestionnaireChoice value="design">视觉设计</QuestionnaireChoice>
                    <QuestionnaireChoice value="code">代码实现</QuestionnaireChoice>
                  </QuestionnaireChoices>
                </QuestionnaireItem>
                <QuestionnaireActions>
                  <QuestionnaireNext>下一步</QuestionnaireNext>
                </QuestionnaireActions>
              </Questionnaire>
            </Demo>
          </Section>

          <Section title="其他" description="侧边栏、方向与杂项。">
            <Demo title="Sidebar" span={2}>
              <div className="flex w-full items-center justify-between gap-3">
                <p className="text-muted-foreground text-sm">
                  Sidebar 已用于全站左侧布局（品牌块、路由菜单、折叠轨、用户菜单）。
                </p>
                <Badge variant="secondary">已启用</Badge>
              </div>
            </Demo>
            <Demo title="Direction (RTL)">
              <DirectionProvider direction="rtl">
                <div dir="rtl" className="flex items-center gap-2 text-sm">
                  你好，世界
                  <Badge variant="outline">RTL</Badge>
                </div>
              </DirectionProvider>
            </Demo>
            <Demo title="Icons / Kbd">
              <BellIcon className="text-muted-foreground size-4" />
              <MailIcon className="text-muted-foreground size-4" />
              <SparklesIcon className="text-muted-foreground size-4" />
              <ChevronRightIcon className="text-muted-foreground size-4" />
              <Kbd>⌘</Kbd>
              <Kbd>J</Kbd>
            </Demo>
            <Demo title="Check icon">
              <CheckIcon className="text-primary size-4" />
              <Loader2Icon className="text-muted-foreground size-4 animate-spin" />
            </Demo>
          </Section>
        </div>

        <ThemeRail />
      </div>

      {/* 小屏下常驻的主题入口（大屏由右侧配置栏承担） */}
      <Button
        className="fixed bottom-[calc(var(--footer-height)+1rem)] left-4 z-40 shadow-lg xl:hidden"
        onClick={() => setPanelOpen(true)}
      >
        <PaletteIcon />
        主题
      </Button>
    </>
  );
};

export { Components };
