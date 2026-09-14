document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const currentPage = body.dataset.page || 'home';
  const languageKey = 'chenglangrong-homepage-language';
  const originalTextNodes = new WeakMap();
  const originalAttributes = new WeakMap();
  const translatableAttributes = ['aria-label', 'alt', 'data-title'];

  const pageTitles = {
    en: {
      home: 'ChengLang Rong | Academic Homepage',
      research: 'Research | ChengLang Rong',
      publications: 'Papers | ChengLang Rong',
      awards: 'Awards | ChengLang Rong',
      education: 'Education | ChengLang Rong',
      contact: 'Contact | ChengLang Rong',
    },
    zh: {
      home: '容程朗 | 学术主页',
      research: '研究 | 容程朗',
      publications: '论文 | 容程朗',
      awards: '荣誉 | 容程朗',
      education: '教育 | 容程朗',
      contact: '联系 | 容程朗',
    },
  };

  const translations = {
    zh: {
      'Artificial Intelligence': '人工智能',
      'Primary navigation': '主导航',
      'Mobile navigation': '移动端导航',
      'Home': '首页',
      'Research': '研究',
      'Publications': '论文',
      'Awards': '荣誉',
      'Education': '教育',
      'Contact': '联系',
      'Open menu': '打开菜单',
      'Close menu': '关闭菜单',
      'Undergraduate Researcher @ GDUT': '广东工业大学本科生研究者',
      'Guangzhou, China': '中国广州',
      'Email': '邮箱',
      'Homepage QR': '主页二维码',
      'Academic Profile': '学术简介',
      'I am an undergraduate researcher in the Artificial Intelligence Innovation Class at Guangdong University of Technology. My work focuses on reinforcement learning, intelligent scheduling, semiconductor manufacturing optimization, and engineering control.': '我是广东工业大学人工智能创新班本科生研究者，研究聚焦强化学习、智能调度、半导体制造优化与工程控制。',
      'I develop learning-based scheduling methods for constrained engineering systems, combining event-driven simulation, feasibility-aware decision making, multi-agent reinforcement learning, and safety mechanisms. I also study power prediction and adaptive control for energy-efficient central air-conditioning systems.': '我面向受约束工程系统开发学习驱动调度方法，结合事件驱动仿真、可行性感知决策、多智能体强化学习与安全机制；同时研究中央空调节能系统中的功率预测与自适应控制。',
      'Highlights': '近期亮点',
      'All publications': '全部论文',
      '— Two first-author conference papers accepted.': '— 两篇第一作者会议论文被录用。',
      '— First-author CCF-C conference paper accepted.': '— 一篇第一作者 CCF-C 会议论文被录用。',
      '— Second-author EI conference paper accepted.': '— 一篇第二作者 EI 会议论文被录用。',
      'GDUT Artificial Intelligence Innovation Class': '广东工业大学人工智能创新班',
      '— GPA 3.623 / 5.0, major rank 6 / 36.': '— GPA 3.623 / 5.0，专业排名 6 / 36。',
      'Research Interests': '研究兴趣',
      'Research details': '研究详情',
      'Intelligent Scheduling': '智能调度',
      'Learning-based scheduling for single-arm cluster and multicluster semiconductor tools.': '面向单臂集群与多集群半导体设备的学习驱动调度。',
      'Reinforcement Learning': '强化学习',
      'Multi-agent coordination, dynamic feasibility masking, PPO refinement, TD3, and safety shielding.': '多智能体协同、动态可行性掩码、PPO 精炼、TD3 与安全屏蔽。',
      'Engineering Control': '工程控制',
      'Power prediction and adaptive control for central air-conditioning systems.': '中央空调系统功率预测与自适应控制。',
      'Full background': '完整背景',
      'Guangdong University of Technology': '广东工业大学',
      'B.Eng. candidate, Artificial Intelligence Innovation Class, School of Computer Science.': '计算机学院人工智能创新班工学学士候选人。',
      'GPA 3.623 / 5.0 · Major rank 6 / 36': 'GPA 3.623 / 5.0 · 专业排名 6 / 36',
      'Selected Publications': '代表性论文',
      'View all five': '查看全部五篇',
      'Runtime-Shielded Joint-Action Scheduling for a Multicluster Tool with Cooling Reentry': '带重入冷却的多集群设备运行时屏蔽联合动作调度',
      'First author · Accepted · IEEE International Conference on Big Data, Machine Learning and Intelligent Computing (BDMLIC 2026)': '第一作者 · 已录用 · IEEE International Conference on Big Data, Machine Learning and Intelligent Computing (BDMLIC 2026)',
      'SGC-MOPS for event-triggered scheduling, cooling reentry, and commit-time runtime shielding': 'SGC-MOPS：事件触发调度、冷却重入与提交时运行时屏蔽',
      'Multi-Agent Reinforcement Learning for Scheduling a Multicluster Tool for Processing Two Wafer Types': '面向两类晶圆加工多集群设备调度的多智能体强化学习',
      'Action-masked QMIX scheduling under buffer competition and wafer residency-time constraints': '缓冲区竞争与晶圆驻留时间约束下的动作掩码 QMIX 调度',
      'First author · SCI Q1, CCF-B journal · Under review': '第一作者 · SCI Q1、CCF-B 期刊 · 审稿中',
      'Multi-agent scheduling for constrained multicluster tools': '面向受约束多集群设备的多智能体调度',
      'First author · CCF-C conference · Accepted': '第一作者 · CCF-C 会议 · 已录用',
      'TD3-based full-cycle scheduling for single-arm cluster tools': '基于 TD3 的单臂集群设备全周期调度',
      'Second author · EI conference · Accepted': '第二作者 · EI 会议 · 已录用',
      'MAPPO-based online scheduling with variable cleaning cycles': '基于 MAPPO 的可变清洗周期在线调度',
      'Mobile Access': '移动访问',
      'Scan to open my homepage': '扫码打开我的主页',
      'Quick Access': '快捷访问',
      'Take my academic profile with you': '随身查看我的学术主页',
      'Point your phone camera at the code to view my research, papers, awards, and contact details.': '用手机相机扫描二维码，即可查看我的研究、论文、荣誉与联系方式。',
      'Open Homepage': '打开主页',
      'Copy Link': '复制链接',
      '© 2026 Academic Homepage. All rights reserved.': '© 2026 学术主页。保留所有权利。',

      'Research Projects': '研究项目',
      'Artificial Intelligence, Optimization, and': '人工智能、优化与',
      'Selected Artificial Intelligence projects on reinforcement learning, semiconductor manufacturing scheduling, event-driven simulation, runtime safety control, and HVAC intelligent control.': '以下为围绕强化学习、半导体制造调度、事件驱动仿真、运行时安全控制与暖通空调智能控制开展的人工智能项目。',
      'Project 01': '项目 01',
      'Project 02': '项目 02',
      'Project 03': '项目 03',
      'Project 04': '项目 04',
      '2025.11-Present': '2025.11-至今',
      'Scheduling of Single-Arm Multicluster Tools for Multi-Type Wafers with Parallel Processing, Residency Time Constraints, and Reentrant Buffer Cooling Operations': '面向多类型晶圆并行加工、驻留时间约束与重入式缓冲冷却操作的单臂多集群设备调度',
      'Event-Driven Simulation': '事件驱动仿真',
      'Safety Shielding': '安全屏蔽',
      'Joint-Action Certification': '联合动作认证',
      'Cooling Reentry': '冷却重入',
      'IEEE International Conference on Big Data, Machine Learning and Intelligent Computing (BDMLIC 2026) Accepted': 'IEEE International Conference on Big Data, Machine Learning and Intelligent Computing (BDMLIC 2026) 已录用',
      'Time': '时间',
      'Role': '角色',
      'Project Lead': '项目负责人',
      'Problem:': '问题：',
      'Schedule single-arm multicluster tools under cooling reentry, shared-buffer direction constraints, cooling readiness, residency-time limits, and robot joint-action coupling.': '在冷却重入、共享缓冲区方向约束、冷却就绪、驻留时间限制与机器人联合动作耦合下，对单臂多集群设备进行调度。',
      'Method:': '方法：',
      'SGC-MOPS, an event-triggered joint-action scheduler with robot-local feasibility masks, joint compatibility predicates, deterministic progress repair, and a final runtime shield.': 'SGC-MOPS，一种事件触发联合动作调度器，包含机器人局部可行性掩码、联合兼容谓词、确定性进展修复与最终运行时屏蔽。',
      'Progress:': '进展：',
      'The accepted BDMLIC 2026 paper reports completion of all 15 evaluated deterministic configurations, a 42.40% mean paired makespan reduction versus Serial-Safe, zero enumerated-predicate violations across 3,926 committed decisions, and 1.270 ms pooled p95 decision latency.': '已录用的 BDMLIC 2026 论文报告了 15 个确定性配置全部完成，相比 Serial-Safe 平均配对 makespan 降低 42.40%，3,926 次提交决策中枚举谓词违规为 0，合并 p95 决策延迟为 1.270 ms。',
      'My Contribution:': '我的贡献：',
      'I led cooling-reentry scenario construction, simulation and constraint checking, scheduling framework design, safety-shield implementation, experiment design, and paper writing.': '我负责冷却重入场景构建、仿真与约束检查、调度框架设计、安全屏蔽实现、实验设计与论文写作。',
      'First author · IEEE International Conference on Big Data, Machine Learning and Intelligent Computing (BDMLIC 2026) · Accepted': '第一作者 · IEEE International Conference on Big Data, Machine Learning and Intelligent Computing (BDMLIC 2026) · 已录用',
      'View Details': '查看详情',
      'Research Detail': '研究详情',
      'Scheduling of Single-Arm Multicluster Tools for Multi-Type Wafers with Parallel Processing and Residency Time Constraints': '面向多类型晶圆并行加工与驻留时间约束的单臂多集群设备调度',
      'Multi-Agent RL': '多智能体强化学习',
      'Residency Constraints': '驻留约束',
      'Dynamic Feasibility Masks': '动态可行性掩码',
      'Benchmark Evaluation': '基准评估',
      'T-ASE Under Review': 'T-ASE 审稿中',
      'CCF-B Journal': 'CCF-B 期刊',
      'Project Lead / First Author': '项目负责人 / 第一作者',
      'Coordinate multi-type wafer flows with parallel processing, shared modules, buffer competition, residency-time constraints, and deadlock risk.': '在并行加工、共享模块、缓冲区竞争、驻留时间约束与死锁风险下协调多类型晶圆流。',
      'The accepted BDMLIC study uses action-masked QMIX; the broader project develops MA-QMIX-PPO with dynamic feasibility masks, centralized monotonic value decomposition, PPO joint-action refinement, expert-guided imitation, successful-trajectory replay, and elite archive search.': '已录用的 BDMLIC 研究采用动作掩码 QMIX；更完整项目发展 MA-QMIX-PPO，结合动态可行性掩码、集中式单调价值分解、PPO 联合动作精炼、专家引导模仿、成功轨迹回放与精英档案搜索。',
      'The BDMLIC paper reports 3/3 successful runs, a 2,233 s mean feasible makespan, and a 2,220 s best feasible makespan in the evaluated 20-wafer setting. Broader baseline and CP-SAT comparisons across 51 perturbation cases support the first-author IEEE T-ASE under-review manuscript.': 'BDMLIC 论文在评估的 20 片晶圆设置中报告了 3/3 次成功运行、2,233 s 平均可行 makespan 与 2,220 s 最优可行 makespan。覆盖 51 个扰动案例的更广泛基线与 CP-SAT 比较支撑第一作者 IEEE T-ASE 在审稿件。',
      'I led problem modeling, MDP definition, event-driven simulation, robot coordination interfaces, algorithm design, experiment organization, result analysis, and manuscript writing.': '我负责问题建模、MDP 定义、事件驱动仿真、机器人协同接口、算法设计、实验组织、结果分析与稿件写作。',
      'First author · IEEE International Conference on Big Data, Machine Learning and Intelligent Computing (BDMLIC 2026) · Accepted; first author · IEEE Transactions on Automation Science and Engineering · Under review': '第一作者 · IEEE International Conference on Big Data, Machine Learning and Intelligent Computing (BDMLIC 2026) · 已录用；第一作者 · IEEE Transactions on Automation Science and Engineering · 审稿中',
      'Scheduling of a Single-Arm Cluster Tool for Processing Two Types of Wafers with Parallel Processing': '面向两类晶圆并行加工的单臂集群设备调度',
      'Deep RL': '深度强化学习',
      'Improved TD3': '改进 TD3',
      'Cluster Tool': '集群设备',
      '29th IEEE International Conference on Computer Supported Cooperative Work in Design (CSCWD 2026) Accepted': '29th IEEE International Conference on Computer Supported Cooperative Work in Design (CSCWD 2026) 已录用',
      'Optimize full-cycle scheduling for a single-arm cluster tool processing two wafer types.': '优化处理两类晶圆的单臂集群设备全周期调度。',
      'An MDP formulation solved by improved TD3 with legal-action handling, reward reconstruction, dynamic exploration, prioritized replay, cyclic learning rate, attention, and normalized states.': '将调度过程建模为 MDP，并采用改进 TD3 求解，包含合法动作处理、奖励重构、动态探索、优先经验回放、循环学习率、注意力机制与状态归一化。',
      'Experiments show lower makespan, faster convergence, and stronger robustness than TD3, DDPG, and DQN; the first-author paper has been accepted by the 29th IEEE International Conference on Computer Supported Cooperative Work in Design (CSCWD 2026).': '实验显示该方法相比 TD3、DDPG 与 DQN 具有更低 makespan、更快收敛与更强鲁棒性；第一作者论文已被 29th IEEE International Conference on Computer Supported Cooperative Work in Design (CSCWD 2026) 录用。',
      'I handled problem modeling, MDP definition, simulation environment programming, legal-action and constraint-checking implementation, algorithm design, comparison experiments, result analysis, and main paper writing.': '我承担问题建模、MDP 定义、仿真环境编程、合法动作与约束检查实现、算法设计、对比实验、结果分析与主体论文写作。',
      'First author · 29th IEEE International Conference on Computer Supported Cooperative Work in Design (CSCWD 2026) · CCF-C conference': '第一作者 · 29th IEEE International Conference on Computer Supported Cooperative Work in Design (CSCWD 2026) · CCF-C 会议',
      'Intelligent Scheduling System for Central Air Conditioning': '中央空调智能调度系统',
      'Transformer Prediction': 'Transformer 预测',
      'HVAC Control': '暖通空调控制',
      'Power Regulation': '功率调节',
      'Regional Third Prize': '省赛三等奖',
      'Improve coordinated scheduling of central air-conditioning equipment under dynamic load, environmental temperature changes, and operating constraints.': '在动态负荷、环境温度变化与运行约束下改进中央空调设备协同调度。',
      'Neural-network and Transformer-based power prediction combined with DDPG continuous-action adaptive scheduling.': '将神经网络与 Transformer 功率预测同 DDPG 连续动作自适应调度结合。',
      'The project produced an adaptive HVAC scheduling prototype and won Third Prize in the Guangdong Regional Competition of the China Robot and Artificial Intelligence Competition.': '项目形成了自适应暖通空调调度原型，并获得中国机器人及人工智能大赛广东赛区三等奖。',
      'I led data modeling, power-prediction model training, and intelligent control algorithm implementation.': '我负责数据建模、功率预测模型训练与智能控制算法实现。',
      'Project lead · Regional Third Prize · China Robot and Artificial Intelligence Competition': '项目负责人 · 省赛三等奖 · 中国机器人及人工智能大赛',
      'Demonstration Videos': '演示视频',
      'Robotic-Arm Scheduling Demonstrations': '机械臂调度演示',
      'Our work and research are dedicated to developing concise, safe, and efficient scheduling algorithms for robotic-arm control, improving the production efficiency and safety of Multicluster Tools and Cluster Tools in semiconductor manufacturing.': '我们的工作致力于开发简洁、安全、高效的机械臂控制调度算法，提升半导体制造中多集群设备与集群设备的生产效率与安全性。',
      'Single-Cluster Tool 3D Demonstration': '单集群设备 3D 演示',
      '3D visualization of robotic-arm coordination in a single-cluster tool.': '单集群设备中机械臂协同过程的 3D 可视化。',
      'Continuous Scheduling Demonstration': '连续调度演示',
      'Uninterrupted view of wafer transfer and robotic-arm scheduling behavior.': '连续展示晶圆传输与机械臂调度行为。',
      'Close-Up Scheduling Details': '调度细节特写',
      'Camera-switching view focused on detailed module interactions and transfer timing.': '通过镜头切换展示模块交互细节与传输时序。',
      'Detail': '详情',
      'Close detail': '关闭详情',
      'Scheduling of Single-Arm Multicluster Tools with Reentrant Buffer Cooling': '带重入缓冲冷却的单臂多集群设备调度',
      'This project studies real-time scheduling for single-arm multicluster semiconductor tools under cooling-reentry constraints. The core coupling comes from shared-buffer direction constraints, cooling readiness, residency-time limits, robot joint actions, and runtime safety certification.': '该项目研究冷却重入约束下单臂多集群半导体设备的实时调度。核心耦合来自共享缓冲区方向约束、冷却就绪、驻留时间限制、机器人联合动作与运行时安全认证。',
      'The technical framework is SGC-MOPS, an event-triggered joint-action scheduler that combines a fixed 9 × 11 interface, robot-local feasibility masks, joint compatibility predicates, advisory candidate ranking, deterministic progress repair, certified waits, and a final runtime shield.': '技术框架为 SGC-MOPS，一种事件触发联合动作调度器，结合固定 9 × 11 接口、机器人局部可行性掩码、联合兼容谓词、建议候选排序、确定性进展修复、认证等待与最终运行时屏蔽。',
      'My work covers cooling-reentry scenario construction, event-driven simulation and constraint-checking implementation, scheduling framework design, safety-shield implementation, experiment design, response-latency analysis, and paper writing. The accepted BDMLIC 2026 paper reports completion of all 15 evaluated deterministic configurations, zero enumerated-predicate violations across 3,926 committed decisions, and 1.270 ms pooled p95 decision latency.': '我的工作覆盖冷却重入场景构建、事件驱动仿真与约束检查实现、调度框架设计、安全屏蔽实现、实验设计、响应延迟分析与论文写作。已录用的 BDMLIC 2026 论文报告 15 个评估确定性配置全部完成，3,926 次提交决策中枚举谓词违规为 0，合并 p95 决策延迟为 1.270 ms。',
      'Scheduling of Single-Arm Multicluster Tools with Residency Constraints': '带驻留约束的单臂多集群设备调度',
      'This project studies full-cycle scheduling for two-type and three-type wafer processing in single-arm multicluster tools. The scheduling model covers startup, steady-state, and close-down phases under parallel processing, shared processing, shared buffers, residency-time constraints, and deadlock-sensitive resource coupling.': '该项目研究单臂多集群设备中两类与三类晶圆加工的全周期调度。调度模型覆盖并行加工、共享加工、共享缓冲区、驻留时间约束与死锁敏感资源耦合下的启动、稳态与收尾阶段。',
      'The accepted BDMLIC study uses AM-QMIX, combining robot-specific action masks, recurrent Q-networks, monotonic value mixing, and joint replay for a 20-wafer, two-type scheduling scenario. The broader MA-QMIX-PPO framework adds PPO joint-action refinement, expert-guided imitation, successful-trajectory replay, and elite archive search.': '已录用的 BDMLIC 研究采用 AM-QMIX，在 20 片晶圆、两类型调度场景中结合机器人专属动作掩码、循环 Q 网络、单调价值混合与联合回放。更完整的 MA-QMIX-PPO 框架加入 PPO 联合动作精炼、专家引导模仿、成功轨迹回放与精英档案搜索。',
      'My work covers multicluster scheduling modeling and MDP definition, event-driven simulation, robot coordination interfaces, dynamic feasibility masks, reinforcement-learning algorithm design, baseline and CP-SAT comparisons, perturbation-case analysis, and manuscript writing. The BDMLIC paper reports 3/3 successful runs, a 2,233 s mean feasible makespan, and a 2,220 s best feasible makespan; the broader first-author IEEE T-ASE manuscript remains under review.': '我的工作覆盖多集群调度建模与 MDP 定义、事件驱动仿真、机器人协同接口、动态可行性掩码、强化学习算法设计、基线与 CP-SAT 对比、扰动案例分析与稿件写作。BDMLIC 论文报告 3/3 次成功运行、2,233 s 平均可行 makespan 与 2,220 s 最优可行 makespan；更完整的第一作者 IEEE T-ASE 稿件仍在审稿中。',
      'Scheduling of a Single-Arm Cluster Tool for Two Wafer Types': '面向两类晶圆的单臂集群设备调度',
      'This work studies full-cycle scheduling for a single-arm cluster tool processing two wafer types, covering startup transient, steady-state, and close-down transient phases. The model incorporates parallel processing modules, shared module competition, and wafer residency time constraints.': '该工作研究处理两类晶圆的单臂集群设备全周期调度，覆盖启动瞬态、稳态与收尾瞬态阶段。模型纳入并行加工模块、共享模块竞争与晶圆驻留时间约束。',
      'I formulated the scheduling process as an MDP and developed an improved TD3 algorithm tailored to the environment. The main technical components include legal-action handling, constraint checking, reward reconstruction, dynamic noise exploration, dynamic prioritized replay, adaptive cyclic learning rate, an attention mechanism, a makespan-oriented reward function, and normalized state features.': '我将调度过程建模为 MDP，并开发适配该环境的改进 TD3 算法。主要技术组件包括合法动作处理、约束检查、奖励重构、动态噪声探索、动态优先经验回放、自适应循环学习率、注意力机制、面向 makespan 的奖励函数与状态特征归一化。',
      'Experiments across representative scenarios show improved minimum makespan, faster convergence, and stronger robustness compared with TD3, DDPG, and DQN. My work covers simulation environment programming, improved TD3 implementation, comparison experiments, result analysis, and main paper writing. The first-author paper has been accepted by the 29th IEEE International Conference on Computer Supported Cooperative Work in Design (CSCWD 2026).': '代表性场景实验显示，相比 TD3、DDPG 与 DQN，该方法获得更优最小 makespan、更快收敛与更强鲁棒性。我的工作覆盖仿真环境编程、改进 TD3 实现、对比实验、结果分析与主体论文写作。第一作者论文已被 29th IEEE International Conference on Computer Supported Cooperative Work in Design (CSCWD 2026) 录用。',
      'This project studies coordinated scheduling for central air-conditioning equipment, including chillers, pumps, fans, and auxiliary control units. The system goal is adaptive response to changing environmental and operating conditions while maintaining energy efficiency and control responsiveness.': '该项目研究中央空调设备协同调度，覆盖冷机、水泵、风机与辅助控制单元。系统目标是在保持能效与控制响应性的同时，自适应应对环境与运行条件变化。',
      'The project analyzes device coupling and scheduling patterns, then uses neural-network and Transformer-based techniques to predict power consumption after frequency regulation under changing environmental conditions. This prediction module supports downstream scheduling decisions with data-driven estimates of device response.': '项目分析设备耦合与调度模式，采用神经网络与 Transformer 技术预测变化环境条件下变频调节后的功耗。该预测模块以数据驱动的设备响应估计支撑下游调度决策。',
      'The control layer applies the DDPG reinforcement-learning framework to adjust continuous scheduling actions in real time. My work covers data modeling, power-prediction model training, and intelligent control algorithm implementation. The project produced an adaptive HVAC scheduling prototype and won Third Prize in the Guangdong Regional Competition of the China Robot and Artificial Intelligence Competition.': '控制层采用 DDPG 强化学习框架实时调整连续调度动作。我的工作覆盖数据建模、功率预测模型训练与智能控制算法实现。项目形成自适应暖通空调调度原型，并获得中国机器人及人工智能大赛广东赛区三等奖。',

      'Papers': '论文',
      'Publication and': '发表与',
      'Submission Status': '投稿状态',
      'Independent paper entries centered on Artificial Intelligence, reinforcement learning, semiconductor manufacturing optimization, and multicluster tool scheduling.': '以下为围绕人工智能、强化学习、半导体制造优化与多集群设备调度整理的独立论文条目。',
      'Paper 01': '论文 01',
      'Paper 02': '论文 02',
      'Paper 03': '论文 03',
      'Paper 04': '论文 04',
      'Paper 05': '论文 05',
      'Accepted': '已录用',
      'Under Review': '审稿中',
      'Status:': '状态：',
      'Role:': '角色：',
      'Authors:': '作者：',
      'Linked Project:': '关联项目：',
      'Summary:': '摘要：',
      'Level:': '级别：',
      'Topic:': '主题：',
      'First author.': '第一作者。',
      'Second author.': '第二作者。',
      'Accepted by IEEE International Conference on Big Data, Machine Learning and Intelligent Computing (BDMLIC 2026).': '已被 IEEE International Conference on Big Data, Machine Learning and Intelligent Computing (BDMLIC 2026) 录用。',
      'Project 01, reentrant buffer cooling scheduling.': '项目 01，重入式缓冲冷却调度。',
      'SGC-MOPS completed all 15 evaluated deterministic configurations with a 42.40% mean paired makespan reduction versus Serial-Safe, zero enumerated-predicate violations across 3,926 committed decisions, and 1.270 ms pooled p95 decision latency.': 'SGC-MOPS 完成 15 个评估确定性配置；相比 Serial-Safe 平均配对 makespan 降低 42.40%，3,926 次提交决策中枚举谓词违规为 0，合并 p95 决策延迟为 1.270 ms。',
      'Project 02, multicluster tool scheduling.': '项目 02，多集群设备调度。',
      'AM-QMIX achieved 3/3 successful runs, a 2,233 s mean feasible makespan, and a 2,220 s best feasible makespan under the evaluated 20-wafer, three-seed, 5,500-episode setting.': 'AM-QMIX 在评估的 20 片晶圆、3 个随机种子、5,500 回合设置下达到 3/3 次成功运行，平均可行 makespan 为 2,233 s，最优可行 makespan 为 2,220 s。',
      '29th IEEE International Conference on Computer Supported Cooperative Work in Design (CSCWD 2026) Conference Paper': '29th IEEE International Conference on Computer Supported Cooperative Work in Design (CSCWD 2026) 会议论文',
      'Accepted by the 29th IEEE International Conference on Computer Supported Cooperative Work in Design (CSCWD 2026).': '已被 29th IEEE International Conference on Computer Supported Cooperative Work in Design (CSCWD 2026) 录用。',
      'CCF-C conference.': 'CCF-C 会议。',
      'Project 03, single-arm cluster tool scheduling.': '项目 03，单臂集群设备调度。',
      'Improved TD3 for full-cycle scheduling of a single-arm cluster tool processing two wafer types with parallel processing and residency limits.': '改进 TD3 用于具备并行加工与驻留限制的两类晶圆单臂集群设备全周期调度。',
      'Open IEEE Xplore': '打开 IEEE Xplore',
      'IEEE International Conference on Automation in Manufacturing, Transportation and Logistics (iCaMaL 2026) Conference Paper': 'IEEE International Conference on Automation in Manufacturing, Transportation and Logistics (iCaMaL 2026) 会议论文',
      'Accepted by IEEE International Conference on Automation in Manufacturing, Transportation and Logistics (iCaMaL 2026).': '已被 IEEE International Conference on Automation in Manufacturing, Transportation and Logistics (iCaMaL 2026) 录用。',
      'EI conference.': 'EI 会议。',
      'Single-arm multicluster tool scheduling with variable cleaning cycles.': '带可变清洗周期的单臂多集群设备调度。',
      'MAPPO-based online scheduling for variable cleaning periods, stochastic cleaning time, residency-time constraints, shared action masks, and risk-sensitive rewards.': '基于 MAPPO 的在线调度，覆盖可变清洗周期、随机清洗时间、驻留时间约束、共享动作掩码与风险敏感奖励。',
      'IEEE Transactions on Automation Science and Engineering Journal Manuscript': 'IEEE Transactions on Automation Science and Engineering 期刊稿件',
      'First author · IEEE Transactions on Automation Science and Engineering · SCI Q1, CCF-B journal': '第一作者 · IEEE Transactions on Automation Science and Engineering · SCI Q1、CCF-B 期刊',
      'Under review at IEEE Transactions on Automation Science and Engineering.': '正在 IEEE Transactions on Automation Science and Engineering 审稿。',
      'SCI Q1, CCF-B journal.': 'SCI Q1、CCF-B 期刊。',
      'MA-QMIX-PPO scheduling for two-type and three-type wafer processing under parallel processing, shared-resource coupling, buffer competition, residency-time constraints, and deadlock risk.': '面向两类型与三类型晶圆加工的 MA-QMIX-PPO 调度，覆盖并行加工、共享资源耦合、缓冲区竞争、驻留时间约束与死锁风险。',

      'Honors, Scholarships, and Competition Results': '荣誉、奖学金与竞赛成果',
      'Academic awards and competition records with an Artificial Intelligence-centered innovation profile.': '以人工智能创新能力为核心的学术荣誉与竞赛记录。',
      'Resume Highlights': '简历亮点',
      'Scholarships, Leadership, and Competition Awards': '奖学金、学生工作与竞赛奖项',
      'Scholarships': '奖学金',
      'First-, Second-, and Third-Class Scholarships Across Academic Years': '跨学年一等、二等与三等奖学金',
      'Guangdong University of Technology.': '广东工业大学。',
      'Leadership': '学生工作',
      'Student Cadre and Class Representative Honors': '学生干部与班集体代表荣誉',
      'Campus leadership and class collective recognition.': '校园组织与班集体荣誉。',
      'Academic Awards': '学业与创新奖项',
      'Innovation and Academic Progress': '创新奖与学业进步奖',
      'University-level awards in 2025-2026.': '2025-2026 学年校级奖项。',
      'Competitions': '竞赛',
      'Modeling, Network Technology, and Robot AI': '数学建模、网络技术与机器人 AI',
      'Provincial, national, and South China regional awards.': '省级、国家级与华南赛区奖项。',
      'Modeling': '建模',
      'Mathematics': '数学',
      'Network Technology': '网络技术',
      'Provincial Award': '省级奖项',
      'National Award': '国家级奖项',
      'Scholarship': '奖学金',
      'Innovation': '创新奖',
      'Academic Progress': '学业进步',
      'Class Honor': '班集体荣誉',
      'China Undergraduate Mathematical Contest in Modeling': '全国大学生数学建模竞赛',
      'Award:': '奖项：',
      'Second Prize, Guangdong Provincial Division.': '广东省赛区二等奖。',
      'Award Detail': '奖项详情',
      'National Mathematics Competition for College Students': '全国大学生数学竞赛',
      'Third Prize, Guangdong Provincial Division.': '广东省赛区三等奖。',
      'China Network Technology Challenge': '中国网络技术挑战赛',
      'Third Prize, South China Regional Competition.': '华南赛区三等奖。',
      'China Robot and Artificial Intelligence Competition': '中国机器人及人工智能大赛',
      'Track:': '赛道：',
      'Artificial Intelligence Innovation.': '人工智能创新。',
      'Third Prize, National Competition.': '全国赛三等奖。',
      'Outstanding Student Scholarship, Guangdong University of Technology': '广东工业大学优秀学生奖学金',
      'Third-Class Scholarship.': '三等奖学金。',
      'Second-Class Scholarship.': '二等奖学金。',
      'Student Innovation Award, Guangdong University of Technology': '广东工业大学学生创新奖',
      'Student Innovation Award.': '学生创新奖。',
      'Outstanding Student Cadre, Guangdong University of Technology': '广东工业大学优秀学生干部',
      'Outstanding Student Cadre.': '优秀学生干部。',
      'Academic Progress Award, Guangdong University of Technology': '广东工业大学学业进步奖',
      'Academic Progress Award.': '学业进步奖。',
      'Advanced Class Collective, Guangdong University of Technology': '广东工业大学先进班集体（代表）',
      'Advanced Class Collective.': '先进班集体。',
      'Outstanding Class Monitor and Student Cadre, Guangdong University of Technology': '广东工业大学优秀班长与优秀学生干部',
      'Honor:': '荣誉：',
      'Outstanding Class Monitor and Outstanding Student Cadre.': '优秀班长与优秀学生干部。',
      'First-Class Scholarship.': '一等奖学金。',
      'Representative.': '代表。',
      'Year: 2024.': '年份：2024。',
      'Year: 2025.': '年份：2025。',
      'Year: 2026.': '年份：2026。',
      'Academic Year: 2023-2024.': '学年：2023-2024。',
      'Academic Year: 2024-2025.': '学年：2024-2025。',
      'Academic Year: 2025-2026.': '学年：2025-2026。',
      'Open Original Certificate': '打开原始证书',
      'This recognition highlights leadership, student service, and academic performance at Guangdong University of Technology.': '该荣誉体现了在广东工业大学的班级组织、学生服务与学业表现。',
      'This resume-listed competition result strengthens the engineering implementation and network-technology profile of the academic homepage.': '该简历竞赛成果强化了学术主页中的工程实现与网络技术能力画像。',
      'This university-level scholarship recognizes outstanding academic performance at Guangdong University of Technology.': '该校级奖学金表彰在广东工业大学的优秀学业表现。',
      'This university-level award recognizes student innovation work at Guangdong University of Technology.': '该校级奖项表彰在广东工业大学的学生创新工作。',
      'This university-level honor recognizes student leadership and service at Guangdong University of Technology.': '该校级荣誉表彰在广东工业大学的学生工作与服务。',
      'This university-level award recognizes academic progress at Guangdong University of Technology.': '该校级奖项表彰在广东工业大学的学业进步。',
      'This recognition records class-level collective honor with ChengLang Rong listed as representative.': '该记录展示班级集体荣誉，容程朗为代表。',

      'Academic Background': '学术背景',
      'Undergraduate study centered on artificial intelligence, with coursework spanning machine learning, optimization, systems, and semiconductor manufacturing processes.': '本科阶段围绕人工智能学习，课程覆盖机器学习、优化、系统与半导体制造工艺。',
      'Education Timeline': '教育时间线',
      'Artificial Intelligence Innovation Class (B.Eng.)': '人工智能创新班（工学学士）',
      '2023-2027, School of Computer Science.': '2023-2027，计算机学院。',
      'GPA': 'GPA',
      '3.623 / 5.0.': '3.623 / 5.0。',
      'Major Rank': '专业排名',
      '6 / 36 in the Artificial Intelligence Innovation Class.': '人工智能创新班 6 / 36。',
      'English Proficiency': '英语水平',
      'CET-4: 465; CET-6: 466.': 'CET-4：465；CET-6：466。',
      'Research Preparation': '研究准备',
      'Core foundation:': '核心基础：',
      'data structures, algorithms, operating systems, computer networks, databases, and software engineering.': '数据结构、算法、操作系统、计算机网络、数据库与软件工程。',
      'Artificial Intelligence foundation:': '人工智能基础：',
      'machine learning, deep learning, reinforcement learning, NLP, knowledge engineering, and high-performance computing.': '机器学习、深度学习、强化学习、自然语言处理、知识工程与高性能计算。',
      'Mathematical foundation:': '数学基础：',
      'numerical analysis, discrete mathematics, linear algebra, and optimization methods.': '数值分析、离散数学、线性代数与优化方法。',
      'Engineering domain:': '工程领域：',
      'semiconductor manufacturing processes and equipment, including coursework with a recorded score of 100.': '半导体制造工艺与设备，其中相关课程成绩为 100。',
      'Coursework': '课程',
      'Major Courses': '主要课程',
      'Introduction to Artificial Intelligence': '人工智能导论',
      'Machine Learning': '机器学习',
      'Deep Learning': '深度学习',
      'Data Structures and Algorithms': '数据结构与算法',
      'Computer Networks': '计算机网络',
      'Operating Systems': '操作系统',
      'Computer Organization': '计算机组成原理',
      'Engineering Mathematical Analysis': '工程数学分析',
      'Linear Algebra': '线性代数',
      'Numerical Analysis (98)': '数值分析（98）',
      'Discrete Mathematics (97)': '离散数学（97）',
      'Software Engineering': '软件工程',
      'Programming': '程序设计',
      'Database Systems (95)': '数据库系统（95）',
      'Digital Logic and System Design': '数字逻辑与系统设计',
      'Optimization Methods (94)': '优化方法（94）',
      'Linux Technologies': 'Linux 技术',
      'Big Data Principles and Applications': '大数据原理与应用',
      'Compiler Principles': '编译原理',
      'Natural Language Processing': '自然语言处理',
      'High-Performance Computing': '高性能计算',
      'Knowledge Engineering and Knowledge Graphs (94)': '知识工程与知识图谱（94）',
      'Semiconductor Manufacturing Processes and Equipment (100)': '半导体制造工艺与设备（100）',

      'Academic Contact': '学术联系',
      'Contact information for academic communication on Artificial Intelligence, reinforcement learning, and engineering optimization.': '用于人工智能、强化学习与工程优化学术交流的联系方式。',
      'Email and Phone': '邮箱与电话',
      'Copy Contact Info': '复制联系方式',
      'Profiles': '个人链接',
      'Links': '链接',
      'University': '学校',
      'School:': '学院：',
      'School of Computer Science.': '计算机学院。',
      'Program:': '专业：',
      'Artificial Intelligence Innovation Class, B.Eng.': '人工智能创新班，工学学士。',
      'Research Direction:': '研究方向：',
      'Artificial Intelligence-centered reinforcement learning and optimization for engineering systems.': '以人工智能为中心的强化学习与工程系统优化。',

      'Copied': '已复制',
      'Manual Copy': '请手动复制',
      'Portrait of ChengLang Rong': '容程朗肖像',
      "QR code linking to ChengLang Rong's academic homepage": '指向容程朗学术主页的二维码',
      'Single-cluster tool 3D demonstration': '单集群设备 3D 演示',
      'Continuous multicluster tool scheduling demonstration': '连续多集群设备调度演示',
      'Close-up scheduling detail demonstration': '调度细节特写演示',
      'Certificate preview for China Undergraduate Mathematical Contest in Modeling': '全国大学生数学建模竞赛证书预览',
      'Certificate preview for National Mathematics Competition for College Students': '全国大学生数学竞赛证书预览',
      'Certificate preview for China Robot and Artificial Intelligence Competition': '中国机器人及人工智能大赛证书预览',
      'Certificate preview for the 2023-2024 scholarship': '2023-2024 学年奖学金证书预览',
      'Certificate preview for the 2024-2025 scholarship': '2024-2025 学年奖学金证书预览',
    },
  };

  const navLinks = document.querySelectorAll('[data-nav-page]');
  const revealItems = document.querySelectorAll('.reveal');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const detailModal = document.getElementById('detail-modal');
  const detailModalTitle = document.getElementById('detail-modal-title');
  const detailModalBody = document.getElementById('detail-modal-body');
  const detailModalClose = document.getElementById('detail-modal-close');
  const modalButtons = document.querySelectorAll('[data-modal-button]');
  const copyButtons = document.querySelectorAll('[data-copy-text]');
  const qrEntryButton = document.getElementById('qr-entry-button');
  const qrEntryDialog = document.getElementById('qr-entry-dialog');
  const qrCloseButtons = document.querySelectorAll('[data-qr-close]');
  let currentLanguage = getInitialLanguage();
  let languageToggle = null;
  let lastModalTrigger = null;

  copyButtons.forEach((button) => {
    button.dataset.originalHtml = button.innerHTML;
  });

  function getInitialLanguage() {
    try {
      const storedLanguage = window.localStorage.getItem(languageKey);
      if (storedLanguage === 'zh' || storedLanguage === 'en') {
        return storedLanguage;
      }
    } catch (error) {
      return 'en';
    }
    return 'en';
  }

  function saveLanguage(language) {
    try {
      window.localStorage.setItem(languageKey, language);
    } catch (error) {
      // Local files or strict privacy settings can block storage.
    }
  }

  function t(text, language = currentLanguage) {
    if (language !== 'zh') {
      return text;
    }
    return translations.zh[text] || text;
  }

  function menuButtonLabel(expanded, language) {
    if (language === 'zh') {
      return expanded ? '关闭菜单' : '打开菜单';
    }
    return expanded ? 'Close menu' : 'Open menu';
  }

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    if (!parent) {
      return true;
    }
    return Boolean(parent.closest('script, style, noscript, template, [data-no-translate]'));
  }

  function translateTextNodes(root, language) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return shouldSkipTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    let node = walker.nextNode();
    while (node) {
      if (!originalTextNodes.has(node)) {
        originalTextNodes.set(node, node.nodeValue);
      }
      const original = originalTextNodes.get(node);
      const trimmed = original.trim();
      if (trimmed) {
        const leading = original.match(/^\s*/)[0];
        const trailing = original.match(/\s*$/)[0];
        node.nodeValue = `${leading}${t(trimmed, language)}${trailing}`;
      }
      node = walker.nextNode();
    }
  }

  function getElements(root) {
    if (root.nodeType !== Node.ELEMENT_NODE) {
      return [];
    }
    return [root, ...root.querySelectorAll('*')];
  }

  function getOriginalAttribute(element, attributeName) {
    let storedAttributes = originalAttributes.get(element);
    if (!storedAttributes) {
      storedAttributes = {};
      originalAttributes.set(element, storedAttributes);
    }
    if (!(attributeName in storedAttributes)) {
      storedAttributes[attributeName] = element.getAttribute(attributeName);
    }
    return storedAttributes[attributeName];
  }

  function translateAttributes(root, language) {
    getElements(root).forEach((element) => {
      if (element.closest('script, style, noscript, template, [data-no-translate]')) {
        return;
      }
      translatableAttributes.forEach((attributeName) => {
        if (!element.hasAttribute(attributeName)) {
          return;
        }
        const original = getOriginalAttribute(element, attributeName);
        if (original) {
          element.setAttribute(attributeName, t(original, language));
        }
      });
    });
  }

  function translateContainer(root, language) {
    translateTextNodes(root, language);
    translateAttributes(root, language);
  }

  function updateLanguageToggle(language) {
    if (!languageToggle) {
      return;
    }
    const label = language === 'zh' ? 'English' : '中文';
    const ariaLabel = language === 'zh' ? '切换到英文' : 'Switch to Chinese';
    languageToggle.innerHTML = `<i class="fa fa-language" aria-hidden="true"></i><span>${label}</span>`;
    languageToggle.setAttribute('aria-label', ariaLabel);
    languageToggle.setAttribute('aria-pressed', String(language === 'zh'));
  }

  function applyLanguage(language) {
    currentLanguage = language;
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    body.dataset.lang = language;
    document.title = pageTitles[language][currentPage] || pageTitles[language].home;
    translateContainer(body, language);
    updateLanguageToggle(language);
    if (mobileMenuButton) {
      const expanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      mobileMenuButton.setAttribute('aria-label', menuButtonLabel(expanded, language));
    }
  }

  function createLanguageToggle() {
    const navShell = document.querySelector('.nav-shell');
    const brand = document.querySelector('.brand');
    if (!navShell || !brand || document.querySelector('.language-toggle')) {
      return document.querySelector('.language-toggle');
    }
    const button = document.createElement('button');
    button.className = 'language-toggle';
    button.type = 'button';
    button.dataset.noTranslate = 'true';
    button.addEventListener('click', () => {
      const nextLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
      saveLanguage(nextLanguage);
      applyLanguage(nextLanguage);
    });
    navShell.insertBefore(button, brand);
    return button;
  }

  navLinks.forEach((link) => {
    const isActive = link.dataset.navPage === currentPage;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    }
  });

  languageToggle = createLanguageToggle();
  applyLanguage(currentLanguage);

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      const expanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      mobileMenuButton.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.hidden = expanded;
      mobileMenuButton.setAttribute('aria-label', menuButtonLabel(!expanded, currentLanguage));
    });
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const setModalLock = () => {
    if (detailModal) {
      body.classList.toggle('modal-open', !detailModal.hidden);
    }
  };

  const closeModal = () => {
    if (detailModal && detailModalBody) {
      detailModal.hidden = true;
      detailModalBody.innerHTML = '';
      setModalLock();
      if (lastModalTrigger) {
        lastModalTrigger.focus();
      }
    }
  };

  if (detailModal && detailModalTitle && detailModalBody) {
    modalButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const template = document.getElementById(button.dataset.template || '');
        lastModalTrigger = button;
        detailModalTitle.textContent = button.dataset.title || t('Detail');
        detailModalBody.innerHTML = template ? template.innerHTML : '';
        translateContainer(detailModalBody, currentLanguage);
        detailModal.hidden = false;
        setModalLock();
        if (detailModalClose) {
          detailModalClose.focus();
        }
      });
    });

    if (detailModalClose) {
      detailModalClose.addEventListener('click', closeModal);
    }

    detailModal.addEventListener('click', (event) => {
      if (event.target === detailModal || event.target.classList.contains('modal-backdrop')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && detailModal && !detailModal.hidden) {
        closeModal();
      }
    });
  }

  if (qrEntryButton && qrEntryDialog) {
    const closeQrDialog = () => {
      if (qrEntryDialog.open) {
        qrEntryDialog.close();
      }
    };

    qrEntryButton.addEventListener('click', () => {
      qrEntryDialog.showModal();
      qrEntryButton.setAttribute('aria-expanded', 'true');
      body.classList.add('modal-open');
    });

    qrCloseButtons.forEach((button) => {
      button.addEventListener('click', closeQrDialog);
    });

    qrEntryDialog.addEventListener('click', (event) => {
      if (event.target === qrEntryDialog) {
        closeQrDialog();
      }
    });

    qrEntryDialog.addEventListener('close', () => {
      qrEntryButton.setAttribute('aria-expanded', 'false');
      body.classList.remove('modal-open');
      qrEntryButton.focus();
    });
  }

  copyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const originalContent = button.dataset.originalHtml || button.innerHTML;
      const text = button.dataset.copyText || '';
      const copyWithTextarea = () => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        let copied = false;
        try {
          copied = document.execCommand('copy');
        } catch (error) {
          copied = false;
        }
        textarea.remove();
        return copied;
      };

      let copied = false;
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          copied = true;
        } catch (error) {
          copied = copyWithTextarea();
        }
      } else {
        copied = copyWithTextarea();
      }

      button.textContent = copied ? t('Copied') : t('Manual Copy');
      window.setTimeout(() => {
        button.innerHTML = originalContent;
        translateContainer(button, currentLanguage);
      }, 1600);
    });
  });
});
