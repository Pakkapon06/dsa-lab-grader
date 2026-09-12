# CS231 — DSA Lab Grader

โปรเจกต์รวมโจทย์ Lab วิชา **01418231 Data Structures and Algorithms (CS231)** มหาวิทยาลัยเกษตรศาสตร์
พร้อม **web grader** ที่รันในเครื่องตัวเอง สำหรับตรวจคำตอบอัตโนมัติ — compile → รันกับทุก test case → เทียบผล → รายงาน **AC / WA / TLE / RE / CE** พร้อม diff ทีละบรรทัด และเก็บประวัติการ Run

> ⚠️ grader นี้ **compile และรันโค้ด C/C++ จริง** ในเครื่องคุณ จึงรันบน Vercel/Netlify ไม่ได้ (ต้องรันในเครื่องตัวเอง)

---

## 1. สิ่งที่ต้องมีก่อน (ติดตั้งครั้งเดียว)

### 1.1 Node.js (v18 ขึ้นไป)
ดาวน์โหลด + ติดตั้งจาก <https://nodejs.org> (เลือก LTS) — เช็คว่าติดตั้งสำเร็จ:
```bash
node --version
```

### 1.2 คอมไพเลอร์ g++ / gcc

**Windows** — แนะนำ MSYS2:
1. ติดตั้ง MSYS2 จาก <https://www.msys2.org>
2. เปิด "MSYS2 UCRT64" แล้วรัน:
   ```bash
   pacman -S mingw-w64-ucrt-x86_64-gcc
   ```
   (หรือถ้าใช้ mingw64: `pacman -S mingw-w64-x86_64-gcc`)

   grader หา g++ ให้อัตโนมัติจาก `C:\msys64\ucrt64\bin` และ `C:\msys64\mingw64\bin` — ถ้าลงที่อื่นดูข้อ 4

**Linux (Ubuntu/Debian):**
```bash
sudo apt update && sudo apt install g++
```

**macOS:**
```bash
xcode-select --install
```
(หรือ `brew install gcc`)

เช็คว่าเจอ compiler:
```bash
g++ --version
```

---

## 2. โหลดโปรเจกต์

```bash
git clone https://github.com/Pakkapon06/dsa-lab-grader.git
```
```bash
cd dsa-lab-grader
```

---

## 3. รัน grader

```bash
node _grader/server.js
```

แล้วเปิดเบราว์เซอร์ไปที่ **<http://localhost:5599>**

- **Windows:** ดับเบิลคลิก `_grader\run-grader.cmd` ก็ได้ (เปิดเบราว์เซอร์ให้อัตโนมัติ) — หรือรัน `_grader\create-shortcut.ps1` หนึ่งครั้งเพื่อสร้าง `Lab Grader.lnk` (มี icon) ไว้ดับเบิลคลิก
- **Linux/macOS:** `bash _grader/run-grader.sh`

ตอน server เปิด จะพิมพ์บอกว่าเจอ compiler ที่ไหน เช่น `[compiler] g++: C:\msys64\ucrt64\bin\g++.exe`

### วิธีใช้เว็บ
1. เลือกโจทย์จากแถบซ้าย (เปิดมาจะเลือกข้อแรกให้เลย)
2. อ่านโจทย์ในแท็บ **โจทย์** (PDF) · กด **🔑 เฉลย** เพื่อดูเฉลย (ไม่ทับโค้ดที่พิมพ์)
3. พิมพ์โค้ดของคุณในช่อง editor แล้วกด **▶ Run** (หรือ Ctrl+Enter)
4. ดูผลในแท็บ **ผล Grader** — คลิกเคสที่ fail เพื่อดู input/expected/got · ดูประวัติในแท็บ **ประวัติ**
   - จุดหน้าชื่อโจทย์: 🟢 เขียว = รันผ่านหมด · 🔴 แดง = มีเคสไม่ผ่าน · ⚪ เทา = ยังไม่ได้รัน
   - ชื่อโจทย์สีแดง = ยังไม่มีเฉลยในโฟลเดอร์

---

## 4. ถ้า compiler อยู่ที่อื่น (แก้ "compiler not found")

ตั้ง environment variable ชี้ path เอง:
```bash
# Windows PowerShell
$env:GRADER_GPP="D:\path\to\g++.exe"; node _grader/server.js
```
```bash
# Linux / macOS
GRADER_GPP=/usr/bin/g++ node _grader/server.js
```
(ตั้ง `GRADER_GCC` เพิ่มถ้าใช้โจทย์ภาษา C ด้วย)

**เปลี่ยน port** (ถ้า 5599 ชนกับโปรแกรมอื่น): ตั้ง `GRADER_PORT` เช่น `GRADER_PORT=8080 node _grader/server.js`

---

## 5. เพิ่มโจทย์ของตัวเอง

สร้างโฟลเดอร์ `problems/LabN/<ชื่อโจทย์>/` วางไฟล์ `1.in` / `1.ans` (จับคู่เลขเดียวกัน, มีได้หลายชุด) และวางโจทย์เป็น `.pdf` หรือ `statement.md` ถ้ามี — แล้วกด **↻ Reload** ในเว็บ grader จะเห็นเอง

---

## โครงสร้างโปรเจกต์

```
dsa-lab-grader/
├── _grader/            เว็บ grader (Node built-in ล้วน ไม่ต้อง npm install)
│   ├── server.js       HTTP server + compile/run/diff
│   ├── public/         หน้าเว็บ (index.html, app.js, style.css)
│   └── run-grader.*    ตัวเปิด (cmd/ps1/sh) + create-shortcut.ps1
├── problems/
│   ├── Lab1/ … Lab8/   โจทย์ 8 Lab (PDF + เฉลย + .in/.ans)
│   └── Practice/       โจทย์ฝึก original
├── CLAUDE.md
└── README.md
```

## หัวข้อแต่ละ Lab

| Lab | หัวข้อ | | Lab | หัวข้อ |
|-----|--------|---|-----|--------|
| 1 | Intro C / C++ | | 5 | Recursive Function & Hash Table |
| 2 | String, Array, Struct & Class | | 6 | Linear & Binary Search |
| 3 | Linked List | | 7 | Graph & Graph Traversal |
| 4 | Stack & Queue | | 8 | Tree & Tree Traversal |

## หมายเหตุ

- เวลาที่ grader วัดเป็นของเครื่องคุณ ใช้ดูคร่าว ๆ — judge จริงเป็น Linux ความเร็วต่างกัน
- ประวัติ/ผล/โค้ดที่พิมพ์ เก็บใน browser (localStorage) ของเครื่องนั้น ๆ ไม่ได้แชร์ข้ามเครื่อง
- grader รันที่ `127.0.0.1` เท่านั้น (ไม่เปิดออกเน็ต)
