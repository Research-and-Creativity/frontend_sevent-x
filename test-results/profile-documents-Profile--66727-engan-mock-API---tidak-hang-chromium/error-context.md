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
    - waiting for "http://localhost:3000/login" navigation to finish...
    - navigated to "http://localhost:3000/login"

```

```yaml
- alert
- link "SEVENT X SEVENT X":
  - /url: /
  - img "SEVENT X"
  - text: SEVENT X
- heading "WELCOME BACK!" [level=1]
- paragraph: Input your email and password, let's continue your journey!
- text: Email
- textbox "Email"
- text: Password
- textbox "Password"
- button "Toggle password"
- link "Forgot password? Click here":
  - /url: /forgot-password
- button "Login"
- text: or
- button "Continue with Google":
  - img
  - text: Continue with Google
- paragraph:
  - text: Doesn't have an account?
  - link "Register":
    - /url: /register
- text: ©2026 SEVENT. All Rights Reserved
- link "social":
  - /url: "#"
- link "social":
  - /url: "#"
- link "social":
  - /url: "#"
- region "Notifications alt+T"
```

# Test source

```ts
  22  |         },
  23  |         version: 0
  24  |       }));
  25  |     });
  26  | 
  27  |     await page.route('**/api/auth/me', async route => {
  28  |       await route.fulfill({
  29  |         status: 200,
  30  |         contentType: 'application/json',
  31  |         body: JSON.stringify({
  32  |           success: true,
  33  |           data: {
  34  |             id: 'test-user-id',
  35  |             email: 'peserta@test.com',
  36  |             fullName: 'Test Peserta',
  37  |             role: 'PESERTA',
  38  |             isVerified: true,
  39  |           }
  40  |         })
  41  |       });
  42  |     });
  43  | 
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
  105 |     await page.goto('/peserta/profile');
  106 |     
  107 |     // Cek halaman profile muncul
  108 |     await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible({ timeout: 10000 });
  109 |     
  110 |     // Coba pilih file untuk dokumen KTM
  111 |     const fileInput = page.locator('input[type="file"]').first();
  112 |     await expect(fileInput).toBeAttached();
  113 |     
  114 |     // Buat file dummy untuk testing
  115 |     await fileInput.setInputFiles({
  116 |       name: 'ktm.jpg',
  117 |       mimeType: 'image/jpeg',
  118 |       buffer: Buffer.from('fake-image-content')
  119 |     });
  120 |     
  121 |     // Pastikan file terpilih (muncul nama file)
> 122 |     await expect(page.getByText('ktm.jpg')).toBeVisible({ timeout: 5000 });
      |                                             ^ Error: expect(locator).toBeVisible() failed
  123 |     
  124 |     // Tombol Kirim Semua harus enabled
  125 |     const submitAllBtn = page.getByRole('button', { name: /kirim semua/i });
  126 |     await expect(submitAllBtn).toBeEnabled();
  127 |   });
  128 | });
  129 | 
```