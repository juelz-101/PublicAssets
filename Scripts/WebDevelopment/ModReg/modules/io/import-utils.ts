
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

const BINARY_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'mp3', 'mp4', 'wav', 'ogg', 'webm'];

/**
 * Gets the file extension from a filename.
 * @param filename The name of the file.
 * @returns The extension in lowercase, without the dot.
 */
const getExtension = (filename: string): string => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
};

const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(blob);
    });
};

/**
 * An unexported helper to fetch the raw directory listing from the GitHub API.
 */
const fetchDirectoryContents = async (owner: string, repo: string, branch: string, path: string): Promise<GitHubContent[]> => {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
            }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`GitHub API error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            // This can happen if the path points to a file.
            // Return an array with the single file object for consistency.
            if (data.type === 'file') return [data as GitHubContent];
            throw new Error('The specified path does not appear to be a directory or a file.');
        }
        return data as GitHubContent[];
    } catch (error) {
        console.error(`Failed to fetch directory contents from GitHub: ${url}`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Could not fetch the directory contents from GitHub. Check the repository details and file path.');
    }
}


/**
 * Fetches the raw content of a file from a public GitHub repository.
 * @param owner The owner of the repository (e.g., 'facebook').
 * @param repo The name of the repository (e.g., 'react').
 * @param branch The branch name (e.g., 'main').
 * @param path The full path to the file within the repository (e.g., 'README.md').
 * @returns A promise that resolves with the text content of the file.
 */
export const fetchFromGitHubRaw = async (owner: string, repo: string, branch: string, path: string): Promise<string> => {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Failed to fetch from GitHub: ${url}`, error);
    throw new Error('Could not fetch the file from GitHub. Check the repository details and file path.');
  }
};


/**
 * Fetches the contents (files and directories) of a directory in a public GitHub repository.
 * @param owner The owner of the repository.
 * @param repo The name of the repository.
 * @param branch The branch name.
 * @param path The path to the directory.
 * @param options Optional parameters, including fileTypes to filter by.
 * @returns A promise resolving to an array of objects describing the directory's contents.
 */
export const getGitHubRepoDirectoryContents = async (
    owner: string,
    repo: string,
    branch: string,
    path: string,
    options?: { fileTypes?: string | string[] }
): Promise<GitHubContent[]> => {
    const allContents = await fetchDirectoryContents(owner, repo, branch, path);

    if (!options?.fileTypes || options.fileTypes.length === 0) {
        return allContents;
    }

    const allowedTypes = (Array.isArray(options.fileTypes) ? options.fileTypes : [options.fileTypes])
        .map(ext => ext.toLowerCase().replace(/^\./, ''));
        
    return allContents.filter(item => {
        if (item.type === 'dir') {
            return true; // Always include directories
        }
        const extension = getExtension(item.name);
        return extension && allowedTypes.includes(extension);
    });
};

/**
 * An unexported helper to get a filtered list of only file items from a repo directory.
 */
const getFilteredRepoFiles = async (
    owner: string,
    repo: string,
    branch: string,
    path: string,
    options?: { fileTypes?: string | string[] }
): Promise<GitHubContent[]> => {
    const allContents = await fetchDirectoryContents(owner, repo, branch, path);
    let files = allContents.filter(item => item.type === 'file');

    if (options?.fileTypes && options.fileTypes.length > 0) {
        const allowedTypes = (Array.isArray(options.fileTypes) ? options.fileTypes : [options.fileTypes])
            .map(ext => ext.toLowerCase().replace(/^\./, ''));
        
        files = files.filter(file => {
            const extension = getExtension(file.name);
            return extension && allowedTypes.includes(extension);
        });
    }
    return files;
};

/**
 * Gets the count of files within a directory in a public GitHub repository, with optional filtering.
 * @param owner The owner of the repository.
 * @param repo The name of the repository.
 * @param branch The branch name.
 * @param path The path to the directory.
 * @param options Optional parameters, including fileTypes to filter by.
 * @returns A promise resolving to the number of matching files.
 */
