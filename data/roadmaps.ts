export interface Topic {
  id: string;
  label: string;
  completed?: boolean;
}

export interface Resource {
  title: string;
  url: string;
  type: 'youtube' | 'docs' | 'roadmap' | 'other';
}

export interface RoadmapPhase {
  id: string;
  title: string;
  duration: string;
  topics: Topic[];
  languages: string[];
  projectIdea: string;
  resources: Resource[];
  interconnects: string[]; // IDs of phases in other roadmaps this connects to
  trackChoices?: {
    [trackName: string]: {
      title: string;
      topics: Topic[];
      projectIdea: string;
      resources: Resource[];
    };
  };
}

export interface RoadmapData {
  id: string;
  title: string;
  slug: string;
  color: string;
  path: string[];
  phases: RoadmapPhase[];
  interconnectionNote: string;
}

export const ROADMAPS_DATA: Record<string, RoadmapData> = {
  aiml: {
    id: "aiml",
    title: "AI / ML Engineer",
    slug: "aiml",
    color: "#7F77DD", // Purple
    path: ["Complete Beginner", "Junior ML Engineer", "Mid-level", "Senior/Research"],
    interconnectionNote: "This roadmap uses Web Dev skills at Phase 2 (FastAPI deployment) and DevOps skills at Phase 3 (MLOps track).",
    phases: [
      {
        id: "aiml-0",
        title: "Phase 0 — Foundation",
        duration: "6–8 weeks",
        languages: ["Python", "SQL", "Bash"],
        projectIdea: "Analyze a Kaggle dataset, visualize trends, write a summary report.",
        interconnects: ["webdev-0", "devops-0"], // Connects to HTML/CSS basics & Linux/Networking basics
        topics: [
          { id: "aiml-0-t1", label: "Python Basics (Variables, Loops, Functions, Data Structures)" },
          { id: "aiml-0-t2", label: "NumPy for Array Manipulation & Vectorized Operations" },
          { id: "aiml-0-t3", label: "Pandas for Data Loading, Cleaning & Aggregation" },
          { id: "aiml-0-t4", label: "Matplotlib & Seaborn for Data Visualization" },
          { id: "aiml-0-t5", label: "Git & GitHub Version Control Essentials" },
          { id: "aiml-0-t6", label: "Linux Basics & Command Line Navigation" },
          { id: "aiml-0-t7", label: "SQL Queries (SELECT, JOINs, Group By, Subqueries)" }
        ],
        resources: [
          { title: "Python for Beginners (YouTube)", url: "https://www.youtube.com/watch?v=kqtD5dpn9C8", type: "youtube" },
          { title: "Pandas & NumPy Docs", url: "https://pandas.pydata.org/docs/", type: "docs" },
          { title: "Kaggle Learning Platform", url: "https://www.kaggle.com/learn", type: "roadmap" }
        ]
      },
      {
        id: "aiml-1",
        title: "Phase 1 — Core ML",
        duration: "8–10 weeks",
        languages: ["Python", "SQL"],
        projectIdea: "House price predictor using linear regression on a real dataset.",
        interconnects: [],
        topics: [
          { id: "aiml-1-t1", label: "Descriptive & Inferential Statistics & Probability theory" },
          { id: "aiml-1-t2", label: "Scikit-learn fundamentals & model workflow" },
          { id: "aiml-1-t3", label: "Regression models (Linear, Ridge, Lasso)" },
          { id: "aiml-1-t4", label: "Classification models (Logistic Regression, Decision Trees, Random Forest, SVM)" },
          { id: "aiml-1-t5", label: "Clustering Algorithms (K-Means, Hierarchical, DBSCAN)" },
          { id: "aiml-1-t6", label: "Model Evaluation (Cross-Validation, Precision, Recall, F1, ROC-AUC)" },
          { id: "aiml-1-t7", label: "Feature Engineering & Dimensionality Reduction (PCA)" },
          { id: "aiml-1-t8", label: "Jupyter Notebooks best practices for EDA" }
        ],
        resources: [
          { title: "StatQuest: Machine Learning (YouTube)", url: "https://www.youtube.com/watch?v=qbig3Hn8N9c", type: "youtube" },
          { title: "Scikit-Learn Getting Started Guide", url: "https://scikit-learn.org/stable/getting_started.html", type: "docs" },
          { title: "Intro to Statistical Learning (Book)", url: "https://www.statlearning.com/", type: "other" }
        ]
      },
      {
        id: "aiml-2",
        title: "Phase 2 — Deep Learning",
        duration: "10–12 weeks",
        languages: ["Python"],
        projectIdea: "Image classifier (cats vs dogs) deployed as a REST API using FastAPI.",
        interconnects: ["webdev-3"], // Connects to Web Dev Backend & Databases (REST API design)
        topics: [
          { id: "aiml-2-t1", label: "Neural Network Foundations & Activation Functions" },
          { id: "aiml-2-t2", label: "Backpropagation & Gradient Descent optimization algorithms" },
          { id: "aiml-2-t3", label: "PyTorch or TensorFlow architecture and Tensor operations" },
          { id: "aiml-2-t4", label: "Convolutional Neural Networks (CNNs) for image processing" },
          { id: "aiml-2-t5", label: "Recurrent Neural Networks (RNNs) & LSTMs for sequential data" },
          { id: "aiml-2-t6", label: "Transfer Learning using Pretrained Models" },
          { id: "aiml-2-t7", label: "Model Deployment basics with FastAPI & API design" }
        ],
        resources: [
          { title: "PyTorch Tutorials", url: "https://pytorch.org/tutorials/", type: "docs" },
          { title: "FastAPI Tutorial", url: "https://fastapi.tiangolo.com/tutorial/", type: "docs" },
          { title: "Deep Learning Specialization (Coursera)", url: "https://www.coursera.org/specializations/deep-learning", type: "other" }
        ]
      },
      {
        id: "aiml-3",
        title: "Phase 3 — Specialization",
        duration: "8–10 weeks",
        languages: ["Python", "Bash", "SQL"],
        projectIdea: "Select a track: Build a RAG Chatbot (Track A) OR Real-time Object Detector (Track B) OR full MLOps pipeline for a model (Track C).",
        interconnects: ["devops-2", "devops-3"], // Connects to Containers & Orchestration / Cloud
        topics: [
          { id: "aiml-3-t1", label: "Select a track to complete: Track A (NLP), Track B (CV), or Track C (MLOps)" }
        ],
        trackChoices: {
          nlp: {
            title: "Track A — Natural Language Processing",
            topics: [
              { id: "aiml-3-nlp-t1", label: "Transformers Architecture & Self-Attention" },
              { id: "aiml-3-nlp-t2", label: "HuggingFace Ecosystem (Transformers, Datasets, Hub)" },
              { id: "aiml-3-nlp-t3", label: "Large Language Models (LLMs) & Prompt Engineering" },
              { id: "aiml-3-nlp-t4", label: "Retrieval-Augmented Generation (RAG) & Vector DBs" },
              { id: "aiml-3-nlp-t5", label: "Model Fine-Tuning (LoRA, QLoRA, PEFT)" },
              { id: "aiml-3-nlp-t6", label: "LangChain or LlamaIndex frameworks" }
            ],
            projectIdea: "Build a RAG chatbot on your own documents using LangChain and a local LLM.",
            resources: [
              { title: "Hugging Face Course", url: "https://huggingface.co/learn", type: "docs" },
              { title: "LangChain Documentation", url: "https://python.langchain.com/docs/get_started/introduction", type: "docs" }
            ]
          },
          cv: {
            title: "Track B — Computer Vision",
            topics: [
              { id: "aiml-3-cv-t1", label: "Image processing operations using OpenCV" },
              { id: "aiml-3-cv-t2", label: "Object Detection algorithms (YOLO v8/v10, SSD)" },
              { id: "aiml-3-cv-t3", label: "Image Segmentation (U-Net, Mask R-CNN)" },
              { id: "aiml-3-cv-t4", label: "Keypoint detection & Pose Estimation" },
              { id: "aiml-3-cv-t5", label: "Feature Extraction & Matching (SIFT, ORB)" }
            ],
            projectIdea: "Build a real-time object detector that counts specific items using OpenCV and YOLO.",
            resources: [
              { title: "OpenCV Tutorials", url: "https://docs.opencv.org/4.x/d9/df8/tutorial_root.html", type: "docs" },
              { title: "Ultralytics YOLO Docs", url: "https://docs.ultralytics.com/", type: "docs" }
            ]
          },
          mlops: {
            title: "Track C — MLOps",
            topics: [
              { id: "aiml-3-ops-t1", label: "Dockerizing Machine Learning model environments" },
              { id: "aiml-3-ops-t2", label: "Model Tracking & Registries with MLflow or W&B" },
              { id: "aiml-3-ops-t3", label: "Data Versioning with DVC (Data Version Control)" },
              { id: "aiml-3-ops-t4", label: "Model Monitoring (Data Drift, Concept Drift, EvidentlyAI)" },
              { id: "aiml-3-ops-t5", label: "CI/CD Pipelines for Machine Learning (GitHub Actions)" },
              { id: "aiml-3-ops-t6", label: "Cloud Model Deployments (AWS Sagemaker / GCP VertexAI)" }
            ],
            projectIdea: "Build a full MLOps pipeline that automatically retrains, tests, and redeploys a model on new data.",
            resources: [
              { title: "MLOps Zoomcamp Course", url: "https://github.com/DataTalksClub/mlops-zoomcamp", type: "other" },
              { title: "MLflow Documentation", url: "https://mlflow.org/docs/latest/index.html", type: "docs" }
            ]
          }
        },
        resources: [
          { title: "Hugging Face Course", url: "https://huggingface.co/learn", type: "docs" },
          { title: "MLOps Guide", url: "https://mlops-guide.org/", type: "roadmap" }
        ]
      },
      {
        id: "aiml-4",
        title: "Phase 4 — Production & Research",
        duration: "6–8 weeks",
        languages: ["Python", "Bash"],
        projectIdea: "Reproduce a recent ArXiv paper, publish results and code on GitHub.",
        interconnects: ["devops-4"], // Connects to DevOps Observability
        topics: [
          { id: "aiml-4-t1", label: "System design for ML at scale (distributed inference/training)" },
          { id: "aiml-4-t2", label: "A/B Testing & shadow deployments for models" },
          { id: "aiml-4-t3", label: "Distributed Training frameworks (DeepSpeed, PyTorch FSDP)" },
          { id: "aiml-4-t4", label: "Reading and dissecting AI research papers (ArXiv)" },
          { id: "aiml-4-t5", label: "Contributing to open source ML packages" }
        ],
        resources: [
          { title: "Papers with Code", url: "https://paperswithcode.com/", type: "other" },
          { title: "ML System Design Course", url: "https://github.com/chiphuyen/machine-learning-systems-design", type: "other" }
        ]
      }
    ]
  },
  webdev: {
    id: "webdev",
    title: "Web Developer",
    slug: "webdev",
    color: "#378ADD", // Blue
    path: ["Complete Beginner", "Frontend", "Full-Stack", "Senior Engineer"],
    interconnectionNote: "Phase 4 overlaps directly with DevOps Roadmap Phase 0–1. TypeScript used here is also the gateway to understanding Java's type system.",
    phases: [
      {
        id: "webdev-0",
        title: "Phase 0 — Absolute Basics",
        duration: "4 weeks",
        languages: ["HTML", "CSS"],
        projectIdea: "Build your personal portfolio site — fully responsive, 3 pages.",
        interconnects: [],
        topics: [
          { id: "webdev-0-t1", label: "How the Internet Works (DNS, HTTP/S, Client-Server model)" },
          { id: "webdev-0-t2", label: "HTML5 structural elements, semantic tags, and SEO basics" },
          { id: "webdev-0-t3", label: "CSS3 styling, selectors, and values" },
          { id: "webdev-0-t4", label: "Layout models: Flexbox and Grid" },
          { id: "webdev-0-t5", label: "Responsive Web Design & Media Queries" },
          { id: "webdev-0-t6", label: "Browser Developer Tools (Elements panel, Console)" }
        ],
        resources: [
          { title: "HTML/CSS FreeCodeCamp Course", url: "https://www.youtube.com/watch?v=mU6an7qYJ-Y", type: "youtube" },
          { title: "MDN Web Docs: HTML & CSS", url: "https://developer.mozilla.org/", type: "docs" },
          { title: "CSS Tricks Guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", type: "docs" }
        ]
      },
      {
        id: "webdev-1",
        title: "Phase 1 — JavaScript Fundamentals",
        duration: "6 weeks",
        languages: ["JavaScript"],
        projectIdea: "Weather app using OpenWeather API, with search, local storage, and favorites.",
        interconnects: ["aiml-0"], // Connects to AI/ML foundation python coding logic
        topics: [
          { id: "webdev-1-t1", label: "JavaScript syntax, variables, operations, and control structures" },
          { id: "webdev-1-t2", label: "Objects, Arrays, and ES6+ features (destructuring, arrow functions, rest/spread)" },
          { id: "webdev-1-t3", label: "DOM Manipulation (selecting elements, modifying style, event listeners)" },
          { id: "webdev-1-t4", label: "Asynchronous JavaScript: Callback, Promises, Async/Await" },
          { id: "webdev-1-t5", label: "Fetch API & consuming REST endpoints" },
          { id: "webdev-1-t6", label: "Browser storage APIs (localStorage, sessionStorage)" },
          { id: "webdev-1-t7", label: "Error handling (try-catch, console logging)" }
        ],
        resources: [
          { title: "JavaScript.info", url: "https://javascript.info/", type: "docs" },
          { title: "JavaScript Basics (YouTube)", url: "https://www.youtube.com/watch?v=W6NZfCO5SIk", type: "youtube" }
        ]
      },
      {
        id: "webdev-2",
        title: "Phase 2 — Frontend Framework",
        duration: "8 weeks",
        languages: ["JavaScript", "TypeScript"],
        projectIdea: "Multi-page e-commerce storefront with cart, filters, and dark mode.",
        interconnects: [],
        topics: [
          { id: "webdev-2-t1", label: "React basics: Components, Props, State, and Virtual DOM" },
          { id: "webdev-2-t2", label: "React Hooks (useState, useEffect, useContext, useRef, useMemo)" },
          { id: "webdev-2-t3", label: "TypeScript basics (types, interfaces, generics in React)" },
          { id: "webdev-2-t4", label: "React Router or SPA Routing structures" },
          { id: "webdev-2-t5", label: "State Management with Zustand or Redux Toolkit" },
          { id: "webdev-2-t6", label: "Component Libraries (Tailwind CSS, Shadcn UI)" },
          { id: "webdev-2-t7", label: "Next.js core concepts (App Router, Server Components vs Client Components, SSR, ISR)" }
        ],
        resources: [
          { title: "Next.js Official Documentation", url: "https://nextjs.org/docs", type: "docs" },
          { title: "React Hooks Explained", url: "https://react.dev/reference/react/hooks", type: "docs" },
          { title: "TypeScript handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "docs" }
        ]
      },
      {
        id: "webdev-3",
        title: "Phase 3 — Backend & Databases",
        duration: "8 weeks",
        languages: ["JavaScript", "TypeScript", "SQL"],
        projectIdea: "Full-stack blog platform with auth, CRUD posts, and image uploads.",
        interconnects: ["aiml-2"], // Links back to Deep Learning (model APIs)
        topics: [
          { id: "webdev-3-t1", label: "Node.js core runtime architecture & event loop" },
          { id: "webdev-3-t2", label: "Express.js framework, route structures, and middleware" },
          { id: "webdev-3-t3", label: "REST API design specifications (Status codes, HTTP methods, JSON)" },
          { id: "webdev-3-t4", label: "NoSQL DB (MongoDB + Mongoose schemas)" },
          { id: "webdev-3-t5", label: "Relational DB (PostgreSQL + Prisma ORM)" },
          { id: "webdev-3-t6", label: "User authentication & security (JWT, Session cookies, bcrypt)" },
          { id: "webdev-3-t7", label: "File Upload APIs & Cloud integration (Cloudinary/S3)" },
          { id: "webdev-3-t8", label: "API Rate limiting, security headers, & CORS setups" }
        ],
        resources: [
          { title: "Node.js Complete Guide (YouTube)", url: "https://www.youtube.com/watch?v=TbMJC_T76b8", type: "youtube" },
          { title: "Prisma ORM Getting Started", url: "https://www.prisma.io/docs/getting-started", type: "docs" },
          { title: "MongoDB University", url: "https://learn.mongodb.com/", type: "roadmap" }
        ]
      },
      {
        id: "webdev-4",
        title: "Phase 4 — DevOps Basics for Web Devs",
        duration: "4 weeks",
        languages: ["Bash"],
        projectIdea: "Deploy your Phase 3 project with an automated CI/CD pipeline.",
        interconnects: ["devops-1", "devops-2"], // Connects to Version Control & Containers
        topics: [
          { id: "webdev-4-t1", label: "Advanced Git branching, rebasing, pull request workflow" },
          { id: "webdev-4-t2", label: "Docker basics: writing Dockerfiles for React/Node projects" },
          { id: "webdev-4-t3", label: "GitHub Actions configurations for auto linting and testing" },
          { id: "webdev-4-t4", label: "Deploying frontend to Vercel/Netlify & backend to Railway/Render" },
          { id: "webdev-4-t5", label: "Environment variable configuration and management (.env)" },
          { id: "webdev-4-t6", label: "Basic error logging and server monitoring" }
        ],
        resources: [
          { title: "Docker Course for Beginners", url: "https://www.youtube.com/watch?v=3c-iKanevrA", type: "youtube" },
          { title: "GitHub Actions Tutorials", url: "https://docs.github.com/en/actions", type: "docs" }
        ]
      },
      {
        id: "webdev-5",
        title: "Phase 5 — Senior Skills",
        duration: "Ongoing",
        languages: ["JavaScript", "TypeScript"],
        projectIdea: "Design and build a scalable URL shortener with analytics dashboard, Redis cache, and DB replication.",
        interconnects: ["devops-4", "devops-5"], // Connects to Observability & Platform Eng
        topics: [
          { id: "webdev-5-t1", label: "System Design: horizontal scaling, load balancers, DB replication" },
          { id: "webdev-5-t2", label: "Caching layer strategies using Redis" },
          { id: "webdev-5-t3", label: "Message Queues for background jobs (BullMQ, RabbitMQ)" },
          { id: "webdev-5-t4", label: "Microservices architecture fundamentals & API Gateways" },
          { id: "webdev-5-t5", label: "Web Security principles (OWASP Top 10 vulnerabilities)" },
          { id: "webdev-5-t6", label: "Advanced performance optimization (Lighthouse, Core Web Vitals)" },
          { id: "webdev-5-t7", label: "Accessibility (a11y) standards (WCAG guidelines)" }
        ],
        resources: [
          { title: "ByteByteGo System Design", url: "https://bytebytego.com/", type: "roadmap" },
          { title: "Redis University", url: "https://university.redis.io/", type: "roadmap" }
        ]
      }
    ]
  },
  devops: {
    id: "devops",
    title: "DevOps / Cloud Engineer",
    slug: "devops",
    color: "#1D9E75", // Teal
    path: ["Complete Beginner", "Junior DevOps", "Cloud Engineer", "Platform Engineer"],
    interconnectionNote: "DevOps Phase 2–3 is required for AI/ML Roadmap Phase 3 MLOps track. Python scripting from AI/ML roadmap transfers directly to Phase 3 Lambda functions.",
    phases: [
      {
        id: "devops-0",
        title: "Phase 0 — Linux & Networking Basics",
        duration: "4–6 weeks",
        languages: ["Bash"],
        projectIdea: "Automate a local backup system using shell scripts and cron jobs.",
        interconnects: ["aiml-0", "webdev-1"], // Connects to Python scripting basics
        topics: [
          { id: "devops-0-t1", label: "Linux Command Line: navigating files, directories, text streams" },
          { id: "devops-0-t2", label: "Linux file system permissions, user/group management" },
          { id: "devops-0-t3", label: "Process control commands (ps, top, kill, systemctl)" },
          { id: "devops-0-t4", label: "Networking layers: TCP/IP, DNS routing, HTTP/S protocols, ports" },
          { id: "devops-0-t5", label: "SSH Key generation, configurations, and remote login" },
          { id: "devops-0-t6", label: "Bash Scripting foundations (variables, loops, conditional arguments)" },
          { id: "devops-0-t7", label: "Automation task schedulers (cron jobs)" }
        ],
        resources: [
          { title: "Linux CLI Survival Guide (YouTube)", url: "https://www.youtube.com/watch?v=yvkqM31v7s4", type: "youtube" },
          { title: "Bash Scripting for Beginners", url: "https://www.youtube.com/watch?v=e7BufavJHgM", type: "youtube" },
          { title: "Linux Journey tutorial", url: "https://linuxjourney.com/", type: "roadmap" }
        ]
      },
      {
        id: "devops-1",
        title: "Phase 1 — Version Control & CI/CD",
        duration: "4 weeks",
        languages: ["Bash"],
        projectIdea: "CI/CD pipeline for a Node.js app: lint → test → build → deploy.",
        interconnects: ["webdev-4"], // Connects to Web Dev DevOps basics
        topics: [
          { id: "devops-1-t1", label: "Git Advanced: rebasing, cherry-picking, hooks, merge strategies" },
          { id: "devops-1-t2", label: "GitHub Actions workflow syntax, runners, triggers, and secrets" },
          { id: "devops-1-t3", label: "GitLab CI configurations and pipelines" },
          { id: "devops-1-t4", label: "Package and Artifact management (npm, Docker Registry, Nexus)" },
          { id: "devops-1-t5", label: "Environment promotion strategies (dev → staging → prod)" }
        ],
        resources: [
          { title: "Git Advanced Course (YouTube)", url: "https://www.youtube.com/watch?v=ecK3-dH24E0", type: "youtube" },
          { title: "GitHub Actions Docs", url: "https://docs.github.com/en/actions", type: "docs" }
        ]
      },
      {
        id: "devops-2",
        title: "Phase 2 — Containers & Orchestration",
        duration: "8–10 weeks",
        languages: ["Bash"],
        projectIdea: "Dockerize a full-stack app and deploy to a local Kubernetes cluster (Minikube) with ingress and load balancing.",
        interconnects: ["webdev-4", "aiml-3"], // Connects to Web Dev DevOps & AI MLOps
        topics: [
          { id: "devops-2-t1", label: "Docker architecture: images, containers, filesystems, networking" },
          { id: "devops-2-t2", label: "Writing optimized Multi-stage Dockerfiles" },
          { id: "devops-2-t3", label: "Docker Compose for multi-container local setups" },
          { id: "devops-2-t4", label: "Kubernetes core architecture (Control plane, Worker nodes, Kubelet)" },
          { id: "devops-2-t5", label: "K8s resources: Pods, Deployments, Services, Ingress controllers" },
          { id: "devops-2-t6", label: "Package management using Helm charts" },
          { id: "devops-2-t7", label: "Kubernetes namespaces, configmaps, and secrets management" }
        ],
        resources: [
          { title: "TechWorld with Nana: Docker Course", url: "https://www.youtube.com/watch?v=3c-iKanevrA", type: "youtube" },
          { title: "Kubernetes Tutorial for Beginners", url: "https://www.youtube.com/watch?v=X48VuDVv0do", type: "youtube" },
          { title: "Kubernetes Docs", url: "https://kubernetes.io/docs/home/", type: "docs" }
        ]
      },
      {
        id: "devops-3",
        title: "Phase 3 — Cloud (AWS or GCP)",
        duration: "10 weeks",
        languages: ["Python", "Bash"],
        projectIdea: "Provision a production-grade VPC infrastructure with Terraform including web tier, app tier, DB tier, and security groups.",
        interconnects: ["aiml-3"], // Scripting for Lambda functions connects with AI Python
        topics: [
          { id: "devops-3-t1", label: "Core cloud services (EC2 / Compute, S3 / Object Storage, RDS / Databases)" },
          { id: "devops-3-t2", label: "Serverless compute logic (AWS Lambda or Cloud Functions)" },
          { id: "devops-3-t3", label: "Cloud networking (VPCs, Subnets, Route Tables, NAT Gateways)" },
          { id: "devops-3-t4", label: "Identity & Access Management (IAM roles, policies, group privileges)" },
          { id: "devops-3-t5", label: "Infrastructure as Code (IaC) syntax using Terraform" },
          { id: "devops-3-t6", label: "Terraform states, variables, modules, and team sharing backends" },
          { id: "devops-3-t7", label: "Cloud budget alerts and cost optimization principles" }
        ],
        resources: [
          { title: "Terraform Getting Started", url: "https://developer.hashicorp.com/terraform/tutorials", type: "docs" },
          { title: "AWS Solutions Architect Course", url: "https://www.youtube.com/watch?v=Ia-UEYYq44Y", type: "youtube" }
        ]
      },
      {
        id: "devops-4",
        title: "Phase 4 — Observability & SRE",
        duration: "6 weeks",
        languages: ["Python"],
        projectIdea: "Setup a full observability stack (Prometheus & Grafana) monitoring CPU, memory, and API requests of a cloud app.",
        interconnects: ["aiml-4", "webdev-5"], // Connects to ML Production & Web Senior Skills
        topics: [
          { id: "devops-4-t1", label: "Prometheus timeseries DB architecture, scraping, and targets" },
          { id: "devops-4-t2", label: "Grafana dashboards setups, variables, and alerts config" },
          { id: "devops-4-t3", label: "Centralized logging systems (ELK Stack / Loki & Promtail)" },
          { id: "devops-4-t4", label: "Distributed tracing using Jaeger or OpenTelemetry" },
          { id: "devops-4-t5", label: "SRE principles: SLIs, SLOs, SLAs, and error budgets" },
          { id: "devops-4-t6", label: "Incident management: PagerDuty integrations, runbooks, postmortems" },
          { id: "devops-4-t7", label: "Chaos engineering basics (Gremlin, Chaos Mesh)" }
        ],
        resources: [
          { title: "Grafana & Prometheus Course", url: "https://www.youtube.com/watch?v=hA7Im9uH-R8", type: "youtube" },
          { title: "SRE Google E-Book", url: "https://sre.google/sre-book/table-of-contents/", type: "other" }
        ]
      },
      {
        id: "devops-5",
        title: "Phase 5 — Platform Engineering",
        duration: "Ongoing",
        languages: ["Bash", "Python"],
        projectIdea: "GitOps-based deployment pipeline where every git push auto-deploys to a Kubernetes cluster using ArgoCD.",
        interconnects: [],
        topics: [
          { id: "devops-5-t1", label: "Internal Developer Platforms (IDP) concept and tools (Backstage)" },
          { id: "devops-5-t2", label: "GitOps deployment models using ArgoCD or FluxCD" },
          { id: "devops-5-t3", label: "Service Mesh architectures (Istio or Linkerd) for proxy traffic" },
          { id: "devops-5-t4", label: "Secrets management using HashiCorp Vault" },
          { id: "devops-5-t5", label: "Cloud FinOps strategies: measuring and reducing container costs" },
          { id: "devops-5-t6", label: "Multi-cloud Kubernetes cluster management" }
        ],
        resources: [
          { title: "ArgoCD Fundamentals", url: "https://argo-cd.readthedocs.io/en/stable/", type: "docs" },
          { title: "HashiCorp Vault Tutorial", url: "https://developer.hashicorp.com/vault/tutorials", type: "docs" }
        ]
      }
    ]
  }
};
