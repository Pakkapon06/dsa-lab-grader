const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn, spawnSync } = require("child_process");

const ROOT = process.env.GRADER_ROOT
    ? path.resolve(process.env.GRADER_ROOT)
    : fs.existsSync(path.join(__dirname, "..", "problems"))
    ? path.join(__dirname, "..", "problems")
    : path.resolve(__dirname, "..");
const PUBLIC = path.join(__dirname, "public");
const PORT = process.env.GRADER_PORT ? Number(process.env.GRADER_PORT) : 5599;

const IS_WIN = process.platform === "win32";
const DEFAULT_TIMEOUT_MS = 3000;

function findCompiler(lang) {
    const exe = lang === "c" ? "gcc" : "g++";
    const envKey = lang === "c" ? "GRADER_GCC" : "GRADER_GPP";
    if (process.env[envKey] && fs.existsSync(process.env[envKey])) return process.env[envKey];
    const bin = IS_WIN ? exe + ".exe" : exe;
    const candidates = IS_WIN
        ? [
              "C:\\msys64\\mingw64\\bin\\" + bin,
              "C:\\msys64\\ucrt64\\bin\\" + bin,
              "C:\\MinGW\\bin\\" + bin,
              "C:\\Strawberry\\c\\bin\\" + bin,
          ]
        : ["/usr/bin/" + exe, "/usr/local/bin/" + exe, "/opt/homebrew/bin/" + exe];
    for (const c of candidates) if (fs.existsSync(c)) return c;
    try {
        const r = spawnSync(IS_WIN ? "where" : "which", [exe], { encoding: "utf-8" });
        if (r.status === 0) {
            const first = (r.stdout || "").split(/\r?\n/).find(Boolean);
            if (first && fs.existsSync(first.trim())) return first.trim();
        }
    } catch {}
    return exe;
}

const GPP = findCompiler("cpp");
const GCC = findCompiler("c");
const COMPILER_DIR = path.isAbsolute(GPP) ? path.dirname(GPP) : null;

function childEnv() {
    if (!COMPILER_DIR) return process.env;
    const env = { ...process.env };
    const key = Object.keys(env).find((k) => k.toLowerCase() === "path") || "PATH";
    env[key] = COMPILER_DIR + path.delimiter + (env[key] || "");
    return env;
}

const LAB_DIR_RE = /^Lab\d+$/i;
const CODE_RE = /^(\d{2})-(\d+)\.(c|cpp)$/i;

function sendJson(res, code, obj) {
    const body = JSON.stringify(obj);
    res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
    res.end(body);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (c) => {
            data += c;
            if (data.length > 5 * 1024 * 1024) reject(new Error("body too large"));
        });
        req.on("end", () => resolve(data));
        req.on("error", reject);
    });
}

function isSafeUnder(base, target) {
    const rel = path.relative(base, target);
    return rel && !rel.startsWith("..") && !path.isAbsolute(rel);
}

function listProblemFiles(dir) {
    let entries = [];
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return null;
    }
    let code = null;
    const tests = {};
    let pdf = null;
    let md = null;
    for (const e of entries) {
        if (!e.isFile()) continue;
        const name = e.name;
        const m = name.match(CODE_RE);
        if (m) {
            code = { name, lang: m[3].toLowerCase() === "c" ? "c" : "cpp" };
            continue;
        }
        const tin = name.match(/^(\d+)\.in$/);
        if (tin) {
            const k = Number(tin[1]);
            (tests[k] = tests[k] || {}).in = name;
            continue;
        }
        const tans = name.match(/^(\d+)\.ans$/);
        if (tans) {
            const k = Number(tans[1]);
            (tests[k] = tests[k] || {}).ans = name;
            continue;
        }
        if (name.toLowerCase().endsWith(".pdf")) pdf = name;
        else if (name.toLowerCase().endsWith(".md")) {
            if (!md || name.toLowerCase() === "statement.md") md = name;
        }
    }
    const statement = pdf ? { type: "pdf", name: pdf } : md ? { type: "md", name: md } : null;
    const testList = Object.keys(tests)
        .map(Number)
        .sort((a, b) => a - b)
        .filter((k) => tests[k].in && tests[k].ans)
        .map((k) => ({ id: k, in: tests[k].in, ans: tests[k].ans }));
    return { code, tests: testList, pdf, statement };
}

