# Paawan Shah — Portfolio Website

A dark, modern personal portfolio built with HTML, CSS & JavaScript. Designed to be hosted free on **GitHub Pages** with a custom domain.

## 🚀 How to Deploy on GitHub Pages (Free!)

### Step 1: Create a GitHub Repository
1. Go to [github.com](https://github.com) and sign in (or create an account)
2. Click the **+** icon → **New repository**
3. Name it: `paawanshah99.github.io` (replace `paawanshah99` with your GitHub username)
4. Set it to **Public**
5. Click **Create repository**

### Step 2: Upload Your Files
1. On the repository page, click **"uploading an existing file"**
2. Drag and drop ALL files from this folder: `index.html`, `CNAME`
3. Click **"Commit changes"**

### Step 3: Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Select **main** branch and **/ (root)** folder
4. Click **Save**

### Step 4: Connect Your Custom Domain
1. In GitHub Pages settings, under **Custom domain**, enter: `Paawanshah99.com`
2. Click **Save**
3. Go to your domain registrar (where you bought Paawanshah99.com)
4. Update DNS settings:

   **Option A — A Records (Recommended):**
   | Type | Name | Value |
   |------|------|-------|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | paawanshah99.github.io |

   **Option B — CNAME Only (if A records not supported):**
   | Type | Name | Value |
   |------|------|-------|
   | CNAME | www | paawanshah99.github.io |

5. Wait 24-48 hours for DNS propagation
6. Back in GitHub Pages settings, check **"Enforce HTTPS"** once it becomes available

### ✅ Done!
Your site will be live at **https://Paawanshah99.com**

## 📁 File Structure
```
├── index.html    # Complete portfolio website
├── CNAME         # Custom domain config for GitHub Pages
└── README.md     # This file
```

## ✏️ Customization
- Edit `index.html` to update your bio, projects, skills, and contact info
- Colors can be changed via CSS variables at the top of the `<style>` block
- Add your real project links in the Projects section

## 📧 Contact Form
The contact form currently shows a success animation. To make it functional, you can integrate:
- [Formspree](https://formspree.io) (free tier available)
- [Getform](https://getform.io)
- [EmailJS](https://www.emailjs.com)

---
Built with ❤️ by Paawan Shah
