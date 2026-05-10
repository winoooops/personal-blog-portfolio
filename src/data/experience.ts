export type ExperienceTag = 'AGENTIC' | 'CRAFT' | 'INFRA';

export type Experience = {
  yr: string;
  role: string;
  co: string;
  loc: string;
  tags: readonly ExperienceTag[];
  body: string;
};

export const experience: readonly Experience[] = [
  {
    yr: "'22 – CURRENT",
    role: 'Software Engineer',
    co: 'TOMTEC Imaging Systems GmbH',
    loc: 'Unterschleißheim, Germany',
    tags: ['AGENTIC', 'CRAFT', 'INFRA'],
    body:
      'AI chatbot prototypes on OpenAI and Anthropic Claude with LangChain and RAG pipelines over internal Confluence datasets. Custom MCP server (LangChain + ChromaDB) for context ingestion, vector search, and query routing. Spec-driven approach with LLM-generated Selenium + unit tests. Refactored a legacy Java / Angular monolith into modular services with strengthened CI/CD. Migrated reporting from Wicket to React inside Philips HSDP, contributing to backend REST API design with OpenAPI auto-generation.',
  },
  {
    yr: "'21 – '22",
    role: 'Web Developer',
    co: 'Ningbo Turing Singularity Intelligent Technology',
    loc: 'Ningbo, China',
    tags: ['CRAFT', 'INFRA'],
    body:
      'React + Node applications deployed on AWS ECS, paired with designers on responsive dashboards. Ethereum smart contracts in Solidity for decentralized identity verification and secure data workflows. Established GitHub Actions CI/CD pipelines and ran internal training. Main point of contact with stakeholders — translating technical constraints into product decisions.',
  },
  {
    yr: "'20 – '21",
    role: 'Front-end Developer',
    co: 'Ningbo Jetron Technology',
    loc: 'Ningbo, China',
    tags: ['CRAFT'],
    body:
      'Vue.js + ElementUI / Vant for MOM and MES enterprise systems. Led UI integration for shipment and inventory tracking. Participated in API design reviews and contributed to frontend-backend alignment on data handling and validation.',
  },
] as const;