function scanLabs() {
    const labs = [];
    let dirs = [];
    try {
        dirs = fs.readdirSync(ROOT, { withFileTypes: true });
    } catch {
        return labs;
    }
    const labNames = dirs
        .filter((d) => d.isDirectory() && LAB_DIR_RE.test(d.name))
        .map((d) => d.name)
        .sort((a, b) => {
            const na = Number(a.replace(/\D/g, ""));
            const nb = Number(b.replace(/\D/g, ""));
            return na - nb;
        });
    if (dirs.find((d) => d.isDirectory() && d.name === "Practice")) labNames.push("Practice");
    for (const lab of labNames) {
        const labPath = path.join(ROOT, lab);
        const probs = [];
        for (const p of fs.readdirSync(labPath, { withFileTypes: true })) {
            if (!p.isDirectory()) continue;
            const info = listProblemFiles(path.join(labPath, p.name));
            if (!info) continue;
            probs.push({
                name: p.name,
                rel: `${lab}/${p.name}`,
                hasCode: !!info.code,
                lang: info.code ? info.code.lang : null,
                testCount: info.tests.length,
                hasPdf: !!info.pdf,
            });
        }
        probs.sort((a, b) => a.name.localeCompare(b.name));
        labs.push({ lab, problems: probs });
    }
    return labs;
}

function resolveProblem(rel) {
    if (typeof rel !== "string" || !rel.includes("/")) return null;
    const target = path.join(ROOT, rel);
    if (!isSafeUnder(ROOT, target)) return null;
    if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) return null;
    return target;
}

function normalizeOutput(s) {
    const lines = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    while (lines.length && lines[lines.length - 1].trimEnd() === "") lines.pop();
    return lines.map((l) => l.replace(/[ \t]+$/g, "")).join("\n");
}

function compareOutput(got, ans, mode) {
    if (mode === "exact") {
        return got.replace(/\r\n/g, "\n") === ans.replace(/\r\n/g, "\n");
    }
    return normalizeOutput(got) === normalizeOutput(ans);
}

function compile(srcPath, lang, outPath) {
    const compiler = lang === "c" ? GCC : GPP;
    const std = lang === "c" ? "-std=c11" : "-std=c++17";
    const args = ["-O2", std];
    if (IS_WIN) args.push("-Wl,--stack,268435456");
    args.push("-o", outPath, srcPath);
    const r = spawnSync(compiler, args, { encoding: "utf-8", timeout: 30000, env: childEnv() });
    if (r.error) return { ok: false, stderr: `compiler error: ${r.error.message}` };
    if (r.status !== 0) return { ok: false, stderr: r.stderr || "compile failed" };
    return { ok: true, stderr: r.stderr || "" };
}

function runOne(exePath, inputPath, timeoutMs) {
    return new Promise((resolve) => {
        const started = Date.now();
        let stdout = "";
        let stderr = "";
        let done = false;
        const child = spawn(exePath, [], { windowsHide: true, env: childEnv() });
        const timer = setTimeout(() => {
            if (!done) {
                done = true;
                child.kill("SIGKILL");
                resolve({ status: "TLE", stdout, timeMs: timeoutMs });
            }
        }, timeoutMs);
        child.stdout.on("data", (d) => (stdout += d));
        child.stderr.on("data", (d) => (stderr += d));
        child.on("error", (e) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            resolve({ status: "RE", stdout, stderr: e.message, timeMs: Date.now() - started });
        });
        child.on("close", (code, signal) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            const timeMs = Date.now() - started;
            if (signal || code !== 0) {
                resolve({ status: "RE", stdout, stderr, exit: code, signal, timeMs });
            } else {
                resolve({ status: "OK", stdout, timeMs });
            }
        });
        try {
            const input = fs.readFileSync(inputPath);
            child.stdin.write(input);
            child.stdin.end();
        } catch (e) {
            if (!done) {
                done = true;
                clearTimeout(timer);
                child.kill("SIGKILL");
                resolve({ status: "RE", stdout, stderr: "cannot read input", timeMs: 0 });
            }
        }
    });
}

