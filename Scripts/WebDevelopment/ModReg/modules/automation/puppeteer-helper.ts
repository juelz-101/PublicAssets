// modules/automation/puppeteer-helper.ts
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const SYSTEM_PROMPT = `You are an expert Puppeteer automation engineer. 
Generate clean, modern Node.js code using Puppeteer. 
Include helpful comments, use async/await, and ensure proper error handling with try/catch.
Assume 'puppeteer' is already installed.
Provide only the code without markdown block wrappers unless specifically asked otherwise.`;

/**
 * Generates a Puppeteer script from a description.
 */
export const generateAutomationScript = async (prompt: string): Promise<string> => {
    if (!apiKey) return "// Error: API Key not configured.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Write a Puppeteer script for: ${prompt}`,
            config: { systemInstruction: SYSTEM_PROMPT }
        });
        return response.text || "// No code generated.";
    } catch (e) {
        console.error(e);
        return `// Error generating script: ${e instanceof Error ? e.message : 'Unknown'}`;
    }
};

/**
 * Returns common Puppeteer boilerplate templates.
 */
export const getBoilerplate = (template: 'base' | 'scrape' | 'screenshot' | 'pdf'): string => {
    switch (template) {
        case 'scrape':
            return `const data = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.item'));
    return items.map(item => ({
        title: item.querySelector('h2')?.innerText,
        price: item.querySelector('.price')?.innerText
    }));
});
console.log(data);`;
        case 'screenshot':
            return `await page.screenshot({ path: 'screenshot.png', fullPage: true });`;
        case 'pdf':
            return `await page.pdf({ path: 'page.pdf', format: 'A4' });`;
        default:
            return `const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://example.com');
  
  // Logic here
  
  await browser.close();
})();`;
    }
};

/**
 * Formats a logic string into a full Puppeteer boilerplate.
 */
export const formatPuppeteerCode = (logic: string, options = { headless: true }): string => {
    return `const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: ${options.headless} });
  const page = await browser.newPage();
  
  try {
    ${logic.split('\n').map(line => '    ' + line).join('\n')}
  } catch (err) {
    console.error("Automation Failed:", err);
  } finally {
    await browser.close();
  }
})();`;
};
