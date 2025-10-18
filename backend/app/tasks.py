from flask_mail import Message
import time
from celery.utils.log import get_task_logger
from .email_templates import render_email_template


# Register celery tasks by passing the celery instance and the Flask app.
def register_tasks(celery, app):
    logger = get_task_logger(__name__)

    @celery.task(name='app.tasks.send_email', bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_backoff_max=600, retry_kwargs={'max_retries': 5})
    def _send_email(self, to_email, subject=None, body=None, template_name=None, template_context=None):
        with app.app_context():
            mail_ext = app.extensions.get('mail')
            # If a template is provided, render it. The template may include a Subject: line.
            if template_name:
                template_context = template_context or {}
                rendered = render_email_template(template_name.replace('.txt', '').replace('.html', ''), template_context)
                # Use subject from rendered result if not provided
                subject = subject or rendered.get('subject')
                # prefer explicit body param, then text, then empty
                body = body or rendered.get('text', '')
                html_body = rendered.get('html')

            msg = Message(subject=subject or '(no-subject)', recipients=[to_email], body=body or '')
            # attach html part when available
            try:
                if 'html_body' in locals() and html_body:
                    msg.html = html_body
            except Exception:
                app.logger.exception('failed to attach html part')
            if mail_ext:
                mail_ext.send(msg)

    @celery.task(name='app.tasks.send_sms', bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_backoff_max=600, retry_kwargs={'max_retries': 5})
    def _send_sms(self, phone_number, body):
        """Simple SMS sending task. If a provider is configured, this will attempt to call it.

        In test/dev environments where no provider is configured, this is a noop that logs.
        """
        with app.app_context():
            logger.info('send_sms called for %s', phone_number)
            # provider not configured -> noop
            provider = app.config.get('SMS_PROVIDER')
            if not provider:
                app.logger.debug('no SMS provider configured; skipping send')
                return True
            # If Twilio configured, attempt to POST to Twilio API (minimal, no external dependency here)
            if provider == 'twilio':
                # Expect TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_FROM
                import os, requests
                sid = app.config.get('TWILIO_ACCOUNT_SID') or os.environ.get('TWILIO_ACCOUNT_SID')
                token = app.config.get('TWILIO_AUTH_TOKEN') or os.environ.get('TWILIO_AUTH_TOKEN')
                from_number = app.config.get('TWILIO_FROM') or os.environ.get('TWILIO_FROM')
                if not sid or not token or not from_number:
                    app.logger.warning('twilio configured but credentials missing')
                    return False
                url = f'https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json'
                try:
                    resp = requests.post(url, data={'To': phone_number, 'From': from_number, 'Body': body}, auth=(sid, token), timeout=10)
                    resp.raise_for_status()
                except Exception:
                    app.logger.exception('failed to send sms')
                    raise
                return True
            # unknown provider
            app.logger.warning('unknown SMS provider: %s', provider)
            return False

    return celery
