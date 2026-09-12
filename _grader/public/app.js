const $ = (id) => document.getElementById(id);
const state = { rel: null, lang: "cpp", statement: null, solution: "", results: [], active: null, drafts: {} };

function saveDraft() {
    if (!state.rel) return;
    const v = $("editor").value;
    if (v) state.drafts[state.rel] = v;
    else delete state.drafts[state.rel];
    try { localStorage.setItem("grader-drafts", JSON.stringify(state.drafts)); } catch {}
}

async function api(path, opts) {
    const r = await fetch(path, opts);
    return r.json();
}
function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------- icons (inline SVG, Lucide-style) ---------- */
const ICONS = {
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M8 9h2"/>',
    check: '<path d="M21.8 10A10 10 0 1 1 17 3.3"/><path d="m9 11 3 3L22 4"/>',
    key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L21 5"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
    save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
};
function svg(name) {
    return '<svg class="ic-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
}
function initIcons(root) {
    (root || document).querySelectorAll("[data-ic]").forEach((e) => { e.innerHTML = svg(e.dataset.ic); });
}

const LAB_TOPICS = {
    Lab1: "Intro C / C++",
    Lab2: "String · Array · Struct/Class",
    Lab3: "Linked List",
    Lab4: "Stack & Queue",
    Lab5: "Recursion & Hashing",
    Lab6: "Linear & Binary Search",
    Lab7: "Graph & Traversal",
    Lab8: "Tree & Traversal",
    Practice: "โจทย์ฝึก (original)",
};

/* ---------- syntax highlight (C/C++) ---------- */
const KW = new Set("if else for while do return break continue switch case default goto sizeof new delete this using namespace template typename public private protected class struct enum union operator const constexpr static extern inline virtual override friend explicit mutable volatile register nullptr true false".split(" "));
const TY = new Set("int long short char bool float double void unsigned signed auto string wstring size_t vector map set pair stack queue deque list array unordered_map unordered_set priority_queue FILE".split(" "));
const HL_RE = /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|((?<=^[ \t]*)#[^\n]*)|(\b\d[\w.]*)|([A-Za-z_]\w*)|(\s+)|([^\sA-Za-z0-9_]+)/gm;

function highlight(code) {
    let out = "";
    HL_RE.lastIndex = 0;
    let m;
    while ((m = HL_RE.exec(code)) !== null) {
        if (m[1]) out += `<span class="t-com">${escapeHtml(m[1])}</span>`;
        else if (m[2]) out += `<span class="t-com">${escapeHtml(m[2])}</span>`;
        else if (m[3]) out += `<span class="t-str">${escapeHtml(m[3])}</span>`;
        else if (m[4]) out += `<span class="t-str">${escapeHtml(m[4])}</span>`;
        else if (m[5]) out += `<span class="t-pre">${escapeHtml(m[5])}</span>`;
        else if (m[6]) out += `<span class="t-num">${escapeHtml(m[6])}</span>`;
        else if (m[7]) {
            const id = m[7];
            if (KW.has(id)) out += `<span class="t-key">${id}</span>`;
            else if (TY.has(id)) out += `<span class="t-type">${id}</span>`;
            else {
                let j = HL_RE.lastIndex;
                while (code[j] === " " || code[j] === "\t") j++;
                out += code[j] === "(" ? `<span class="t-fn">${escapeHtml(id)}</span>` : escapeHtml(id);
            }
        } else if (m[8]) out += escapeHtml(m[8]);
        else if (m[9]) out += `<span class="t-punct">${escapeHtml(m[9])}</span>`;
    }
    return out;
}

function renderEditor() {
    const code = $("editor").value;
    $("hl").firstElementChild.innerHTML = highlight(code) + "\n";
    syncScroll();
}
function syncScroll() {
    const e = $("editor"), h = $("hl");
    h.scrollTop = e.scrollTop;
    h.scrollLeft = e.scrollLeft;
}

/* ---------- tabs ---------- */
function switchTab(name) {
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    $("panelStatement").classList.toggle("active", name === "statement");
    $("panelResults").classList.toggle("active", name === "results");
}

/* ---------- minimal markdown ---------- */
function renderMarkdown(md) {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let i = 0;
    const inline = (s) =>
        escapeHtml(s)
            .replace(/`([^`]+)`/g, "<code>$1</code>")
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            .replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, "<em>$1</em>");
    while (i < lines.length) {
        const line = lines[i];
        if (/^```/.test(line)) {
            let code = "";
            i++;
            while (i < lines.length && !/^```/.test(lines[i])) code += lines[i++] + "\n";
            i++;
            html += `<pre><code>${escapeHtml(code)}</code></pre>`;
            continue;
        }
        if (/^\s*$/.test(line)) { i++; continue; }
        let mh = line.match(/^(#{1,4})\s+(.*)$/);
        if (mh) { html += `<h${mh[1].length}>${inline(mh[2])}</h${mh[1].length}>`; i++; continue; }
        if (/^\s*([-*_])\s*\1\s*\1[\s\1]*$/.test(line)) { html += "<hr>"; i++; continue; }
        if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[-:\s|]+\|\s*$/.test(lines[i + 1])) {
            const head = line.split("|").slice(1, -1).map((c) => c.trim());
            i += 2;
            let rows = "";
            while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
                const cells = lines[i].split("|").slice(1, -1).map((c) => c.trim());
                rows += "<tr>" + cells.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>";
                i++;
            }
            html += "<table><thead><tr>" + head.map((c) => `<th>${inline(c)}</th>`).join("") + "</tr></thead><tbody>" + rows + "</tbody></table>";
            continue;
        }
        if (/^\s*>/.test(line)) {
            let q = "";
            while (i < lines.length && /^\s*>/.test(lines[i])) q += lines[i++].replace(/^\s*>\s?/, "") + " ";
            html += `<blockquote>${inline(q)}</blockquote>`;
            continue;
        }
        if (/^\s*[-*]\s+/.test(line)) {
            let items = "";
            while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items += `<li>${inline(lines[i++].replace(/^\s*[-*]\s+/, ""))}</li>`;
            html += `<ul>${items}</ul>`;
            continue;
        }
        if (/^\s*\d+\.\s+/.test(line)) {
            let items = "";
            while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items += `<li>${inline(lines[i++].replace(/^\s*\d+\.\s+/, ""))}</li>`;
            html += `<ol>${items}</ol>`;
            continue;
        }
        let para = "";
        while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,4}\s|```|\s*\||\s*>|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) para += lines[i++] + " ";
        html += `<p>${inline(para)}</p>`;
    }
    return html;
}

