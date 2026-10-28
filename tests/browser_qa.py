from playwright.sync_api import sync_playwright
from pathlib import Path
import json, time, datetime
BASE='about:blank'
SITE=Path(__file__).resolve().parent.parent
MARKETS=[
 dict(id='bitcoin',symbol='btc',name='Bitcoin',current_price=112345.21,price_change_percentage_24h=3.5,price_change_percentage_7d_in_currency=8.4,market_cap=2100000000000,total_volume=15000000000,market_cap_rank=1,last_updated='2026-10-28T00:00:00Z',image=''),
 dict(id='ethereum',symbol='eth',name='Ethereum',current_price=4356.12,price_change_percentage_24h=-2.1,price_change_percentage_7d_in_currency=-5.2,market_cap=545000000000,total_volume=7000000000,market_cap_rank=2,last_updated='2026-10-28T00:00:00Z',image=''),
 dict(id='solana',symbol='sol',name='Solana',current_price=211,price_change_percentage_24h=6.3,price_change_percentage_7d_in_currency=13.4,market_cap=92000000000,total_volume=3500000000,market_cap_rank=3,last_updated='2026-10-28T00:00:00Z',image=''),
 dict(id='xrp',symbol='xrp',name='XRP',current_price=2.5,price_change_percentage_24h=-1.1,price_change_percentage_7d_in_currency=3,market_cap=120000000000,total_volume=2900000000,market_cap_rank=4,last_updated='2026-10-28T00:00:00Z',image=''),
 dict(id='dogecoin',symbol='doge',name='Dogecoin',current_price=.24,price_change_percentage_24h=10.2,price_change_percentage_7d_in_currency=30,market_cap=35000000000,total_volume=2000000000,market_cap_rank=6,last_updated='2026-10-28T00:00:00Z',image='')]

for m in MARKETS:m['last_updated']=datetime.datetime.now(datetime.timezone.utc).isoformat()

def attach_mock(page,fail=False):
 def local_file(route):
  from urllib.parse import urlsplit, unquote
  rel=unquote(urlsplit(route.request.url).path).lstrip('/') or 'index.html'
  f=(SITE/rel).resolve()
  if not f.is_relative_to(SITE) or not f.is_file():return route.fulfill(status=404,body='Not found')
  kind= 'text/html' if f.suffix=='.html' else 'text/css' if f.suffix=='.css' else 'application/javascript' if f.suffix=='.js' else 'image/svg+xml'
  route.fulfill(status=200,body=f.read_bytes(),content_type=kind)
 # No navigation outside about:blank: styles and scripts injected with static HTML.
 def route_handler(route):
  url=route.request.url
  if fail:route.fulfill(status=429,body='{"error":"rate limited"}',content_type='application/json')
  elif '/market_chart?' in url:route.fulfill(status=200,headers={'Access-Control-Allow-Origin':'*'},body=json.dumps({'prices':[[1720000000000,100],[1720086400000,120],[1720172800000,110]]}),content_type='application/json')
  elif '/coins/markets?' in url:route.fulfill(status=200,headers={'Access-Control-Allow-Origin':'*'},body=json.dumps(MARKETS),content_type='application/json')
  else:route.abort()
 page.route('**/api.coingecko.com/**',route_handler)
 page.route('**/api.kraken.com/**',route_handler)


def load_page(page):
 html=(SITE/'index.html').read_text()
 html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+ (SITE/'styles.css').read_text() +'</style>')
 html=html.replace('<script defer src="core.js"></script><script defer src="app.js"></script>','')
 shim="<script>Object.defineProperty(window,'localStorage',{value:{records:{},getItem(k){return this.records[k]??null},setItem(k,v){this.records[k]=String(v)},removeItem(k){delete this.records[k]}} ,configurable:true});</script>"
 html=html.replace('</body>',shim+'<script>'+(SITE/'core.js').read_text()+'</script><script>'+(SITE/'app.js').read_text()+'</script></body>')
 page.set_content(html,wait_until='domcontentloaded')


def navigate(page,width,view):
 if width<=880:page.locator("#menuButton").click()
 page.locator(f'[data-view="{view}"]').click()

def main():
 root=Path(__file__).parent
 with sync_playwright() as p:
  b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width in [280,320,375,430,768,1024,1440]:
   page=b.new_page(viewport={'width':width,'height':820},device_scale_factor=1)
   issues=[]
   page.on('pageerror',lambda e: issues.append(str(e)))
   attach_mock(page)
   load_page(page)
   page.locator('#dataStatus').get_by_text('CoinGecko',exact=False).wait_for(timeout=10000)
   page.wait_for_timeout(220)
   overflow=page.evaluate('document.documentElement.scrollWidth > innerWidth')
   assert not issues,(width,issues)
   assert not overflow,('Horizontal overflow',width)
   if width in (375,1440):page.screenshot(path=str(root/f'screen_{width}.png'),full_page=True)
   navigate(page,width,"markets")
   page.locator('#searchMarkets').fill('bitcoin')
   assert page.locator('tbody tr[data-coin]').count()==1
   page.locator('tbody tr[data-coin]').click()
   assert page.locator('#modalHost').get_by_text('Bitcoin market details').count()==1
   page.locator('#detailChart svg').wait_for(timeout=3000)
   page.locator('#closeModal').click()
   page.locator('#searchMarkets').fill('')
   page.locator('button[data-star="BTC"]').first.click()
   navigate(page,width,"portfolio")
   page.locator('#tradeSymbol').select_option('BTC')
   page.locator('#tradeAmount').fill('100')
   page.locator('#tradeForm button[type="submit"]').click()
   assert '9,900.00' in page.locator('#viewRoot').inner_text(), 'Practice buy did not reduce cash'
   page.locator('#tradeSide').select_option('SELL')
   page.locator('#tradeAmount').fill('50')
   page.locator('#tradeForm button[type="submit"]').click()
   assert '9,950.00' in page.locator('#viewRoot').inner_text(), 'Practice sell did not settle'
   navigate(page,width,"alerts")
   page.locator('#alertSymbol').select_option('BTC')
   page.locator('#alertTarget').fill('110000')
   page.locator('#alertForm button[type="submit"]').click()
   assert 'BTC' in page.locator('#viewRoot').inner_text()
   navigate(page,width,"learn")
   assert 'Cornelius Aurelius' in page.locator('#viewRoot').inner_text()
   assert not issues,(width,issues)
   print('PASS',width,'no overflow, JS errors, market search, chart, trade, alert, learning')
   page.close()
  page=b.new_page(viewport={'width':375,'height':820})
  attach_mock(page,fail=True)
  load_page(page)
  page.get_by_text('Offline / unavailable',exact=False).wait_for(timeout=15000)
  assert 'Unable to verify current prices' in page.locator('#networkAlert').inner_text()
  assert 'Market prices are currently unavailable' in page.locator('#viewRoot').inner_text()
  assert not page.locator('#viewRoot').get_by_text('$112,345.21').count()
  print('PASS network failure produces honest empty state with no fake prices')
  page.close();b.close()
if __name__=='__main__':main()
