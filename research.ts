import { and, eq, ilike } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateResearchDocumentBody,
  GetResearchDocumentParams,
  GetResearchDocumentResponse,
  GetResearchGraphQueryParams,
  GetResearchGraphResponse,
  GetResearchOverviewResponse,
  ListResearchActivityResponse,
  ListResearchDocumentsQueryParams,
  ListResearchDocumentsResponse,
  SearchResearchQueryParams,
  SearchResearchResponse,
} from "@workspace/api-zod";
import {
  db,
  researchActivityTable,
  researchDocumentsTable,
} from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

const seedDocuments = [
  {
    id: "doc-neural-fields",
    title: "Neural Fields for Climate Simulation",
    type: "Paper",
    department: "Computer Science",
    authors: ["Maya Patel", "Jon Bell"],
    status: "ready",
    entityCount: 28,
    relationshipCount: 46,
    summary:
      "A method for accelerating regional climate simulation with neural operators and open atmospheric datasets.",
  },
  {
    id: "doc-urban-heat",
    title: "Urban Heat and Housing Inequality",
    type: "Paper",
    department: "Environmental Studies",
    authors: ["Elena Rossi", "Maya Patel"],
    status: "ready",
    entityCount: 34,
    relationshipCount: 61,
    summary:
      "Combines satellite imagery, neighborhood surveys, and causal inference to measure heat exposure across housing types.",
  },
  {
    id: "doc-eco-sensor",
    title: "EcoSense: An Open Sensor Toolkit",
    type: "Code",
    department: "Engineering",
    authors: ["David Okafor", "Priya Shah"],
    status: "ready",
    entityCount: 19,
    relationshipCount: 27,
    summary:
      "A reproducible sensor and data pipeline for collecting high-resolution environmental measurements in the field.",
  },
];

const seedActivity = [
  {
    id: "activity-1",
    type: "ingestion",
    title: "Urban Heat and Housing Inequality",
    detail: "Extraction complete · 34 entities · 61 relationships",
  },
  {
    id: "activity-2",
    type: "connection",
    title: "New cross-department connection",
    detail: "Maya Patel ↔ Environmental Studies",
  },
  {
    id: "activity-3",
    type: "dataset",
    title: "NOAA Climate Data linked",
    detail: "Referenced by 4 documents across 2 departments",
  },
];

const graphNodes = [
  { id: "maya", label: "Maya Patel", kind: "Author", department: "Computer Science", size: 32, x: 50, y: 43 },
  { id: "elena", label: "Elena Rossi", kind: "Author", department: "Environmental Studies", size: 25, x: 25, y: 30 },
  { id: "david", label: "David Okafor", kind: "Author", department: "Engineering", size: 22, x: 76, y: 28 },
  { id: "neural", label: "Neural operators", kind: "Method", department: "Computer Science", size: 24, x: 48, y: 20 },
  { id: "climate", label: "Climate simulation", kind: "Topic", department: "Environmental Studies", size: 26, x: 29, y: 57 },
  { id: "noaa", label: "NOAA Climate Data", kind: "Dataset", department: "Environmental Studies", size: 20, x: 68, y: 62 },
  { id: "sensor", label: "EcoSense toolkit", kind: "Code", department: "Engineering", size: 18, x: 84, y: 50 },
];

const graphEdges = [
  { id: "edge-1", source: "maya", target: "neural", label: "authored", strength: 0.92 },
  { id: "edge-2", source: "maya", target: "elena", label: "collaborates", strength: 0.78 },
  { id: "edge-3", source: "maya", target: "climate", label: "studies", strength: 0.68 },
  { id: "edge-4", source: "elena", target: "noaa", label: "uses", strength: 0.87 },
  { id: "edge-5", source: "neural", target: "climate", label: "overlaps", strength: 0.64 },
  { id: "edge-6", source: "david", target: "sensor", label: "maintains", strength: 0.94 },
  { id: "edge-7", source: "sensor", target: "noaa", label: "feeds", strength: 0.52 },
];

const graphInsights = [
  "Maya Patel is the strongest bridge between Computer Science and Environmental Studies.",
  "NOAA Climate Data is reused across 4 studies, but metadata is inconsistent in 2.",
  "Neural operators and EcoSense share a reproducibility pattern that has not been cited directly.",
];

async function ensureSeedData(): Promise<void> {
  const existing = await db
    .select({ id: researchDocumentsTable.id })
    .from(researchDocumentsTable)
    .limit(1);
  if (existing.length > 0) return;

  await db.insert(researchDocumentsTable).values(seedDocuments);
  await db.insert(researchActivityTable).values(seedActivity);
}

function toDocumentResponse(document: typeof researchDocumentsTable.$inferSelect) {
  return {
    ...document,
    updatedAt: document.updatedAt.toISOString(),
  };
}

