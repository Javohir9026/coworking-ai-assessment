import { expect, test } from '@playwright/test'

test('member can sign in and see the resource catalog', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Member demo' }).click()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/resources/)
  await expect(page.getByRole('heading', { name: 'Find a workspace' })).toBeVisible()
})

test('member can open the live reservation form for an enabled workspace', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Member demo' }).click()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.getByRole('button', { name: 'Reserve' }).first().click()
  await Promise.all([
    page.waitForURL(/\/resources\/[^/]+\/reserve/),
    page.locator('a[href$="/reserve"]').click()
  ])
  await expect(page.getByRole('heading', { name: 'Choose your time' })).toBeVisible()
  await expect(page.getByLabel('Start time (local)')).toBeVisible()
  await expect(page.getByLabel('End time (local)')).toBeVisible()
})

test('administrator can load the live dashboard controls', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Admin demo' }).click()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/admin\/dashboard/)
  await expect(page.getByRole('heading', { name: 'Operations dashboard' })).toBeVisible()
  await expect(page.getByLabel('From')).toBeVisible()
  await expect(page.getByLabel('To')).toBeVisible()
})
