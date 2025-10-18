from flask import Blueprint, request, jsonify
from .. import db
from ..models import Program, ProgramEnrollment

programs_bp = Blueprint('programs', __name__)


@programs_bp.route('/', methods=['GET'])
def list_programs():
    progs = Program.query.filter_by(status='active').all()
    return jsonify([{'program_id': p.program_id, 'title': p.title, 'category': p.category} for p in progs])


@programs_bp.route('/<int:program_id>', methods=['GET'])
def get_program(program_id):
    p = Program.query.get_or_404(program_id)
    return jsonify({'program_id': p.program_id, 'title': p.title, 'description': p.description, 'category': p.category})


@programs_bp.route('/<int:program_id>/apply', methods=['POST'])
def apply_program(program_id):
    data = request.get_json() or {}
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id required'}), 400
    enrollment = ProgramEnrollment(user_id=user_id, program_id=program_id)
    db.session.add(enrollment)
    db.session.commit()
    return jsonify({'message': 'applied'}), 201
