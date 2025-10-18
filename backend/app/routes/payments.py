from flask import Blueprint, request, jsonify
from .. import db
from ..models import Payment, User, Notification
from flask import current_app
import os

def send_payment_notification(user, payment):
    # create in-app notification
    note = Notification(
        user_id=user.user_id,
        title='Payment received',
        message=(
            f'Your payment {payment.transaction_reference} was successful'
        ),
        type='payment',
    )
    db.session.add(note)
    db.session.commit()
    # enqueue email via celery (if configured)
    try:
        current_app.celery.send_task(
            'app.tasks.send_email',
            args=[
                user.email,
                'Payment received',
                f'Thank you, your payment {payment.transaction_reference} was received.',
            ],
        )
    except Exception:
        # celery may not be configured in this environment; ignore
        pass


payments_bp = Blueprint('payments', __name__)


@payments_bp.route('/initiate', methods=['POST'])
def initiate_payment():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    amount = data.get('amount')
    # Here you'd call M-Pesa API to initiate a payment and return a checkout URL or request id.
    # For this scaffold, we'll return a stubbed transaction reference.
    tx_ref = (
        f"mpesa-{user_id}-{int(amount)}-{int(os.urandom(2).hex(), 16)}"
    )
    payment = Payment(
        user_id=user_id,
        amount=amount,
        method='M-Pesa',
        transaction_reference=tx_ref,
        status='pending',
        payment_type='premium_subscription',
    )
    db.session.add(payment)
    db.session.commit()
    return jsonify({'transaction_reference': tx_ref, 'status': 'pending'})


@payments_bp.route('/callback', methods=['POST'])
def mpesa_callback():
    # M-Pesa will POST a callback to this endpoint. Validate and process.
    data = request.get_json() or {}
    tx_ref = data.get('transaction_reference')
    status = data.get('status')
    amount = data.get('amount')
    user_id = data.get('user_id')

    if not tx_ref:
        return jsonify({'error': 'missing tx ref'}), 400

    existing = Payment.query.filter_by(transaction_reference=tx_ref).first()
    if existing and existing.status == 'success':
        return jsonify({'message': 'already processed'}), 200

    if not existing:
        payment = Payment(
            user_id=user_id,
            amount=amount,
            method='M-Pesa',
            transaction_reference=tx_ref,
            status=status,
            payment_type='premium_subscription',
            date_paid=None,
        )
        db.session.add(payment)
    else:
        existing.status = status
        existing.date_paid = None
        payment = existing

    if status == 'success':
        user = User.query.get(payment.user_id)
        if user:
            user.is_premium = True
            db.session.add(user)
            send_payment_notification(user, payment)
    db.session.commit()

    return jsonify({'message': 'processed'})