async function loadStatement(rel, statement) {
    const panel = $("panelStatement");
    if (!statement) { panel.innerHTML = '<div class="empty">โจทย์นี้ไม่มีไฟล์คำอธิบาย</div>'; return; }
    const url = "/api/statement?rel=" + encodeURIComponent(rel) + "&file=" + encodeURIComponent(statement.name);
    if (statement.type === "pdf") {
        panel.innerHTML = `<embed src="${url}#toolbar=1" type="application/pdf" />`;
    } else {
        panel.innerHTML = '<div class="md-view">กำลังโหลด…</div>';
        const txt = await (await fetch(url)).text();
        panel.innerHTML = `<div class="md-view">${renderMarkdown(txt)}</div>`;
    }
}

/* ---------- labs sidebar ---------- */
async function loadLabs() {
    const sidebar = $("sidebar");
    sidebar.innerHTML = '<div class="empty">กำลังสแกน…</div>';
    const data = await api("/api/labs");
    if (!data.labs.length) { sidebar.innerHTML = '<div class="empty">ไม่พบโฟลเดอร์ Lab</div>'; return; }
    sidebar.innerHTML = "";
    for (const lab of data.labs) {
        const t = document.createElement("div");
        t.className = "lab-title";
        const labNum = lab.lab.replace(/^Lab/, "Lab ");
        t.innerHTML = '<span class="lab-name">' + escapeHtml(labNum) + "</span>" +
            (LAB_TOPICS[lab.lab] ? '<span class="lab-topic">' + escapeHtml(LAB_TOPICS[lab.lab]) + "</span>" : "");
        sidebar.appendChild(t);
        for (const p of lab.problems) {
            const row = document.createElement("div");
            row.className = "prob";
            row.dataset.rel = p.rel;
            const dot = document.createElement("span");
            dot.className = "dot " + (p.hasCode ? "has" : "none");
            dot.title = p.hasCode ? "มีเฉลย" : "ยังไม่มีเฉลย";
            const name = document.createElement("span");
            name.className = "name";
            name.textContent = p.name;
            const tc = document.createElement("span");
            tc.className = "tc";
            tc.textContent = p.testCount ? p.testCount + "t" : "–";
            row.append(dot, name, tc);
            row.onclick = () => selectProblem(p.rel, row);
            sidebar.appendChild(row);
        }
    }
    if (!state.rel) {
        const first = sidebar.querySelector(".prob");
        if (first) selectProblem(first.dataset.rel, first);
    }
}

