from flask import Flask
from datetime import date, timedelta
from .extensions import db
from .models import Train, TrainSchedule
from .routes import CLASSES, main
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
        if not Train.query.first():
            train_data = [
                (
                    "RG101",
                    "Deccan Coast Express",
                    "Mumbai Central",
                    "Pune Junction",
                    "06:15",
                    "09:40",
                    "3h 25m",
                ),
                (
                    "RG202",
                    "Capital Sunrise",
                    "New Delhi",
                    "Jaipur Junction",
                    "07:00",
                    "11:35",
                    "4h 35m",
                ),
                (
                    "RG303",
                    "Southern Breeze",
                    "Bengaluru City",
                    "Chennai Central",
                    "08:30",
                    "13:15",
                    "4h 45m",
                ),
            ]
            for (
                number,
                name,
                source,
                destination,
                departure,
                arrival,
                duration,
            ) in train_data:
                train = Train(
                    train_number=number,
                    train_name=name,
                    source_station=source,
                    destination_station=destination,
                    departure_time=departure,
                    arrival_time=arrival,
                    duration=duration,
                    running_days="Mon Tue Wed Thu Fri Sat Sun",
                )
                db.session.add(train)
                db.session.flush()
                for days_ahead in range(0, 31):
                    journey_date = date.today() + timedelta(days=days_ahead)
                    for travel_class in CLASSES:
                        fare = 450 + (CLASSES.index(travel_class) * 650)
                        db.session.add(
                            TrainSchedule(
                                train_id=train.id,
                                journey_date=journey_date,
                                travel_class=travel_class,
                                total_seats=72,
                                available_seats=72,
                                fare=fare,
                            )
                        )
            db.session.commit()
    return app
