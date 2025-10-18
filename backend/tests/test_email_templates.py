from app.email_templates import render_email_template
import re


def test_render_application_received():
    result = render_email_template('application_received', {'name': 'Alice', 'title': 'Mentor App', 'submitted_at': '2025-10-17'})
    assert isinstance(result, dict)
    # subject should be parsed from the template
    assert result.get('subject') == 'We received your mentor application'
    # name and an expected sentence fragment should be in the text body
    assert 'Alice' in result.get('text', '')
    assert 'Thanks for applying' in result.get('text', '')


def test_render_blog_published():
    result = render_email_template('blog_published', {'name': 'Bob', 'title': 'My Story', 'published_at': '2025-10-17'})
    assert isinstance(result, dict)
    assert result.get('subject') == 'Your blog post is live'
    assert 'Bob' in result.get('text', '')
    assert 'My Story' in result.get('text', '')
