import { expect, test } from '@playwright/test'

async function signIn(page: import('@playwright/test').Page, role: 'Member' | 'Admin') {
  await page.goto('/login')
  const email = page.getByLabel('Email')
  try {
    await expect(email).toBeVisible({ timeout: 10_000 })
  } catch {
    // The Nuxt dev server can briefly serve its startup page on the first request.
    await page.reload()
    await expect(email).toBeVisible({ timeout: 15_000 })
  }
  await page.getByRole('button', { name: role === 'Member' ? 'Member demo' : 'Admin demo' }).click()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(role === 'Member' ? /\/resources/ : /\/admin\/dashboard/, {
    timeout: 15_000
  })
}

function futureLocalInterval(minimumDays: number) {
  const start = new Date(Date.now() + (minimumDays + Math.floor(Math.random() * 300)) * 86_400_000)
  start.setMinutes(0, 0, 0)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  const localDateTime = (value: Date) => {
    const pad = (part: number) => String(part).padStart(2, '0')
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`
  }
  return { start: localDateTime(start), end: localDateTime(end) }
}

async function createReservation(page: import('@playwright/test').Page, minimumDays: number) {
  const interval = futureLocalInterval(minimumDays)
  await page.getByRole('button', { name: 'Reserve' }).first().click()
  await page.getByLabel('Start time (local)').fill(interval.start)
  await page.getByLabel('End time (local)').fill(interval.end)
  await page.getByRole('button', { name: 'Request reservation' }).click()
  await expect(page.getByRole('heading', { name: 'Reservation created' })).toBeVisible()
}

test('member can sign in and see the resource catalog', async ({ page }) => {
  await signIn(page, 'Member')
  await expect(page.getByRole('heading', { name: 'Find a workspace' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Details' })).toHaveCount(5)
})

test('member can open the live reservation form for an enabled workspace', async ({ page }) => {
  await signIn(page, 'Member')
  await page.getByRole('button', { name: 'Reserve' }).first().click()
  await expect(page).toHaveURL(/\/resources\/[^/]+\/reserve/)
  await expect(page.getByRole('heading', { name: 'Choose your time' })).toBeVisible()
  await expect(page.getByLabel('Start time (local)')).toBeVisible()
  await expect(page.getByLabel('End time (local)')).toBeVisible()
})

test('administrator can load the live dashboard controls', async ({ page }) => {
  await signIn(page, 'Admin')
  await expect(page.getByRole('heading', { name: 'Operations dashboard' })).toBeVisible()
  await expect(page.getByLabel('From')).toBeVisible()
  await expect(page.getByLabel('To')).toBeVisible()
})

test('administrator can open every operational module', async ({ page }) => {
  await signIn(page, 'Admin')
  const modules = [
    ['/admin/resources', 'Workspace management'],
    ['/admin/reservations', 'Bookings'],
    ['/admin/payments', 'Payment attempts'],
    ['/admin/audit', 'Ledger & audit trail']
  ] as const

  for (const [path, heading] of modules) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  }
})

test('member reservation is approved and confirmed through the live UI flow', async ({ page }) => {
  await signIn(page, 'Member')
  await createReservation(page, 60)
  await expect(page.getByRole('button', { name: 'Continue to payment' })).toBeDisabled()

  await page.context().clearCookies()
  await signIn(page, 'Admin')
  await page.goto('/admin/reservations')
  await page
    .getByRole('button', { name: /Approve .* booking/ })
    .first()
    .click()
  await expect(page.getByText('Reservation approved.')).toBeVisible()

  await page.context().clearCookies()
  await signIn(page, 'Member')
  await page.goto('/reservations')
  await page.getByRole('link', { name: 'Pay now' }).first().click()
  const paymentResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/payments/simulate') && response.request().method() === 'POST'
  )
  await page.getByRole('button', { name: 'Trigger Success Webhook' }).click()
  await expect((await paymentResponse).status()).toBe(201)
  await expect(
    page.getByText('Simulated success webhook queued. Waiting for server settlement.')
  ).toBeVisible()
})

test('member can cancel an active booking through the confirmation dialog', async ({ page }) => {
  await signIn(page, 'Member')
  await createReservation(page, 400)
  await page.goto('/reservations')
  await page.getByRole('button', { name: 'Cancel booking' }).first().click()
  const dialog = page.getByRole('dialog', { name: 'Cancel booking' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Cancel booking' }).click()
  await expect(page.getByText('Reservation cancelled.')).toBeVisible()
})

test('member can view the administrator rejection reason', async ({ page }) => {
  await signIn(page, 'Member')
  await createReservation(page, 750)

  await page.context().clearCookies()
  await signIn(page, 'Admin')
  await page.goto('/admin/reservations')
  await page.getByRole('button', { name: /Reject .* booking/ }).first().click()
  await page.getByPlaceholder('Reason is required').fill('The requested time is not available for this booking.')
  await page.getByRole('button', { name: 'Reject', exact: true }).click()
  await expect(page.getByText('Reservation rejected.')).toBeVisible()

  await page.context().clearCookies()
  await signIn(page, 'Member')
  await page.goto('/reservations')
  await page.getByRole('button', { name: /View rejection reason for/ }).first().click()
  const dialog = page.getByRole('dialog', { name: 'Rejection reason' })
  await expect(dialog).toContainText('The requested time is not available for this booking.')
})
