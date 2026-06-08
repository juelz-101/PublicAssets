
export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
}

export interface GitTreeFile {
    path: string;
    mode: string;
    type: 'blob' | 'tree'; 
    sha: string;
    size?: number;
    url: string;
}

// Global cache to prevent redundant tree fetches
let globalTreeCache: GitTreeFile[] | null = null;
let treePromise: Promise<GitTreeFile[]> | null = null;

/**
 * Fetches the entire file tree for a branch recursively.
 * Uses a singleton pattern to ensure we only fetch this once per session.
 */
export const fetchGitTree = async (owner: string, repo: string, branch: string): Promise<GitTreeFile[]> => {
    if (globalTreeCache) return globalTreeCache;
    if (treePromise) return treePromise;

    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    
    treePromise = (async () => {
        try {
            const response = await fetch(url, {
                headers: { 'Accept': 'application/vnd.github.v3+json' },
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                // If we hit rate limit, we catch it but don't crash the whole app
                if (response.status === 403) {
                    console.error("GitHub API Rate Limit Exceeded. Falling back to local data where possible.");
                }
                throw new Error(`GitHub API error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }
            const data = await response.json();
            globalTreeCache = data.tree as GitTreeFile[];
            return globalTreeCache;
        } catch (error) {
            treePromise = null; // Allow retry
            throw error;
        }
    })();

    return treePromise;
};

const getExtension = (filename: string): string => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
};

export const fetchFromGitHubRaw = async (owner: string, repo: string, branch: string, path: string): Promise<string> => {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
    }
    return await response.text();
  } catch (error: any) {
    throw new Error(`Could not fetch the file from GitHub. URL: ${url}. Error: ${error.message}`);
  }
};

const getFilesFromTree = async (
    owner: string, 
    repo: string, 
    branch: string, 
    path: string, 
    options?: { fileTypes?: string | string[] }
): Promise<GitTreeFile[]> => {
    const tree = await fetchGitTree(owner, repo, branch);
    const searchPath = path.endsWith('/') ? path : path + '/';
    
    let files = tree.filter(item => 
        item.type === 'blob' && 
        item.path.startsWith(searchPath) && 
        !item.path.slice(searchPath.length).includes('/')
    );

    if (options?.fileTypes) {
        const allowedTypes = (Array.isArray(options.fileTypes) ? options.fileTypes : [options.fileTypes])
            .map(ext => ext.toLowerCase().replace(/^\./, ''));
        files = files.filter(file => allowedTypes.includes(getExtension(file.path)));
    }
    return files;
};

export const getRandomFileInfoFromGitHubRepo = async (
    owner: string,
    repo: string,
    branch: string,
    path: string,
    options?: { fileTypes?: string | string[] }
): Promise<GitHubContent | null> => {
    try {
        const files = await getFilesFromTree(owner, repo, branch, path, options);
        if (files.length === 0) return null;
        const selected = files[Math.floor(Math.random() * files.length)];
        return {
            name: selected.path.split('/').pop() || '',
            path: selected.path,
            sha: selected.sha,
            size: selected.size || 0,
            url: selected.url,
            html_url: '', git_url: '', download_url: null, type: 'file'
        };
    } catch { return null; }
};

export const getGitHubRepoDirectoryContents = async (
    owner: string,
    repo: string,
    branch: string,
    path: string,
    options?: { fileTypes?: string | string[] }
): Promise<GitHubContent[]> => {
    const files = await getFilesFromTree(owner, repo, branch, path, options);
    return files.map(selected => ({
        name: selected.path.split('/').pop() || '',
        path: selected.path,
        sha: selected.sha,
        size: selected.size || 0,
        url: selected.url,
        html_url: '', git_url: '', download_url: null, type: 'file'
    }));
};
