## 🚀 How to Generate a Release

1. Finish your Pull Request (feature, fix, etc.)
2. Make sure you have created a Changeset:
   - Run `yarn changeset`
   - Answer the prompts
   - Commit the generated `.changeset/*.md` file
3. Merge the Pull Request into `master`
4. Manually trigger the GitHub Action: `Deploy Production (Client + Server)`
5. This action will automatically:
   - Bump the versions (client, server, and root)
   - Create a Pull Request titled: `chore(release): version bump`
6. Merge the auto-generated Release Pull Request
7. After merging:
   - Manually trigger the GitHub Action: `Tag and Create Release After Version Bump`
   - GitHub Action will create a new Git Tag (example: `v1.3.0`)
   - GitHub Action will create a new GitHub Release with auto-generated changelog
