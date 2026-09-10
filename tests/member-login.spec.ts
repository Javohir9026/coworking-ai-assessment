import { expect, test } from '@playwright/test'

async function signIn(page: import('@playwright/test').Page, role: 'Member' | 'Admin') {
  await page.goto('/login')
  await page.getByRole('button', { name: `${role} demo` }).click()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(role === 'Member' ? /\/resources/ : /\/admin\/dashboard/, { timeout: 15_000 })
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
