// Puppeteer Browser Toolkit
// Pragmatic helpers for launching, managing, and shutting down Chromium safely
// Designed to prevent common lifecycle, performance, and isolation mistakes

import puppeteer, { Browser, LaunchOptions } from 'puppeteer';

export type BrowserIntent = 'default' | 'debug' | 'ci';

export type ManagedBrowserOptions = {
  intent?: BrowserIntent;
  profilePath?: string;           // userDataDir (optional)
  headless?: boolean | 'new';
  executablePath?: string;
  extraArgs?: string[];
};

let activeBrowser: Browser | null = null;

/**
 * Launches a managed Puppeteer browser.
 * Enforces one-browser-at-a-time unless explicitly closed.
 */
export async function launchBrowser(options: ManagedBrowserOptions = {}): Promise<Browser> {
  if (activeBrowser) {
    throw new Error('Browser already running. Close it before launching another.');
  }

  const intent = options.intent ?? 'default';

  const launchOptions: LaunchOptions = {
    headless: options.headless ?? resolveHeadless(intent),
    userDataDir: options.profilePath,
    executablePath: options.executablePath,
    args: buildArgs(intent, options.extraArgs),
  };

  activeBrowser = await puppeteer.launch(launchOptions);
  return activeBrowser;
}

/**
 * Returns the currently active browser or throws if none exists
 */
export function getBrowser(): Browser {
  if (!activeBrowser) {
    throw new Error('No active browser. Did you forget to call launchBrowser()?');
  }
  return activeBrowser;
}

/**
 * Gracefully closes the active browser
 */
export async function closeBrowser(): Promise<void> {
  if (!activeBrowser) return;

  await activeBrowser.close();
  activeBrowser = null;
}

/**
 * Force-kills the browser process (last resort)
 */
export async function killBrowser(): Promise<void> {
  if (!activeBrowser) return;

  const proc = activeBrowser.process();
  if (proc) {
    proc.kill('SIGKILL');
  }

  activeBrowser = null;
}

/**
 * Creates a new page using the default browser context
 */
export async function newPage() {
  const browser = getBrowser();
  return browser.newPage();
}

/**
 * Utility: resolves headless mode based on intent
 */
function resolveHeadless(intent: BrowserIntent): boolean | 'new' {
  switch (intent) {
    case 'debug':
      return false;
    case 'ci':
      return 'new';
    default:
      return 'new';
  }
}

/**
 * Utility: builds Chromium args based on intent
 */
function buildArgs(intent: BrowserIntent, extraArgs: string[] = []): string[] {
  const base: string[] = [];

  if (intent === 'ci') {
    base.push('--no-sandbox', '--disable-dev-shm-usage');
  }

  if (intent === 'debug') {
    base.push('--auto-open-devtools-for-tabs');
  }

  return [...base, ...extraArgs];
}

/*
USAGE EXAMPLE:

import { launchBrowser, closeBrowser, newPage } from './Puppeteer_Browser-Toolkit';

await launchBrowser({
  intent: 'debug',
  profilePath: './profiles/dev'
});

const page = await newPage();
await page.goto('https://example.com');

await closeBrowser();
*/
