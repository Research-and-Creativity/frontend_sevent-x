# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: competition-eligibility.spec.ts >> Competition - Eligibility Guard >> banner muncul dan tombol submit disabled jika dokumen belum disetujui
- Location: tests\competition-eligibility.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/belum bisa mengumpulkan karya/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/belum bisa mengumpulkan karya/i) with timeout 10000ms
  - waiting for getByText(/belum bisa mengumpulkan karya/i)
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
  4   |   test('banner muncul dan tombol submit disabled jika dokumen belum disetujui', async ({ page }) => {
  5   |     // Mock semua API yang dibutuhkan
  6   |     await page.route('**/api/user/me', async route => {
  7   |       await route.fulfill({
  8   |         status: 200,
  9   |         contentType: 'application/json',
  10  |         body: JSON.stringify({
  11  |           success: true,
  12  |           data: {
  13  |             id: 'test-user-id',
  14  |             email: 'peserta@test.com',
  15  |             fullName: 'Test Peserta',
  16  |             role: 'PESERTA',
  17  |             isVerified: true,
  18  |           }
  19  |         })
  20  |       });
  21  |     });
  22  | 
  23  |     await page.route('**/api/teams/me', async route => {
  24  |       await route.fulfill({
  25  |         status: 200,
  26  |         contentType: 'application/json',
  27  |         body: JSON.stringify({
  28  |           success: true,
  29  |           data: {
  30  |             id: 'team-id',
  31  |             teamName: 'Test Team',
  32  |             teamCode: 'ABC123',
  33  |             status: 'APPROVED',
  34  |             members: [
  35  |               { id: 'm1', role: 'LEADER', user: { id: 'test-user-id', fullName: 'Test Peserta' } }
  36  |             ],
  37  |             competition: { id: 'comp-id', name: 'Web Development', slug: 'web-development' },
  38  |             paymentProof: { status: 'APPROVED' }
  39  |           }
  40  |         })
  41  |       });
  42  |     });
  43  | 
  44  |     await page.route('**/api/teams/me/eligibility', async route => {
  45  |       await route.fulfill({
  46  |         status: 200,
  47  |         contentType: 'application/json',
  48  |         body: JSON.stringify({
  49  |           success: true,
  50  |           data: {
  51  |             isEligible: false,
  52  |             requirements: {
  53  |               teamApproved: true,
  54  |               paymentApproved: true,
  55  |               allMembersDocumentsApproved: false,
  56  |               members: [
  57  |                 {
  58  |                   userId: 'test-user-id',
  59  |                   fullName: 'Test Peserta',
  60  |                   role: 'LEADER',
  61  |                   twibbonApproved: false,
  62  |                   shareStoryApproved: false,
  63  |                   ktmApproved: false,
  64  |                   instagramFollowApproved: false,
  65  |                   allDocumentsApproved: false
  66  |                 }
  67  |               ]
  68  |             }
  69  |           }
  70  |         })
  71  |       });
  72  |     });
  73  | 
  74  |     await page.route('**/api/competitions/web-development', async route => {
  75  |       await route.fulfill({
  76  |         status: 200,
  77  |         contentType: 'application/json',
  78  |         body: JSON.stringify({
  79  |           success: true,
  80  |           data: {
  81  |             id: 'comp-id',
  82  |             name: 'Web Development',
  83  |             slug: 'web-development',
  84  |             linkFields: []
  85  |           }
  86  |         })
  87  |       });
  88  |     });
  89  | 
  90  |     await page.route('**/api/submissions/me', async route => {
  91  |       await route.fulfill({
  92  |         status: 200,
  93  |         contentType: 'application/json',
  94  |         body: JSON.stringify({
  95  |           success: true,
  96  |           data: null
  97  |         })
  98  |       });
  99  |     });
  100 | 
  101 |     await page.goto('/peserta/competition/web-development');
  102 |     
  103 |     // Banner warning harus muncul
> 104 |     await expect(page.getByText(/belum bisa mengumpulkan karya/i)).toBeVisible({ timeout: 10000 });
      |                                                                    ^ Error: expect(locator).toBeVisible() failed
  105 |     
  106 |     // Tombol lengkapi dokumen di profile harus ada
  107 |     await expect(page.getByRole('button', { name: /lengkapi dokumen di profile/i })).toBeVisible();
  108 |     
  109 |     // Tombol submit all harus disabled
  110 |     const submitBtn = page.getByRole('button', { name: /submit all/i });
  111 |     await expect(submitBtn).toBeDisabled();
  112 |   });
  113 | });
  114 | 
```