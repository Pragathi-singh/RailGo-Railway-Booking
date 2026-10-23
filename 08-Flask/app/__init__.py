from flask import Flask
from .extensions import db
from .routes import main
from .security import csrf_token


def create_app(config_object=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_object or "config.Config")
    db.init_app(app)
    app.register_blueprint(main)

    @app.before_request
    def ensure_csrf_token():
        csrf_token()

    @app.context_processor
    def inject_helpers():
        return {"csrf_token": csrf_token}

    @app.errorhandler(404)
    def not_found(error):
        return __import__("flask").render_template("404.html"), 404

    with app.app_context():
        db.create_all()
    return app
