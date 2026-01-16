# Claude Context Instructions

## 📖 สิ่งสำคัญที่ต้องอ่านก่อน

**เมื่อเริ่มต้นทำงานกับโปรเจคนี้ ต้องอ่าน README.md ก่อนเสมอ** เพื่อเข้าใจ:
- โครงสร้างโปรเจค
- Features ทั้งหมด
- วิธีการใช้งาน
- Tech stack ที่ใช้

## 🎯 โปรเจคนี้คืออะไร

ระบบจัดการการยืม-คืนเอกสารสำหรับมูลนิธิและสมาคม ที่สามารถ:
- บันทึกการยืมพร้อมคำนวณจำนวนเล่มอัตโนมัติ
- รองรับการคืนแบบหลายรอบ (partial return)
- แสดง timeline ประวัติการคืนแต่ละรอบ
- ใช้งานบน mobile ได้ลื่นไหล

## 📂 ไฟล์สำคัญ

### Types & Schema
- `lib/types.ts` - TypeScript types สำหรับทั้งระบบ
  - `BorrowRecord` - โครงสร้างข้อมูลการยืม
  - `ReturnHistoryEntry` - log การคืนแต่ละรอบ
  - `OrganizationType` - ประเภท (มูลนิธิ/สมาคม)

### Data Management
- `lib/storage.ts` - localStorage CRUD operations
- `lib/districts.ts` - รายชื่อ 50 เขตใน กทม
- `lib/utils.ts` - Utility functions:
  - `calculateBorrowedBooks()` - คำนวณเล่มที่ยืม
  - `formatDate()` - format วันที่
  - `cn()` - Tailwind class merger

### Pages
- `app/page.tsx` - Dashboard with stats
- `app/borrow/page.tsx` - Form เพิ่มการยืม
- `app/history/page.tsx` - ประวัติทั้งหมด
- `app/detail/[id]/page.tsx` - รายละเอียด + timeline
- `app/return/[id]/page.tsx` - เลือกเล่มที่จะคืน

### Components
- `components/Header.tsx` - Header component
- `components/Navigation.tsx` - Bottom nav
- `components/SearchableSelect.tsx` - Dropdown แบบ searchable
- `components/ui/blur-fade.tsx` - Magic UI animation
- `components/ui/shimmer-button.tsx` - Magic UI button

## 🔄 การคืนแบบหลายรอบ

**สิ่งสำคัญ**: ระบบรองรับการคืนเป็นรอบๆ

### สถานะ 3 แบบ:
1. `borrowed` - ยังไม่ได้คืนเลย
2. `partially_returned` - คืนบางส่วนแล้ว
3. `returned` - คืนครบแล้ว

### การ track:
- `returnedBooks: string[]` - เล่มทั้งหมดที่คืนแล้ว
- `returnHistory: ReturnHistoryEntry[]` - log แต่ละรอบ
  - แต่ละ entry มี: date, booksReturned, count

## 🎨 Magic UI Components

ใช้ Magic UI components สำหรับ UX ที่ดีขึ้น:
- `BlurFade` - Animation fade in ที่นุ่มนวล
- `ShimmerButton` - ปุ่มที่มี shimmer effect

**Dependencies**:
- framer-motion
- @radix-ui/react-slot
- class-variance-authority

## 🐳 Docker Setup

### Dev Mode
- `docker-compose.yml` - Hot reload with volume mounting
- Port: 3005:3000
- Command: `npm install && npm run dev`

### Prod Mode
- `docker-compose.prod.yml` - Multi-stage build
- Port: 3005:3000
- Uses Dockerfile for optimized build
- `next.config.ts` มี `output: "standalone"` สำหรับ Docker

## ⚠️ สิ่งที่ต้องระวัง

1. **localStorage initialization**
   - ต้องเช็ค `typeof window !== "undefined"`
   - returnedBooks และ returnHistory ต้องมี default value `[]`

2. **Date handling**
   - localStorage serialize Date เป็น string
   - ต้อง convert กลับเป็น Date object เมื่ออ่าน
   - ใช้ `formatDate()` ที่มี safety check

3. **Partial return logic**
   - ต้องเช็คว่าคืนครบหรือยัง: `newReturnedBooks.length === record.calculatedBooks.length`
   - update status ให้ถูกต้อง
   - เพิ่ม entry ใหม่เข้า returnHistory[]

## 💡 เมื่อต้องแก้ไขหรือเพิ่ม Feature

1. อ่าน README.md ก่อนเสมอ
2. ดูที่ `lib/types.ts` เพื่อเข้าใจ data structure
3. ตรวจสอบว่า feature ส่งผลต่อ:
   - การคำนวณเล่ม (`lib/utils.ts`)
   - localStorage (`lib/storage.ts`)
   - สถานะต่างๆ (borrowed/partially_returned/returned)
4. Test ด้วย dev browser เสมอ
5. Update README.md ถ้ามีการเปลี่ยนแปลงสำคัญ

## 🔍 Quick Reference

```typescript
// ตัวอย่าง BorrowRecord structure
{
  id: string
  date: Date
  organizationType: "มูลนิธิ" | "สมาคม"
  district: string
  startNumber: number
  endNumber: number
  missingNumbers: string
  duplicateNumbers: string
  calculatedBooks: string[]
  totalBooks: number
  status: "borrowed" | "partially_returned" | "returned"
  returnedBooks: string[]
  returnHistory: ReturnHistoryEntry[]
}
```

---

**หมายเหตุ**: โปรเจคนี้เน้น mobile-first และ UX ที่ดี การแก้ไขใดๆ ควรคำนึงถึง mobile experience เป็นหลัก
