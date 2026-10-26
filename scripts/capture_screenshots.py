import os
import sys
import time
from playwright.sync_api import sync_playwright

def capture():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_dir = os.path.join(base_dir, "docs", "screenshots")
    os.makedirs(output_dir, exist_ok=True)
    sample_csv = os.path.join(base_dir, "sample_data", "sample_patient_data.csv")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 840})
        page = context.new_page()

        print("[1/5] Navigating to Sign In...")
        page.goto("http://localhost:3005/signin", wait_until="networkidle")
        
        # Fill login form
        page.fill('input[name="email"]', "oncologist@breava.health")
        page.fill('input[name="password"]', "Password123!")
        page.click('button[type="submit"]')
        page.wait_for_url("http://localhost:3005/", timeout=10000)
        time.sleep(1.5)

        # 01 Landing Home
        print("[2/5] Capturing Home page...")
        page.screenshot(path=os.path.join(output_dir, "01-landing-home.png"), full_page=False)

        # 02 About Platform
        print("[3/5] Capturing About page...")
        page.goto("http://localhost:3005/about", wait_until="networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(output_dir, "02-about-platform.png"), full_page=False)

        # 03 Diagnose Upload
        print("[4/5] Capturing Diagnose page...")
        page.goto("http://localhost:3005/diagnose", wait_until="networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(output_dir, "03-diagnose-upload.png"), full_page=False)

        # Upload file and diagnose
        print("[*] Uploading sample patient CSV...")
        page.set_input_files('input[type="file"]', sample_csv)
        time.sleep(1)
        page.click('button:has-text("Submit for Clinical Analysis")')
        page.wait_for_url("**/result", timeout=15000)
        time.sleep(2)

        # 04 Clinical Results
        print("[5/5] Capturing Results page...")
        page.screenshot(path=os.path.join(output_dir, "04-clinical-results.png"), full_page=False)

        # 05 Diagnostic Records
        print("[*] Capturing Diagnostic Records page...")
        page.goto("http://localhost:3005/records", wait_until="networkidle")
        time.sleep(1.5)
        page.screenshot(path=os.path.join(output_dir, "05-diagnostic-records.png"), full_page=False)

        browser.close()
        print("All screenshots successfully captured in docs/screenshots!")

if __name__ == "__main__":
    capture()
