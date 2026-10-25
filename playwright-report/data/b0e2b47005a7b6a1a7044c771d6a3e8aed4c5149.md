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
  2   | import path from 'path';
  3   | 
  4   | test.describe('Profile - Upload Dokumen', () => {
  5   |   test('upload dokumen dengan mock API - tidak hang', async ({ page }) => {
  6   |     // Mock API login untuk bisa akses halaman profile
  7   |     await page.route('**/api/auth/me', async route => {
  8   |       await route.fulfill({
  9   |         status: 200,
  10  |         contentType: 'application/json',
  11  |         body: JSON.stringify({
  12  |           success: true,
  13  |           data: {
  14  |             id: 'test-user-id',
  15  |             email: 'peserta@test.com',
  16  |             fullName: 'Test Peserta',
  17  |             role: 'PESERTA',
  18  |             isVerified: true,
  19  |           }
  20  |         })
  21  |       });
  22  |     });
  23  | 
  24  |     await page.route('**/api/user/me', async route => {
  25  |       await route.fulfill({
  26  |         status: 200,
  27  |         contentType: 'application/json',
  28  |         body: JSON.stringify({
  29  |           success: true,
  30  |           data: {
  31  |             id: 'test-user-id',
  32  |             email: 'peserta@test.com',
  33  |             fullName: 'Test Peserta',
  34  |             role: 'PESERTA',
  35  |             isVerified: true,
  36  |             institution: 'Test Univ',
  37  |             phone: '+628123456789',
  38  |             birthDate: '2000-01-01',
  39  |             domicile: 'Jakarta',
  40  |             discordId: 'test#1234',
  41  |           }
  42  |         })
  43  |       });
  44  |     });
  45  | 
  46  |     await page.route('**/api/user/documents', async route => {
  47  |       if (route.request().method() === 'GET') {
  48  |         await route.fulfill({
  49  |           status: 200,
  50  |           contentType: 'application/json',
  51  |           body: JSON.stringify({
  52  |             success: true,
  53  |             data: []
  54  |           })
  55  |         });
  56  |       } else if (route.request().method() === 'POST') {
  57  |         // Simulate successful upload
  58  |         await route.fulfill({
  59  |           status: 201,
  60  |           contentType: 'application/json',
  61  |           body: JSON.stringify({
  62  |             success: true,
  63  |             message: 'Dokumen berhasil disimpan',
  64  |             data: {
  65  |               id: 'doc-id',
  66  |               type: 'KTM',
  67  |               status: 'REVIEW'
  68  |             }
  69  |           })
  70  |         });
  71  |       }
  72  |     });
  73  | 
  74  |     await page.route('**/api/teams/me', async route => {
  75  |       await route.fulfill({
  76  |         status: 200,
  77  |         contentType: 'application/json',
  78  |         body: JSON.stringify({
  79  |           success: true,
  80  |           data: null
  81  |         })
  82  |       });
  83  |     });
  84  | 
  85  |     await page.goto('/peserta/profile');
  86  |     
  87  |     // Cek halaman profile muncul
  88  |     await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible({ timeout: 10000 });
  89  |     
  90  |     // Coba pilih file untuk dokumen KTM
  91  |     const fileInput = page.locator('input[type="file"]').first();
  92  |     await expect(fileInput).toBeAttached();
  93  |     
  94  |     // Buat file dummy untuk testing
  95  |     await fileInput.setInputFiles({
  96  |       name: 'ktm.jpg',
  97  |       mimeType: 'image/jpeg',
  98  |       buffer: Buffer.from('fake-image-content')
  99  |     });
  100 |     
  101 |     // Pastikan file terpilih (muncul nama file)
> 102 |     await expect(page.getByText('ktm.jpg')).toBeVisible({ timeout: 5000 });
      |                                             ^ Error: expect(locator).toBeVisible() failed
  103 |     
  104 |     // Tombol Kirim Semua harus enabled
  105 |     const submitAllBtn = page.getByRole('button', { name: /kirim semua/i });
  106 |     await expect(submitAllBtn).toBeEnabled();
  107 |   });
  108 | });
  109 | 
```