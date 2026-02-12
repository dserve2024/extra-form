export default async function handler(req, res) {
  const { uid, custId } = req.query;

  if (!uid) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(htmlPage('❌', 'ไม่พบ uid', '#ff6b6b'));
  }

  const LINE_TOKEN = process.env.LINE_CHANNEL_TOKEN;

  let ok = false;
  let statusCode = 0;
  let apiBody = '';
  let errorMsg = '';

  try {
    const apiRes = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_TOKEN}`
      },
      body: JSON.stringify({
        to: uid,
        messages: [{
          type: 'text',
          text: '📲 แอดมินกำลังจะแอดบัตรเข้า TrueMoneyWallet\nกรุณาเตรียมส่ง OTP กลับมาให้ทีนะครับ\nแล้วแจ้งกลับอีกครั้งเมื่อวงเงินพร้อม🙏'
        }]
      })
    });
    ok = apiRes.ok;
    statusCode = apiRes.status;
    apiBody = await apiRes.text();
  } catch (e) {
    ok = false;
    errorMsg = e.message;
  }

  const icon = ok ? '✅' : '❌';
  const msg = ok
    ? `แจ้งลูกค้า ${custId || ''} แล้ว`
    : 'ส่งไม่สำเร็จ';
  const color = ok ? '#4ecdc4' : '#ff6b6b';
  const autoClose = ok
    ? '<script>setTimeout(()=>{try{window.close()}catch(e){}},1500)</script>'
    : '';

  const debug = `<div style="font-size:11px;color:#666;margin-top:20px;word-break:break-all;text-align:left;padding:10px;background:#111;border-radius:8px;">uid: ${uid}<br>status: ${statusCode}<br>token: ${LINE_TOKEN ? LINE_TOKEN.substring(0, 10) + '...' : 'MISSING'}<br>response: ${apiBody}<br>${errorMsg ? 'error: ' + errorMsg : ''}</div>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(htmlPage(icon, msg, color, autoClose, debug));
}

function htmlPage(icon, msg, color, extra = '', debug = '') {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:sans-serif;text-align:center;padding:40px 20px;background:#1a1a2e;color:#fff;}
.icon{font-size:48px;margin-bottom:16px;}.msg{font-size:18px;color:${color};}</style></head>
<body><div class="icon">${icon}</div><div class="msg">${msg}</div>
<p style="color:#888;font-size:14px;margin-top:24px;">ปิดหน้านี้ได้เลย</p>
${debug}${extra}</body></html>`;
}
