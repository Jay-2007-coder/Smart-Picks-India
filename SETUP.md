# Automation Setup Guide

To get your 100% free daily automation running, follow these simple steps:

## Step 1: Create Your Google Sheet
1. Go to Google Sheets and create a new blank spreadsheet.
2. In the very first row, add these exact headers (case-sensitive):
   - `Product Name`
   - `Amazon URL`
   - `Category`
   - `Image URL`
3. Add a few test products in the rows below. Make sure the Amazon URL includes your `?tag=smartpick07d2-21`. For the image URL, right click any image online (like on Amazon or Unsplash) and click "Copy Image Address".

## Step 2: Publish Sheet as CSV
1. In your Google Sheet, click **File** -> **Share** -> **Publish to web**.
2. Change "Web page" to **Comma-separated values (.csv)**.
3. Click **Publish** and copy the long link it gives you.

## Step 3: Add GitHub Secrets
1. Go to your GitHub repository: https://github.com/Jay-2007-coder/Smart-Picks-India
2. Click on **Settings** (the gear icon at the top).
3. On the left sidebar, click **Secrets and variables** -> **Actions**.
4. Click **New repository secret**.
5. Add your first secret:
   - **Name:** `SHEET_CSV_URL`
   - **Secret:** *(Paste the published CSV link from Step 2)*
6. Click **Add secret**.
7. Click **New repository secret** again.
8. Add your second secret:
   - **Name:** `GEMINI_API_KEY`
   - **Secret:** *(Paste the Google Gemini API Key you just created)*

## Step 4: Test it!
1. Go to the **Actions** tab at the top of your GitHub repository.
2. Click on **Daily Product Update** on the left side.
3. Click the **Run workflow** dropdown on the right side and click the green button.
4. Wait about 30 seconds. If everything is set up correctly, your repository will update automatically with the new products from your Google Sheet, and Vercel will instantly begin deploying your live website!

Every morning at 10:00 AM IST, this process will run automatically for any new products you've added to your sheet!
