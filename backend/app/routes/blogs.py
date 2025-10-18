from flask import Blueprint, request, jsonify, current_app
from .. import db
from ..models import BlogPost
from ..models import Notification, User
from datetime import datetime, timezone
from ..email_templates import render_email_template

blogs_bp = Blueprint('blogs', __name__)


@blogs_bp.route('/', methods=['GET'])
def list_blogs():
    posts = BlogPost.query.filter_by(status='published').all()
    data = []
    for p in posts:
        data.append({
            'post_id': p.post_id,
            'title': p.title,
            'author_id': p.author_id,
            'views': p.views_count,
        })
    return jsonify(data)


@blogs_bp.route('/<int:post_id>', methods=['GET'])
def get_blog(post_id):
    p = BlogPost.query.get_or_404(post_id)
    p.views_count = p.views_count + 1
    db.session.commit()
    return jsonify({
        'post_id': p.post_id,
        'title': p.title,
        'content': p.content,
        'views': p.views_count,
    })


@blogs_bp.route('/', methods=['POST'])
def create_blog():
    data = request.get_json() or {}
    post = BlogPost(
        author_id=data.get('author_id'),
        title=data.get('title'),
        content=data.get('content'),
        tags=data.get('tags'),
        status='pending',
        cover_image_url=data.get('cover_image_url'),
    )
    db.session.add(post)
    db.session.commit()
    return jsonify({'message': 'created', 'post_id': post.post_id}), 201



@blogs_bp.route('/<int:post_id>/publish', methods=['POST'])
def publish_blog(post_id):
    p = BlogPost.query.get_or_404(post_id)
    # only publish if currently draft or pending
    if p.status == 'published':
        return jsonify({'message': 'already published'}), 200
    p.status = 'published'
    p.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    # create a notification for the author
    notif = Notification(user_id=p.author_id, title='Your post was published', message=f'Your post "{p.title}" is now live.', type='email')
    db.session.add(notif)
    db.session.commit()

    # enqueue templated email if mail configured
    # try to get author email
    author = User.query.get(p.author_id)
    if author and author.email:
        celery_inst = getattr(current_app, 'celery', None)
        if celery_inst:
            celery_inst.send_task('app.tasks.send_email', kwargs={
                'to_email': author.email,
                'template_name': 'blog_published.txt',
                'template_context': {'name': author.name or author.email, 'title': p.title, 'published_at': p.updated_at or p.created_at}
            })
    return jsonify({'message': 'published', 'post_id': p.post_id})


@blogs_bp.route('/<int:post_id>/moderate', methods=['POST'])
def moderate_post(post_id):
    data = request.get_json() or {}
    action = data.get('action')  # 'approve' or 'reject'
    note = data.get('note')
    p = BlogPost.query.get_or_404(post_id)
    if action == 'approve':
        p.status = 'published'
    elif action == 'reject':
        p.status = 'rejected'
    else:
        return jsonify({'error': 'invalid action'}), 400
    db.session.commit()

    # notify author
    author = User.query.get(p.author_id)
    if author:
        notif = Notification(user_id=author.user_id, title='Post moderation update', message=f'Your post "{p.title}" was {p.status}.', type='system')
        db.session.add(notif)
        db.session.commit()
        # enqueue decision email
        celery_inst = getattr(current_app, 'celery', None)
        if celery_inst and author.email:
            celery_inst.send_task('app.tasks.send_email', kwargs={
                'to_email': author.email,
                'template_name': 'blog_moderation.txt',
                'template_context': {'name': author.name or author.email, 'title': p.title, 'decision': p.status, 'note': note}
            })
    return jsonify({'message': 'moderated', 'post_id': p.post_id, 'status': p.status})
