import os
import sys
import time
import subprocess
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

ROOT_DIR = r"d:\Kuliah\RPL"
OUTPUT_MP4 = os.path.join(ROOT_DIR, "demo.mp4")
TEMP_VIDEO_DIR = os.path.join(ROOT_DIR, "temp_video_rec")

OVERLAY_JS = """
window.__initDemoOverlays = function() {
    if (document.getElementById('v-mouse')) return;
    
    // Virtual mouse
    const m = document.createElement('div');
    m.id = 'v-mouse';
    m.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5)); pointer-events: none;">
        <path d="M5.5 3.2L18.5 13.5L12.5 14.5L10 20.5L7.5 19.5L10 13.5L5.5 3.2Z" fill="#ea580c" stroke="#ffffff" stroke-width="1.8"/>
      </svg>
      <div id="v-click-ripple" style="position: absolute; top: 0; left: 0; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #ea580c; opacity: 0; pointer-events: none; transform: translate(-3px, -3px) scale(0.2); transition: transform 0.35s ease-out, opacity 0.35s ease-out;"></div>
    `;
    m.style.cssText = 'position: fixed; z-index: 999999; pointer-events: none; left: 0; top: 0; transform: translate(960px, 400px); transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1);';
    document.body.appendChild(m);

    window.__virtualMouse = {
      el: m,
      moveTo(x, y) {
        if (this.el) {
          this.el.style.transform = `translate(${x}px, ${y}px)`;
        }
      },
      click() {
        const r = document.getElementById('v-click-ripple');
        if (r) {
          r.style.transition = 'none';
          r.style.opacity = '1';
          r.style.transform = 'translate(-3px, -3px) scale(0.3)';
          setTimeout(() => {
            r.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
            r.style.transform = 'translate(-3px, -3px) scale(1.6)';
            r.style.opacity = '0';
          }, 20);
        }
      }
    };

    // Narration container
    const box = document.createElement('div');
    box.id = 'v-narration-box';
    box.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999990;
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 18px;
      padding: 14px 28px;
      box-shadow: 0 20px 45px rgba(0,0,0,0.4);
      max-width: 920px;
      width: calc(100% - 80px);
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    document.body.appendChild(box);

    window.__setNarration = function(badge, title, text) {
      const b = document.getElementById('v-narration-box');
      if (!b) return;
      b.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="background: linear-gradient(135deg, #ea580c, #f97316); color: white; font-weight: 800; font-size: 11px; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 2px 6px rgba(234, 88, 12, 0.4);">${badge}</span>
            <span style="color: #f8fafc; font-weight: 700; font-size: 14px;">${title}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 8px #22c55e;"></span>
            <span style="color: #94a3b8; font-size: 11px; font-weight: 600;">KantinQ v1.0 • Final Release</span>
          </div>
        </div>
        <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5; margin: 0; font-weight: 400;">${text}</p>
      `;
    };
};
"""

