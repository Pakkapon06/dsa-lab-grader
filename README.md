# CS231 — DSA Lab Grader

โปรเจกต์รวมโจทย์ Lab วิชา **01418231 Data Structures and Algorithms (CS231)** ม.เกษตรศาสตร์
พร้อม **web grader** ในเครื่องสำหรับตรวจคำตอบอัตโนมัติ (compile → รันทุก test → เทียบผล → AC/WA/TLE/RE/CE)

## เริ่มใช้งาน

ต้องมี **Node.js** (v18+) และ **g++/gcc** ในเครื่อง แล้วรัน:

```bash
node _grader/server.js
```

เปิด http://localhost:5599 → เลือกโจทย์จากซ้าย → พิมพ์โค้ด → กด **Run**

- Windows: ดับเบิลคลิก `_grader/run-grader.cmd` ก็ได้
- Linux/macOS: `bash _grader/run-grader.sh`

grader หา compiler ให้อัตโนมัติ (MSYS2 / MinGW / `/usr/bin` / PATH) — ถ้าอยู่ที่อื่นตั้ง env `GRADER_GPP` / `GRADER_GCC` ชี้เอง

## โครงสร้าง

```
Lab/
├── _grader/            เว็บ grader (Node built-in ล้วน ไม่ต้อง npm install)
├── Lab1/ … Lab8/       โจทย์จริง 8 Lab × 3 ข้อ (PDF + เฉลย + .in/.ans)
├── Practice/           โจทย์ฝึก original เพิ่มเติม
└── README.md
```

แต่ละโฟลเดอร์โจทย์: `prob-*.pdf` (โจทย์) · `<NN>-<M>.cpp/.c` (เฉลย) · `N.in` / `N.ans` (test)

## หัวข้อแต่ละ Lab

| Lab | หัวข้อ |
|-----|--------|
| 1 | Intro C / C++ |
| 2 | String, Array, Struct and Class |
| 3 | Linked List |
| 4 | Stack and Queue |
| 5 | Recursive Function and Hash Table |
| 6 | Linear Search and Binary Search |
| 7 | Graph and Graph Traversal |
| 8 | Tree and Tree Traversal |

## เพิ่มโจทย์ของตัวเอง

สร้างโฟลเดอร์ `LabN/<ชื่อโจทย์>/` วางไฟล์ `1.in`/`1.ans` (และ `prob.pdf` ถ้ามี) แล้วกด **↻ Reload** ในเว็บ — grader จะเห็นเอง

> รายละเอียด grader เพิ่มเติมดู [`_grader/README.md`](_grader/README.md)
