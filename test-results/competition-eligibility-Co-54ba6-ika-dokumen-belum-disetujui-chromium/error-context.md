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
  20  | 
  21  |     // Mock semua API yang dibutuhkan
  22  |     await page.route('**/api/user/me', async route => {
  23  |       await route.fulfill({
  24  |         status: 200,
  25  |         contentType: 'application/json',
  26  |         body: JSON.stringify({
  27  |           success: true,
  28  |           data: {
  29  |             id: 'test-user-id',
  30  |             email: 'peserta@test.com',
  31  |             fullName: 'Test Peserta',
  32  |             role: 'PESERTA',
  33  |             isVerified: true,
  34  |           }
  35  |         })
  36  |       });
  37  |     });
  38  | 
  39  |     await page.route('**/api/teams/me', async route => {
  40  |       await route.fulfill({
  41  |         status: 200,
  42  |         contentType: 'application/json',
  43  |         body: JSON.stringify({
  44  |           success: true,
  45  |           data: {
  46  |             id: 'team-id',
  47  |             teamName: 'Test Team',
  48  |             teamCode: 'ABC123',
  49  |             status: 'APPROVED',
  50  |             members: [
  51  |               { id: 'm1', role: 'LEADER', user: { id: 'test-user-id', fullName: 'Test Peserta' } }
  52  |             ],
  53  |             competition: { id: 'comp-id', name: 'Web Development', slug: 'web-development' },
  54  |             paymentProof: { status: 'APPROVED' }
  55  |           }
  56  |         })
  57  |       });
  58  |     });
  59  | 
  60  |     await page.route('**/api/teams/me/eligibility', async route => {
  61  |       await route.fulfill({
  62  |         status: 200,
  63  |         contentType: 'application/json',
  64  |         body: JSON.stringify({
  65  |           success: true,
  66  |           data: {
  67  |             isEligible: false,
  68  |             requirements: {
  69  |               teamApproved: true,
  70  |               paymentApproved: true,
  71  |               allMembersDocumentsApproved: false,
  72  |               members: [
  73  |                 {
  74  |                   userId: 'test-user-id',
  75  |                   fullName: 'Test Peserta',
  76  |                   role: 'LEADER',
  77  |                   twibbonApproved: false,
  78  |                   shareStoryApproved: false,
  79  |                   ktmApproved: false,
  80  |                   instagramFollowApproved: false,
  81  |                   allDocumentsApproved: false
  82  |                 }
  83  |               ]
  84  |             }
  85  |           }
  86  |         })
  87  |       });
  88  |     });
  89  | 
  90  |     await page.route('**/api/competitions/web-development', async route => {
  91  |       await route.fulfill({
  92  |         status: 200,
  93  |         contentType: 'application/json',
  94  |         body: JSON.stringify({
  95  |           success: true,
  96  |           data: {
  97  |             id: 'comp-id',
  98  |             name: 'Web Development',
  99  |             slug: 'web-development',
  100 |             linkFields: []
  101 |           }
  102 |         })
  103 |       });
  104 |     });
  105 | 
  106 |     await page.route('**/api/submissions/me', async route => {
  107 |       await route.fulfill({
  108 |         status: 200,
  109 |         contentType: 'application/json',
  110 |         body: JSON.stringify({
  111 |           success: true,
  112 |           data: null
  113 |         })
  114 |       });
  115 |     });
  116 | 
  117 |     await page.goto('/peserta/competition/web-development');
  118 |     
  119 |     // Banner warning harus muncul
> 120 |     await expect(page.getByText(/belum bisa mengumpulkan karya/i)).toBeVisible({ timeout: 10000 });
      |                                                                    ^ Error: expect(locator).toBeVisible() failed
  121 |     
  122 |     // Tombol lengkapi dokumen di profile harus ada
  123 |     await expect(page.getByRole('button', { name: /lengkapi dokumen di profile/i })).toBeVisible();
  124 |     
  125 |     // Tombol submit all harus disabled
  126 |     const submitBtn = page.getByRole('button', { name: /submit all/i });
  127 |     await expect(submitBtn).toBeDisabled();
  128 |   });
  129 | });
  130 | 
```