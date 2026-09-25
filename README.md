# Bloglist: End-to-End Tests

[Playwright](https://playwright.dev/) end-to-end tests for **Bloglist**, a full-stack app for sharing and ranking blog posts. Built as part of the [Full Stack Open](https://fullstackopen.com/en/) course by the University of Helsinki.

**Live demo:** https://danilordossantosbloglist.fly.dev (username `demo`, password `demo2026`)

> The full project documentation, including the real application bugs these tests caught, lives in the backend repository:
> **[fullstack-open-backend2](https://github.com/danilordossantos/fullstack-open-backend2)**

## What is tested

The suite runs against the real frontend and backend. Before each test, the database is reset through a test-only endpoint and a fresh user is created, so every scenario starts from the same state.

1. The login form is shown
2. Login succeeds with correct credentials
3. Login fails with wrong credentials
4. A logged-in user can create a blog
5. A blog can be liked
6. The user who created a blog can delete it
7. Only the creator sees the delete button
8. Blogs are ordered by likes, most liked first

Shared steps live in `tests/helper.js`: `loginWith` fills in the login form, and `createBlog` creates a blog and waits for it to appear in the list before returning, which prevents race conditions between consecutive actions.

## Running the tests

The tests need both applications running, each in its own terminal:

1. **Backend in test mode**, in [fullstack-open-backend2](https://github.com/danilordossantos/fullstack-open-backend2):
   ```bash
   npm run start:test
   ```
   Test mode connects to the test database and enables the `/api/testing/reset` endpoint.

2. **Frontend**, in [fullstack-open-frontend](https://github.com/danilordossantos/fullstack-open-frontend):
   ```bash
   npm run dev
   ```

3. **Tests**, in this repository:
   ```bash
   npm install
   npm test
   ```

The suite runs on Chromium only. It was developed on WSL, where the Firefox and WebKit browsers lack required system libraries.

The first test of a run can occasionally time out while the Vite development server compiles the app for the first time. Running that test again with a warm server passes:

```bash
npx playwright test --project=chromium -g "Login form is shown"
```

## Related repositories

- **Backend and main documentation:** [fullstack-open-backend2](https://github.com/danilordossantos/fullstack-open-backend2)
- **Frontend:** [fullstack-open-frontend](https://github.com/danilordossantos/fullstack-open-frontend)
