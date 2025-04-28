# 🛠️ Contributing Guide

Welcome! Please follow these rules when working on this project.

## ✏️ Commit Messages: Follow Conventional Commits

Always structure your commit messages like:

`<type>(scope): <description>`

Examples:

- `feat(auth): add social login`
- `fix(api): handle empty response`
- `docs(readme): update API usage`

---

### Allowed Commit Types

| Type     | Purpose                                          |
| :------- | :----------------------------------------------- |
| feat     | New feature                                      |
| fix      | Bug fix                                          |
| docs     | Documentation only changes                       |
| style    | Formatting only (no logic changes)               |
| refactor | Code changes that are neither fixes nor features |
| perf     | Performance improvements                         |
| test     | Adding or updating tests                         |
| build    | Changes to build system or dependencies          |
| ci       | Changes to CI/CD configuration                   |
| chore    | Routine tasks like dependency updates            |

---

### Breaking Changes

If your change **breaks backward compatibility**, add `BREAKING CHANGE:` to your commit body.

---

By following this, we ensure:

- ✅ Automated version bumps
- ✅ Clean changelogs
- ✅ Easy debugging and rollback
