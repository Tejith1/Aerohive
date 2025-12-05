# Git History Cleanup - Remove Sensitive Data

## The Problem
Your previous commits contain Google OAuth credentials and Supabase URLs that GitHub's push protection is blocking.

## Solution 1: Using BFG Repo-Cleaner (Recommended - Easiest)

### Step 1: Install BFG
Download from: https://rtyley.github.io/bfg-repo-cleaner/

Or if you have Java installed:
```powershell
# Download BFG jar file
Invoke-WebRequest -Uri "https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar" -OutFile "bfg.jar"
```

### Step 2: Clean the repository
```powershell
# Navigate to parent directory
cd "d:\Aerohive\drone web"

# Run BFG to replace secrets in ALL commits
java -jar bfg.jar --replace-text secrets-to-remove.txt "Aerohive"

# Or use this command to replace specific text:
java -jar bfg.jar -rt secrets-to-remove.txt "Aerohive"
```

### Step 3: Clean up
```powershell
cd "Aerohive"
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Step 4: Force push
```powershell
git push origin main --force
```

---

## Solution 2: Manual History Rewrite (If BFG doesn't work)

### Option A: Remove only the problematic commit
```powershell
# Find the commit hash that contains secrets
git log --oneline | Select-String "oauth|google"

# Interactive rebase to edit/remove commits
git rebase -i HEAD~5  # Adjust number based on how far back

# In the editor, change 'pick' to 'drop' for commits with secrets
# Save and exit
```

### Option B: Create a new branch without history
```powershell
# Create orphan branch (no history)
git checkout --orphan new-main

# Add all current files
git add -A

# Commit
git commit -m "Initial commit - cleaned sensitive data"

# Delete old main branch
git branch -D main

# Rename new branch to main
git branch -m main

# Force push
git push origin main --force
```

---

## Solution 3: Use GitHub's Secret Scanning Resolution (Easiest if you don't care about history)

1. Go to: https://github.com/Tejith1/Aerohive/security/secret-scanning/unblock-secret/36QxndPq39A7sRMlaPEo3B1xZyU

2. Click **"I'll fix it later"** or **"This is a false positive"**

3. Then force push your cleaned commit:
```powershell
git push origin main --force
```

---

## Solution 4: Delete and Re-create Repository (Nuclear Option)

If nothing else works:

1. **Backup your current code** (copy to another folder)
2. Delete the GitHub repository at: https://github.com/Tejith1/Aerohive
3. Create a new repository with the same name
4. Initialize fresh git:
```powershell
cd "d:\Aerohive\drone web\Aerohive"
Remove-Item -Recurse -Force .git
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Tejith1/Aerohive.git
git push -u origin main
```

---

## What I've Already Done ✅

1. ✅ Removed Google Client ID and Secret from all docs
2. ✅ Replaced Supabase URLs with placeholders
3. ✅ Removed test scripts with credentials from git tracking
4. ✅ Added scripts to .gitignore
5. ✅ Created commit with cleaned files
6. ✅ Created script template for future use

## What You Need to Do

Choose one of the solutions above to clean the git history, then:

1. **Regenerate your OAuth credentials** (the old ones are now public)
   - Go to: https://console.cloud.google.com/
   - Delete old OAuth client
   - Create new OAuth client
   - Update in Supabase dashboard only (not in code)

2. **Store credentials securely**:
   - Only in `.env.local` (already in .gitignore)
   - Only in Supabase dashboard
   - Never in documentation or scripts

## Recommended: Solution 1 (BFG)

This is the fastest and safest. Just run:
```powershell
# Download BFG
Invoke-WebRequest -Uri "https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar" -OutFile "bfg.jar"

# Clean history
java -jar bfg.jar --replace-text secrets-to-remove.txt "d:\Aerohive\drone web\Aerohive"

# Cleanup
cd "d:\Aerohive\drone web\Aerohive"
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Push
git push origin main --force
```

Then regenerate your OAuth credentials in Google Cloud Console.
