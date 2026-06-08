// services/contentService.ts
import { fetchFromGitHubRaw, getRandomFileInfoFromGitHubRepo, fetchGitTree, GitTreeFile } from '../modules/io/import-utils';
import { Tab, LibraryPost, MasterDictionary, DictionaryData, LibraryContentItem } from '../types';

export type PageData = any; 

export interface SiteData {
  [key: string]: PageData;
}

// Internal session tracker for image limits
let imageRequestCount = 0;
export const incrementImageRequest = () => imageRequestCount++;
export const getImageRequestCount = () => imageRequestCount;
export const resetImageRequestCount = () => imageRequestCount = 0;

import { Manifest, ManifestUISettings } from '../types';

const fileToTabMap: { [key: string]: Tab } = {
  'home.json': Tab.Home,
  'music.json': Tab.Music,
  'art.json': Tab.Art,
  'tools.json': Tab.Tools,
  'gaming.json': Tab.Gaming,
  'about.json': Tab.About,
  'community.json': Tab.Community,
  'library.json': Tab.Library,
};

const DEFAULT_MIX: any = {
  meta: { type: "Index", name: "Default Post" },
  idx: {
    display_name: "Untitled Folder",
    viewer: {
      title: "Untitled Folder",
      subtitle: "No description available."
    }
  }
};

