import { expect, test } from '@playwright/test'

async function signIn(page: import('@playwright/test').Page, role: 'Member' | 'Admin') {
  await page.goto('/login')
  await page.waitForTimeout(500)
  await page.getByLabel('Email').fill(role === 'Member' ? 'member@cowork.uz' : 'admin@cowork.uz')
  await page.getByLabel('Password').fill('DemoPass123!')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(role === 'Member' ? /\/resources/ : /\/admin\/dashboard/, {
    timeout: 15_000
  })
}

test('member can sign in and see the resource catalog', async ({ page }) => {
  await signIn(page, 'Member')
  await expect(page.getByRole('heading', { name: 'Find a workspace' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Details' })).toHaveCount(6)
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
