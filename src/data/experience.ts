export type ExperienceTag = 'AGENTIC' | 'CRAFT' | 'INFRA';

export type Experience = {
  yr: string;
  role: string;
  co: string;
  loc: string;
  tags: readonly ExperienceTag[];
  bullets: readonly string[];
};

export const experience: readonly Experience[] = [
  {
    yr: "'22 – CURRENT",
    role: 'Software Engineer',
    co: 'TOMTEC Imaging Systems GmbH',
    loc: 'Unterschleißheim, Germany',
    tags: ['AGENTIC', 'CRAFT', 'INFRA'],
    bullets: [
      'Built AI chatbot prototypes on OpenAI and Anthropic Claude with LangChain, routing through RAG pipelines over internal Confluence datasets.',
      'Shipped a custom MCP server (LangChain + ChromaDB) for context ingestion, vector search, and query routing.',
      'Designed a spec-driven approach where LLMs read system requirements and emit Selenium + unit test scripts.',
      'Refactored a legacy Java + Angular monolith into modular services, strengthening CI/CD and Karma / Selenium coverage.',
      'Migrated reporting from Wicket to React inside Philips HSDP, with OpenAPI-generated REST APIs across cloud-based services.',
    ],
  },
  {
    yr: "'21 – '22",
    role: 'Web Developer',
    co: 'Ningbo Turing Singularity Intelligent Technology',
    loc: 'Ningbo, China',
    tags: ['CRAFT', 'INFRA'],
    bullets: [
      'Built React + Node applications deployed on AWS ECS; paired with designers on responsive dashboards.',
      'Integrated Ethereum smart contracts (Solidity) for decentralized identity verification and secure data workflows.',
      'Set up GitHub Actions CI/CD pipelines; ran internal training sessions to lift release quality.',
      'Acted as the main point of contact with stakeholders — translated technical constraints into product decisions and gathered first-hand user feedback.',
    ],
  },
  {
    yr: "'20 – '21",
    role: 'Front-end Developer',
    co: 'Ningbo Jetron Technology',
    loc: 'Ningbo, China',
    tags: ['CRAFT'],
    bullets: [
      'Built Vue.js + ElementUI / Vant frontends for MOM and MES enterprise systems.',
      'Led UI integration for shipment and inventory tracking flows.',
      'Joined API design reviews; aligned frontend and backend on data handling and validation.',
    ],
  },
] as const;
