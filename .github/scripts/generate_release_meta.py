import json
import os
import subprocess
from pathlib import Path


def run_git_command(command):
    result = subprocess.run(
        command,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
    )
    return result.stdout.strip()


def get_latest_tag():
    return run_git_command("git describe --tags --abbrev=0")


def get_changelog(since_tag):
    log_range = f"{since_tag}..HEAD" if since_tag else ""

    if log_range:
        log_command = f"git log {log_range} --pretty=format:%s"
    else:
        log_command = "git log --pretty=format:%s"

    raw_log = run_git_command(log_command)
    print(f"Raw log:\n{raw_log}")

    cleaned_log = "\n".join(
        f"- {line}"
        for line in raw_log.splitlines()
        if "version bump" not in line.lower()
    )
    return cleaned_log


def get_package_version():
    package_json_path = Path("server/package.json")
    with package_json_path.open(encoding="utf-8") as f:
        data = json.load(f)
    return data["version"]


def main():
    latest_tag = get_latest_tag()
    print(f"Latest tag: {latest_tag}")
    new_version = get_package_version()
    print(f"New version: {new_version}")
    changelog = get_changelog(latest_tag)

    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as f:
            f.write(f"version={new_version}\n")
            f.write("log<<EOF\n")
            f.write(changelog + "\n")
            f.write("EOF\n")
    else:
        print(f"::set-output name=version::{new_version}")
        print("::set-output name=log<<EOF")
        print(changelog)
        print("EOF")


if __name__ == "__main__":
    main()
