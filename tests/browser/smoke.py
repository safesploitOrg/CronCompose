#!/usr/bin/env python3
"""Optional local Chromium smoke/regression suite; deliberately excluded from CI."""
import os
import sys
import threading
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
SCREENSHOT_DIR = os.environ.get('CRONCOMPOSE_SCREENSHOTS')

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def main():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT / 'public')))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as p:
            binary = os.environ.get('CHROMIUM_PATH')
            browser = p.chromium.launch(executable_path=binary, headless=True)
            errors = []
            for width,height in [(1440,900),(768,1024),(390,844),(602,844)]:
                page = browser.new_page(viewport={'width':width,'height':height}, color_scheme='light')
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
                page.goto(url, timeout=10000)
                page.locator('#syntax-status').filter(has_text='Supported syntax').wait_for()
                assert page.locator('#output').input_value() == '0 9 * * 1-5 /usr/local/bin/task.sh\n'
                assert page.locator('header a').count() == 0
                assert page.locator('footer a[href*="github.com/safesploitOrg/CronCompose"]').count() == 1
                assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
                def positions():
                    # Document coordinates avoid false failures caused by click-induced scrolling.
                    boxes = page.locator('.day').evaluate_all("els => els.map(el => { const r = el.getBoundingClientRect(); return [r.x + window.scrollX, r.y + window.scrollY, r.width, r.height]; })")
                    return [tuple(round(value, 2) for value in box) for box in boxes]
                def assert_feedback_layout():
                    feedback = page.locator('.schedule-feedback').bounding_box()
                    selector = page.locator('#weekday-panel').bounding_box()
                    buttons = page.locator('.days').bounding_box()
                    meaning = page.locator('.meaning').bounding_box()
                    assert abs((selector['x'] + selector['width']) - (feedback['x'] + feedback['width'])) <= 1, f'Selector not right-aligned at {width}'
                    assert abs((buttons['x'] + buttons['width']) - (selector['x'] + selector['width'])) <= 1
                    assert page.locator('#weekday-panel').evaluate('(el) => getComputedStyle(el).textAlign') == 'right'
                    assert len({round(b[1],2) for b in positions()}) == 1, f'Weekday buttons wrapped at {width}'
                    if feedback['width'] >= 580:
                        assert meaning['x'] + meaning['width'] <= selector['x'] + 1, f'Explanation not to left at {width}'
                        assert abs(meaning['y'] - selector['y']) <= 1
                    else:
                        assert meaning['y'] >= selector['y'] + selector['height'] - 1, f'Explanation did not stack at {width}'
                assert_feedback_layout()
                baseline=positions()
                for expr in ('0 9 * * *','0 9 * * 0-3,5,6','0 9 * * 0-3,5','0 9 * * 2','0 9 * * MON-FRI'):
                    page.locator('#expression').fill(expr)
                    assert positions()==baseline, f'Weekday geometry changed at {width}: {expr}'
                    assert_feedback_layout()
                page.locator('#expression').fill('0 9 * * 1-3,5')
                assert page.locator('#days-label').inner_text() == 'Mon–Wed, Fri'
                assert page.locator('#meaning').inner_text() == 'At 09:00 — Mon–Wed, Fri.'
                assert positions()==baseline
                field_bounds = page.locator('#f4').bounding_box()
                page.locator('#expression').fill('0 9 * * *')
                page.get_by_role('button',name='Thursday',exact=True).click()
                assert page.locator('#f4').input_value()=='0-3,5,6'
                assert page.get_by_role('button',name='Thursday',exact=True).get_attribute('aria-pressed')=='false'
                assert positions()==baseline
                page.get_by_role('button',name='Saturday',exact=True).click()
                assert positions()==baseline
                if SCREENSHOT_DIR and width==602:
                    page.locator('.weekday').screenshot(path=str(Path(SCREENSHOT_DIR)/'croncompose-weekday-fixed.png'))
                page.get_by_role('button',name='Weekdays',exact=True).click()
                if SCREENSHOT_DIR and width==1440:
                    page.screenshot(path=str(Path(SCREENSHOT_DIR)/'croncompose-workspace.png'),full_page=True)
                page.locator('#extended > summary').click()
                page.get_by_role('button',name='Last Tuesday',exact=True).click()
                assert page.locator('#weekday-panel').is_hidden()
                assert page.locator('#weekday-field').is_visible()
                assert page.locator('#f4').is_disabled()
                assert page.locator('#f4').input_value() == '2'
                assert abs(page.locator('#f4').bounding_box()['width'] - field_bounds['width']) <= 1
                assert page.locator('.fields > div').count() == 5
                assert abs(page.locator('.meaning').bounding_box()['width'] - page.locator('.schedule-feedback').bounding_box()['width']) <= 1, 'Extended explanation must use full width'
                assert page.locator('#expression').get_attribute('readonly') is not None
                assert page.locator('#f2').is_disabled() and page.locator('#f3').is_disabled()
                assert page.locator('#expression').input_value()=='0 9 * * 2'
                assert 'case "$d"' in page.locator('#output').input_value()
                page.locator('#f0').fill('15')
                assert page.locator('#expression').input_value()=='15 9 * * 2'
                if SCREENSHOT_DIR and width==1440:
                    page.screenshot(path=str(Path(SCREENSHOT_DIR)/'croncompose-extended.png'),full_page=True)
                page.locator('#extended > summary').click()
                assert page.locator('#weekday-panel').is_hidden()
                assert 'case "$d"' in page.locator('#output').input_value()
                page.locator('#extended > summary').click()
                page.locator('#guard-remove').click()
                assert page.locator('#weekday-panel').is_visible()
                assert page.locator('#f4').is_enabled()
                assert page.locator('#f4').input_value() == '1-5'
                assert_feedback_layout()
                assert positions()==baseline
                assert page.locator('#expression').input_value()=='0 9 * * 1-5'
                page.locator('#system-mode').click()
                assert page.locator('#output').input_value().startswith('0 9 * * 1-5 backup ')
                page.locator('#username').fill('root invalid')
                assert page.locator('#copy').is_disabled()
                page.locator('#username').fill('backup')
                page.locator('#command').fill('<img src=x onerror=alert(1)>')
                assert '<img src=x onerror=alert(1)>' in page.locator('#output').input_value()
                assert page.locator('img[src=x]').count()==0
                page.locator('#theme').select_option('dark')
                page.locator('#density').select_option('compact')
                page.wait_for_function("JSON.parse(localStorage.getItem('croncompose.preferences.v1')).density === 'compact'")
                page.reload()
                assert page.locator('#theme').input_value()=='dark'
                assert page.locator('#density').input_value()=='compact'
                assert_feedback_layout()
                assert page.locator('#command').input_value()=='/usr/local/bin/task.sh'
                prefs=page.evaluate("JSON.parse(localStorage.getItem('croncompose.preferences.v1'))")
                assert set(prefs)=={'theme','density','layout','expandedSections'}
                assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
                page.close()
                print(f'PASS: {width}x{height} — stable right-aligned weekdays, responsive feedback, extended lock, output, storage, no page overflow')
            browser.close()
            assert not errors, errors
    finally:
        server.shutdown()
        server.server_close()

if __name__=='__main__':
    main()
