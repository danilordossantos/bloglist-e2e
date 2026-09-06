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

        describe('and a blog exists', () => {
            beforeEach(async ({ page, request }) => {
                await createBlog(page, 'another blog created', 'playwright', 'https://www.playwright.com')
                await request.post('http://localhost:3003/api/users', {
                    data: {
                        name: 'Joel Silva',
                        username: 'josilv',
                        password: 'senha123'
                    }
                })
                await page.goto('/')
            })

            test('a blog can be liked', async ({ page }) => {
                await page.getByRole('button', { name: 'view' }).click()
                await page.getByRole('button', { name: 'like' }).click()
                await expect(page.getByText('likes 1')).toBeVisible()
            })

            test('user who created the blog can delete it', async ({ page }) => {
                await page.getByRole('button', { name: 'view' }).click()
                page.on('dialog', async dialog => {
                    await dialog.accept()
                })
                await page.getByRole('button', { name: 'remove' }).click()
                await expect(page.getByText('another blog created')).not.toBeVisible()
            })

            test('only the creator can see the delete button', async ({ page }) => {
                await page.getByRole('button', { name: 'logout' }).click()
                await loginWith(page, 'josilv', 'senha123')
                await page.getByRole('button', { name: 'view' }).click()
                await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
            })

            test('blogs are ordered by likes, most liked first', async ({ page }) => {
                const blogsData = [
                    { title: 'first blog', author: 'author one', url: 'https://www.one.com' },
                    { title: 'second blog', author: 'author two', url: 'https://www.two.com' },
                    { title: 'third blog', author: 'author three', url: 'https://www.three.com' }
                ]
                for (const blog of blogsData) {
                    await createBlog(page, blog.title, blog.author, blog.url)
                }
                const blogElement1 = page.getByText('first blog')
                await blogElement1.getByRole('button', { name: 'view' }).click()
                await blogElement1.getByRole('button', { name: 'like' }).click()

                const blogElement2 = page.getByText('second blog')
                await blogElement2.getByRole('button', { name: 'view' }).click()
                await blogElement2.getByRole('button', { name: 'like' }).click()
                await blogElement2.getByText('likes 1').waitFor()
                await blogElement2.getByRole('button', { name: 'like' }).click()
                await blogElement2.getByText('likes 2').waitFor()
                await blogElement2.getByRole('button', { name: 'like' }).click()

                const blogElement3 = page.getByText('third blog')
                await blogElement3.getByRole('button', { name: 'view' }).click()
                await blogElement3.getByRole('button', { name: 'like' }).click()
                await blogElement3.getByText('likes 1').waitFor()
                await blogElement3.getByRole('button', { name: 'like' }).click()
                await expect(page.locator('.blog')).toContainText(['second blog', 'third blog', 'first blog'])
            })
        })
    })
})

