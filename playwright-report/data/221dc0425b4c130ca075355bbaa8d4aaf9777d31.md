# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile-documents.spec.ts >> Profile - Upload Dokumen >> upload dokumen dengan mock API - tidak hang
- Location: tests\profile-documents.spec.ts:5:7

# Error details

```
Error: expect(locator).toBeEnabled() failed

Locator:  getByRole('button', { name: /kirim semua/i })
Expected: enabled
Received: disabled
Timeout:  5000ms

Call log:
  - Expect "toBeEnabled" getByRole('button', { name: /kirim semua/i }) with timeout 5000ms
  - waiting for getByRole('button', { name: /kirim semua/i })
    14 × locator resolved to <button disabled type="button" class="cursor-pointer rounded-full bg-white px-6 h-10 text-xs font-semibold text-[#1B235E] shadow-[0_0_30px_rgba(46,92,255,0.45)] hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">Kirim Semua Dokumen</button>
       - unexpected value "disabled"

```

```yaml
- button "Kirim Semua Dokumen" [disabled]
```

# Test source

```ts
  47  |         contentType: 'application/json',
  48  |         body: JSON.stringify({
  49  |           success: true,
  50  |           data: {
  51  |             id: 'test-user-id',
  52  |             email: 'peserta@test.com',
  53  |             fullName: 'Test Peserta',
  54  |             role: 'PESERTA',
  55  |             isVerified: true,
  56  |             institution: 'Test Univ',
  57  |             phone: '+628123456789',
  58  |             birthDate: '2000-01-01',
  59  |             domicile: 'Jakarta',
  60  |             discordId: 'test#1234',
  61  |           }
  62  |         })
  63  |       });
  64  |     });
  65  | 
  66  |     await page.route('**/api/user/documents', async route => {
  67  |       if (route.request().method() === 'GET') {
  68  |         await route.fulfill({
  69  |           status: 200,
  70  |           contentType: 'application/json',
  71  |           body: JSON.stringify({
  72  |             success: true,
  73  |             data: []
  74  |           })
  75  |         });
  76  |       } else if (route.request().method() === 'POST') {
  77  |         // Simulate successful upload
  78  |         await route.fulfill({
  79  |           status: 201,
  80  |           contentType: 'application/json',
  81  |           body: JSON.stringify({
  82  |             success: true,
  83  |             message: 'Dokumen berhasil disimpan',
  84  |             data: {
  85  |               id: 'doc-id',
  86  |               type: 'KTM',
  87  |               status: 'REVIEW'
  88  |             }
  89  |           })
  90  |         });
  91  |       }
  92  |     });
  93  | 
  94  |     await page.route('**/api/teams/me', async route => {
  95  |       await route.fulfill({
  96  |         status: 200,
  97  |         contentType: 'application/json',
  98  |         body: JSON.stringify({
  99  |           success: true,
  100 |           data: null
  101 |         })
  102 |       });
  103 |     });
  104 | 
  105 |     await page.route('**/api/announcements/me', async route => {
  106 |       await route.fulfill({
  107 |         status: 200,
  108 |         contentType: 'application/json',
  109 |         body: JSON.stringify({
  110 |           success: true,
  111 |           data: { announcements: [] }
  112 |         })
  113 |       });
  114 |     });
  115 | 
  116 |     await page.route('**/api/news**', async route => {
  117 |       await route.fulfill({
  118 |         status: 200,
  119 |         contentType: 'application/json',
  120 |         body: JSON.stringify({
  121 |           success: true,
  122 |           data: { news: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }
  123 |         })
  124 |       });
  125 |     });
  126 | 
  127 |     await page.goto('/peserta/profile', { waitUntil: 'domcontentloaded' });
  128 |     
  129 |     // Cek halaman profile muncul
  130 |     await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible({ timeout: 15000 });
  131 |     
  132 |     // Coba pilih file untuk dokumen KTM (Student ID)
  133 |     const fileInput = page.locator('input[type="file"]').first();
  134 |     await expect(fileInput).toBeAttached();
  135 |     
  136 |     // Buat file dummy untuk testing
  137 |     await fileInput.setInputFiles({
  138 |       name: 'ktm.jpg',
  139 |       mimeType: 'image/jpeg',
  140 |       buffer: Buffer.from('fake-image-content')
  141 |     });
  142 |     
  143 |     await page.waitForTimeout(500);
  144 |     
  145 |     // Tombol Kirim Semua harus enabled setelah file dipilih
  146 |     const submitAllBtn = page.getByRole('button', { name: /kirim semua/i });
> 147 |     await expect(submitAllBtn).toBeEnabled({ timeout: 5000 });
      |                                ^ Error: expect(locator).toBeEnabled() failed
  148 |   });
  149 | });
  150 | 
```