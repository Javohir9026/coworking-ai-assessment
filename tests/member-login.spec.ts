import { expect, test } from '@playwright/test'

test('member can sign in and see the resource catalog', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Member demo' }).click()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/resources/)
  await expect(page.getByRole('heading', { name: 'Find a workspace' })).toBeVisible()
})
