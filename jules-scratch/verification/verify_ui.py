import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        try:
            # The wrangler dev server runs on port 8787 by default.
            await page.goto("http://localhost:8787/sub")
            # Wait for the page to load and the main container to be visible
            await expect(page.locator(".header")).to_be_visible(timeout=15000)
            await page.screenshot(path="jules-scratch/verification/verification.png")
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())