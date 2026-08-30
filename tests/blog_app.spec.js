const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
    beforeEach(async ({ page, request }) => {
        await request.post('http://localhost:3003/api/testing/reset')
        await request.post('http://localhost:3003/api/users', {
            data: {
                name: 'Danilo Abranches',
                username: 'abranches',
                password: 'password123'
            }
        })
        await page.goto('/')
    })

    test('Login form is shown', async ({ page }) => {
        await page.getByRole('button', { name: 'login' }).click()
        const locator1 = page.getByLabel('username')
        const locator2 = page.getByLabel('password')
        await expect(locator1).toBeVisible()
        await expect(locator2).toBeVisible()
    })
})