async function selectProblem(rel, row) {
    saveDraft();
    document.querySelectorAll(".prob.active").forEach((e) => e.classList.remove("active"));
    if (row) row.classList.add("active");
    state.rel = rel;
    const data = await api("/api/problem?rel=" + encodeURIComponent(rel));
    state.lang = data.lang || "cpp";
    state.statement = data.statement;
    state.solution = data.code || "";
    state.solutionName = data.codeName || "";
    $("langSel").value = state.lang;
    $("toolbar").hidden = false;
    $("probName").textContent = rel;
    $("editor").value = state.drafts[rel] || "";
    renderEditor();
    $("solBtn").disabled = !state.solution;
    const flag = $("editorFlag");
    flag.hidden = false;
    flag.textContent = (state.lang === "c" ? "C" : "C++") + (state.solution ? " · มีเฉลย" : " · ยังไม่มีเฉลย");
    resetResults(data.tests.length);
    await loadStatement(rel, data.statement);
    switchTab("statement");
}

function resetResults(testCount) {
    state.results = [];
    state.active = null;
    $("summary").innerHTML = testCount
        ? '<span class="hint">' + testCount + " test cases — กด ▶ Run</span>"
        : '<span class="hint" style="color:var(--wa)">โจทย์นี้ไม่มี test case</span>';
    $("cases").innerHTML = "";
    $("detail").innerHTML = '<div class="empty">ผลการ grade จะแสดงที่นี่</div>';
}

function openSolution() {
    if (!state.solution) return;
    $("solName").textContent = state.solutionName || "";
    $("solCode").firstElementChild.innerHTML = highlight(state.solution) + "\n";
    $("solModal").hidden = false;
}
function closeSolution() { $("solModal").hidden = true; }
function flashCopy() {
    const b = $("solCopy"); const o = b.textContent;
    b.textContent = "คัดลอกแล้ว ✓"; setTimeout(() => (b.textContent = o), 1200);
}
async function copySolution() {
    try { await navigator.clipboard.writeText(state.solution); flashCopy(); }
    catch {
        const t = document.createElement("textarea"); t.value = state.solution;
        document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); flashCopy();
    }
}

async function grade() {
    if (!state.rel) return;
    const code = $("editor").value;
    if (!code.trim()) {
        switchTab("results");
        $("summary").innerHTML = '<span class="hint" style="color:var(--tle)">พิมพ์โค้ดก่อน Run — หรือกด 🔑 เฉลย เพื่อดู/คัดลอกเฉลย</span>';
        $("cases").innerHTML = ""; $("detail").innerHTML = "";
        return;
    }
    const btn = $("gradeBtn");
    btn.disabled = true;
    btn.innerHTML = '<span class="spin"></span> Run…';
    switchTab("results");
    $("summary").innerHTML = '<span class="hint"><span class="spin"></span> compile & run…</span>';
    $("cases").innerHTML = ""; $("detail").innerHTML = "";
    try {
        const res = await api("/api/grade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rel: state.rel, code, lang: $("langSel").value, mode: $("modeSel").value, timeoutMs: Number($("timeoutInp").value) }),
        });
        renderResults(res);
    } catch (e) {
        $("summary").innerHTML = '<span class="hint" style="color:var(--wa)">error: ' + e.message + "</span>";
    } finally {
        btn.disabled = false;
        btn.innerHTML = "▶ Run";
    }
}

function renderResults(res) {
    if (res.error) { $("summary").innerHTML = '<span class="hint" style="color:var(--wa)">' + res.error + "</span>"; return; }
    if (res.compile === false) {
        $("summary").innerHTML = '<span class="verdict v-CE">CE</span> <span class="hint">compile error</span>';
        $("cases").innerHTML = "";
        $("detail").innerHTML = '<div class="compile-err">' + escapeHtml(res.stderr) + "</div>";
        return;
    }
    state.results = res.results;
    const total = res.results.length;
    const ac = res.results.filter((r) => r.verdict === "AC").length;
    $("summary").innerHTML =
        '<span class="score ' + (ac === total ? "pass" : "fail") + '">' + ac + " / " + total + '<span class="lab">AC</span></span>' +
        '<span class="meta">mode ' + res.mode + " · " + res.timeoutMs + "ms" +
        (res.compileWarn ? ' · <span style="color:var(--tle)">warning</span>' : "") + "</span>";
    const cases = $("cases");
    cases.innerHTML = "";
    res.results.forEach((r, i) => {
        const row = document.createElement("div");
        row.className = "case-row";
        row.innerHTML =
            '<span class="cid">#' + r.id + "</span>" +
            '<span class="verdict v-' + r.verdict + '">' + r.verdict + "</span>" +
            '<span class="time">' + r.timeMs + " ms</span>";
        row.onclick = () => showDetail(i, row);
        cases.appendChild(row);
    });
    const firstFail = res.results.findIndex((r) => r.verdict !== "AC");
    const pick = firstFail >= 0 ? firstFail : 0;
    showDetail(pick, cases.children[pick]);
}

