import type { AppConfig, ImageUrl, GitConfig, ProcessedAppConfig } from '../../types';

function resolveImageUrl(imageUrl: ImageUrl, gitConfig: GitConfig): string {
  switch (imageUrl.source) {
    case 'git':
      if (!gitConfig) {
        console.error("Git configuration is missing for a 'git' source image.");
        return '';
      }
      return `https://raw.githubusercontent.com/${gitConfig.user}/${gitConfig.repo}/${gitConfig.branch}/${imageUrl.url}`;
    case 'url':
      return imageUrl.url;
    case 'local':
    default:
      // Assuming 'local' urls are relative to the public root
      return `/${imageUrl.url}`;
  }
}

export async function loadConfig(url: string): Promise<ProcessedAppConfig> {
  try {
    const initialResponse = await fetch(url);
    if (!initialResponse.ok) {
      throw new Error(`Failed to fetch initial config: ${initialResponse.statusText}`);
    }
    const initialConfig: AppConfig = await initialResponse.json();

    let finalConfig = initialConfig;

    if (initialConfig.master_config && initialConfig.master_config.use) {
      console.log('Master config enabled. Fetching remote configuration...');
      const { use, ...masterUrlDetails } = initialConfig.master_config;
      const masterConfigUrl = resolveImageUrl(masterUrlDetails, initialConfig.git);

      const masterResponse = await fetch(masterConfigUrl);
      if (!masterResponse.ok) {
        throw new Error(`Failed to fetch master config from ${masterConfigUrl}: ${masterResponse.statusText}`);
      }
      finalConfig = await masterResponse.json();
      console.log('Master config loaded successfully.');
    }
    
    // Process image URLs from the final configuration
    const processedConfig: ProcessedAppConfig = {
        ...finalConfig,
        bannerImageUrl: resolveImageUrl(finalConfig.bannerImageUrl, finalConfig.git),
        headerLogoUrl: resolveImageUrl(finalConfig.headerLogoUrl, finalConfig.git),
        defaultLogoUrl: resolveImageUrl(finalConfig.defaultLogoUrl, finalConfig.git),
    };

    return processedConfig;

  } catch (error) {
    console.error(`Error loading configuration from ${url}:`, error);
    throw error;
  }
}