async function handleGrade(req, res) {
    let payload;
    try {
        payload = JSON.parse(await readBody(req));
    } catch {
        return sendJson(res, 400, { error: "bad json" });
    }
    const dir = resolveProblem(payload.rel);
    if (!dir) return sendJson(res, 400, { error: "problem not found" });

    const info = listProblemFiles(dir);
    const lang = payload.lang === "c" ? "c" : "cpp";
    const mode = payload.mode === "exact" ? "exact" : "trim";
    const timeoutMs = Math.min(Math.max(Number(payload.timeoutMs) || DEFAULT_TIMEOUT_MS, 200), 15000);

    let source = payload.code;
    if (typeof source !== "string" || source.trim() === "") {
        if (!info.code) return sendJson(res, 400, { error: "no code provided and no file in folder" });
        source = fs.readFileSync(path.join(dir, info.code.name), "utf-8");
    }
    if (!info.tests.length) return sendJson(res, 400, { error: "no test cases in this problem" });

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "grader-"));
    const srcPath = path.join(tmp, lang === "c" ? "sol.c" : "sol.cpp");
    const exePath = path.join(tmp, IS_WIN ? "sol.exe" : "sol");
    fs.writeFileSync(srcPath, source, "utf-8");

    const comp = compile(srcPath, lang, exePath);
    if (!comp.ok) {
        cleanup(tmp);
        return sendJson(res, 200, { compile: false, stderr: comp.stderr });
    }

    const results = [];
    for (const t of info.tests) {
        const inPath = path.join(dir, t.in);
        const ansPath = path.join(dir, t.ans);
        const run = await runOne(exePath, inPath, timeoutMs);
        const ans = fs.readFileSync(ansPath, "utf-8");
        let verdict = run.status;
        if (run.status === "OK") {
            verdict = compareOutput(run.stdout, ans, mode) ? "AC" : "WA";
        }
        results.push({
            id: t.id,
            verdict,
            timeMs: run.timeMs,
            input: fs.readFileSync(inPath, "utf-8"),
            expected: ans,
            got: run.stdout,
            stderr: run.stderr || "",
        });
    }
    cleanup(tmp);
    return sendJson(res, 200, {
        compile: true,
        compileWarn: comp.stderr || "",
        mode,
        timeoutMs,
        results,
    });
}

function cleanup(dir) {
    try {
        fs.rmSync(dir, { recursive: true, force: true });
    } catch {}
}

function handleProblem(req, res, url) {
    const rel = url.searchParams.get("rel");
    const dir = resolveProblem(rel);
    if (!dir) return sendJson(res, 400, { error: "problem not found" });
    const info = listProblemFiles(dir);
    let code = "";
    if (info.code) code = fs.readFileSync(path.join(dir, info.code.name), "utf-8");
    sendJson(res, 200, {
        rel,
        codeName: info.code ? info.code.name : null,
        lang: info.code ? info.code.lang : "cpp",
        code,
        pdf: info.pdf,
        statement: info.statement,
        tests: info.tests.map((t) => ({ id: t.id })),
    });
}

async function handleSave(req, res) {
    let payload;
    try {
        payload = JSON.parse(await readBody(req));
    } catch {
        return sendJson(res, 400, { error: "bad json" });
    }
    const dir = resolveProblem(payload.rel);
    if (!dir) return sendJson(res, 400, { error: "problem not found" });
    if (typeof payload.code !== "string") return sendJson(res, 400, { error: "no code" });
    const info = listProblemFiles(dir);
    let name = info.code ? info.code.name : null;
    if (!name) {
        const m = payload.rel.match(/Lab(\d+)/i);
        const nn = m ? String(m[1]).padStart(2, "0") : "00";
        const lang = payload.lang === "c" ? "c" : "cpp";
        name = `${nn}-1.${lang}`;
    }
    fs.writeFileSync(path.join(dir, name), payload.code, "utf-8");
    sendJson(res, 200, { ok: true, savedAs: name });
}

