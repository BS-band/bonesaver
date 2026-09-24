// Run with Playwright available via NODE_PATH. Only targets the local preview.
const { chromium } = require("playwright");
const fs = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const base = "http://127.0.0.1:4174";
const widths = [320, 360, 390, 768, 860, 861, 900, 1024, 1280, 1440];
const pages = [
  "/",
  "/repertoar.html",
  "/ukazky.html",
  "/o-nas.html",
  "/kontakt.html",
  "/kapela-na-svatbu.html",
  "/kapela-na-ples.html",
  "/firemni-a-verejne-akce.html",
  "/vlastni-tvorba.html",
  "/soukromi.html",
  "/404.html",
];
const failures = [];
const checks = [];
async function check(name, fn) {
  try {
    await fn();
    checks.push(name);
  } catch (error) {
    failures.push({ name, message: error.message });
  }
}
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const external = new Set();
    const errors = [];
    const links = new Set();
    const anchors = new Map();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (!request.url().startsWith(base)) external.add(request.url());
    });
    const titles = new Set();
    let layoutChecks = 0;
    for (const route of pages) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      const response = await page.goto(base + route);
      await page.evaluate(async () => {
        document.querySelectorAll("img").forEach((img) => {
          img.loading = "eager";
        });
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((img) => img.decode().catch(() => {})),
        );
      });
      await check(route + " HTML/SEO/images", async () => {
        assert.equal(response.status(), 200);
        assert.equal(response.headers()["x-robots-tag"], "noindex, nofollow");
        assert.equal(await page.locator("h1").count(), 1);
        assert.equal(await page.locator("html").getAttribute("lang"), "cs");
        const title = await page.title();
        assert(!titles.has(title), "Duplicate title");
        titles.add(title);
        assert.equal(
          await page.locator("link[rel=canonical]").getAttribute("href"),
          "https://www.bonesaver.cz" + route,
        );
        assert(
          (await page.locator("meta[name=description]").getAttribute("content"))
            .length > 40,
        );
        assert.equal(await page.locator("iframe").count(), 0);
        const dom = await page.evaluate(() => ({
          invalidImages: [...document.images]
            .filter(
              (i) =>
                !i.naturalWidth ||
                !i.alt ||
                !i.hasAttribute("width") ||
                !i.hasAttribute("height"),
            )
            .map((i) => i.src),
          ids: [...document.querySelectorAll("[id]")].map((el) => el.id),
          graph: JSON.parse(
            document.querySelector('script[type="application/ld+json"]')
              .textContent,
          ),
          references: [
            ...document.querySelectorAll(
              "a[href],link[rel=stylesheet],script[src],img[src]",
            ),
          ].map((el) => el.getAttribute("href") || el.getAttribute("src")),
        }));
        assert.deepEqual(dom.invalidImages, []);
        assert.equal(dom.ids.length, new Set(dom.ids).size, "Duplicate IDs");
        assert.equal(dom.graph["@context"], "https://schema.org");
        assert(dom.graph["@graph"].some((n) => n["@id"].endsWith("#page")));
        anchors.set(route, new Set(dom.ids));
        for (const href of dom.references) {
          if (!href.startsWith("/") && !href.startsWith("#")) continue;
          const url = new URL(href, base + route);
          links.add(url.pathname + url.hash);
        }
      });
      for (const theme of ["dark", "light"]) {
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
        }, theme);
        for (const width of widths) {
          await page.setViewportSize({ width, height: 900 });
          await check(`${route} ${theme} ${width}px`, async () => {
            const result = await page.evaluate(() => ({
              width: innerWidth,
              scrollWidth: document.documentElement.scrollWidth,
              overflow: [...document.querySelectorAll("body *")]
                .filter((el) => {
                  const rect = el.getBoundingClientRect();
                  return (
                    rect.width > 0 &&
                    (rect.right > innerWidth + 1 || rect.left < -1) &&
                    !el.classList.contains("sr-only")
                  );
                })
                .map((el) => el.tagName + "." + el.className)
                .slice(0, 8),
            }));
            assert(result.scrollWidth <= width, JSON.stringify(result));
            assert.deepEqual(result.overflow, [], JSON.stringify(result));
            layoutChecks++;
          });
        }
      }
      console.log(`Checked ${route}`);
    }
    await check("Internal links and anchors", async () => {
      for (const href of links) {
        const url = new URL(href, base);
        assert.equal(
          (await context.request.get(url.origin + url.pathname)).status(),
          200,
          href,
        );
        if (url.hash)
          assert(
            anchors
              .get(url.pathname)
              ?.has(decodeURIComponent(url.hash.slice(1))),
            "Missing anchor " + href,
          );
      }
    });
    await check(
      "Four document downloads: labels, MIME types and exact file contents",
      async () => {
        await page.goto(base + "/kontakt.html#dokumenty");
        const documents = [
          ["bonesaver-smlouva-hudebni-produkce-vzor.pdf", "application/pdf"],
          ["bonesaver-smlouva-hudebni-produkce-vzor.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
          ["bonesaver-stage-plan.pdf", "application/pdf"],
          ["bonesaver-repertoar-pro-plesy-osa-2026.pdf", "application/pdf"],
        ];
        assert.equal(await page.locator("#dokumenty a[download]").count(), 4);
        assert.match(await page.locator("#dokumenty").innerText(), /60 skladeb/);
        assert.match(await page.locator("#dokumenty").innerText(), /nikoli jako vyplněné hlášení pro OSA/);
        for (const [name, mime] of documents) {
          const href = "/assets/documents/" + name;
          const link = page.locator(`#dokumenty a[href="${href}"][download]`);
          assert.equal(await link.count(), 1);
          assert.match(await link.innerText(), /PDF|Wordu/);
          const expected = await fs.readFile(path.join(root, href.slice(1)));
          const response = await context.request.get(base + href);
          assert.equal(response.status(), 200);
          assert.equal(response.headers()["content-type"], mime);
          assert.deepEqual(await response.body(), expected);
          const [download] = await Promise.all([
            page.waitForEvent("download"),
            link.click(),
          ]);
          assert.equal(await download.failure(), null);
          assert.equal(download.suggestedFilename(), name);
          assert.deepEqual(await fs.readFile(await download.path()), expected);
        }
        const screenshots = path.join(__dirname, "output/event-documents");
        await fs.mkdir(screenshots, { recursive: true });
        for (const [name, width] of [["desktop", 1440], ["mobile", 390]]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
          await page.locator("#dokumenty").screenshot({ path: path.join(screenshots, `downloads-${name}.png`) });
        }
      },
    );
    await check(
      "No unexpected JavaScript errors or third-party initial requests",
      async () => {
        assert.deepEqual(errors, []);
        assert.deepEqual([...external], []);
      },
    );
    await check(
      "174 unchanged songs; 16 originals; accent-insensitive search; empty state",
      async () => {
        await page.goto(base + "/repertoar.html");
        const actual = await page
          .locator("#songTable tbody tr")
          .evaluateAll((rows) =>
            rows.map((row) => ({
              title: row.cells[0].textContent,
              artist: row.cells[1].textContent,
              genre: row.dataset.genre,
            })),
          );
        assert.deepEqual(
          actual,
          JSON.parse(
            await fs.readFile(
              path.join(__dirname, "data/repertoire.json"),
              "utf8",
            ),
          ),
        );
        await page.locator("[data-filter=bonesaver]").click();
        assert.equal(
          await page.locator("#songTable tbody tr:visible").count(),
          16,
        );
        await page.locator("[data-filter=all]").click();
        await page.locator("#repertoireSearch").fill("kabAt");
        assert((await page.locator("#songTable tbody tr:visible").count()) > 0);
        assert(
          (
            await page.locator("#songTable tbody tr:visible").allTextContents()
          ).every((text) => text.includes("Kabát")),
        );
        await page.locator("#repertoireSearch").fill("zzznothingfoundzzz");
        assert(await page.locator("#repertoireEmpty").isVisible());
        await page.locator("#resetRepertoire").click();
        assert.equal(
          await page.locator("#songTable tbody tr:visible").count(),
          174,
        );
        await page.goto(base + "/repertoar.html?zanr=ballroom");
        assert.equal(
          await page
            .locator("[data-filter=ballroom]")
            .getAttribute("aria-pressed"),
          "true",
        );
        await page.goto(base + "/vlastni-tvorba.html");
        assert.equal(await page.locator(".original-songs li").count(), 16);
      },
    );
    await check(
      "Both forms: validation, Web3Forms payload, success and preserved data on failure",
      async () => {
        for (const route of ["/", "/kontakt.html?akce=ples"]) {
          await page.goto(base + route);
          if (route.includes("akce"))
            assert.equal(await page.locator("#eventType").inputValue(), "ples");
          assert.equal(await page.locator("#eventDate").inputValue(), "");
          assert.match(
            await page.locator("#eventDate").getAttribute("min"),
            /^\d{4}-\d{2}-\d{2}$/,
          );
          await page.locator("#eventDate").fill("2020-01-01");
          assert.equal(
            await page
              .locator("#eventDate")
              .evaluate((el) => el.validity.rangeUnderflow),
            true,
          );
          await page.locator("#dateUnknown").check();
          assert(await page.locator("#eventDate").isDisabled());
          await page.locator("#eventLocation").fill("TEST Pardubice & okolí");
          await page.locator("#contactName").fill("TEST <Jana> Žluťoučká");
          await page.locator("#contactEmail").fill("test@example.invalid");
          await page
            .locator("#eventNotes")
            .fill("Test pouze lokálně, nic neodesílat.");
          assert.equal(
            await page.locator("#inquiryForm").getAttribute("action"),
            "https://api.web3forms.com/submit",
          );
          assert((await page.locator('input[name="access_key"]').inputValue()).length > 20);
          const submissions = [];
          let accepted = true;
          await page.route("https://api.web3forms.com/submit", async (intercept) => {
            submissions.push({
              method: intercept.request().method(),
              body: intercept.request().postData() || "",
            });
            await intercept.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({ success: accepted }),
            });
          });
          await page.locator("form [type=submit]").click();
          await page.locator("#resultHeading").waitFor({ state: "visible" });
          assert.match(await page.locator("#resultHeading").innerText(), /Poptávka byla odeslána/);
          assert(await page.locator("#inquiryResult").isVisible());
          assert.equal(submissions.length, 1);
          assert.equal(submissions[0].method, "POST");
          for (const field of ['access_key', 'name', 'email', 'phone', 'subject', 'from_name', 'message', 'botcheck'])
            assert(submissions[0].body.includes(`name="${field}"`), field);
          assert(submissions[0].body.includes("TEST <Jana> Žluťoučká"));
          assert(submissions[0].body.includes("Termín ještě neznám"));
          assert(submissions[0].body.includes("BoneSaver web"));
          assert.equal(
            await page
              .locator("#resultHeading")
              .evaluate((el) => el === document.activeElement),
            true,
          );
          assert.equal(await page.locator("#contactName").inputValue(), "");
          await page.locator("#contactName").fill("TEST retry");
          assert(await page.locator("#inquiryResult").isHidden());
          await page.locator("#dateUnknown").check();
          await page.locator("#eventLocation").fill("TEST Pardubice");
          await page.locator("#contactEmail").fill("test@example.invalid");
          accepted = false;
          await page.locator("form [type=submit]").click();
          await page.locator("#resultHeading").waitFor({ state: "visible" });
          assert.match(await page.locator("#resultHeading").innerText(), /nepodařilo odeslat/);
          assert.equal(await page.locator("#contactName").inputValue(), "TEST retry");
          assert.equal(await page.locator("form [type=submit]").isDisabled(), false);
          assert.equal(submissions.length, 2);
          await page.unroute("https://api.web3forms.com/submit");
        }
      },
    );
    await check(
      "Mobile navigation + keyboard + theme persistence",
      async () => {
        await page.setViewportSize({ width: 360, height: 800 });
        await page.goto(base + "/");
        await page.keyboard.press("Tab");
        assert.equal(
          await page
            .locator(".skip-link")
            .evaluate((el) => el === document.activeElement),
          true,
        );
        await page.locator(".nav-toggle").click();
        assert.equal(
          await page.locator(".nav-toggle").getAttribute("aria-expanded"),
          "true",
        );
        assert(await page.locator(".site-nav").isVisible());
        await page.locator(".nav-dropdown summary").click();
        assert(await page.locator(".dropdown-panel").isVisible());
        await page.keyboard.press("Escape");
        assert(await page.locator(".site-nav").isHidden());
        assert.equal(
          await page
            .locator(".nav-toggle")
            .evaluate((el) => el === document.activeElement),
          true,
        );
        await page.locator(".theme-toggle").click();
        assert.equal(
          await page.locator("html").getAttribute("data-theme"),
          "light",
        );
        await page.reload();
        assert.equal(
          await page.locator("html").getAttribute("data-theme"),
          "light",
        );
      },
    );
    await check(
      "Video starts only on click (external playback request stubbed)",
      async () => {
        await page.goto(base + "/ukazky.html");
        assert.equal(await page.locator("iframe").count(), 0);
        await page.route("https://www.youtube-nocookie.com/**", (route) =>
          route.fulfill({
            status: 200,
            contentType: "text/html",
            body: "<title>Local test stub</title>",
          }),
        );
        await page.locator(".video-play").first().click();
        assert.equal(await page.locator("iframe").count(), 1);
        assert.match(
          await page.locator("iframe").getAttribute("src"),
          /^https:\/\/www.youtube-nocookie.com\/embed\/_o0jpleViPc\?/,
        );
        assert(await page.locator("iframe").getAttribute("title"));
      },
    );
    await check(
      "No-JavaScript content and direct contacts remain usable",
      async () => {
        const noJs = await browser.newContext({
          javaScriptEnabled: false,
          viewport: { width: 360, height: 800 },
        });
        const p = await noJs.newPage();
        await p.goto(base + "/repertoar.html");
        assert.equal(await p.locator("#songTable tbody tr").count(), 174);
        assert(await p.locator(".site-nav").isVisible());
        await p.goto(base + "/kontakt.html");
        assert(await p.locator("form [type=submit]").isDisabled());
        assert(await p.locator(".contact-email").isVisible());
        assert.equal(await p.locator("#dokumenty a[download]").count(), 4);
        await noJs.close();
      },
    );
    await check(
      "404, preview exclusion, sitemap, production robots and unchanged CNAME",
      async () => {
        const missing = await context.request.get(
          base + "/neexistujici-stranka",
        );
        assert.equal(missing.status(), 404);
        assert((await missing.text()).includes("Tady už"));
        for (const url of ["/_dev/PLAN.md", "/.git/config"])
          assert.equal((await context.request.get(base + url)).status(), 404);
        assert(
          (
            await (await context.request.get(base + "/robots.txt")).text()
          ).includes("Disallow: /"),
        );
        const robots = await fs.readFile(path.join(root, "robots.txt"), "utf8");
        assert(robots.includes("Allow: /\n"));
        const sitemap = await fs.readFile(
          path.join(root, "sitemap.xml"),
          "utf8",
        );
        assert.equal([...sitemap.matchAll(/<loc>/g)].length, 10);
        assert(!/index\.html|404\.html|localhost|127\.0\.0\.1/.test(sitemap));
        for (const route of pages.filter((p) => p !== "/404.html")) {
          const html = await fs.readFile(
            path.join(root, route === "/" ? "index.html" : route.slice(1)),
            "utf8",
          );
          assert(
            !/noindex|localhost|127\.0\.0\.1/.test(html),
            route + " contains preview controls",
          );
        }
        assert.equal(
          (await fs.readFile(path.join(root, "CNAME"), "utf8")).trim(),
          "www.bonesaver.cz",
        );
      },
    );
    const report = {
      date: new Date().toISOString(),
      base,
      browser: browser.version(),
      passed: checks.length,
      layoutChecks,
      failures,
      limits: [
        "Chromium desktop emulation, not physical iOS/Android.",
        "No real email delivery or live YouTube playback asserted.",
        "No production deployment, ranking or field Core Web Vitals verification.",
      ],
    };
    await fs.mkdir(path.join(__dirname, "output"), { recursive: true });
    await fs.writeFile(
      path.join(__dirname, "output/verification.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
    console.log(JSON.stringify(report, null, 2));
    if (failures.length) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
