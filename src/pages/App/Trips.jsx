import React, { useState, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Tag,
  Empty,
  Alert,
  Spin,
  Modal,
  Carousel,
  message,
  Tooltip,
} from "antd";
import {
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  ArrowRightOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  useGetAllTripsQuery,
  useLazyGetItineraryQuery,
} from "../../api/tripApi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { startCase, toLower } from "lodash";
const { Title, Text, Paragraph } = Typography;

// --- Helper Functions for Download ---

/**
 * Converts the itinerary JSON data into a full HTML string.
 * (This function remains the same, as html2pdf needs HTML input)
 */
const generateItineraryHtml = (data) => {
  // Helper to safely render list items
  const renderList = (items, className = "") => {
    if (!items || items.length === 0) return "<p>No items listed.</p>";
    return `<ul class="${className}">
      ${items.map((item) => `<li>${item}</li>`).join("")}
    </ul>`;
  };

  // Helper to render places
  const renderPlaces = (places) => {
    if (!places || places.length === 0) return "<p>No places listed.</p>";
    return places
      .map(
        (place) => `
      <div class="place-card">
        <strong>${place.name}</strong>
        <p>${place.description}</p>
        <small>Best time to visit: ${place.best_time_to_visit}</small>
      </div>
    `
      )
      .join("");
  };

  // Styles for the PDF content
  const styles = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
      line-height: 1.6;
      background-color: #ffffff;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      margin: 0 auto;
      padding: 10px;
    }
    h1, h2, h3, h4, h5 {
      color: #1a202c;
      margin-top: 1.5em;
      margin-bottom: 0.7em;
      page-break-after: avoid; /* Avoid breaking pages right after a heading */
    }
    h1 {
      font-size: 2.2rem;
      color: #2c5282;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
    }
    h2 {
      font-size: 1.6rem;
      color: #2d3748;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
    }
    h3 {
      font-size: 1.25rem;
      color: #4a5568;
    }
    p { margin-bottom: 1rem; }
    strong { color: #2d3748; }
    .header-info {
      background-color: #edf2f7;
      border-radius: 8px;
      padding: 20px;
      margin-top: 1.5rem;
      page-break-inside: avoid;
    }
    .header-info p { margin-bottom: 0.5rem; }
    .image-gallery {
      display: grid;
      grid-template-columns: repeat(3, 1fr); /* 3 columns for PDF */
      gap: 10px;
      margin-top: 1rem;
      page-break-inside: avoid;
    }
    .image-gallery img {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
    }
    .day-card {
      background: #fafafa;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 1.5rem;
      page-break-inside: avoid; /* Try to keep each day card on one page */
    }
    .place-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      page-break-inside: auto;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      font-weight: 600;
    }
    .travel-leg {
      border-bottom: 1px dashed #cbd5e0;
      padding-bottom: 10px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    .travel-leg:last-child {
      border-bottom: none;
    }
    .travel-advisory {
      background-color: #fffaf0;
      border: 1px solid #fbd38d;
      border-radius: 8px;
      padding: 15px;
      page-break-inside: avoid;
    }
    ul { padding-left: 20px; }
  `;

  // The HTML structure remains largely the same, but wrapped in a container
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Itinerary: ${data.trip_name}</title>
      <style>${styles}</style>
    </head>
    <body>
      <div class="container">
        <h1>${data.trip_name}</h1>
        <p><strong>Destination:</strong> ${data.destination_full_name}</p>
        
        <div class="header-info">
          <p><strong>Dates:</strong> ${dayjs(data.start_date).format(
    "MMM D, YYYY"
  )} - ${dayjs(data.end_date).format("MMM D, YYYY")}</p>
          <p><strong>Budget:</strong> ₹${data.budget.toLocaleString(
    "en-IN"
  )} for ${data.num_people} people</p>
          <p><strong>Travelling With:</strong> ${data.travelling_with}</p>
          <p><strong>Activities:</strong> ${data.activities.join(", ")}</p>
        </div>

        <h2>About ${data.destination_full_name}</h2>
        <p>${data.destination_details}</p>
        
        ${data.destination_image_url && data.destination_image_url.length > 0
      ? `
          <h4>Destination Images</h4>
          <div class="image-gallery">
            ${data.destination_image_url
        .map(
          (url) =>
            `<img src="${url}" alt="${data.destination_full_name}" />`
        )
        .join("")}
          </div>
        `
      : ""
    }

        ${data.your_travel_options && data.your_travel_options.legs
      ? `
          <h2>Your Travel Plan (${data.your_travel_options.option_name})</h2>
          ${data.your_travel_options.legs
        .map(
          (leg) => `
            <div class="travel-leg">
              <p><strong>From:</strong> ${leg.from} (${leg.from_code}) <strong>To:</strong> ${leg.to} (${leg.to_code})</p>
              <p><strong>Mode:</strong> ${leg.mode} | <strong>Date:</strong> ${leg.journey_date}</p>
              <p><strong>Time:</strong> ${leg.approx_time} | <strong>Cost:</strong> ${leg.approx_cost}</p>
              <p><a href="${leg.booking_url}" target="_blank">Booking Link (Not clickable in PDF)</a></p>
            </div>
          `
        )
        .join("")}
        `
      : ""
    }

        ${data.travel_update
      ? `
          <h2>Latest Travel Update (${data.travel_update.Date})</h2>
          <div class="travel-advisory">
            <h4>Weather</h4>
            <p>Current: ${data.travel_update.Weather.Current_Temperature} (Min: ${data.travel_update.Weather.Min_Temperature
      })</p>
            <p>Forecast: ${data.travel_update.Weather["Next_5_Days_Forecast"]}</p>
            ${data.travel_update.Weather["IMD_Alert"]
        ? `<p><strong>Alert: ${data.travel_update.Weather["IMD_Alert"]}</strong></p>`
        : ""
      }
            <h4>Travel Advisory</h4>
            ${renderList(data.travel_update["Travel_Advisory"])}
          </div>
        `
      : ""
    }

        <h2>Daily Itinerary</h2>
        ${!data.itineraries || data.itineraries.length === 0
      ? `<p>${data.itineraries_status_message}</p>`
      : data.itineraries
        .map(
          (day) => `
          <div class="day-card">
            <h3>Day ${day.day} (${dayjs(day.date).format("MMM D, YYYY")})</h3>
            
            <h4>Places to Visit</h4>
            ${renderPlaces(day.places)}
            
            <h4>Food Suggestions</h4>
            ${renderList(day.food, "food-list")}
            
            <h4>Culture & Activities</h4>
            ${renderList(day.culture, "culture-list")}
            
            <p><strong>Travel Tip:</strong> ${day.travel_tips}</p>
          </div>
        `
        )
        .join("")
    }

        ${data.cost_breakdown && data.cost_breakdown.expenses
      ? `
          <h2>Cost Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Expense</th>
                <th>Details</th>
                <th>Type</th>
                <th>Est. Cost (Total)</th>
                <th>Est. Cost (Per Person)</th>
              </tr>
            </thead>
            <tbody>
              ${data.cost_breakdown.expenses
        .map(
          (item) => `
                <tr>
                  <td>${item.expense_name}</td>
                  <td>${item.details}</td>
                  <td>${item.expense_type}</td>
                  <td>₹${item.estimated_cost.toLocaleString("en-IN")}</td>
                  <td>₹${item.cost_per_person.toLocaleString("en-IN")}</td>
                </tr>
              `
        )
        .join("")}
              <tr>
                <td colspan="3"><strong>Total Estimated Expenses</strong></td>
                <td><strong>₹${data.cost_breakdown.total_expenses.toLocaleString(
          "en-IN"
        )}</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `
      : ""
    }
      </div>
    </body>
    </html>
  `;
};

