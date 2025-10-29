import React, { useEffect, useState } from 'react';
import { App, Spin, Alert, Typography, Tabs, Card, Button, Space, Row, Col, message, Modal, Timeline, Tag } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined, InfoCircleOutlined, DollarCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAnalyzeTravelOptionQuery } from '../../api/bookingApi';
import LegAnalysisDetails from './LegAnalysisDetails'; // Import the new component
import { motion } from 'framer-motion';

const { Title, Text, Paragraph, Link } = Typography;

// Helper to get travel mode icon - simplified for Tabs
const getModeIcon = (mode) => {
  const lowerCaseMode = mode?.toLowerCase() || '';
  if (lowerCaseMode.includes('train')) return <span class="material-symbols-outlined">train</span>;
  if (lowerCaseMode.includes('flight')) return <span class="material-symbols-outlined">flight</span>;
  if (lowerCaseMode.includes('bus')) return <span class="material-symbols-outlined">directions_bus</span>
  return <i className="fas fa-car"></i>;
};


const AnalyzeTravel = ({ tripId, onComplete, setStatus, bookingList, onAddToBooking}) => {
  const [activeTabKey, setActiveTabKey] = useState('0'); // Start with the first leg tab
  const [modal, modalContextHolder] = Modal.useModal();


  //Fetch the analysis data
  const { data: analysisData, error, isLoading, isFetching, refetch } = useAnalyzeTravelOptionQuery(tripId, {
    // Removed polling here, assuming analysis is quick or triggered manually
    refetchOnMountOrArgChange: true,
  });
  // const isLoading = false;
  // const error = false;
  // const analysisData = {
  //   "status": true,
  //   "data": {
  //     "selected_travel_options": {
  //       "legs": [
  //         {
  //           "to": "Delhi",
  //           "from": "Nagpur",
  //           "mode": "Train",
  //           "to_code": "NDLS",
  //           "from_code": "NGP",
  //           "approx_cost": "INR 800 - INR 2500",
  //           "approx_time": "15 hours",
  //           "booking_url": "https://railways.easemytrip.com/TrainListInfo/Nagpur(NGP)-to-Delhi(NDLS)/2/01-11-2025",
  //           "journey_date": "2025-11-01"
  //         },
  //         {
  //           "to": "Haridwar",
  //           "from": "Delhi",
  //           "mode": "Train",
  //           "to_code": "HW",
  //           "from_code": "NDLS",
  //           "approx_cost": "INR 500 - INR 1500",
  //           "approx_time": "4 hours",
  //           "booking_url": "https://railways.easemytrip.com/TrainListInfo/Delhi(NDLS)-to-Haridwar(HW)/2/02-11-2025",
  //           "journey_date": "2025-11-02"
  //         },
  //         {
  //           "to": "Rishikesh",
  //           "from": "Haridwar",
  //           "mode": "Bus",
  //           "to_code": "",
  //           "from_code": "",
  //           "approx_cost": "INR 100 - INR 300",
  //           "approx_time": "1 hour",
  //           "booking_url": "https://bus.easemytrip.com/home/list?org=Haridwar&des=Rishikesh%2CUttarakhand&date=02-11-2025&searchid=802_842&CCode=IN&AppCode=Emt",
  //           "journey_date": "2025-11-02"
  //         }
  //       ],
  //       "option_name": "Cost Effective Route"
  //     },
  //     "travel_options_analysis": {
  //       "status": true,
  //       "option_name": "Cost Effective Route",
  //       "total_legs": 3,
  //       "legs": [
  //         {
  //           "to": "Delhi",
  //           "from": "Nagpur",
  //           "mode": "Train",
  //           "to_code": "NDLS",
  //           "from_code": "NGP",
  //           "approx_cost": "INR 800 - INR 2500",
  //           "approx_time": "15 hours",
  //           "booking_url": "https://railways.easemytrip.com/TrainListInfo/Nagpur(NGP)-to-Delhi(NDLS)/2/01-11-2025",
  //           "journey_date": "2025-11-01",
  //           "train_data_analysis": {
  //             "status": true,
  //             "option_name": "Train Nagpur-Delhi",
  //             "overall_statistics": {
  //               "total_trains_found": 14,
  //               "trains_with_available_tickets": 3
  //             },
  //             "leg_wise_analysis": [
  //               {
  //                 "status": true,
  //                 "summary": {
  //                   "total_trains": 14,
  //                   "trains_with_available_tickets": 3,
  //                   "total_available_seats": 15
  //                 },
  //                 "available_trains": [
  //                   {
  //                     "train_name": "Tamilnadu Sf Exp",
  //                     "train_number": "12621",
  //                     "departure": "13:50",
  //                     "arrival": "06:30",
  //                     "duration": "16:40",
  //                     "route": "Nagpur (NGP) → New Delhi (NDLS)",
  //                     "available_seats": 5,
  //                     "available_classes_count": 1,
  //                     "classes": [
  //                       {
  //                         "class_name": "Sleeper Class",
  //                         "class_code": "SL",
  //                         "fare": "550",
  //                         "available_seats": 5,
  //                         "status": "AVAILABLE-5"
  //                       }
  //                     ]
  //                   },
  //                   {
  //                     "train_name": "Sampark Kranti",
  //                     "train_number": "12649",
  //                     "departure": "17:10",
  //                     "arrival": "08:10",
  //                     "duration": "15:00",
  //                     "route": "Nagpur (NGP) → Hazrat Nizamuddin Delhi (NZM)",
  //                     "available_seats": 0,
  //                     "available_classes_count": 1,
  //                     "classes": [
  //                       {
  //                         "class_name": "AC 3 Tier Economy",
  //                         "class_code": "3E",
  //                         "fare": "1340",
  //                         "available_seats": 0,
  //                         "status": "NOT AVAILABLE"
  //                       }
  //                     ]
  //                   },
  //                   {
  //                     "train_name": "Ngp Asr Ac Exp",
  //                     "train_number": "22125",
  //                     "departure": "17:50",
  //                     "arrival": "11:55",
  //                     "duration": "18:05",
  //                     "route": "Nagpur (NGP) → New Delhi (NDLS)",
  //                     "available_seats": 10,
  //                     "available_classes_count": 2,
  //                     "classes": [
  //                       {
  //                         "class_name": "Second Seating",
  //                         "class_code": "2S",
  //                         "fare": "335",
  //                         "available_seats": 9,
  //                         "status": "AVAILABLE-9"
  //                       },
  //                       {
  //                         "class_name": "First AC",
  //                         "class_code": "1A",
  //                         "fare": "3430",
  //                         "available_seats": 1,
  //                         "status": "AVAILABLE-1"
  //                       }
  //                     ]
  //                   }
  //                 ],
  //                 "fare_analysis": {
  //                   "by_class": {
  //                     "AC 3 Tier": {
  //                       "average": 1482.86,
  //                       "min": 990.0,
  //                       "max": 2535.0,
  //                       "median": 1440.0,
  //                       "count": 14
  //                     },
  //                     "AC 2 Tier": {
  //                       "average": 2146.15,
  //                       "min": 1995.0,
  //                       "max": 3465.0,
  //                       "median": 2040.0,
  //                       "count": 13
  //                     },
  //                     "First AC": {
  //                       "average": 3500.45,
  //                       "min": 3355.0,
  //                       "max": 4280.0,
  //                       "median": 3430.0,
  //                       "count": 11
  //                     },
  //                     "Sleeper": {
  //                       "average": 547.27,
  //                       "min": 520.0,
  //                       "max": 550.0,
  //                       "median": 550.0,
  //                       "count": 11
  //                     },
  //                     "AC 3 Economy": {
  //                       "average": 1331.0,
  //                       "min": 1295.0,
  //                       "max": 1340.0,
  //                       "median": 1340.0,
  //                       "count": 5
  //                     },
  //                     "Second Sitting": {
  //                       "average": 335.0,
  //                       "min": 335.0,
  //                       "max": 335.0,
  //                       "median": 335.0,
  //                       "count": 1
  //                     }
  //                   },
  //                   "cheapest_options": {
  //                     "sleeper_class": [
  //                       {
  //                         "train_name": "Chattisgarh Exp",
  //                         "train_number": "18237",
  //                         "fare": 520.0,
  //                         "class": "Sleeper Class",
  //                         "availability": "Tap To Refresh",
  //                         "departure_time": "22:20",
  //                         "duration": "21:30"
  //                       },
  //                       {
  //                         "train_name": "Tamilnadu Sf Exp",
  //                         "train_number": "12621",
  //                         "fare": 550.0,
  //                         "class": "Sleeper Class",
  //                         "availability": "AVAILABLE-5",
  //                         "departure_time": "13:50",
  //                         "duration": "16:40"
  //                       },
  //                       {
  //                         "train_name": "Sampark Kranti",
  //                         "train_number": "12649",
  //                         "fare": 550.0,
  //                         "class": "Sleeper Class",
  //                         "availability": "RLWL10/WL10",
  //                         "departure_time": "17:10",
  //                         "duration": "15:00"
  //                       }
  //                     ],
  //                     "ac_3_tier": [
  //                       {
  //                         "train_name": "Nzm Garibrath",
  //                         "train_number": "12611",
  //                         "fare": 990.0,
  //                         "class": "AC 3 Tier",
  //                         "availability": "RLWL70/WL54",
  //                         "departure_time": "20:30",
  //                         "duration": "14:00"
  //                       },
  //                       {
  //                         "train_name": "Chattisgarh Exp",
  //                         "train_number": "18237",
  //                         "fare": 1395.0,
  //                         "class": "AC 3 Tier",
  //                         "availability": "Tap To Refresh",
  //                         "departure_time": "22:20",
  //                         "duration": "21:30"
  //                       },
  //                       {
  //                         "train_name": "Tamilnadu Sf Exp",
  //                         "train_number": "12621",
  //                         "fare": 1440.0,
  //                         "class": "AC 3 Tier",
  //                         "availability": "RLWL3/WL3",
  //                         "departure_time": "13:50",
  //                         "duration": "16:40"
  //                       }
  //                     ]
  //                   }
  //                 },
  //                 "fastest_trains": [
  //                   {
  //                     "train_name": "Nzm Garibrath",
  //                     "train_number": "12611",
  //                     "duration": "14:00",
  //                     "duration_minutes": 840,
  //                     "departure_time": "20:30",
  //                     "arrival_time": "10:30"
  //                   },
  //                   {
  //                     "train_name": "Rajdhani Exp",
  //                     "train_number": "22691",
  //                     "duration": "14:30",
  //                     "duration_minutes": 870,
  //                     "departure_time": "15:00",
  //                     "arrival_time": "05:30"
  //                   },
  //                   {
  //                     "train_name": "Sampark Kranti",
  //                     "train_number": "12649",
  //                     "duration": "15:00",
  //                     "duration_minutes": 900,
  //                     "departure_time": "17:10",
  //                     "arrival_time": "08:10"
  //                   }
  //                 ],
  //                 "recommendations": {
  //                   "best_for_speed": {
  //                     "train_name": "Nzm Garibrath",
  //                     "train_number": "12611",
  //                     "duration": "14:00",
  //                     "duration_minutes": 840,
  //                     "departure_time": "20:30",
  //                     "arrival_time": "10:30"
  //                   },
  //                   "best_for_budget": {
  //                     "train_name": "Chattisgarh Exp",
  //                     "train_number": "18237",
  //                     "fare": 520.0,
  //                     "class": "Sleeper Class",
  //                     "availability": "Tap To Refresh",
  //                     "departure_time": "22:20",
  //                     "duration": "21:30"
  //                   },
  //                   "most_available": {
  //                     "train_name": "Ngp Asr Ac Exp",
  //                     "train_number": "22125",
  //                     "departure_time": "17:50",
  //                     "arrival_time": "11:55",
  //                     "duration": "18:05",
  //                     "from_station": "Nagpur (NGP)",
  //                     "to_station": "New Delhi (NDLS)",
  //                     "total_available_seats": 10,
  //                     "available_classes": [
  //                       {
  //                         "class_name": "Second Seating",
  //                         "class_code": "2S",
  //                         "fare": "335",
  //                         "available_seats": 9,
  //                         "status": "AVAILABLE-9"
  //                       },
  //                       {
  //                         "class_name": "First AC",
  //                         "class_code": "1A",
  //                         "fare": "3430",
  //                         "available_seats": 1,
  //                         "status": "AVAILABLE-1"
  //                       }
  //                     ]
  //                   }
  //                 },
  //                 "journey_date": "01/11/2025"
  //               }
  //             ]
  //           }
  //         },
  //         {
  //           "to": "Haridwar",
  //           "from": "Delhi",
  //           "mode": "Train",
  //           "to_code": "HW",
  //           "from_code": "NDLS",
  //           "approx_cost": "INR 500 - INR 1500",
  //           "approx_time": "4 hours",
  //           "booking_url": "https://railways.easemytrip.com/TrainListInfo/Delhi(NDLS)-to-Haridwar(HW)/2/02-11-2025",
  //           "journey_date": "2025-11-02",
  //           "train_data_analysis": {
  //             "status": true,
  //             "option_name": "Train Delhi-Haridwar",
  //             "overall_statistics": {
  //               "total_trains_found": 11,
  //               "trains_with_available_tickets": 10
  //             },
  //             "leg_wise_analysis": [
  //               {
  //                 "status": true,
  //                 "summary": {
  //                   "total_trains": 11,
  //                   "trains_with_available_tickets": 10,
  //                   "total_available_seats": 1431
  //                 },
  //                 "available_trains": [
  //                   {
  //                     "train_name": "Bdts Hw Exp",
  //                     "train_number": "19019",
  //                     "departure": "02:50",
  //                     "arrival": "07:45",
  //                     "duration": "04:55",
  //                     "route": "Hazrat Nizamuddin Delhi (NZM) → Haridwar Jn (HW)",
  //                     "available_seats": 14,
  //                     "available_classes_count": 3,
  //                     "classes": [
  //                       {
  //                         "class_name": "AC 3 Tier",
  //                         "class_code": "3A",
  //                         "fare": "515",
  //                         "available_seats": 10,
  //                         "status": "AVAILABLE-10"
  //                       },
  //                       {
  //                         "class_name": "AC 2 tier",
  //                         "class_code": "2A",
  //                         "fare": "720",
  //                         "available_seats": 3,
  //                         "status": "AVAILABLE-3"
  //                       },
  //                       {
  //                         "class_name": "First AC",
  //                         "class_code": "1A",
  //                         "fare": "1185",
  //                         "available_seats": 1,
  //                         "status": "AVAILABLE-1"
  //                       }
  //                     ]
  //                   },
  //                   {
  //                     "train_name": "Yoga Express",
  //                     "train_number": "19031",
  //                     "departure": "04:00",
  //                     "arrival": "11:20",
  //                     "duration": "07:20",
  //                     "route": "Delhi Cantt (DEC) → Haridwar Jn (HW)",
  //                     "available_seats": 2,
  //                     "available_classes_count": 1,
  //                     "classes": [
  //                       {
  //                         "class_name": "Sleeper Class",
  //                         "class_code": "SL",
  //                         "fare": "195",
  //                         "available_seats": 2,
  //                         "status": "AVAILABLE-2"
  //                       }
  //                     ]
  //                   },
  //                   {
  //                     "train_name": "Tvcn Ynrk Sf Ex",
  //                     "train_number": "22659",
  //                     "departure": "06:00",
  //                     "arrival": "12:25",
  //                     "duration": "06:25",
  //                     "route": "Hazrat Nizamuddin Delhi (NZM) → Haridwar Jn (HW)",
  //                     "available_seats": 92,
  //                     "available_classes_count": 3,
  //                     "classes": [
  //                       {
  //                         "class_name": "Sleeper Class",
  //                         "class_code": "SL",
  //                         "fare": "215",
  //                         "available_seats": 34,
  //                         "status": "AVAILABLE-34"
  //                       },
  //                       {
  //                         "class_name": "AC 3 Tier",
  //                         "class_code": "3A",
  //                         "fare": "560",
  //                         "available_seats": 39,
  //                         "status": "AVAILABLE-39"
  //                       },
  //                       {
  //                         "class_name": "AC 2 tier",
  //                         "class_code": "2A",
  //                         "fare": "765",
  //                         "available_seats": 19,
  //                         "status": "AVAILABLE-19"
  //                       }
  //                     ]
  //                   },
  //                   {
  //                     "train_name": "Ddn Shtbdi Exp",
  //                     "train_number": "12017",
  //                     "departure": "06:45",
  //                     "arrival": "11:35",
  //                     "duration": "04:50",
  //                     "route": "New Delhi (NDLS) → Haridwar Jn (HW)",
  //                     "available_seats": 512,
  //                     "available_classes_count": 1,
  //                     "classes": [
  //                       {
  //                         "class_name": " AC Chair Car",
  //                         "class_code": "CC",
  //                         "fare": "735",
  //                         "available_seats": 512,
  //                         "status": "AVAILABLE-512"
  //                       }
  //                     ]
  //                   },
  //                   {
  //                     "train_name": "Lmnr Ynrk Exp",
  //                     "train_number": "14317",
  //                     "departure": "09:50",
  //                     "arrival": "16:10",
  //                     "duration": "06:20",
  //                     "route": "Hazrat Nizamuddin Delhi (NZM) → Haridwar Jn (HW)",
  //                     "available_seats": 1,
  //                     "available_classes_count": 1,
  //                     "classes": [
  //                       {
  //                         "class_name": "AC 3 Tier Economy",
  //                         "class_code": "3E",
  //                         "fare": "515",
  //                         "available_seats": 1,
  //                         "status": "AVAILABLE-1"
  //                       }
  //                     ]
  //                   },
  //                   {
  //                     "train_name": "Utkal Express",
  //                     "train_number": "18477",
  //                     "departure": "13:20",
  //                     "arrival": "20:08",
  //                     "duration": "06:48",
  //                     "route": "Hazrat Nizamuddin Delhi (NZM) → Haridwar Jn (HW)",
  //                     "available_seats": 32,
  //                     "available_classes_count": 1,
  //                     "classes": [
  //                       {
  //                         "class_name": "AC 3 Tier Economy",
  //                         "class_code": "3E",
  //                         "fare": "515",
  //                         "available_seats": 32,
  //                         "status": "AVAILABLE-32"
  //                       }
  //                     ]
  //                   },
  //                   {
  //                     "train_name": "Ddn Janshtbdi",
  //                     "train_number": "12055",
  //                     "departure": "15:20",
  //                     "arrival": "19:33",
  //                     "duration": "04:13",
  //                     "route": "New Delhi (NDLS) → Haridwar Jn (HW)",
  //                     "available_seats": 414,
  //                     "available_classes_count": 2,
  //                     "classes": [
  //                       {
  //                         "class_name": "Second Seating",
  //                         "class_code": "2S",
  //                         "fare": "145",
  //                         "available_seats": 240,
  //                         "status": "AVAILABLE-240"
  //                       },
  //                       {
  //                         "class_name": " AC Chair Car",
  //                         "class_code": "CC",
  //                         "fare": "490",
  //                         "available_seats": 174,
  //                         "status": "AVAILABLE-174"
  //                       }
  //                     ]
  //                   },
  //                   {
  //                     "train_name": "Vande Bharat Exp",
  //                     "train_number": "22457",
  //                     "departure": "17:50",
  //                     "arrival": "21:11",
  //                     "duration": "03:21",
  //                     "route": "Anand Vihar Terminus Delhi (ANVT) → Haridwar Jn (HW)",
  //                     "available_seats": 347,
  //                     "available_classes_count": 1,
  //                     "classes": [
  //                       {
  //                         "class_name": " AC Chair Car",
  //                         "class_code": "CC",
  //                         "fare": "980",
  //                         "available_seats": 347,
  //                         "status": "AVAILABLE-347"
  //                       }
  //                     ]
  //                   },
  //                   {
  //                     "train_name": "Mussoorie Exp",
  //                     "train_number": "14041",
  //                     "departure": "22:25",
  //                     "arrival": "05:50",
  //                     "duration": "07:25",
  //                     "route": "Old Delhi (DLI) → Haridwar Jn (HW)",
  //                     "available_seats": 15,
  //                     "available_classes_count": 2,
  //                     "classes": [
  //                       {
  //                         "class_name": "AC 2 tier",
  //                         "class_code": "2A",
  //                         "fare": "720",
  //                         "available_seats": 3,
  //                         "status": "AVAILABLE-3"
  //                       },
  //                       {
  //                         "class_name": "First AC",
  //                         "class_code": "1A",
  //                         "fare": "1185",
  //                         "available_seats": 12,
  //                         "status": "AVAILABLE-12"
  //                       }
  //                     ]
  //                   },
  //                   {
  //                     "train_name": "Kota Ddn Ac Exp",
  //                     "train_number": "12401",
  //                     "departure": "23:50",
  //                     "arrival": "03:57",
  //                     "duration": "04:07",
  //                     "route": "Hazrat Nizamuddin Delhi (NZM) → Haridwar Jn (HW)",
  //                     "available_seats": 2,
  //                     "available_classes_count": 1,
  //                     "classes": [
  //                       {
  //                         "class_name": "AC 2 tier",
  //                         "class_code": "2A",
  //                         "fare": "765",
  //                         "available_seats": 2,
  //                         "status": "AVAILABLE-2"
  //                       }
  //                     ]
  //                   }
  //                 ],
  //                 "fare_analysis": {
  //                   "by_class": {
  //                     "AC 3 Tier": {
  //                       "average": 526.25,
  //                       "min": 515.0,
  //                       "max": 560.0,
  //                       "median": 515.0,
  //                       "count": 8
  //                     },
  //                     "AC 2 Tier": {
  //                       "average": 731.25,
  //                       "min": 720.0,
  //                       "max": 765.0,
  //                       "median": 720.0,
  //                       "count": 8
  //                     },
  //                     "First AC": {
  //                       "average": 1200.0,
  //                       "min": 1185.0,
  //                       "max": 1260.0,
  //                       "median": 1185.0,
  //                       "count": 5
  //                     },
  //                     "Sleeper": {
  //                       "average": 193.57,
  //                       "min": 185.0,
  //                       "max": 215.0,
  //                       "median": 190.0,
  //                       "count": 7
  //                     },
  //                     "AC 3 Economy": {
  //                       "average": 522.5,
  //                       "min": 515.0,
  //                       "max": 560.0,
  //                       "median": 515.0,
  //                       "count": 6
  //                     },
  //                     "Chair Car": {
  //                       "average": 735.0,
  //                       "min": 490.0,
  //                       "max": 980.0,
  //                       "median": 735.0,
  //                       "count": 3
  //                     },
  //                     "Second Sitting": {
  //                       "average": 145.0,
  //                       "min": 145.0,
  //                       "max": 145.0,
  //                       "median": 145.0,
  //                       "count": 1
  //                     }
  //                   },
  //                   "cheapest_options": {
  //                     "sleeper_class": [
  //                       {
  //                         "train_name": "Bdts Hw Exp",
  //                         "train_number": "19019",
  //                         "fare": 185.0,
  //                         "class": "Sleeper Class",
  //                         "availability": "RLWL5/WL5",
  //                         "departure_time": "02:50",
  //                         "duration": "04:55"
  //                       },
  //                       {
  //                         "train_name": "Utkal Express",
  //                         "train_number": "18477",
  //                         "fare": 185.0,
  //                         "class": "Sleeper Class",
  //                         "availability": "Tap To Refresh",
  //                         "departure_time": "13:20",
  //                         "duration": "06:48"
  //                       },
  //                       {
  //                         "train_name": "Udz Ynrk Exp",
  //                         "train_number": "19609",
  //                         "fare": 185.0,
  //                         "class": "Sleeper Class",
  //                         "availability": "RLWL70/WL63",
  //                         "departure_time": "02:15",
  //                         "duration": "06:15"
  //                       }
  //                     ],
  //                     "ac_3_tier": [
  //                       {
  //                         "train_name": "Bdts Hw Exp",
  //                         "train_number": "19019",
  //                         "fare": 515.0,
  //                         "class": "AC 3 Tier",
  //                         "availability": "AVAILABLE-10",
  //                         "departure_time": "02:50",
  //                         "duration": "04:55"
  //                       },
  //                       {
  //                         "train_name": "Yoga Express",
  //                         "train_number": "19031",
  //                         "fare": 515.0,
  //                         "class": "AC 3 Tier",
  //                         "availability": "REGRET",
  //                         "departure_time": "04:00",
  //                         "duration": "07:20"
  //                       },
  //                       {
  //                         "train_name": "Lmnr Ynrk Exp",
  //                         "train_number": "14317",
  //                         "fare": 515.0,
  //                         "class": "AC 3 Tier",
  //                         "availability": "REGRET",
  //                         "departure_time": "09:50",
  //                         "duration": "06:20"
  //                       }
  //                     ]
  //                   }
  //                 },
  //                 "fastest_trains": [
  //                   {
  //                     "train_name": "Vande Bharat Exp",
  //                     "train_number": "22457",
  //                     "duration": "03:21",
  //                     "duration_minutes": 201,
  //                     "departure_time": "17:50",
  //                     "arrival_time": "21:11"
  //                   },
  //                   {
  //                     "train_name": "Kota Ddn Ac Exp",
  //                     "train_number": "12401",
  //                     "duration": "04:07",
  //                     "duration_minutes": 247,
  //                     "departure_time": "23:50",
  //                     "arrival_time": "03:57"
  //                   },
  //                   {
  //                     "train_name": "Ddn Janshtbdi",
  //                     "train_number": "12055",
  //                     "duration": "04:13",
  //                     "duration_minutes": 253,
  //                     "departure_time": "15:20",
  //                     "arrival_time": "19:33"
  //                   }
  //                 ],
  //                 "recommendations": {
  //                   "best_for_speed": {
  //                     "train_name": "Vande Bharat Exp",
  //                     "train_number": "22457",
  //                     "duration": "03:21",
  //                     "duration_minutes": 201,
  //                     "departure_time": "17:50",
  //                     "arrival_time": "21:11"
  //                   },
  //                   "best_for_budget": {
  //                     "train_name": "Bdts Hw Exp",
  //                     "train_number": "19019",
  //                     "fare": 185.0,
  //                     "class": "Sleeper Class",
  //                     "availability": "RLWL5/WL5",
  //                     "departure_time": "02:50",
  //                     "duration": "04:55"
  //                   },
  //                   "most_available": {
  //                     "train_name": "Ddn Shtbdi Exp",
  //                     "train_number": "12017",
  //                     "departure_time": "06:45",
  //                     "arrival_time": "11:35",
  //                     "duration": "04:50",
  //                     "from_station": "New Delhi (NDLS)",
  //                     "to_station": "Haridwar Jn (HW)",
  //                     "total_available_seats": 512,
  //                     "available_classes": [
  //                       {
  //                         "class_name": " AC Chair Car",
  //                         "class_code": "CC",
  //                         "fare": "735",
  //                         "available_seats": 512,
  //                         "status": "AVAILABLE-512"
  //                       }
  //                     ]
  //                   }
  //                 },
  //                 "journey_date": "02/11/2025"
  //               }
  //             ]
  //           }
  //         },
  //         {
  //           "to": "Rishikesh",
  //           "from": "Haridwar",
  //           "mode": "Bus",
  //           "to_code": "",
  //           "from_code": "",
  //           "approx_cost": "INR 100 - INR 300",
  //           "approx_time": "1 hour",
  //           "booking_url": "https://bus.easemytrip.com/home/list?org=Haridwar&des=Rishikesh%2CUttarakhand&date=02-11-2025&searchid=802_842&CCode=IN&AppCode=Emt",
  //           "journey_date": "2025-11-02",
  //           "bus_data_analysis": {
  //             "route_info": {
  //               "source": "Haridwar",
  //               "destination": "Rishikesh",
  //               "journey_date": "Sunday, 02 November 2025"
  //             },
  //             "summary": {
  //               "total_buses": 154,
  //               "ac_buses": 152,
  //               "non_ac_buses": 2
  //             },
  //             "fare_analysis": {
  //               "average_fare_overall": 954.78,
  //               "min_fare": 299.0,
  //               "max_fare": 5999.0,
  //               "price_range": "₹299.0 - ₹5999.0"
  //             },
  //             "cheapest_buses": [
  //               {
  //                 "operator": "OurBus",
  //                 "type": "AC Seater Electric (2 + 2)  ",
  //                 "fare": 299.0,
  //                 "duration": "00h 25m",
  //                 "departure": "04:19",
  //                 "seats": "33"
  //               },
  //               {
  //                 "operator": "Raj Kalpana Travels Pvt.Ltd",
  //                 "type": "2+1, Air Suspension Ac Sleeper, AC",
  //                 "fare": 338.0,
  //                 "duration": "00h 35m",
  //                 "departure": "03:25",
  //                 "seats": "32"
  //               },
  //               {
  //                 "operator": "zingbus plus",
  //                 "type": "Bharat Benz A/C Seater/Sleeper (Washroom)",
  //                 "fare": 340.0,
  //                 "duration": "0h 30m",
  //                 "departure": "15:20",
  //                 "seats": "32"
  //               }
  //             ],
  //             "fastest_buses": [
  //               {
  //                 "operator": "CITY LAND TOURS & TRAVELS PRIVATE LIMITED",
  //                 "type": "2+1, Air Suspension Hitech Sleeper, AC, NonVideo",
  //                 "duration": "00h 00m",
  //                 "fare": 838.0,
  //                 "departure": "12:30",
  //                 "seats": "42"
  //               },
  //               {
  //                 "operator": "CITY LAND TOURS & TRAVELS PRIVATE LIMITED",
  //                 "type": "2+1, Air Suspension Hitech Sleeper, AC, NonVideo",
  //                 "duration": "00h 00m",
  //                 "fare": 838.0,
  //                 "departure": "06:00",
  //                 "seats": "34"
  //               },
  //               {
  //                 "operator": "CITY LAND TOURS & TRAVELS PRIVATE LIMITED",
  //                 "type": "2+1, Air Suspension Hitech Sleeper, AC, NonVideo",
  //                 "duration": "00h 00m",
  //                 "fare": 838.0,
  //                 "departure": "06:35",
  //                 "seats": "45"
  //               }
  //             ],
  //             "best_discounts": [
  //               {
  //                 "operator": "Raj Kalpana Travels Pvt.Ltd",
  //                 "type": "2+2, Bharat Benz Semi Sleeper, AC, Video",
  //                 "discount": 150.0,
  //                 "original_price": "999",
  //                 "final_fare": 849.0,
  //                 "savings": 150.0
  //               },
  //               {
  //                 "operator": "Kashi Bus",
  //                 "type": "VOLVO AC Multiaxle Semi Sleeper (2 + 2)  ",
  //                 "discount": 125.0,
  //                 "original_price": "800",
  //                 "final_fare": 675.0,
  //                 "savings": 125.0
  //               },
  //               {
  //                 "operator": "Raj Kalpana Travels Pvt.Ltd",
  //                 "type": "2+2, Bharat Benz Semi Sleeper, AC, Video",
  //                 "discount": 118.0,
  //                 "original_price": "470",
  //                 "final_fare": 352.0,
  //                 "savings": 118.0
  //               }
  //             ],
  //             "highest_rated": [
  //               {
  //                 "operator": "zingbus plus",
  //                 "type": "Bharat Benz A/C Seater/Sleeper (Washroom)",
  //                 "rating": "4.6",
  //                 "fare": 340.0,
  //                 "duration": "0h 30m",
  //                 "departure": "15:20"
  //               },
  //               {
  //                 "operator": "zingbus plus",
  //                 "type": "Volvo Eicher A/C Seater (2X2)",
  //                 "rating": "4.6",
  //                 "fare": 341.0,
  //                 "duration": "0h 25m",
  //                 "departure": "13:25"
  //               },
  //               {
  //                 "operator": "zingbus plus",
  //                 "type": "Ashok Leyland A/C Seater (49 Seats)",
  //                 "rating": "4.6",
  //                 "fare": 348.0,
  //                 "duration": "0h 25m",
  //                 "departure": "22:50"
  //               }
  //             ],
  //             "operators": {
  //               "CITY LAND TOURS & TRAVELS PRIVATE LIMITED": {
  //                 "count": 29,
  //                 "avg_fare": 1093.07,
  //                 "total_fare": 31699.0
  //               },
  //               "TRAVELXME": {
  //                 "count": 21,
  //                 "avg_fare": 562.0,
  //                 "total_fare": 11802.0
  //               },
  //               "zingbus plus": {
  //                 "count": 17,
  //                 "avg_fare": 463.35,
  //                 "total_fare": 7877.0
  //               },
  //               "Flixbus": {
  //                 "count": 13,
  //                 "avg_fare": 660.0,
  //                 "total_fare": 8580.0
  //               },
  //               "Shri Krishna Travels ( jai shri ganesh yatra com.)": {
  //                 "count": 11,
  //                 "avg_fare": 1154.27,
  //                 "total_fare": 12697.0
  //               },
  //               "LeafyBus": {
  //                 "count": 8,
  //                 "avg_fare": 422.88,
  //                 "total_fare": 3383.0
  //               },
  //               "OurBus": {
  //                 "count": 6,
  //                 "avg_fare": 787.33,
  //                 "total_fare": 4724.0
  //               },
  //               "Ram Dalal Holidays": {
  //                 "count": 5,
  //                 "avg_fare": 763.2,
  //                 "total_fare": 3816.0
  //               },
  //               "Mr Bus": {
  //                 "count": 5,
  //                 "avg_fare": 490.4,
  //                 "total_fare": 2452.0
  //               },
  //               "Raj Kalpana Travels Pvt.Ltd": {
  //                 "count": 4,
  //                 "avg_fare": 472.75,
  //                 "total_fare": 1891.0
  //               },
  //               "Get Book Cab": {
  //                 "count": 3,
  //                 "avg_fare": 959.33,
  //                 "total_fare": 2878.0
  //               },
  //               "Travelzap India Private Limited": {
  //                 "count": 3,
  //                 "avg_fare": 832.33,
  //                 "total_fare": 2497.0
  //               },
  //               "EMPIRE TRAVELS(empt)": {
  //                 "count": 2,
  //                 "avg_fare": 849.0,
  //                 "total_fare": 1698.0
  //               },
  //               "Royals Services": {
  //                 "count": 2,
  //                 "avg_fare": 1000.0,
  //                 "total_fare": 2000.0
  //               },
  //               "Kohli Tours & Travels": {
  //                 "count": 2,
  //                 "avg_fare": 1649.0,
  //                 "total_fare": 3298.0
  //               },
  //               "Sunil Bus Service": {
  //                 "count": 2,
  //                 "avg_fare": 2000.0,
  //                 "total_fare": 4000.0
  //               },
  //               "Laxmi Holidays": {
  //                 "count": 2,
  //                 "avg_fare": 5499.0,
  //                 "total_fare": 10998.0
  //               },
  //               "Baba Travels(Mathura)": {
  //                 "count": 1,
  //                 "avg_fare": 950.0,
  //                 "total_fare": 950.0
  //               },
  //               "MAHALAXMI BUS SERVICE (mhbv)": {
  //                 "count": 1,
  //                 "avg_fare": 1449.0,
  //                 "total_fare": 1449.0
  //               },
  //               "VT Bus": {
  //                 "count": 1,
  //                 "avg_fare": 539.0,
  //                 "total_fare": 539.0
  //               },
  //               "Chandramukhi Travels Sikar": {
  //                 "count": 1,
  //                 "avg_fare": 599.0,
  //                 "total_fare": 599.0
  //               },
  //               "Shri Ram Transport Company": {
  //                 "count": 1,
  //                 "avg_fare": 599.0,
  //                 "total_fare": 599.0
  //               },
  //               "Kashi Bus": {
  //                 "count": 1,
  //                 "avg_fare": 675.0,
  //                 "total_fare": 675.0
  //               },
  //               "Yuvraj Travels Jaipur": {
  //                 "count": 1,
  //                 "avg_fare": 699.0,
  //                 "total_fare": 699.0
  //               },
  //               "PT Travel": {
  //                 "count": 1,
  //                 "avg_fare": 738.0,
  //                 "total_fare": 738.0
  //               },
  //               "Shree Krishna Bus Service": {
  //                 "count": 1,
  //                 "avg_fare": 761.0,
  //                 "total_fare": 761.0
  //               },
  //               "Western Bus": {
  //                 "count": 1,
  //                 "avg_fare": 990.0,
  //                 "total_fare": 990.0
  //               },
  //               "Shekhar Travels": {
  //                 "count": 1,
  //                 "avg_fare": 1000.0,
  //                 "total_fare": 1000.0
  //               },
  //               "Choudhary Travels": {
  //                 "count": 1,
  //                 "avg_fare": 1000.0,
  //                 "total_fare": 1000.0
  //               },
  //               "Golden Temple Travels": {
  //                 "count": 1,
  //                 "avg_fare": 1199.0,
  //                 "total_fare": 1199.0
  //               },
  //               "I B S Travels": {
  //                 "count": 1,
  //                 "avg_fare": 1349.0,
  //                 "total_fare": 1349.0
  //               },
  //               "PTC SkyBus": {
  //                 "count": 1,
  //                 "avg_fare": 1800.0,
  //                 "total_fare": 1800.0
  //               },
  //               "Mahalaxmi Travels ISO 9001:2015": {
  //                 "count": 1,
  //                 "avg_fare": 1899.0,
  //                 "total_fare": 1899.0
  //               },
  //               "Rajdhani Travels (Nimbhera)": {
  //                 "count": 1,
  //                 "avg_fare": 4500.0,
  //                 "total_fare": 4500.0
  //               },
  //               "BT Travels (Brham Travels)": {
  //                 "count": 1,
  //                 "avg_fare": 5000.0,
  //                 "total_fare": 5000.0
  //               },
  //               "Haridas Premium Class Bus Service": {
  //                 "count": 1,
  //                 "avg_fare": 5000.0,
  //                 "total_fare": 5000.0
  //               }
  //             }
  //           }
  //         }
  //       ],
  //       "generated_on": "2025-10-21 15:47:46"
  //     }
  //   },
  //   "message": "User-preferred travelling options analyzed successfully!",
  //   "status_code": 200
  // }

  // const refetch = () => { }

  useEffect(() => {
    if (error) {
      setStatus('error');
    } else if (analysisData) {
      setStatus('finish'); // Mark step as finished once data arrives
    } else {
      setStatus('process');
    }
  }, [analysisData, error, setStatus]);


  if (isLoading && !analysisData?.data) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Analyzing your selected travel option..." /></div>;
  }

  if (error) {
    return <Alert message="Error" description={error.data?.message || "Could not analyze travel options."} type="error" showIcon />;
  }

  // Check if the backend analysis itself reported an issue
  if (analysisData && analysisData?.data.travel_options_analysis && analysisData?.data.travel_options_analysis.status === false) {
    return <Alert message="Analysis Issue" description={analysisData?.data.travel_options_analysis.message || "Could not complete analysis."} type="warning" showIcon />;
  }

  if (!analysisData || !analysisData?.data.travel_options_analysis || !analysisData?.data.travel_options_analysis.legs) {
    return <Alert message="Analysis data is incomplete or unavailable." type="info" showIcon />;
  }



  const selectedOption = analysisData?.data.selected_travel_options;
  const analysisResult = analysisData?.data.travel_options_analysis;

  //-- Modal to display Selected Trip Details
  const showSelectedTripDetailsModal = (selectedOption) => {
    modal.info({
      title: <span>{selectedOption.option_name}</span>,
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Timeline style={{ marginTop: 16 }}>
            {selectedOption.legs.map((leg, index) => (
              <Timeline.Item key={index} dot={getModeIcon(leg.mode)}>
                <Paragraph strong style={{ margin: 0 }}>{leg.from} ({leg.from_code || 'N/A'}) <ArrowRightOutlined /> {leg.to} ({leg.to_code || 'N/A'})</Paragraph>
                <Text type="secondary">{new Date(leg.journey_date).toLocaleDateString()}</Text>
                <div style={{ marginTop: 4 }}>
                  <Space align="baseline" wrap >
                    <Tag icon={getModeIcon(leg.mode)}>{leg.mode}</Tag>
                    <Tag icon={<DollarCircleOutlined />}>{leg.approx_cost}</Tag>
                    <Tag icon={<ClockCircleOutlined />}>{leg.approx_time}</Tag>
                  </Space>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Space>
      ),
      icon: <span style={{marginRight:10}} class="material-symbols-outlined">
        route
      </span>,
      width: "50%",
      onOk() { },
    });
  };

  // Prepare items for Ant Design Tabs
  const tabItems = analysisResult.legs.map((leg, index) => ({
    key: String(index),
    label: (
      <Space>
        {getModeIcon(leg.mode)}
        Leg {index + 1}: {leg.mode}
      </Space>
    ),
    children: <LegAnalysisDetails leg={leg} bookingList={bookingList} onAddToBooking={onAddToBooking} />, // Pass the specific leg data
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      <Title level={4}>Travel Option Analysis</Title>
      <Paragraph type="secondary">
        Detailed analysis for your journey from <Text strong>{selectedOption.legs[0]?.from}</Text> to <Text strong>{selectedOption.legs[selectedOption.legs.length - 1]?.to}</Text>.
      </Paragraph>

      <Card style={{ background: '#e6f7ff', border: '1px solid #91d5ff', marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <CheckCircleOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
              <Text strong>Selected Route: {analysisResult.option_name}</Text>
            </Space>
            {/* <Paragraph type="secondary" style={{ margin: '4px 0 0 26px' }}>
              This is the route you selected, balancing cost and travel time.
            </Paragraph> */}
          </Col>
          <Col>
            <Button type="primary" onClick={() => showSelectedTripDetailsModal(selectedOption)}>View Details</Button>
          </Col>
        </Row>
      </Card>

      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        items={tabItems}
        type="card" // Gives a tabbed appearance similar to the screenshot
      />

      <Button
        type="primary"
        onClick={onComplete} // Call the function passed from parent to move to next step
        style={{ marginTop: 24 }}
        block
        size="large"
      >
        Confirm Analysis & Proceed to Hotel Preferences
      </Button>
      {modalContextHolder}
    </motion.div>
  );
};

export default AnalyzeTravel;

