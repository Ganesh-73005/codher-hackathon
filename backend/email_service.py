import os
import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from dotenv import load_dotenv
import traceback

load_dotenv()

SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USER)

# ─── Shared layout helpers ────────────────────────────────────────────────────

def _base_styles() -> str:
    return """
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #f0ebff; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; }
      .wrapper { max-width: 600px; margin: 32px auto; }
      .card    { background: #ffffff; border-radius: 20px; overflow: hidden;
                 box-shadow: 0 8px 40px rgba(109,40,217,0.13); }

      /* ── Header ── */
      .header  { background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #a855f7 100%);
                 padding: 40px 32px 36px; text-align: center; position: relative; }
      .header::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
                       height: 24px; background: #fff;
                       clip-path: ellipse(55% 100% at 50% 100%); }
      .logo    { display: inline-block; font-size: 26px; font-weight: 700;
                 color: #fff; letter-spacing: -0.5px; }
      .logo span { color: #e9d5ff; }
      .tagline { color: rgba(255,255,255,0.78); font-size: 13px; margin-top: 6px; }

      /* ── Body ── */
      .body    { padding: 36px 36px 28px; }
      .greeting{ font-size: 22px; font-weight: 700; color: #1e1b4b; margin-bottom: 10px; }
      .intro   { font-size: 15px; color: #4b5563; line-height: 1.65; margin-bottom: 22px; }

      /* ── Info card ── */
      .info-box { background: #faf8ff; border: 1.5px solid #e9d5ff;
                  border-radius: 14px; padding: 22px 24px; margin: 20px 0; }
      .info-row { display: flex; align-items: center; gap: 10px;
                  padding: 9px 0; border-bottom: 1px solid #ede9fe; }
      .info-row:last-child { border-bottom: none; padding-bottom: 0; }
      .info-row:first-child{ padding-top: 0; }
      .info-icon{ font-size: 16px; width: 22px; text-align: center; flex-shrink: 0; }
      .info-label{ font-size: 12px; font-weight: 600; color: #7c3aed;
                   text-transform: uppercase; letter-spacing: 0.6px; width: 90px; flex-shrink: 0; }
      .info-value{ font-size: 14px; color: #1e1b4b; font-weight: 500; word-break: break-all; }

      /* ── Alert / notice ── */
      .notice  { background: #fdf4ff; border-left: 4px solid #a855f7;
                 border-radius: 0 10px 10px 0; padding: 14px 18px;
                 font-size: 14px; color: #6d28d9; line-height: 1.55; margin-top: 20px; }
      .notice strong { color: #4c1d95; }

      /* ── Status badge ── */
      .badge   { display: inline-block; background: #ede9fe; color: #6d28d9;
                 font-size: 12px; font-weight: 600; padding: 4px 12px;
                 border-radius: 999px; margin-bottom: 18px; }

      /* ── Footer ── */
      .footer  { background: #f5f3ff; padding: 20px 32px; text-align: center; }
      .footer p { color: #9ca3af; font-size: 12px; line-height: 1.6; }
      .footer a { color: #7c3aed; text-decoration: none; }

      /* ── Divider ── */
      .divider { height: 1px; background: #ede9fe; margin: 24px 0; }
    </style>
    """

def _header_html(subtitle: str = "Hackathon Management Portal") -> str:
    return f"""
    <div class="header">
      <div class="logo">Cod<span>HER</span></div>
      <div class="tagline">{subtitle}</div>
    </div>
    """

def _footer_html() -> str:
    return """
    <div class="footer">
      <p>This is an automated message from <strong>CodHER Platform</strong>. Please do not reply to this email.<br>
      &copy; 2025 CodHER. All rights reserved.</p>
    </div>
    """

def _wrap(inner_html: str) -> str:
    """Wrap content in the shared base layout."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
{_base_styles()}
</head>
<body>
  <div class="wrapper">
    <div class="card">
      {_header_html()}
      <div class="body">{inner_html}</div>
      {_footer_html()}
    </div>
  </div>
</body>
</html>"""


# ─── Core sender ─────────────────────────────────────────────────────────────

