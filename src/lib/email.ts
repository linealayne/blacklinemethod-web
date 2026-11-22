/**
 * The emails the site sends, as branded HTML with a plain-text twin.
 *
 * There is one today: the consult request notification that
 * /api/contact sends to the practice. Who receives it, the sender, the
 * subject, and what triggers it all live in the route and are not decided
 * here.
 *
 * Email rules this file follows (keep them if you edit it):
 *   - tables for layout, every style inline, a bgcolor on every cell
 *   - dark only: the color-scheme metas stop mail apps inverting it
 *   - the wordmark and the gene are PNGs on blacklinemethod.com (email
 *     cannot load the site's font reliably or run animation); both sit on
 *     the same near-black as the email, and both have alt text
 *   - everything a visitor typed is escaped before it goes into the HTML
 *
 * Colours are the palette tokens from globals.css, written out because
 * email has no CSS variables.
 */

const SITE = 'https://blacklinemethod.com'

const C = {
  black: '#080808',
  hairline: '#262624',
  offwhite: '#F2F1EC',
  tan: '#D0AE82',
  label: '#8C8A84',
  body: '#B9B8B2',
}

const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
const SERIF = "Georgia, 'Times New Roman', Times, serif"

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** spaced capitals, the email's version of `.bl-label` */
const label = (text: string, color = C.label) =>
  `<span style="font-family:${SANS};font-size:11px;line-height:16px;font-weight:600;letter-spacing:2.2px;text-transform:uppercase;color:${color};">${text}</span>`

const row = (name: string, value: string) => `
              <tr>
                <td bgcolor="${C.black}" width="112" valign="top" style="width:112px;padding:16px 0;border-top:1px solid ${C.hairline};background-color:${C.black};">${label(name)}</td>
                <td bgcolor="${C.black}" valign="top" style="padding:14px 0 16px 0;border-top:1px solid ${C.hairline};background-color:${C.black};font-family:${SANS};font-size:15px;line-height:22px;color:${C.offwhite};word-break:break-word;">${value}</td>
              </tr>`

export interface ConsultRequest {
  name: string
  email: string
  message: string
  /** when the request arrived; defaults to now */
  receivedAt?: Date
}

