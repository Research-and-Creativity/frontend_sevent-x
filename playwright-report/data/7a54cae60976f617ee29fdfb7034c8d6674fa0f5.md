# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile-documents.spec.ts >> Profile - Upload Dokumen >> upload dokumen dengan mock API - tidak hang
- Location: tests\profile-documents.spec.ts:5:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('ktm.jpg')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('ktm.jpg') with timeout 5000ms
  - waiting for getByText('ktm.jpg')

```

```yaml
- alert
- complementary:
  - link "SEVENT X SEVENT X":
    - /url: /peserta/dashboard
    - img "SEVENT X"
    - text: SEVENT X
  - navigation:
    - link "Overview":
      - /url: /peserta/dashboard
    - link "Profile":
      - /url: /peserta/profile
    - link "Competition":
      - /url: /peserta/competition
  - button "Log out"
- main:
  - heading "Profile" [level=1]
  - heading "Profil sudah lengkap" [level=2]
  - text: 5/5 terisi
  - paragraph: Kelima field wajib sudah terisi, jadi kamu sudah bisa mendaftar kompetisi.
  - list:
    - listitem: Institution sudah terisi
    - listitem: Phone Number sudah terisi
    - listitem: Birth Date sudah terisi
    - listitem: Domicile sudah terisi
    - listitem: Discord ID sudah terisi
  - heading "General Information" [level=2]
  - text: Name
  - textbox "Name": Test Peserta
  - text: Birth Date *
  - textbox "Birth Date *": 2000-01-01
  - text: Domicile *
  - textbox "Domicile *":
    - /placeholder: Domicile
    - text: Jakarta
  - text: Institution/University/School *
  - textbox "Institution/University/School *":
    - /placeholder: Institution/University/School
    - text: Test Univ
  - text: Phone Number * +62
  - textbox "Phone Number *":
    - /placeholder: 812-3456-7890
    - text: "8123456789"
  - text: Discord ID *
  - textbox "Discord ID *":
    - /placeholder: Discord ID
    - text: test#1234
  - button "Save"
  - heading "Account Information" [level=2]
  - text: Email
  - textbox "Email": peserta@test.com
  - text: New Password
  - textbox "New Password":
    - /placeholder: ••••••••
  - text: Current Password
  - textbox "Current Password":
    - /placeholder: ••••••••
  - button "Save"
  - heading "Verification Document" [level=2]
  - text: Twibbon Upload File
  - button "Upload Twibbon"
  - link "Belum punya twibbon? Bikin di sini →":
    - /url: /twibbon
  - text: Post Story Upload File
  - button "Upload Post Story"
  - text: Student ID Upload File
  - button "Upload Student ID"
  - text: Follow Instagram Sevent.tup Upload File
  - button "Upload Follow Instagram Sevent.tup"
  - button "Kirim Semua Dokumen" [disabled]
  - paragraph: Dokumen menunggu persetujuan admin. Kamu baru bisa mengirim karya setelah keempat dokumen disetujui.
- region "Notifications alt+T"
```

# Test source

```ts
  44  |     await page.route('**/api/user/me', async route => {
  45  |       await route.fulfill({
  46  |         status: 200,
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
  132 |     // Coba pilih file untuk dokumen KTM
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
  143 |     // Pastikan file terpilih (muncul nama file)
> 144 |     await expect(page.getByText('ktm.jpg')).toBeVisible({ timeout: 5000 });
      |                                             ^ Error: expect(locator).toBeVisible() failed
  145 |     
  146 |     // Tombol Kirim Semua harus enabled
  147 |     const submitAllBtn = page.getByRole('button', { name: /kirim semua/i });
  148 |     await expect(submitAllBtn).toBeEnabled();
  149 |   });
  150 | });
  151 | 
```