export const getGitHubRepoFileCount = async (
    owner: string,
    repo: string,
    branch: string,
    path: string,
    options?: { fileTypes?: string | string[] }
): Promise<number> => {
    const files = await getFilteredRepoFiles(owner, repo, branch, path, options);
    return files.length;
};


/**
 * Fetches random files from a directory in a public GitHub repository, with optional filtering.
 * @param owner The owner of the repository.
 * @param repo The name of the repository.
 * @param branch The branch name.
 * @param path The path to the directory.
 * @param options Optional parameters, including fileTypes to filter by and the count of files to retrieve.
 * @returns A promise resolving to an array of objects, each with the file's content and metadata.
 */
export const getRandomFileFromGitHubRepo = async (
    owner: string,
    repo: string,
    branch: string,
    path: string,
    options?: { fileTypes?: string | string[], count?: number }
): Promise<{ content: string; file: GitHubContent; isBinary: boolean; }[]> => {
    const files = await getFilteredRepoFiles(owner, repo, branch, path, options);

    if (files.length === 0) {
        return []; // Return empty array if no files match
    }

    const count = options?.count ?? 1;
    const numToFetch = Math.min(count, files.length);

    const shuffledFiles = [...files].sort(() => 0.5 - Math.random());
    const selectedFiles = shuffledFiles.slice(0, numToFetch);

    const contentPromises = selectedFiles.map(file => {
        const extension = getExtension(file.name);
        const isBinary = BINARY_EXTENSIONS.includes(extension);

        if (isBinary) {
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
            return fetch(rawUrl)
                .then(res => {
                    if (!res.ok) throw new Error(`Failed to fetch blob for ${file.path}: ${res.statusText}`);
                    return res.blob();
                })
                .then(blobToDataURL)
                .then(content => ({ content, file, isBinary: true }));
        }

        return fetchFromGitHubRaw(owner, repo, branch, file.path).then(content => ({
            content,
            file,
            isBinary: false,
        }));
    });
    
    return Promise.all(contentPromises);
};

/**
 * Fetches Nth file(s) from a directory in a public GitHub repository.
 * @param owner The owner of the repository.
 * @param repo The name of the repository.
 * @param branch The branch name.
 * @param path The path to the directory.
 * @param options Optional parameters, including fileTypes, start index, and count.
 * @returns A promise resolving to an array of objects, each with the file's content and metadata.
 */
export const getNthFileFromGitHubRepo = async (
    owner: string,
    repo: string,
    branch: string,
    path: string,
    options?: { fileTypes?: string | string[]; start?: number; count?: number }
): Promise<{ content: string; file: GitHubContent; isBinary: boolean; }[]> => {
    const files = await getFilteredRepoFiles(owner, repo, branch, path, options);

    const start = options?.start ?? 1;
    const count = options?.count ?? 1;
    const startIndex = Math.max(0, start - 1); // convert to 0-based, ensure non-negative

    if (startIndex >= files.length) {
        return []; // start is out of bounds
    }

    const selectedFiles = files.slice(startIndex, startIndex + count);

    const contentPromises = selectedFiles.map(file => {
        const extension = getExtension(file.name);
        const isBinary = BINARY_EXTENSIONS.includes(extension);

        if (isBinary) {
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
            return fetch(rawUrl)
                .then(res => {
                    if (!res.ok) throw new Error(`Failed to fetch blob for ${file.path}: ${res.statusText}`);
                    return res.blob();
                })
                .then(blobToDataURL)
                .then(content => ({ content, file, isBinary: true }));
        }

        return fetchFromGitHubRaw(owner, repo, branch, file.path).then(content => ({
            content,
            file,
            isBinary: false,
        }));
    });
    
    return Promise.all(contentPromises);
};