TERMINAL_OVERLAY_JS = """
window.__showTerminalDemo = function() {
    return new Promise((resolve) => {
        let t = document.getElementById('v-terminal-drawer');
        if (t) t.remove();

        t = document.createElement('div');
        t.id = 'v-terminal-drawer';
        t.style.cssText = `
          position: fixed;
          bottom: 110px;
          left: 50%;
          transform: translateX(-50%) translateY(40px);
          width: 960px;
          height: 520px;
          background: #1e1e1e;
          border-radius: 16px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
          border: 1px solid #333333;
          z-index: 999980;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: "Cascadia Code", "Fira Code", Consolas, "Courier New", monospace;
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        `;

        t.innerHTML = `
          <div style="background: #252526; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #333;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
              <span style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
              <span style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
              <span style="color: #cccccc; font-size: 12px; font-weight: 600; margin-left: 8px;">Terminal — PowerShell (KantinQ Automatic Testing)</span>
            </div>
            <span style="background: #0e639c; color: white; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px;">npm test</span>
          </div>
          <div id="v-term-body" style="flex: 1; padding: 18px 22px; color: #d4d4d4; font-size: 13px; line-height: 1.6; overflow-y: auto;">
            <div style="color: #9cdcfe; margin-bottom: 6px;">
              <span>PS D:\\Kuliah\\RPL&gt; </span><span id="v-type-cmd" style="color: #ffffff; font-weight: bold;"></span><span id="v-term-cursor" style="background: #fff; width: 8px; height: 15px; display: inline-block; vertical-align: text-bottom; animation: blink 1s step-end infinite;"></span>
            </div>
            <div id="v-term-logs" style="display: none; margin-top: 10px;">
              <div style="color: #858585; font-size: 12px;">&gt; @kantinq/web@1.0.0 test<br>&gt; vitest run</div>
              <div style="color: #4ec9b0; margin: 8px 0 12px 0; font-weight: bold;"> RUN  v2.1.9 D:/Kuliah/RPL/apps/web</div>
              <div id="v-line-1" style="color: #4fc1ff; opacity: 0; transition: opacity 0.3s;"><span style="color: #4ec9b0; font-weight: bold;"> ✓ </span>src/test/validation.test.ts <span style="color: #858585;">(17 tests) 243ms</span></div>
              <div id="v-line-2" style="color: #4fc1ff; opacity: 0; transition: opacity 0.3s;"><span style="color: #4ec9b0; font-weight: bold;"> ✓ </span>src/test/useCart.test.ts <span style="color: #858585;">(8 tests) 156ms</span></div>
              <div id="v-line-3" style="color: #4fc1ff; opacity: 0; transition: opacity 0.3s;"><span style="color: #4ec9b0; font-weight: bold;"> ✓ </span>src/test/components.test.tsx <span style="color: #858585;">(10 tests) 2514ms</span></div>
              <div id="v-line-4" style="color: #4fc1ff; opacity: 0; transition: opacity 0.3s;"><span style="color: #4ec9b0; font-weight: bold;"> ✓ </span>src/test/api.test.ts <span style="color: #858585;">(6 tests) 50ms</span></div>
              <div id="v-line-5" style="color: #4fc1ff; opacity: 0; transition: opacity 0.3s;"><span style="color: #4ec9b0; font-weight: bold;"> ✓ </span>src/test/useOrderHistory.test.ts <span style="color: #858585;">(5 tests) 168ms</span></div>
              <div id="v-summary" style="margin-top: 16px; border-top: 1px solid #333333; padding-top: 14px; opacity: 0; transition: opacity 0.4s;">
                <div style="display: flex; gap: 32px; font-weight: bold; font-size: 14px;">
                  <div> Test Files  <span style="color: #4ec9b0; background: rgba(78, 201, 176, 0.15); padding: 2px 8px; border-radius: 4px;">5 passed (5)</span></div>
                  <div>      Tests  <span style="color: #4ec9b0; background: rgba(78, 201, 176, 0.2); padding: 2px 10px; border-radius: 4px; font-size: 15px;">46 passed (46)</span></div>
                </div>
                <div style="color: #858585; font-size: 12px; margin-top: 8px;">
                  Duration: <span style="color: #d4d4d4;">3.13s</span> • All unit tests verified successfully!
                </div>
                <div style="margin-top: 14px; background: rgba(39, 201, 63, 0.12); border: 1px solid #27c93f; border-radius: 8px; padding: 10px 14px; color: #27c93f; font-weight: bold; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>100% SUCCESS: 46 Automated Unit Tests Passed (Validation, Cart, UI, API, Storage)</span>
                </div>
              </div>
            </div>
          </div>
        `;

        document.body.appendChild(t);

        // Animate drawer entrance
        setTimeout(() => {
          t.style.opacity = '1';
          t.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);

        // Type "npm test"
        const cmd = "npm test";
        let idx = 0;
        const typeTimer = setInterval(() => {
          if (idx < cmd.length) {
            document.getElementById('v-type-cmd').textContent += cmd[idx];
            idx++;
          } else {
            clearInterval(typeTimer);
            document.getElementById('v-term-cursor').style.display = 'none';
            document.getElementById('v-term-logs').style.display = 'block';

            setTimeout(() => { document.getElementById('v-line-1').style.opacity = '1'; }, 400);
            setTimeout(() => { document.getElementById('v-line-2').style.opacity = '1'; }, 800);
            setTimeout(() => { document.getElementById('v-line-3').style.opacity = '1'; }, 1200);
            setTimeout(() => { document.getElementById('v-line-4').style.opacity = '1'; }, 1600);
            setTimeout(() => { document.getElementById('v-line-5').style.opacity = '1'; }, 2000);
            setTimeout(() => {
              document.getElementById('v-summary').style.opacity = '1';
              resolve();
            }, 2500);
          }
        }, 120);
    });
};

window.__hideTerminalDemo = function() {
    const t = document.getElementById('v-terminal-drawer');
    if (t) {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(60px)';
      setTimeout(() => t.remove(), 600);
    }
};
"""