/**
 * Triggers a browser download for the given HTML content as a PDF.
 * @param {string} htmlContent - The HTML string to download.
 * @param {string} tripName - The name of the trip, used for the filename.
 */
const downloadPdfFile = (htmlContent, tripName) => {
  // Check if the html2pdf library is loaded
  if (!window.html2pdf) {
    message.error(
      "PDF generation library is not loaded. Please ensure you've added the script tag to your index.html and refresh the page."
    );
    console.error("html2pdf.js is not loaded on the window object.");
    return;
  }

  const filename = `${tripName
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()}_itinerary.pdf`;

  // Options for html2pdf
  const opt = {
    margin: 0.5,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true, // Important for loading external images
      logging: false,
    },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] }, // Helps with page breaking
  };

  // Run the conversion and save
  try {
    const worker = window
      .html2pdf()
      .from(htmlContent)
      .set(opt)
      .save()
      .catch((err) => {
        console.error("PDF generation failed:", err);
        message.error("PDF generation failed. See console for details.");
      });
  } catch (error) {
    console.error("Error initializing html2pdf:", error);
    message.error("PDF generation failed. See console for details.");
  }
};

// --- TripCard Sub-Component ---
const TripCard = ({ trip, index }) => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const [triggerGetItinerary] = useLazyGetItineraryQuery();

  const handleDownload = async (e, tripId, tripName) => {
    e.stopPropagation();
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await triggerGetItinerary(tripId).unwrap();

      if (response.status && response.data) {
        if (
          !response.data.itineraries ||
          response.data.itineraries.length === 0
        ) {
          const errorMsg =
            response.data.itineraries_status_message ||
            "No itinerary found to download. Please generate one first.";
          setDownloadError(errorMsg);
          message.error(errorMsg);
        } else {
          // Generate HTML and trigger PDF download
          const htmlContent = generateItineraryHtml(response.data);
          downloadPdfFile(htmlContent, tripName); // Call the new PDF function
          message.success("Itinerary PDF generation started!");
        }
      } else {
        const errorMsg =
          response.message || "Failed to fetch itinerary data.";
        setDownloadError(errorMsg);
        message.error(errorMsg);
      }
    } catch (err) {
      console.error("Download error:", err);
      const errorMsg =
        err.data?.message ||
        err.message ||
        "An error occurred while fetching the itinerary.";
      setDownloadError(errorMsg);
      message.error(errorMsg);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
          opacity: 1,
          y: 0,
          transition: { delay: i * 0.1, duration: 0.4 },
        }),
      }}
    >
      <Card
        hoverable
        style={{ borderRadius: 16, overflow: "hidden" }}
        cover={
          trip.destination_image_url &&
            trip.destination_image_url.length > 0 ? (
            <Carousel
              ref={carouselRef}
              arrows
              pauseOnFocus
              lazyLoad
              autoplay
              dotPosition="bottom"
              effect="fade"
            >
              {trip.destination_image_url.map((url, i) => (
                <div key={i}>
                  <img
                    alt={`${startCase(toLower(trip.trip_name))} image ${i + 1}`}
                    src={url}
                    style={{ width: "100%", height: 220, objectFit: "cover" }}
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <div
              style={{
                height: 220,
                background: "#f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EnvironmentOutlined style={{ fontSize: 48, color: "#ccc" }} />
            </div>
          )
        }
        actions={[
          <Tooltip title="Download Itinerary as PDF">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              key="download"
              loading={isDownloading}
              onClick={(e) => handleDownload(e, trip.trip_id, trip.trip_name)}
              style={{ color: "#555" }}
              iconPosition="end"
            >
              Download
            </Button>
          </Tooltip>,
          <Tooltip title="View Trip Details">
            <Button
              type="text"
              key="details"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              onClick={() => navigate(`/user/trips/${trip.trip_id}`)}
              style={{ color: "#555" }}
            >
              View Details
            </Button>
          </Tooltip>,
        ]}
      >
        <Title
          level={4}
          style={{
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {startCase(toLower(trip.trip_name))}
        </Title>
        <Text type="secondary">
          <EnvironmentOutlined /> {trip.destination_full_name}
        </Text>

        <Paragraph
          style={{ marginTop: 12, minHeight: 44 }}
          ellipsis={{
            rows: 2,
            expandable: "collapsible",
          }}
        >
          {trip.destination_details}
        </Paragraph>

        {/* Show download-specific error here */}
        {downloadError && (
          <Alert
            message={downloadError}
            type="error"
            showIcon
            style={{ marginTop: 12 }}
            closable
            onClose={() => setDownloadError(null)}
          />
        )}

        <div style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text>
              <CalendarOutlined />{" "}
              {dayjs(trip.start_date).format("MMM D, YYYY")} -{" "}
              {dayjs(trip.end_date).format("MMM D, YYYY")}
            </Text>
            <Text>
              <DollarOutlined /> ₹{trip.budget.toLocaleString("en-IN")} for{" "}
              {trip.num_people} people ({trip.travelling_with})
            </Text>
            <Space wrap>
              {trip.activities.map((activity) => (
                <Tag key={activity} color="blue">
                  {activity}
                </Tag>
              ))}
            </Space>
          </Space>
        </div>
      </Card>
    </motion.div>
  );
};

// --- Main Trips Component ---
const Trips = () => {
  const { data: trips, error, isLoading } = useGetAllTripsQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Loading your trips..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description="Could not fetch your trips. Please try again."
        type="error"
        showIcon
      />
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>
            No trips planned yet! <br /> Let's create your first adventure.
          </span>
        }
      >
        <Button type="primary" onClick={() => navigate("/user/newtrip")}>
          Create New Trip
        </Button>
      </Empty>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Title level={3} style={{ marginBottom: 24 }}>
          Your Planned Trips
        </Title>
      </motion.div>
      <Row gutter={[24, 24]}>
        {trips.map((trip, index) => (
          <Col xs={24} sm={24} md={12} lg={8} key={trip.trip_id}>
            <TripCard trip={trip} index={index} />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Trips;

