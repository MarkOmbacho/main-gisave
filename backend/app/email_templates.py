from jinja2 import Environment, FileSystemLoader, select_autoescape, TemplateNotFound
from pathlib import Path


TEMPLATE_DIR = Path(__file__).resolve().parent / 'templates' / 'email'


def render_email_template(base_name: str, context: dict) -> dict:
    """Render text and optional HTML templates.

    base_name: template basename, e.g. 'blog_published' will look for
    'blog_published.txt' and 'blog_published.html'. Returns a dict with keys:
      - subject: optional subject parsed from text template first line starting with 'Subject:'
      - text: rendered plain text (may be empty string)
      - html: rendered HTML (or None)
    """
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATE_DIR)),
        autoescape=select_autoescape(['html', 'xml'])
    )
    result = {'subject': None, 'text': '', 'html': None}

    # text template
    txt_name = f"{base_name}.txt"
    try:
        tmpl = env.get_template(txt_name)
        rendered = tmpl.render(**(context or {}))
        # parse Subject: first line if present
        if rendered.startswith('Subject:'):
            first_line, rest = rendered.split('\n', 1)
            result['subject'] = first_line.replace('Subject:', '').strip()
            result['text'] = rest.strip()
        else:
            result['text'] = rendered
    except TemplateNotFound:
        result['text'] = ''

    # optional HTML template
    html_name = f"{base_name}.html"
    try:
        tmpl_html = env.get_template(html_name)
        result['html'] = tmpl_html.render(**(context or {}))
    except TemplateNotFound:
        result['html'] = None

    return result