const safeJsonParse = (jsonString: string, filePath: string): { data: any; error: string | null } => {
    try {
        if (!jsonString || jsonString.trim() === '') {
             return { data: null, error: null }; 
        }
        const data = JSON.parse(jsonString);
        return { data, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown JSON parsing error';
        console.error(`Failed to parse JSON from ${filePath}: ${errorMessage}`);
        return { data: null, error: `Syntax error in ${filePath}: ${errorMessage}` };
    }
};

const fetchAndMergeDictionaries = async (
    owner: string,
    repo: string,
    branch: string,
    mldFilePaths: string[]
): Promise<MasterDictionary> => {
    const parsingErrors: string[] = [];
    const masterFilePath = mldFilePaths.find(p => {
        const lowerP = p.toLowerCase();
        return lowerP.endsWith('master_dictionary.mld') || lowerP.endsWith('masterdictionary.mld');
    });
    
    const emptyDictionary = { dictionary: { skillsets: [], collections: [] }, errors: parsingErrors };

    if (!masterFilePath) {
        parsingErrors.push('master_dictionary.mld not found in the library!');
        return emptyDictionary;
    }

    const masterContent = await fetchFromGitHubRaw(owner, repo, branch, masterFilePath);
    const { data: masterParsed, error: masterError } = safeJsonParse(masterContent, masterFilePath);
    
    if (masterError) {
        parsingErrors.push(masterError);
    }
    
    if (!masterParsed || !masterParsed.data?.dictionary) {
        if (!masterError) parsingErrors.push(`Master dictionary file is malformed or missing the 'data.dictionary' key.`);
        return { dictionary: { skillsets: [], collections: [] }, errors: parsingErrors };
    }
    
    const mergedDictionaryData: DictionaryData = masterParsed.data.dictionary;
    if (!Array.isArray(mergedDictionaryData.collections)) {
        mergedDictionaryData.collections = [];
    }
    if (!Array.isArray(mergedDictionaryData.skillsets)) {
        mergedDictionaryData.skillsets = [];
    }
    
    const otherMldFilePaths = mldFilePaths.filter(p => p !== masterFilePath);

    const mergePromises = otherMldFilePaths.map(async path => {
        try {
            const content = await fetchFromGitHubRaw(owner, repo, branch, path);
            const { data: parsed, error } = safeJsonParse(content, path);
            if (error) {
                parsingErrors.push(error);
                return null;
            }
            if (!parsed || !parsed.data || !parsed.data.dictionary) {
                return null;
            }
            return parsed.data.dictionary;
        } catch (err: any) {
            parsingErrors.push(`Failed to fetch ${path}: ${err.message}`);
            return null;
        }
    });
    
    const dictionariesToMerge = (await Promise.all(mergePromises)).filter((d): d is DictionaryData => !!d);

    for (const dictDataToMerge of dictionariesToMerge) {
        if (dictDataToMerge.collections && Array.isArray(dictDataToMerge.collections)) {
            (mergedDictionaryData.collections as any[]).push(...dictDataToMerge.collections);
        }
        if (dictDataToMerge.skillsets && Array.isArray(dictDataToMerge.skillsets)) {
            (mergedDictionaryData.skillsets as any[]).push(...dictDataToMerge.skillsets);
        }
    }

    return { dictionary: mergedDictionaryData, errors: parsingErrors };
};


export const fetchManifest = async (): Promise<Manifest> => {
  const localManifestResponse = await fetch('/data/manifest.json');
  if (!localManifestResponse.ok) {
    throw new Error(`Failed to fetch local manifest.json: ${localManifestResponse.statusText}`);
  }
  const localManifest: Manifest = await localManifestResponse.json();

  // Failsafe: Ensure manifest.git exists if it was moved to data.git
  if (!(localManifest as any).data?.git && (localManifest as any).git) {
      (localManifest as any).data.git = (localManifest as any).git;
  }

  const masterConfig = localManifest.data?.cfg?.master_config;
  if (masterConfig && masterConfig.use && masterConfig.source === 'git' && masterConfig.url) {
    try {
      const { user, repo, branch } = localManifest.data.git;
      const remoteManifestContent = await fetchFromGitHubRaw(user, repo, branch, masterConfig.url);
      const remoteManifest: Manifest = JSON.parse(remoteManifestContent);
      return remoteManifest;
    } catch (error) {
      console.error("Failed to fetch remote master_config. Falling back.", error);
      return localManifest;
    }
  }

  return localManifest;
};

export const fetchAllPagesData = async (manifest: Manifest): Promise<SiteData> => {
  const { user, repo, branch } = manifest.data.git;
  const { get: files, dir } = manifest.data.data;

  // --- Safe Mode Data Blocking ---
  if (manifest.settings.safe_mode.on && manifest.settings.safe_mode.override.data.block_all_online_data) {
      console.warn("[SAFE_MODE] Data block active. Returning limited shell data.");
      const shell: SiteData = {};
      files.forEach(f => {
          const tab = fileToTabMap[f];
          if (tab) shell[tab] = { intro: "<h2>Safe Mode Active</h2><p>Online data fetching is currently restricted by the manifest's Safe Mode settings.</p>", songs: [], albums: [], artists: [], people: [], events: [], tools: {}, lobby: { title: "Library Restricted" } };
      });
      return shell;
  }

  const dataPromises = files.map(async (fileName) => {
    try {
      const path = `${dir}/${fileName}`;
      const content = await fetchFromGitHubRaw(user, repo, branch, path);
      const jsonData = JSON.parse(content);
      const tab = fileToTabMap[fileName];
      return { tab, data: jsonData };
    } catch (error) {
      console.error(`Failed to fetch ${fileName}:`, error);
      return { tab: fileToTabMap[fileName], data: null };
    }
  });

  const results = await Promise.all(dataPromises);
  
  const siteData: SiteData = {};
  results.forEach(result => {
    if (result && result.tab) {
      siteData[result.tab] = result.data;
    }
  });

  if (manifest.data.library && manifest.data.library.dir) {
      const libraryRootPath = manifest.data.library.dir;
      const libraryPageData = siteData[Tab.Library];
      try {
          const gitTree = await fetchGitTree(user, repo, branch);
          const libraryItems = gitTree.filter(item => item.path.startsWith(libraryRootPath + '/') && item.path !== libraryRootPath);

          const rootAisle: LibraryContentItem = {
              name: libraryRootPath.split('/').pop() || libraryRootPath,
              path: libraryRootPath,
              type: 'dir',
              children: [],
              meta: DEFAULT_MIX,
          };
          const nodeMap = new Map<string, LibraryContentItem>([[libraryRootPath, rootAisle]]);

          libraryItems.forEach(item => {
              if (item.type === 'tree') {
                  const dirNode: LibraryContentItem = {
                      name: item.path.split('/').pop()!,
                      path: item.path,
                      type: 'dir',
                      children: [],
                      meta: { ...DEFAULT_MIX, idx: { ...DEFAULT_MIX.idx, viewer: { ...DEFAULT_MIX.idx.viewer, title: item.path.split('/').pop()! } } },
                  };
                  nodeMap.set(item.path, dirNode);
              }
          });

          libraryItems.forEach(item => {
              const pathParts = item.path.split('/');
              const parentPath = pathParts.slice(0, -1).join('/');
              const parentNode = nodeMap.get(parentPath);

              if (parentNode) {
                  const name = pathParts[pathParts.length - 1];
                  let childNode: LibraryContentItem | undefined = undefined;
                  if (item.type === 'tree') {
                      childNode = nodeMap.get(item.path);
                  } else if (item.type === 'blob' && !name.endsWith('.mix')) {
                      childNode = { name, path: item.path, type: 'file' };
                  }
                  
                  if (childNode && !parentNode.children?.some(c => c.path === childNode!.path)) {
                      parentNode.children?.push(childNode);
                  }
              }
          });
          
          const mixFiles = gitTree.filter(item => item.path.startsWith(libraryRootPath + '/') && item.path.endsWith('.mix'));
          const mixPromises = mixFiles.map(async mixFile => {
              const dirPath = mixFile.path.substring(0, mixFile.path.lastIndexOf('/')) || libraryRootPath;
              const dirNode = nodeMap.get(dirPath);
              if (dirNode) {
                  try {
                      const content = await fetchFromGitHubRaw(user, repo, branch, mixFile.path);
                      const { data } = safeJsonParse(content, mixFile.path);
                      // We parse the data normally; account-based fields are simply ignored by current UI components
                      // Ensure data is not an empty array or invalid format before assigning
                      if (data && typeof data === 'object' && !Array.isArray(data)) {
                          dirNode.meta = data;
                      }
                  } catch (err: any) {
                      // Suppressing aggressive error logging for missing mix files as they may have been deleted but github tree is cached
                      console.warn(`[ContentService] Missing or unfetchable mix file skipped: ${mixFile.path}`);
                  }
              }
          });
          await Promise.all(mixPromises);

          nodeMap.forEach(node => {
              node.children?.sort((a, b) => {
                  if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
                  return a.name.localeCompare(b.name);
              });
          });

          const mldFilePaths = gitTree.filter(item => item.path.startsWith(libraryRootPath + '/') && item.path.endsWith('.mld')).map(f => f.path);
          const dictionary = await fetchAndMergeDictionaries(user, repo, branch, mldFilePaths);

          if (libraryPageData) {
              libraryPageData.aisles = rootAisle;
              libraryPageData.dictionary = dictionary;
          }

      } catch (error) {
          console.error('Failed to process library:', error);
          if (libraryPageData) {
              libraryPageData.aisles = null;
              libraryPageData.dictionary = null;
              libraryPageData.error = error instanceof Error ? error.message : 'Could not load library.';
          }
      }
  }

  return siteData;
};

export const fetchRandomBackgroundUrl = async (manifest: Manifest, tab: Tab, perPageSwitching: boolean): Promise<string | null> => {
  const { user, repo, branch } = manifest.data.git;
  const backgrounds = manifest.data.images.backgrounds;

  let path: string;
  if (perPageSwitching) {
    const tabKey = tab.toLowerCase().replace(/\s/g, '').replace('us', '');
    path = backgrounds[tabKey] || backgrounds.main;
  } else {
    path = backgrounds.main;
  }

  if (!path || typeof path !== 'string' || path.trim() === '') return null;
  
  try {
    const randomFile = await getRandomFileInfoFromGitHubRepo(user, repo, branch, path);
    if (randomFile) {
      return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${randomFile.path}`;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch background: ${path}`, error);
    return null;
  }
};
