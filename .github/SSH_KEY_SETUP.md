# SSH Key Setup for GitHub Actions

## Current Issue
The workflow is failing during SSH key setup with "Process completed with exit code 1"

## How to Fix Your SSH_PRIVATE_KEY Secret

### Step 1: Get Your SSH Private Key
On your local machine or server where you have the key:
```bash
cat ~/.ssh/id_ed25519
```

### Step 2: Copy the ENTIRE Key
The output should look like this:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
...multiple lines of base64 encoded content...
-----END OPENSSH PRIVATE KEY-----
```

⚠️ **IMPORTANT**: 
- Include the `-----BEGIN OPENSSH PRIVATE KEY-----` header
- Include the `-----END OPENSSH PRIVATE KEY-----` footer
- Include ALL lines in between
- Do NOT add any extra spaces or newlines at the beginning or end
- Do NOT convert to base64 or modify it in any way

### Step 3: Add to GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SSH_PRIVATE_KEY`
5. Value: Paste the ENTIRE key (including headers and footers)
6. Click **Add secret**

### Step 4: Verify Your Public Key is on the VPS

On your VPS (2.56.246.163), make sure the public key is in authorized_keys:
```bash
ssh ansh@2.56.246.163
cat ~/.ssh/authorized_keys
```

You should see a line starting with `ssh-ed25519 AAAA...`

If it's not there, add it:
```bash
# On your local machine, get the public key:
cat ~/.ssh/id_ed25519.pub

# Then on the VPS:
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## Alternative Solution: Use SSH Agent Action

If the manual method continues to fail, you can use the official `webfactory/ssh-agent` action instead:

Replace the "Setup SSH" step in `.github/workflows/deploy.yml` with:

```yaml
      # 2) Setup SSH using official action
      - name: 🔐 Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
      
      - name: 🔑 Add VPS to known hosts
        run: |
          ssh-keyscan -H 2.56.246.163 >> ~/.ssh/known_hosts
```

Then update the deployment step to remove the `-i` flag:
```yaml
      - name: 🚀 Deploy to VPS
        run: |
          ssh ansh@2.56.246.163 <<'EOF'
          # ... rest of the deployment commands
```

## Debugging Tips

1. **Check the workflow logs**: The `head -n 1 ~/.ssh/id_ed25519` command should show `-----BEGIN OPENSSH PRIVATE KEY-----`
2. **Test SSH locally**: Try connecting from your local machine first
3. **Check key permissions**: Make sure the key file has 600 permissions
4. **Verify key format**: The key must be in OpenSSH format (not PEM format)

## Common Mistakes

❌ **Wrong key format** - Using RSA PEM format instead of OpenSSH format
❌ **Missing headers** - Not including BEGIN/END lines  
❌ **Extra whitespace** - Adding spaces or newlines around the key
❌ **Wrong key** - Using public key instead of private key
❌ **Encoded key** - Base64 encoding the key before adding to secrets
