## Contributing

Thanks for your interest. Quick guide to contribute:

- Fork the repo and open a branch for your change.
- Run the test suite and linters locally before opening a PR:

```bash
bun install
bun run smoke
bun Tools/run_unit_tests.ts
npm run typecheck
npm run lint
```

- Keep changes small and focused; include tests for new behavior.
- Use clear commit messages and link the PR to an issue when applicable.

For code style, we use Prettier and ESLint. CI runs typecheck, lint, and the smoke tests.