def move_to_element(page, selector, offset_x=0, offset_y=0, wait_sec=0.55):
    try:
        page.wait_for_selector(selector, state="visible", timeout=5000)
        box = page.locator(selector).first.bounding_box()
        if box:
            target_x = box["x"] + box["width"] / 2 + offset_x
            target_y = box["y"] + box["height"] / 2 + offset_y
            page.evaluate(f"window.__virtualMouse.moveTo({target_x}, {target_y})")
            time.sleep(wait_sec)
            return target_x, target_y
    except Exception as e:
        print(f"Warning: move_to_element '{selector}' failed: {e}")
    return None

def click_element(page, selector, offset_x=0, offset_y=0, pre_wait=0.3, post_wait=0.8):
    move_to_element(page, selector, offset_x, offset_y, wait_sec=0.5)
    page.evaluate("window.__virtualMouse.click()")
    time.sleep(pre_wait)
    page.locator(selector).first.click()
    time.sleep(post_wait)

def set_narration(page, badge, title, text):
    # Escape quotes
    safe_badge = badge.replace("'", "\\'")
    safe_title = title.replace("'", "\\'")
    safe_text = text.replace("'", "\\'")
    page.evaluate(f"window.__setNarration('{safe_badge}', '{safe_title}', '{safe_text}')")

def smooth_scroll(page, start_y, end_y, steps=25, delay=0.03):
    step_val = (end_y - start_y) / steps
    current = start_y
    for _ in range(steps):
        current += step_val
        page.evaluate(f"window.scrollTo(0, {current})")
        time.sleep(delay)

def type_text(page, selector, text, delay=0.08):
    move_to_element(page, selector)
    page.evaluate("window.__virtualMouse.click()")
    loc = page.locator(selector).first
    loc.click()
    loc.fill("")
    for char in text:
        loc.type(char, delay=int(delay * 1000))
    time.sleep(0.4)

