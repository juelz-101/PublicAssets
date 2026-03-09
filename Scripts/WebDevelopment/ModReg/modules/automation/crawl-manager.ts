// modules/automation/crawl-manager.ts

export interface CrawlConfig {
    maxDepth: number;
    domainWhitelist?: string[];
    maxTotalUrls?: number;
}

export class CrawlQueue {
    private queue: { url: string; depth: number }[] = [];
    private visited: Set<string> = new Set();
    private config: Required<CrawlConfig>;

    constructor(config: CrawlConfig) {
        this.config = {
            maxDepth: config.maxDepth,
            domainWhitelist: config.domainWhitelist || [],
            maxTotalUrls: config.maxTotalUrls || 1000
        };
    }

    public push(url: string, currentDepth: number): boolean {
        const normalized = this.normalize(url);
        
        if (this.visited.has(normalized)) return false;
        if (currentDepth > this.config.maxDepth) return false;
        if (this.visited.size >= this.config.maxTotalUrls) return false;

        if (this.config.domainWhitelist.length > 0) {
            const domain = new URL(normalized).hostname;
            if (!this.config.domainWhitelist.some(d => domain.includes(d))) return false;
        }

        this.queue.push({ url: normalized, depth: currentDepth });
        return true;
    }

    public pop(): { url: string; depth: number } | undefined {
        const item = this.queue.shift();
        if (item) this.visited.add(item.url);
        return item;
    }

    public get size(): number { return this.queue.length; }
    public get visitedCount(): number { return this.visited.size; }

    private normalize(url: string): string {
        try {
            const u = new URL(url);
            u.hash = ''; // Remove fragments
            return u.toString();
        } catch {
            return url;
        }
    }
}

export const createCrawlQueue = (config: CrawlConfig) => new CrawlQueue(config);