function toActivityResponse(activity: typeof researchActivityTable.$inferSelect) {
  return {
    ...activity,
    timestamp: activity.timestamp.toISOString(),
  };
}

router.get("/overview", requireAuth, async (_req, res): Promise<void> => {
  await ensureSeedData();
  const [documents, activities] = await Promise.all([
    db.select().from(researchDocumentsTable),
    db.select().from(researchActivityTable),
  ]);
  const authorCount = new Set(documents.flatMap((document) => document.authors)).size;
  res.json(
    GetResearchOverviewResponse.parse({
      documents: documents.length,
      entities: documents.reduce((sum, document) => sum + document.entityCount, 0) + 143,
      relationships:
        documents.reduce((sum, document) => sum + document.relationshipCount, 0) + 218,
      activeResearchers: authorCount + 18,
      graphHealth: 94,
      recentActivity: activities.slice(0, 3).map(toActivityResponse),
    }),
  );
});

router.get("/documents", requireAuth, async (req, res): Promise<void> => {
  await ensureSeedData();
  const params = ListResearchDocumentsQueryParams.parse(req.query);
  const conditions = [];
  if (params.query) {
    conditions.push(ilike(researchDocumentsTable.title, `%${params.query}%`));
  }
  if (params.type) conditions.push(eq(researchDocumentsTable.type, params.type));
  if (params.department) {
    conditions.push(eq(researchDocumentsTable.department, params.department));
  }
  const documents = await db
    .select()
    .from(researchDocumentsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(researchDocumentsTable.updatedAt);
  res.json(ListResearchDocumentsResponse.parse(documents.map(toDocumentResponse)));
});

router.post("/documents", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateResearchDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const id = `doc-${crypto.randomUUID()}`;
  const [document] = await db
    .insert(researchDocumentsTable)
    .values({
      id,
      ...parsed.data,
      status: "processing",
      entityCount: 0,
      relationshipCount: 0,
    })
    .returning();
  res.status(201).json(GetResearchDocumentResponse.parse(toDocumentResponse(document)));
});

router.get("/documents/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetResearchDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await ensureSeedData();
  const [document] = await db
    .select()
    .from(researchDocumentsTable)
    .where(eq(researchDocumentsTable.id, params.data.id));
  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  res.json(GetResearchDocumentResponse.parse(toDocumentResponse(document)));
});

router.get("/search", requireAuth, async (req, res): Promise<void> => {
  await ensureSeedData();
  const params = SearchResearchQueryParams.parse(req.query);
  const query = params.q.trim().toLowerCase();
  const documents = await db.select().from(researchDocumentsTable);
  const results = documents
    .filter((document) => !params.department || document.department === params.department)
    .filter((document) => {
      if (!params.scope) return true;
      const scope = params.scope.toLowerCase();
      if (scope === "paper") return document.type.toLowerCase() === "paper";
      return document.type.toLowerCase().includes(scope);
    })
    .map((document) => {
      const haystack = `${document.title} ${document.summary} ${document.department} ${document.authors.join(" ")}`.toLowerCase();
      const match = haystack.includes(query);
      return {
        id: document.id,
        title: document.title,
        kind: document.type,
        department: document.department,
        excerpt: document.summary,
        relevance: match ? 0.96 : 0.71,
        tags: [document.department, document.type, "semantic match"],
        linkedCount: document.relationshipCount,
      };
    })
    .filter((result) => result.relevance > 0.8 || !query)
    .concat(
      query && "climate".includes(query)
        ? [{
            id: "entity-noaa",
            title: "NOAA Climate Data",
            kind: "Dataset",
            department: "Environmental Studies",
            excerpt: "A high-value shared dataset referenced across climate and urban heat research.",
            relevance: 0.89,
            tags: ["Dataset", "shared resource", "4 linked studies"],
            linkedCount: 4,
          }]
        : [],
    );
  res.json(SearchResearchResponse.parse({ query: params.q, total: results.length, results }));
});

router.get("/graph", requireAuth, async (req, res): Promise<void> => {
  const params = GetResearchGraphQueryParams.parse(req.query);
  const focus = params.focus?.toLowerCase();
  const nodes = focus
    ? graphNodes.filter((node) => node.label.toLowerCase().includes(focus) || node.kind.toLowerCase().includes(focus))
    : graphNodes;
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = focus
    ? graphEdges.filter((edge) => nodeIds.has(edge.source) || nodeIds.has(edge.target))
    : graphEdges;
  res.json(GetResearchGraphResponse.parse({ nodes, edges, insights: graphInsights }));
});

router.get("/activity", requireAuth, async (_req, res): Promise<void> => {
  await ensureSeedData();
  const activities = await db
    .select()
    .from(researchActivityTable)
    .orderBy(researchActivityTable.timestamp);
  res.json(ListResearchActivityResponse.parse(activities.map(toActivityResponse)));
});

export default router;