async def send_email(to_email: str, subject: str, html_body: str, db=None):
    """Send email via Gmail SMTP with logging."""
    log_entry = {
        "to_email": to_email,
        "subject": subject,
        "status": "pending",
        "sent_at": datetime.utcnow(),
        "error": None,
        "retries": 0,
    }
    try:
        def _send():
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"CodHER Platform <{SMTP_FROM}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_body, "html"))
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, [to_email], msg.as_string())
            server.quit()

        await asyncio.get_event_loop().run_in_executor(None, _send)
        log_entry["status"] = "sent"
    except Exception as e:
        log_entry["status"] = "failed"
        log_entry["error"] = str(e)
        traceback.print_exc()

    if db is not None:
        await db.email_logs.insert_one(log_entry)
    return log_entry


# ─── Email templates ──────────────────────────────────────────────────────────

async def send_credential_email(to_email: str, username: str, password: str, role: str, db=None):
    """Send credential email to new user."""
    body = f"""
      <p class="greeting">👋 Welcome to CodHER!</p>
      <p class="intro">
        Your account has been successfully created. Below are your login credentials —
        please keep them safe and change your password after your first login.
      </p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-icon">🏷️</span>
          <span class="info-label">Role</span>
          <span class="info-value">{role.title()}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">📧</span>
          <span class="info-label">Email</span>
          <span class="info-value">{to_email}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">👤</span>
          <span class="info-label">Username</span>
          <span class="info-value">{username}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">🔑</span>
          <span class="info-label">Password</span>
          <span class="info-value">{password}</span>
        </div>
      </div>

      <div class="notice">
        <strong>Security tip:</strong> Log in to the portal and update your password as soon as possible.
        Never share your credentials with anyone.
      </div>
    """
    html = _wrap(body)
    return await send_email(to_email, "Your CodHER Platform Credentials", html, db)


async def send_evaluation_status_email(to_email: str, team_name: str, round_name: str, db=None):
    """Send evaluation status email (NO marks/scores!)."""
    body = f"""
      <span class="badge">✅ Evaluation Update</span>
      <p class="greeting">Evaluation Completed</p>
      <p class="intro">Dear <strong>{team_name}</strong>,</p>
      <p class="intro">
        Great news — your submission for <strong>{round_name}</strong> has been
        evaluated by your mentor. Head over to the portal to view your updated status.
      </p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-icon">🏆</span>
          <span class="info-label">Round</span>
          <span class="info-value">{round_name}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">👥</span>
          <span class="info-label">Team</span>
          <span class="info-value">{team_name}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">📋</span>
          <span class="info-label">Status</span>
          <span class="info-value">Evaluated</span>
        </div>
      </div>

      <div class="notice">
        📊 <strong>Note:</strong> Detailed scores will be released later by the admin if applicable.
        Log in to the portal to view the full evaluation status.
      </div>
    """
    html = _wrap(body)
    return await send_email(to_email, f"Evaluation Completed for {round_name} - CodHER", html, db)


async def send_results_release_email(to_email: str, team_name: str, round_name: str, db=None):
    """Send final marks release email."""
    body = f"""
      <span class="badge">🎉 Results Released</span>
      <p class="greeting">Final Results Are In!</p>
      <p class="intro">Dear <strong>{team_name}</strong>,</p>
      <p class="intro">
        Your final evaluation results for <strong>{round_name}</strong> have been
        officially released. Log in to the platform to view your marks, mentor feedback,
        and complete result details.
      </p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-icon">🏆</span>
          <span class="info-label">Round</span>
          <span class="info-value">{round_name}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">👥</span>
          <span class="info-label">Team</span>
          <span class="info-value">{team_name}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">📊</span>
          <span class="info-label">Status</span>
          <span class="info-value">Results Published</span>
        </div>
      </div>

      <div class="notice">
        Log in to the <strong>CodHER Platform</strong> to view your complete scorecard and feedback from your mentors.
      </div>
    """
    html = _wrap(body)
    return await send_email(to_email, f"Final Evaluation Results Released - {round_name} - CodHER", html, db)


async def send_custom_email(to_email: str, subject: str, body_html: str, db=None):
    """Send custom email from admin."""
    body = f"""
      <span class="badge">📣 Message from Admin</span>
      <div class="divider"></div>
      {body_html}
    """
    html = _wrap(body)
    return await send_email(to_email, subject, html, db)