/** The consult request notification. */
export function consultRequestEmail({ name, email, message, receivedAt = new Date() }: ConsultRequest) {
  const n = escapeHtml(name)
  const e = escapeHtml(email)
  const m = escapeHtml(message).replace(/\r\n|\r|\n/g, '<br>')
  const when = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(receivedAt)
  const mailto = `mailto:${encodeURIComponent(email).replace(/%40/g, '@')}`
  const first = escapeHtml(name.split(/\s+/)[0] || name)

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>Consult request from ${n}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style>
  :root { color-scheme: dark; supported-color-schemes: dark; }
  body { margin: 0; padding: 0; }
  a { text-decoration: none; }
  img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  @media (max-width: 620px) {
    .bl-pad { padding-left: 24px !important; padding-right: 24px !important; }
    .bl-head { font-size: 22px !important; line-height: 30px !important; }
  }
  /* mail apps that recolour dark mode: hold the palette */
  [data-ogsc] .bl-ink, [data-ogsb] .bl-ink { background-color: ${C.black} !important; }
  u + .body .bl-ink { background-color: ${C.black} !important; }
</style>
</head>
<body class="body" bgcolor="${C.black}" style="margin:0;padding:0;background-color:${C.black};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${C.black};">${n} sent a consult request. ${escapeHtml(message.replace(/\s+/g, ' ').slice(0, 110))}</div>
<table role="presentation" class="bl-ink" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.black}" style="background-color:${C.black};">
  <tr>
    <td class="bl-ink" align="center" bgcolor="${C.black}" style="padding:24px 12px 40px 12px;background-color:${C.black};">
      <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table role="presentation" class="bl-ink" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.black}" style="max-width:600px;background-color:${C.black};border:1px solid ${C.hairline};">

        <!-- wordmark -->
        <tr>
          <td class="bl-ink bl-pad" bgcolor="${C.black}" style="padding:30px 40px 6px 40px;background-color:${C.black};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="${C.black}" valign="middle" style="background-color:${C.black};">
                  <a href="${SITE}" style="text-decoration:none;"><img src="${SITE}/email/wordmark.png" width="143" height="28" alt="BLACKLINE" style="display:block;width:143px;height:28px;border:0;font-family:${SERIF};font-size:15px;letter-spacing:6px;color:${C.offwhite};"></a>
                </td>
                <td bgcolor="${C.black}" align="right" valign="middle" style="background-color:${C.black};">${label('Consult request', C.tan)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- the gene -->
        <tr>
          <td class="bl-ink" bgcolor="${C.black}" style="padding:0;background-color:${C.black};font-size:0;line-height:0;">
            <img src="${SITE}/email/gene.png" width="598" height="130" alt="" style="display:block;width:100%;max-width:598px;height:auto;border:0;">
          </td>
        </tr>

        <!-- who -->
        <tr>
          <td class="bl-ink bl-pad" bgcolor="${C.black}" style="padding:10px 40px 26px 40px;background-color:${C.black};">
            <p style="margin:0 0 12px 0;">${label('New request from')}</p>
            <h1 class="bl-head" style="margin:0;font-family:${SERIF};font-weight:400;font-size:26px;line-height:34px;letter-spacing:2px;text-transform:uppercase;color:${C.offwhite};word-break:break-word;">${n}</h1>
          </td>
        </tr>

        <!-- the details -->
        <tr>
          <td class="bl-ink bl-pad" bgcolor="${C.black}" style="padding:0 40px;background-color:${C.black};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${row('Name', n)}${row('Email', `<a href="${mailto}" style="color:${C.tan};text-decoration:none;">${e}</a>`)}${row('Received', `${escapeHtml(when)} <span style="color:${C.label};">Central</span>`)}
              <tr>
                <td bgcolor="${C.black}" colspan="2" style="padding:16px 0 8px 0;border-top:1px solid ${C.hairline};background-color:${C.black};">${label('Message')}</td>
              </tr>
              <tr>
                <td bgcolor="${C.black}" colspan="2" style="padding:0 0 26px 0;border-bottom:1px solid ${C.hairline};background-color:${C.black};font-family:${SANS};font-size:15px;line-height:25px;color:${C.offwhite};word-break:break-word;">${m}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- reply -->
        <tr>
          <td class="bl-ink bl-pad" bgcolor="${C.black}" style="padding:28px 40px 36px 40px;background-color:${C.black};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="${C.offwhite}" align="center" style="background-color:${C.offwhite};">
                  <a href="${mailto}" style="display:inline-block;padding:15px 28px;font-family:${SANS};font-size:11px;line-height:16px;font-weight:700;letter-spacing:2.2px;text-transform:uppercase;color:${C.black};text-decoration:none;">Reply to ${first}</a>
                </td>
              </tr>
            </table>
            <p style="margin:14px 0 0 0;font-family:${SANS};font-size:13px;line-height:20px;color:${C.label};">Replying to this email also goes straight to ${first}.</p>
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td class="bl-ink bl-pad" bgcolor="${C.black}" style="padding:22px 40px 26px 40px;border-top:1px solid ${C.hairline};background-color:${C.black};">
            <p style="margin:0 0 6px 0;">${label('Blackline &nbsp;&middot;&nbsp; Dallas, Texas', C.body)}</p>
            <p style="margin:0;font-family:${SANS};font-size:12px;line-height:18px;color:${C.label};">Sent from the consult form at <a href="${SITE}" style="color:${C.label};text-decoration:underline;">blacklinemethod.com</a></p>
          </td>
        </tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td>
  </tr>
</table>
</body>
</html>`

  const text = [
    'BLACKLINE',
    'Consult request',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Received: ${when} Central`,
    '',
    'Message:',
    message,
    '',
    `Reply to this email to answer ${name.split(/\s+/)[0] || name} directly.`,
    '',
    '--',
    'Blackline · Dallas, Texas',
    'Sent from the consult form at blacklinemethod.com',
  ].join('\n')

  return { html, text }
}