function servePdf(req, res, url) {
    const rel = url.searchParams.get("rel");
    const file = url.searchParams.get("file");
    const dir = resolveProblem(rel);
    if (!dir || !file || file.includes("..") || !file.toLowerCase().endsWith(".pdf")) {
        res.writeHead(400);
        return res.end("bad request");
    }
    const target = path.join(dir, file);
    if (!isSafeUnder(ROOT, target) || !fs.existsSync(target)) {
        res.writeHead(404);
        return res.end("not found");
    }
    res.writeHead(200, { "Content-Type": "application/pdf" });
    fs.createReadStream(target).pipe(res);
}

function serveStatement(req, res, url) {
    const rel = url.searchParams.get("rel");
    const file = url.searchParams.get("file");
    const dir = resolveProblem(rel);
    if (!dir || !file || file.includes("..")) {
        res.writeHead(400);
        return res.end("bad request");
    }
    const low = file.toLowerCase();
    if (!low.endsWith(".pdf") && !low.endsWith(".md")) {
        res.writeHead(400);
        return res.end("bad file");
    }
    const target = path.join(dir, file);
    if (!isSafeUnder(ROOT, target) || !fs.existsSync(target)) {
        res.writeHead(404);
        return res.end("not found");
    }
    if (low.endsWith(".pdf")) {
        res.writeHead(200, { "Content-Type": "application/pdf" });
        return fs.createReadStream(target).pipe(res);
    }
    res.writeHead(200, { "Content-Type": "text/markdown; charset=utf-8" });
    fs.createReadStream(target).pipe(res);
}

function serveStatic(req, res, url) {
    let p = url.pathname === "/" ? "/index.html" : url.pathname;
    const target = path.join(PUBLIC, p);
    if (!isSafeUnder(PUBLIC, target) && target !== path.join(PUBLIC, "index.html")) {
        res.writeHead(403);
        return res.end("forbidden");
    }
    fs.readFile(target, (err, data) => {
        if (err) {
            res.writeHead(404);
            return res.end("not found");
        }
        const ext = path.extname(target).toLowerCase();
        const type =
            ext === ".html"
                ? "text/html; charset=utf-8"
                : ext === ".js"
                ? "text/javascript; charset=utf-8"
                : ext === ".css"
                ? "text/css; charset=utf-8"
                : ext === ".svg"
                ? "image/svg+xml"
                : "application/octet-stream";
        res.writeHead(200, { "Content-Type": type });
        res.end(data);
    });
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    try {
        if (url.pathname === "/api/labs") return sendJson(res, 200, { root: ROOT, labs: scanLabs() });
        if (url.pathname === "/api/problem") return handleProblem(req, res, url);
        if (url.pathname === "/api/grade" && req.method === "POST") return await handleGrade(req, res);
        if (url.pathname === "/api/save" && req.method === "POST") return await handleSave(req, res);
        if (url.pathname === "/api/pdf") return servePdf(req, res, url);
        if (url.pathname === "/api/statement") return serveStatement(req, res, url);
        return serveStatic(req, res, url);
    } catch (e) {
        sendJson(res, 500, { error: String(e && e.message ? e.message : e) });
    }
});

function checkCompilers() {
    for (const [name, p] of [["g++", GPP], ["gcc", GCC]]) {
        if (path.isAbsolute(p)) {
            if (fs.existsSync(p)) console.log(`[compiler] ${name}: ${p}`);
            else console.warn(`[warn] ${name} not found at ${p} — set ${name === "g++" ? "GRADER_GPP" : "GRADER_GCC"} env or install a compiler`);
        } else {
            console.log(`[compiler] ${name}: "${p}" (from PATH)`);
        }
    }
}

server.listen(PORT, "127.0.0.1", () => {
    checkCompilers();
    console.log(`Grader running at http://localhost:${PORT}`);
    console.log(`Scanning labs under: ${ROOT}`);
});
