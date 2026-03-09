// modules/playground/project-manager.ts
import { DBManager, StoreSchema } from '../web-apis/indexed-db-utils';
import type { Content } from '@google/genai';

// --- Types ---
export interface ProjectFile {
    name: string; // Full path, e.g., "src/utils/helper.ts"
    content: string;
    language: 'typescript' | 'javascript' | 'json' | 'markdown' | 'text';
}

export interface PlaygroundProject {
    id: string;
    name: string;
    created: number;
    lastModified: number;
    files: ProjectFile[];
    chatHistory: Content[]; // Stores conversation with AI assistant
    imports: string[]; // List of module names (e.g., "string-utils") used in this project
}

// --- Configuration ---
const DB_NAME = 'ZIKYinc_ModuleReg';
const STORE_NAME = 'Projects';
// Bumping version to 10 to force onupgradeneeded to fire for users with older versions
const DB_VERSION = 10; 

const schema: StoreSchema[] = [
    {
        name: STORE_NAME,
        keyPath: 'id',
        indexes: [
            { name: 'lastModified', keyPath: 'lastModified', options: { unique: false } }
        ]
    }
];

// --- Manager Class ---
class ProjectManager {
    private db: DBManager;
    private initialized: Promise<void>;
    private isReady: boolean = false;

    constructor() {
        this.db = new DBManager(DB_NAME, DB_VERSION);
        this.initialized = this.db.open(schema)
            .then(() => {
                this.isReady = true;
                console.log(`[ProjectManager] DB "${DB_NAME}" (v${DB_VERSION}) initialized successfully.`);
            })
            .catch(err => {
                console.error("[ProjectManager] Failed to initialize Project Database:", err);
            });
    }

    private async ensureInit() {
        if (!this.isReady) {
            await this.initialized;
        }
    }

    private generateId(): string {
        try {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
        } catch (e) {}
        // Secure fallback for non-HTTPS or older browsers
        return 'proj_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
    }

    /**
     * Creates a new project with default template.
     */
    public async createProject(name: string): Promise<PlaygroundProject> {
        console.log(`[ProjectManager] Creating project: ${name}`);
        await this.ensureInit();
        const newProject: PlaygroundProject = {
            id: this.generateId(),
            name: name || "Untitled Project",
            created: Date.now(),
            lastModified: Date.now(),
            files: [
                {
                    name: 'main.ts',
                    content: '// Welcome to the Sandbox\nconsole.log("Ready to experiment.");',
                    language: 'typescript'
                }
            ],
            chatHistory: [],
            imports: []
        };
        try {
            await this.db.add(STORE_NAME, newProject);
            console.log(`[ProjectManager] Project created with ID: ${newProject.id}`);
            return newProject;
        } catch (e) {
            console.error("[ProjectManager] Error creating project in DB:", e);
            throw e;
        }
    }

    /**
     * Updates an existing project.
     */
    public async saveProject(project: PlaygroundProject): Promise<void> {
        await this.ensureInit();
        const updatedProject = { ...project, lastModified: Date.now() };
        await this.db.update(STORE_NAME, updatedProject);
    }

    /**
     * Loads a project by ID.
     */
    public async loadProject(id: string): Promise<PlaygroundProject | undefined> {
        await this.ensureInit();
        return this.db.get<PlaygroundProject>(STORE_NAME, id);
    }

    /**
     * Deletes a project by ID.
     */
    public async deleteProject(id: string): Promise<void> {
        await this.ensureInit();
        await this.db.delete(STORE_NAME, id);
    }

    /**
     * Retrieves all projects, sorted by last modified date (descending).
     */
    public async getAllProjects(): Promise<PlaygroundProject[]> {
        await this.ensureInit();
        const projects = await this.db.getAll<PlaygroundProject>(STORE_NAME);
        return projects.sort((a, b) => b.lastModified - a.lastModified);
    }
    
    /**
     * Imports a project from a JSON string.
     */
    public async importProject(jsonString: string): Promise<PlaygroundProject> {
        await this.ensureInit();
        try {
            const parsed = JSON.parse(jsonString);
            // Basic validation
            if (!parsed.name || !Array.isArray(parsed.files)) {
                throw new Error("Invalid project format.");
            }
            // Ensure ID is unique if it collides (though UUIDs shouldn't) or generate new one for import
            const project: PlaygroundProject = {
                ...parsed,
                id: this.generateId(), // Always new ID on import to avoid collisions
                lastModified: Date.now(),
                imports: Array.isArray(parsed.imports) ? parsed.imports : []
            };
            await this.db.add(STORE_NAME, project);
            return project;
        } catch (e) {
            throw new Error(`Import failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    }
}

export const projectManager = new ProjectManager();
