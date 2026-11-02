type ProjectStatus = "active" | "paused" | "completed";

interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: ProjectStatus;
  updatedAt: number;
}

interface ProjectInput {
  name: string;
  description: string;
  owner: string;
  status: ProjectStatus;
}

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "进行中",
  paused: "已暂停",
  completed: "已完成",
};

let projects: Project[] = [
  {
    id: "p-01",
    name: "设计系统迁移",
    description: "把旧组件的 token 与交互状态统一到新的语义层。",
    owner: "林舟",
    status: "active",
    updatedAt: Date.now() - 1000 * 60 * 24,
  },
  {
    id: "p-02",
    name: "数据看板重构",
    description: "重排指标层级，减少首屏信息密度，补充空状态。",
    owner: "陈默",
    status: "active",
    updatedAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: "p-03",
    name: "移动端体验优化",
    description: "收紧导航层级，修复表单在小屏上的溢出。",
    owner: "苏晚",
    status: "paused",
    updatedAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: "p-04",
    name: "权限模型升级",
    description: "把角色与资源权限拆开，支持按空间继承。",
    owner: "周屿",
    status: "completed",
    updatedAt: Date.now() - 1000 * 60 * 60 * 72,
  },
  {
    id: "p-05",
    name: "组件文档站",
    description: "为每个交互组件补充可运行的示例和键盘说明。",
    owner: "林舟",
    status: "active",
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "p-06",
    name: "计费流程改造",
    description: "统一订阅、用量与发票的结构，减少重复页面。",
    owner: "顾言",
    status: "paused",
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
  },
];

/**
 * 模拟网络延迟，并支持 AbortSignal
 *
 * @param ms - 延迟时间
 * @param signal - 可选中止信号
 */
const wait = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, ms);

    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      reject(new DOMException("Aborted", "AbortError"));
    };

    signal?.addEventListener("abort", abort, { once: true });
  });

/**
 * 获取项目列表
 *
 * @param signal - 可选中止信号
 */
const listProjects = async (signal?: AbortSignal): Promise<Project[]> => {
  await wait(450, signal);
  return projects.map((project) => ({ ...project }));
};

/**
 * 创建项目
 *
 * @param input - 表单数据
 */
const createProject = async (input: ProjectInput): Promise<Project> => {
  await wait(300);
  const project: Project = {
    ...input,
    id: crypto.randomUUID(),
    updatedAt: Date.now(),
  };
  projects = [project, ...projects];
  return project;
};

/**
 * 更新项目
 *
 * @param id - 项目 id
 * @param input - 表单数据
 */
const updateProject = async (id: string, input: ProjectInput): Promise<Project> => {
  await wait(300);
  const current = projects.find((project) => project.id === id);

  if (!current) {
    throw new Error("项目不存在");
  }

  const next = { ...current, ...input, updatedAt: Date.now() };
  projects = projects.map((project) => (project.id === id ? next : project));
  return next;
};

/**
 * 删除项目
 *
 * @param id - 项目 id
 */
const removeProject = async (id: string): Promise<void> => {
  await wait(250);
  projects = projects.filter((project) => project.id !== id);
};

export { PROJECT_STATUS_LABELS, createProject, listProjects, removeProject, updateProject };
export type { Project, ProjectInput, ProjectStatus };