function showDetail(i, row) {
    document.querySelectorAll(".case-row.active").forEach((e) => e.classList.remove("active"));
    if (row) row.classList.add("active");
    state.active = i;
    const r = state.results[i];
    if (!r) return;
    let html =
        '<p class="lbl">Input · #' + r.id + '</p><pre>' + escapeHtml(r.input || "(ว่าง)") + "</pre>" +
        '<div class="cols"><div><p class="lbl">Expected</p>' + diffBlock(r.expected, r.got) + "</div>" +
        '<div><p class="lbl">Got' + (r.verdict === "TLE" ? " · TLE" : "") + '</p>' + diffBlock(r.got, r.expected) + "</div></div>";
    if (r.stderr) html += '<p class="lbl">stderr</p><pre>' + escapeHtml(r.stderr) + "</pre>";
    $("detail").innerHTML = html;
}

function normLines(s) {
    const lines = (s || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").map((l) => l.replace(/[ \t]+$/g, ""));
    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    return lines;
}
function diffBlock(a, b) {
    const la = normLines(a), lb = normLines(b);
    const n = Math.max(la.length, lb.length);
    let out = "";
    for (let i = 0; i < n; i++) {
        const x = la[i];
        if (x === undefined) continue;
        const cls = x !== lb[i] ? "difline diff" : "difline";
        out += '<span class="' + cls + '">' + (escapeHtml(x) || "&nbsp;") + "</span>";
    }
    return "<pre>" + (out || "&nbsp;") + "</pre>";
}

async function save() {
    if (!state.rel) return;
    if (!$("editor").value.trim()) { alert("ช่องโค้ดว่าง"); return; }
    if (!confirm("บันทึกโค้ดทับไฟล์ในโฟลเดอร์โจทย์นี้?")) return;
    const res = await api("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rel: state.rel, code: $("editor").value, lang: $("langSel").value }),
    });
    if (res.ok) {
        state.solution = $("editor").value;
        $("solBtn").disabled = false;
        switchTab("results");
        $("summary").innerHTML = '<span class="hint" style="color:var(--ac)">บันทึกแล้ว: ' + res.savedAs + "</span>";
        loadLabs();
    } else alert("save error: " + (res.error || "unknown"));
}

function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("grader-theme", next); } catch {}
}

(function init() {
    try { const t = localStorage.getItem("grader-theme"); if (t) document.documentElement.setAttribute("data-theme", t); } catch {}
    try { state.drafts = JSON.parse(localStorage.getItem("grader-drafts") || "{}") || {}; } catch { state.drafts = {}; }
    $("gradeBtn").onclick = grade;
    $("saveBtn").onclick = save;
    $("solBtn").onclick = openSolution;
    $("solClose").onclick = closeSolution;
    $("solCopy").onclick = copySolution;
    $("solModal").addEventListener("click", (e) => { if (e.target === $("solModal")) closeSolution(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("solModal").hidden) closeSolution(); });
    $("reloadBtn").onclick = loadLabs;
    $("themeBtn").onclick = toggleTheme;
    document.querySelectorAll(".tab").forEach((t) => (t.onclick = () => switchTab(t.dataset.tab)));
    initIcons();
    const ed = $("editor");
    ed.addEventListener("input", () => { renderEditor(); saveDraft(); });
    ed.addEventListener("scroll", syncScroll);
    ed.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const s = ed.selectionStart, en = ed.selectionEnd;
            ed.value = ed.value.slice(0, s) + "    " + ed.value.slice(en);
            ed.selectionStart = ed.selectionEnd = s + 4;
            renderEditor(); saveDraft();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); grade(); }
    });
    window.addEventListener("beforeunload", saveDraft);
    loadLabs();
})();
