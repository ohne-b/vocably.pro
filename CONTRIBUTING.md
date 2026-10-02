# Contributing to Vocably

Thank you for wanting to contribute to Vocably!

## Get in touch first

Before opening a pull request, please email the author at [d@vocably.pro](mailto:d@vocably.pro). I'll be very happy to hear from you, and I can help you plan the change, point you to the right parts of the codebase, and make sure your work fits the project.

## Pull request title

The pull request title must follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<optional scope>): <description>
```

Examples:

- `feat(app): anonymous welcome flow`
- `fix(extension): popup position on scroll`
- `docs: add contributing guide`

Common types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

The title matters because releases and the changelog are generated automatically from it.

## Commit messages

Pull requests are always merged with **squash**, and the PR title becomes the commit message. Commit messages inside your branch can be in any format.

## Development setup

See [CLAUDE.md](CLAUDE.md) for the project structure, build commands, and testing instructions.
