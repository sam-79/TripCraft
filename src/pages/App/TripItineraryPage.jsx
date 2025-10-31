import React from "react";
import "../../styles/TripItineraryPage.css"; // styling
import tripData from "./tripData.json"; // or pass via props

const TripItineraryPage = () => {
    const handlePrint = () => {
        window.print();
    };

    const {
        trip_name,
        destination_full_name,
        destination_details,
        destination_image_url,
        start_date,
        end_date,
        base_location,
        budget,
        num_people,
        itineraries,
        cost_breakdown,
        travel_update,
    } = tripData;

    return (
        <div className="itinerary-wrapper">
            <button className="print-btn" onClick={handlePrint}>
                🖨️ Download / Print Itinerary
            </button>

            <div className="itinerary-container">
                {/* 🏞️ Header Section */}
                <header className="itinerary-header">
                    <h1>{trip_name} Journey</h1>
                    <p className="destination">
                        {base_location} → {destination_full_name}
                    </p>
                    <p className="dates">
                        {new Date(start_date).toDateString()} -{" "}
                        {new Date(end_date).toDateString()}
                    </p>
                </header>

                {/* 🖼️ Destination Section */}
                <section className="destination-section">
                    <div className="destination-images">
                        {destination_image_url.slice(0, 3).map((url, i) => (
                            <img key={i} src={url} alt={destination_full_name} />
                        ))}
                    </div>
                    <div className="destination-details">
                        <h2>About {destination_full_name}</h2>
                        <p>{destination_details}</p>
                    </div>
                </section>

                {/* 🗓️ Daily Itinerary */}
                <section className="daily-section">
                    <h2>🗓️ Daily Itinerary</h2>
                    {itineraries.map((day) => (
                        <div key={day.day} className="day-card">
                            <div className="day-header">
                                <h3>
                                    Day {day.day}: {new Date(day.date).toDateString()}
                                </h3>
                            </div>
                            <p className="tips">💡 {day.travel_tips}</p>

                            <div className="day-lists">
                                <div>
                                    <h4>🍴 Food</h4>
                                    <ul>
                                        {day.food.map((f, idx) => (
                                            <li key={idx}>{f}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4>🎭 Culture</h4>
                                    <ul>
                                        {day.culture.map((c, idx) => (
                                            <li key={idx}>{c}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="places">
                                <h4>📍 Places to Visit</h4>
                                <div className="places-grid">
                                    {day.places.map((place) => (
                                        <div key={place.id} className="place-card">
                                            <h5>{place.name}</h5>
                                            <p>{place.description}</p>
                                            <p className="best-time">
                                                ⏰ {place.best_time_to_visit}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* 💰 Cost Section */}
                <section className="cost-section">
                    <h2>💰 Cost Breakdown</h2>
                    <table className="cost-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Expense</th>
                                <th>Details</th>
                                <th>Estimated Cost (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cost_breakdown.expenses.map((exp, idx) => (
                                <tr key={idx}>
                                    <td>{exp.expense_type}</td>
                                    <td>{exp.expense_name}</td>
                                    <td>{exp.details}</td>
                                    <td>{exp.estimated_cost.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="cost-summary">
                        <strong>Total:</strong> ₹{cost_breakdown.total_expenses.toLocaleString()} |{" "}
                        <strong>Remaining:</strong>{" "}
                        <span
                            className={
                                cost_breakdown.budget_remaining < 0 ? "negative" : "positive"
                            }
                        >
                            ₹{cost_breakdown.budget_remaining.toLocaleString()}
                        </span>
                    </p>
                </section>

                {/* 🌤️ Travel Update */}
                <section className="travel-update">
                    <h2>🌤️ Travel Updates</h2>
                    <div className="weather-box">
                        <p><strong>Temperature:</strong> {travel_update.Weather["Current Temperature"]}</p>
                        <p><strong>Forecast:</strong> {travel_update.Weather["Next 5 Days Forecast"]}</p>
                    </div>
                    <ul>
                        {/* {travel_update.TravelAdvisory.map((tip, idx) => ( */}
                        {/* <li key={idx}>✅ {tip}</li>
            ))} */}
                    </ul>
                </section>

                {/* 🪪 Footer */}
                <footer className="itinerary-footer">
                    <p>
                        Generated on {new Date().toDateString()} — Powered by <strong>TripCraft AI ✈️</strong>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default TripItineraryPage;