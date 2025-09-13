#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Title: Public Asset Auto Updater (git)
Root: ZIKYinc_Data
Platform: Python
Desc: Run to automatically update the repo, gitignore, asset register, per-folder JSONs, and tree file.
Creator: Juelz-101
Organization: ZIKYinc
Version: 1.3
"""

import os
import json
import subprocess

# --- Settings ---
REPO_PATH = r"H:\Other computers\My computer\My Stuff\Assets\Data\ZIKYinc_Data\PublicAssets"
USER = "juelz-101"
REPO = "PublicAssets"
BRANCH = "main"

IGNORE_FOLDERS = {".git", "__pycache__", ".github"}  # add more if needed

# --- Helper Functions ---
def run_git(*args, cwd=REPO_PATH, suppress_errors=False):
    """Run git commands safely."""
    try:
        kwargs = {"cwd": cwd, "check": True}
        if suppress_errors:
            kwargs["stderr"] = subprocess.DEVNULL
        return subprocess.run(["git"] + list(args), **kwargs)
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Git command failed: {e}")

def build_register(base_path):
    """Scan all folders/files and build a register with URLs, ignoring system folders."""
    register = {}
    for root, dirs, files in os.walk(base_path):
        # Skip ignored folders
        dirs[:] = [d for d in dirs if d not in IGNORE_FOLDERS]

        rel_path = os.path.relpath(root, base_path).replace("\\", "/")
        rel_path = "" if rel_path == "." else rel_path
        folder_items = []

        for f in files:
            if f.startswith("."):  # skip hidden files
                continue
            ext = os.path.splitext(f)[1].lstrip(".")
            url_path = os.path.relpath(os.path.join(root, f), base_path).replace("\\", "/")
            folder_items.append({
                "name": f,
                "ext": ext,
                "path": url_path,
                "url": f"https://raw.githubusercontent.com/{USER}/{REPO}/{BRANCH}/{url_path}"
            })

        register[rel_path] = folder_items

        # Write per-folder JSON if folder contains files
        if folder_items:
            safe_name = rel_path.replace("/", "_") or "root"
            with open(os.path.join(base_path, f"{safe_name}.json"), "w", encoding="utf-8") as f_json:
                json.dump(folder_items, f_json, indent=2, ensure_ascii=False)

    return register

def write_tree_unicode(base_path, prefix=""):
    """Generate a Unicode tree representation, ignoring system folders."""
    lines = []
    entries = sorted(os.listdir(base_path))
    entries = [e for e in entries if e not in IGNORE_FOLDERS and (os.path.isdir(os.path.join(base_path, e)) or os.path.isfile(os.path.join(base_path, e)))]
    count = len(entries)

    for i, entry in enumerate(entries):
        path = os.path.join(base_path, entry)
        connector = "└── " if i == count - 1 else "├── "
        lines.append(f"{prefix}{connector}{entry}/" if os.path.isdir(path) else f"{prefix}{connector}{entry}")

        if os.path.isdir(path):
            child_prefix = prefix + ("    " if i == count - 1 else "│   ")
            lines.extend(write_tree_unicode(path, prefix=child_prefix))

    return lines

# --- Main Script ---
try:
    os.chdir(REPO_PATH)

    print("📂 Checking for local changes...")
    run_git("add", ".")
    run_git("commit", "-m", "Auto-update assets", suppress_errors=True)
    run_git("push", suppress_errors=True)

    print("🌐 Building asset register and per-folder JSONs...")
    register = build_register(REPO_PATH)

    print("📝 Writing asset_register.json...")
    with open(os.path.join(REPO_PATH, "asset_register.json"), "w", encoding="utf-8") as f:
        json.dump(register, f, indent=2, ensure_ascii=False)

    print("📝 Writing public_assets.tree...")
    tree_lines = ["PublicAssets/"] + write_tree_unicode(REPO_PATH)
    with open(os.path.join(REPO_PATH, "public_assets.tree"), "w", encoding="utf-8") as f_tree:
        f_tree.write("\n".join(tree_lines))

    print("📤 Committing updates...")
    run_git("add", "asset_register.json", "*.json", "public_assets.tree")
    run_git("commit", "-m", "Update asset register, per-folder JSONs, and tree", suppress_errors=True)
    run_git("push", suppress_errors=True)

    print("✅ Done! All registry files updated and pushed.")

except Exception as e:
    print("❌ ERROR:", e)

input("Press Enter to exit…")