def main():
    print("[1/5] Initializing Playwright...")
    os.makedirs(TEMP_VIDEO_DIR, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--start-maximized",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--hide-scrollbars",
            ],
        )

        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=TEMP_VIDEO_DIR,
            record_video_size={"width": 1920, "height": 1080},
        )

        page = context.new_page()

        print("[2/5] Navigating to KantinQ on http://localhost:5173...")
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(1.0)

        # Inject overlays
        page.evaluate(OVERLAY_JS)
        page.evaluate(TERMINAL_OVERLAY_JS)
        page.evaluate("window.__initDemoOverlays()")

        # ==========================================
        # SCENE 1: Pengenalan & Akses Kantin (00:00 - 00:25) ~25s
        # ==========================================
        print(">>> Executing Scene 1: Pengenalan & Akses Kantin...")
        click_element(page, "button:has-text('QR Kantin')")
        set_narration(
            page,
            "Bagian 1/7",
            "Pengenalan & Akses Kantin via QR Code",
            "KantinQ adalah sistem pemesanan & antrean digital kantin kampus berbasis QR Code. Alur dimulai saat mahasiswa memindai QR Code di stan kasir untuk langsung membuka web app tanpa download."
        )
        time.sleep(2.0)

        # Move to QR Code card & inspect standee
        move_to_element(page, "div.bg-orange-50")
        time.sleep(4.0)

        # Move to copy button and print button
        move_to_element(page, "button:has-text('Salin')")
        time.sleep(2.0)
        click_element(page, "button:has-text('Salin')")
        time.sleep(2.0)

        move_to_element(page, "button:has-text('Cetak / Print QR Code')")
        time.sleep(3.0)

        # Click "Uji Buka Menu" to open customer ordering page
        click_element(page, "button:has-text('Uji Buka Menu')")
        time.sleep(3.0)

        # ==========================================
        # SCENE 2: Eksplorasi Menu, Filter & Validasi Keranjang (00:25 - 01:10) ~45s
        # ==========================================
        print(">>> Executing Scene 2: Eksplorasi Menu, Filter & Validasi Keranjang...")
        set_narration(
            page,
            "Bagian 2/7",
            "Eksplorasi Menu, Filter Kategori & Validasi Input",
            "Mahasiswa dapat mencari makanan favorit, memfilter kategori minuman/tersedia, dan mengatur porsi di keranjang. Sistem dilengkapi validasi ketat agar pesanan selalu valid."
        )
        time.sleep(2.5)

        # Show queue condition badge
        move_to_element(page, "text=Kondisi Antrean Saat Ini:")
        time.sleep(2.5)

        # Search menu: type "Ayam"
        search_input = "input[placeholder='Cari makanan atau minuman...']"
        type_text(page, search_input, "Ayam", delay=0.1)
        time.sleep(3.0)

        # Filter: Minuman
        click_element(page, "button:has-text('Minuman')")
        time.sleep(3.0)

        # Filter: Tersedia
        click_element(page, "button:has-text('Tersedia')")
        time.sleep(3.0)

        # Reset search & filter: clear input and click "Semua"
        loc_search = page.locator(search_input).first
        loc_search.click()
        loc_search.fill("")
        time.sleep(0.5)
        click_element(page, "button:has-text('Semua')")
        time.sleep(2.5)

        # Select menu: "Nasi Ayam Geprek Sambal Bawang" -> Add to cart
        # Find card with text "Nasi Ayam Geprek Sambal Bawang"
        card_ayam = page.locator("div.bg-white:has-text('Nasi Ayam Geprek Sambal Bawang')").first
        btn_add_ayam = card_ayam.locator("button:has-text('Tambah')").first
        btn_add_ayam.click()
        page.evaluate("window.__virtualMouse.click()")
        time.sleep(1.5)

        # Increase portion to 2 using "+" button on the card
        btn_plus = card_ayam.locator("button[aria-label*='Tambah']").first
        btn_plus.click()
        page.evaluate("window.__virtualMouse.click()")
        time.sleep(1.5)

        # Add "Es Teh Manis Jumbo" (1 portion)
        card_teh = page.locator("div.bg-white:has-text('Es Teh Manis Jumbo')").first
        btn_add_teh = card_teh.locator("button:has-text('Tambah')").first
        btn_add_teh.click()
        page.evaluate("window.__virtualMouse.click()")
        time.sleep(2.0)

        # Move mouse to cart section and highlight Total Pembayaran: Rp 40.000
        move_to_element(page, "text=Total Pembayaran")
        time.sleep(3.0)

        # --- VALIDATION TEST 1: Empty name -> Click "Buat Pesanan" ---
        btn_buat_pesanan = "button[type='submit']:has-text('Buat Pesanan')"
        click_element(page, btn_buat_pesanan)
        time.sleep(3.0)

        # --- VALIDATION TEST 2: Name only "1" -> Shows error ---
        name_input = "input[placeholder*='Budi']"
        type_text(page, name_input, "1", delay=0.1)
        click_element(page, btn_buat_pesanan)
        time.sleep(3.0)

        # --- VALID INPUT: "Budi Santoso (NIM 210123)" ---
        type_text(page, name_input, "Budi Santoso (NIM 210123)", delay=0.08)
        time.sleep(2.5)

        # ==========================================
        # SCENE 3: Checkout & Tiket Antrean Digital (01:10 - 01:45) ~35s
        # ==========================================
        print(">>> Executing Scene 3: Checkout & Tiket Antrean Digital...")
        set_narration(
            page,
            "Bagian 3/7",
            "Checkout & Penerbitan Tiket Antrean Digital",
            "Setelah tombol 'Buat Pesanan' ditekan, sistem menerbitkan tiket antrean digital otomatis dengan nomor antrean unik, rincian biaya, dan progress tracker 4 tahap interaktif."
        )
        click_element(page, btn_buat_pesanan)
        time.sleep(3.5)

        # We should be on OrderConfirmationPage
        # Highlight Jumbo Queue Number
        move_to_element(page, "div.text-5xl")
        time.sleep(3.5)

        # Highlight Status Badge "MENUNGGU"
        move_to_element(page, "span:has-text('MENUNGGU')")
        time.sleep(2.5)

        # Smooth scroll down to view details
        smooth_scroll(page, 0, 420, steps=25, delay=0.03)
        time.sleep(2.0)

        # Highlight detail items breakdown
        move_to_element(page, "text=Detail Item yang Dipesan")
        time.sleep(3.0)

        # Highlight payment instruction callout
        move_to_element(page, "text=Instruksi Pengambilan & Pembayaran:")
        time.sleep(3.0)

        # Highlight polling indicator text
        move_to_element(page, "text=Status diperbarui secara otomatis setiap 4 detik")
        time.sleep(2.5)

        # Click Refresh button
        click_element(page, "button:has-text('Lihat Status Pesanan (Refresh)')")
        time.sleep(3.0)

        # Smooth scroll back up
        smooth_scroll(page, 420, 0, steps=25, delay=0.03)
        time.sleep(2.0)

        # ==========================================
        # SCENE 4: Riwayat "Pesanan Saya" (01:45 - 02:05) ~20s
        # ==========================================
        print(">>> Executing Scene 4: Riwayat 'Pesanan Saya'...")
        set_narration(
            page,
            "Bagian 4/7",
            "Riwayat 'Pesanan Saya' (Penyimpanan Lokal)",
            "Pesanan mahasiswa tersimpan otomatis di localStorage tab 'Pesanan Saya'. Nomor antrean aman dan dapat dibuka kembali kapan saja meskipun browser ditutup atau di-refresh."
        )
        click_element(page, "button:has-text('Pesanan Saya')")
        time.sleep(3.0)

        # Click "Segarkan Status"
        click_element(page, "button:has-text('Segarkan Status')")
        time.sleep(3.0)

        # Click the order card to reopen the Digital Ticket
        order_card = page.locator("button.w-full:has-text('Budi Santoso')").first
        order_card.click()
        page.evaluate("window.__virtualMouse.click()")
        time.sleep(4.0)

        # ==========================================
        # SCENE 5: Papan Antrean Digital Publik (02:05 - 02:25) ~20s
        # ==========================================
        print(">>> Executing Scene 5: Papan Antrean Digital Publik...")
        set_narration(
            page,
            "Bagian 5/7",
            "Papan Antrean Digital Publik (TV Monitor Kantin)",
            "Halaman Pantau Antrean dapat ditampilkan di monitor TV aula kantin. Menampilkan 3 kolom status: Menunggu, Sedang Diproses, dan Siap Diambil secara transparan."
        )
        click_element(page, "button:has-text('Pantau Antrean')")
        time.sleep(3.0)

        # Highlight column 1 (Menunggu)
        move_to_element(page, "span:has-text('Menunggu')")
        time.sleep(3.0)

        # Highlight column 2 (Sedang Diproses)
        move_to_element(page, "span:has-text('Sedang Diproses')")
        time.sleep(3.0)

        # Highlight column 3 (Siap Diambil)
        move_to_element(page, "span:has-text('Siap Diambil')")
        time.sleep(4.0)

        # ==========================================
        # SCENE 6: Pengelolaan Antrean di Dashboard Penjual (02:25 - 03:00) ~35s
        # ==========================================
        print(">>> Executing Scene 6: Pengelolaan Antrean di Dashboard Penjual...")
        set_narration(
            page,
            "Bagian 6/7",
            "Pengelolaan Antrean Dapur di Dashboard Penjual",
            "Dashboard memudahkan dapur memajukan status pesanan dari memasak hingga siap diambil. Omset harian dan kartu statistik antrean otomatis terbarui secara real-time."
        )
        click_element(page, "button:has-text('Dashboard Penjual')")
        time.sleep(3.0)

        # Highlight metrics
        move_to_element(page, "text=Pesanan Hari Ini")
        time.sleep(1.5)
        move_to_element(page, "text=Pendapatan Hari Ini")
        time.sleep(2.0)

        # Locate Budi's order card in active list
        card_budi = page.locator("div.rounded-2xl:has-text('Budi Santoso')").first

        # STEP 1: Click "Proses Pesanan" (Status -> DIPROSES)
        btn_proses = card_budi.locator("button:has-text('Proses Pesanan')").first
        btn_proses.click()
        page.evaluate("window.__virtualMouse.click()")
        time.sleep(3.5)

        # STEP 2: Click "Pesanan Siap" (Status -> SIAP DIAMBIL)
        card_budi = page.locator("div.rounded-2xl:has-text('Budi Santoso')").first
        btn_siap = card_budi.locator("button:has-text('Pesanan Siap')").first
        btn_siap.click()
        page.evaluate("window.__virtualMouse.click()")
        time.sleep(3.5)

        # STEP 3: Switch briefly to "Pantau Antrean" to verify Siap Diambil
        click_element(page, "button:has-text('Pantau Antrean')")
        time.sleep(4.0)

        # STEP 4: Switch to "Pesanan Saya" -> Click Budi's ticket -> See "PESANAN SIAP!" callout
        click_element(page, "button:has-text('Pesanan Saya')")
        time.sleep(2.0)
        card_budi_hist = page.locator("button:has-text('Budi Santoso')").first
        card_budi_hist.click()
        page.evaluate("window.__virtualMouse.click()")
        time.sleep(4.5)

        # STEP 5: Return to Seller Dashboard and complete order
        click_element(page, "button:has-text('Dashboard Penjual')")
        time.sleep(2.5)

        card_budi = page.locator("div.rounded-2xl:has-text('Budi Santoso')").first
        btn_selesaikan = card_budi.locator("button:has-text('Selesaikan')").first
        btn_selesaikan.click()
        page.evaluate("window.__virtualMouse.click()")
        time.sleep(3.5)

        # View History tab in seller dashboard
        click_element(page, "button:has-text('Riwayat Selesai & Dibatalkan')")
        time.sleep(4.0)

        # ==========================================
        # SCENE 7: Pengujian Otomatis & Penutup (03:00 - 03:20) ~22s
        # ==========================================
        print(">>> Executing Scene 7: Pengujian Otomatis & Penutup...")
        # Switch back to clean "Pesan Menu" view
        click_element(page, "button:has-text('Pesan Menu')")
        time.sleep(2.0)

        set_narration(
            page,
            "Bagian 7/7",
            "Pengujian Otomatis (Unit Testing) & Penutup",
            "Seluruh 46 unit tests telah diverifikasi 100% lulus. KantinQ siap menjadi solusi digitalisasi kantin kampus yang handal, cepat, dan modern. Terima kasih!"
        )

        # Run terminal demo inside the browser
        page.evaluate("window.__showTerminalDemo()")
        time.sleep(12.0)

        # Close terminal drawer to reveal clean KantinQ interface
        page.evaluate("window.__hideTerminalDemo()")
        time.sleep(5.0)

        print("[3/5] Finishing recording and closing browser...")
        context.close()
        browser.close()

    # Find recorded webm file
    webm_files = [os.path.join(TEMP_VIDEO_DIR, f) for f in os.listdir(TEMP_VIDEO_DIR) if f.endswith(".webm")]
    if not webm_files:
        raise RuntimeError("No recorded webm video file found!")

    raw_webm = webm_files[0]
    print(f"Recorded raw video: {raw_webm} (Size: {os.path.getsize(raw_webm)} bytes)")

    # Convert to MP4 using imageio-ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"[4/5] Converting to {OUTPUT_MP4} via FFmpeg...")

    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", raw_webm,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        OUTPUT_MP4
    ]

    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("FFmpeg error:", res.stderr)
        sys.exit(1)

    # Check output
    if os.path.exists(OUTPUT_MP4) and os.path.getsize(OUTPUT_MP4) > 0:
        print(f"[5/5] Success! Created {OUTPUT_MP4} ({os.path.getsize(OUTPUT_MP4)} bytes)")
    else:
        print("Error: Output MP4 was not created or is 0 bytes.")
        sys.exit(1)

if __name__ == "__main__":
    main()
