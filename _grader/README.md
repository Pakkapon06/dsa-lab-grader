# Lab Grader

เว็บ grader ในเครื่องสำหรับตรวจโจทย์ Lab อัตโนมัติ: compile → รันทุก `.in` → เทียบ `.ans` → รายงาน AC/WA/TLE/RE/CE

## วิธีรัน

ดับเบิลคลิก `run-grader.ps1` หรือรันใน terminal:

```bash
node _grader/server.js
```

แล้วเปิด http://localhost:5599 (เปลี่ยน port ได้ด้วย env `GRADER_PORT`)

## ฟีเจอร์

- สแกน `Lab*/<โจทย์>/` อัตโนมัติ — จุดเขียว = มีโค้ด, จุดแดง = ยังไม่ทำ, ตัวเลข = จำนวน test
- แก้โค้ดในเว็บได้ (Ctrl+Enter = Grade) หรือ grade ไฟล์เดิมในโฟลเดอร์
- **Save** เขียนโค้ดกลับลงไฟล์ `<NN>-<M>.cpp/.c` (ถามยืนยันก่อนทับ)
- เทียบผลแบบ **trim** (แนะนำ — ตัดช่องว่างท้าย/บรรทัดว่างท้าย, กัน CRLF ของ Windows) หรือ **exact**
- ตั้ง timeout ได้ (กัน infinite loop)
- คลิกเคสที่ fail → เห็น input / expected / got เทียบข้างกัน highlight บรรทัดที่ต่าง
- เปิด PDF โจทย์ได้จากในเว็บ

## แชร์ให้เพื่อน / ใช้เครื่องอื่น (portable)

grader นี้ทำงานข้าม platform ได้ (Windows / Linux / macOS) — สิ่งที่เพื่อนต้องมี:

1. **Node.js** (v18+ ก็พอ) — ดาวน์โหลดที่ nodejs.org
2. **คอมไพเลอร์ g++/gcc** สักตัวในเครื่อง

**การหา compiler ทำอัตโนมัติ** ตามลำดับ:
1. env `GRADER_GPP` / `GRADER_GCC` (ชี้ path เอง — override ได้)
2. ที่ติดตั้งยอดนิยม: Windows → MSYS2 (`C:\msys64\mingw64|ucrt64`), MinGW, Strawberry · Linux/mac → `/usr/bin`, `/usr/local/bin`, `/opt/homebrew/bin`
3. `where`/`which` ตาม PATH

ถ้าเจอ compiler ที่อื่น สั่ง (ตัวอย่าง):
```bash
# Windows PowerShell
$env:GRADER_GPP="D:\mingw\bin\g++.exe"; node _grader/server.js
# Linux/mac
GRADER_GPP=/usr/bin/g++ node _grader/server.js
```
ตอนเปิด server จะพิมพ์ว่าเจอ compiler ที่ไหน (`[compiler] g++: ...`) — ถ้าไม่เจอจะเตือน

**วิธีแชร์:** zip ทั้งโฟลเดอร์ `Lab/` (มี `_grader/` + โฟลเดอร์โจทย์) ส่งให้เพื่อน หรือ push ขึ้น GitHub — เพื่อนแตกไฟล์แล้วรัน `node _grader/server.js` ได้เลย
- flag `-Wl,--stack` ใส่เฉพาะบน Windows (Linux/mac stack ใหญ่กว่าอยู่แล้ว)
- ฟอนต์โหลดจาก Google Fonts (ออนไลน์) — ออฟไลน์จะ fallback เป็นฟอนต์ระบบ ยังใช้ได้ปกติ

## หมายเหตุสำคัญ

- ค่า default บน Windows: MSYS2 `C:\msys64\mingw64\bin\g++.exe` / `gcc.exe` (`-O2 -std=c++17` / `c11`)
- บน Windows compile ด้วย `-Wl,--stack,268435456` (stack 256MB) เพื่อกัน **stack overflow ปลอม** จาก local array ใหญ่ ๆ ที่บน judge (Linux) ผ่านแต่บน Windows (stack 1MB) crash
- เวลาที่วัดเป็นของเครื่องนั้น ๆ ใช้ดูคร่าว ๆ — **judge จริงเป็น Linux** ความเร็ว scanf/printf ต่างกัน อย่ายึดเป็นหลัก
- รันที่ `127.0.0.1` เท่านั้น (ไม่เปิดออกเน็ต) — ถ้าอยากให้เพื่อนในวง LAN เดียวกันเข้าได้ ต้องแก้ `server.listen` เป็น `0.0.0.0` (ระวังความปลอดภัย เพราะ grader รันโค้ดที่ส่งเข้ามา)
