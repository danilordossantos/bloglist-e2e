const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

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

    describe('Login', () => {
        test('succeeds with correct credentials', async ({ page }) => {
            await loginWith(page, 'abranches', 'password123')

            await expect(page.getByText('Danilo Abranches logged in')).toBeVisible()
        })

        test('fails with wrong credentials', async ({ page }) => {
            await loginWith(page, 'abranches', 'password12')

            await expect(page.getByText('wrong credentials')).toBeVisible()
        })
    })

    describe('When logged in', () => {
        beforeEach(async ({ page }) => {
            await loginWith(page, 'abranches', 'password123')
        })
        test('a new blog can be created', async ({ page }) => {
            await createBlog(page, 'a blog created', 'playwright', 'https://www.playwright.com')
            await expect(page.getByText('a blog created')).toBeVisible()
        })
    })
})

