import { asyncHandler } from "../utils/asyncHandler.js";
import Booking from "../models/bookings.model.js";
import { Sequelize, Op } from 'sequelize';
const TOTAL_SEATS = 80; // Total fixed seats
const SEATS_PER_ROW = 7;
const LAST_ROW_SEATS = 3;

const seatBooking = asyncHandler(async (req, res) => {
  const { user_id, seats } = req.body;
  // Validate input
  if (!user_id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  if (seats < 1 || seats > 7) {
    return res.status(400).json({ message: "You can reserve between 1 and 7 seats at a time." });
  }

  const totalRows = Math.ceil(TOTAL_SEATS / SEATS_PER_ROW);

  // Fetch existing bookings
  const bookedSeats = await Booking.findAll({
    attributes: ["seat_no"],
  });
  const bookedSeatNumbers = bookedSeats.map((b) => b.seat_no);

  // Initialize seat allocation array
  let allocatedSeats = [];

  // Iterate through each row to find contiguous seats
  for (let row = 1; row <= totalRows; row++) {
    const startSeat = (row - 1) * SEATS_PER_ROW + 1;
    let endSeat = row * SEATS_PER_ROW;

    // Adjust for the last row
    if (row === totalRows) {
      endSeat = startSeat + LAST_ROW_SEATS - 1;
    }

    // Find available seats in the row
    const availableSeats = [];
    for (let seat = startSeat; seat <= endSeat; seat++) {
      if (!bookedSeatNumbers.includes(seat)) {
        availableSeats.push(seat);
      }
    }

    // If enough seats are available in this row, allocate them
    if (availableSeats.length >= seats) {
      allocatedSeats = availableSeats.slice(0, seats);
      break;
    }
  }

  // If not enough seats found in a single row, allocate nearby seats
  if (allocatedSeats.length < seats) {
    const allAvailableSeats = [];
    for (let seat = 1; seat <= TOTAL_SEATS; seat++) {
      if (!bookedSeatNumbers.includes(seat)) {
        allAvailableSeats.push(seat);
      }
    }
    // Find the nearest available seats using a sliding window
    let nearestSeats = [];
    let minDifference = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i <= allAvailableSeats.length - seats; i++) {
      // const currentWindow = allAvailableSeats.slice(i, i + seats);
      const currentWindow = Array.from({ length: seats }, (_, index) => allAvailableSeats[i + index]);
      const currentDifference = currentWindow[currentWindow.length - 1] - currentWindow[0];

      if (currentDifference < minDifference) {
        minDifference = currentDifference;
        nearestSeats = currentWindow;
      }
    }

    if (nearestSeats.length >= seats) {
      allocatedSeats = nearestSeats;
    }
  }
  const totalAvailableSeats = TOTAL_SEATS - bookedSeatNumbers.length;
  // If no seats can be allocated
  if (allocatedSeats.length < seats) {
    return res.status(400).json({
      message: `Booking failed,only ${totalAvailableSeats} seats available to book`,
    });
  }

  // Save the allocated seats to the database
  const bookingData = allocatedSeats.map((seat) => ({
    seat_no: seat,
    user_id,
  }));
  await Booking.bulkCreate(bookingData);

  return res.status(201).json({
    message: "Seats booked successfully",
    allocatedSeats,
  });
});


const showBookedSeat = asyncHandler(async (req, res) => {
  try {
    // Fetch the latest booking by date and time
    const latestBooking = await Booking.findOne({
      order: [['created_at', 'DESC']],
    });
    if (!latestBooking) {
      return res.status(404).json({ message: 'No bookings found' });
    }
  
    // Fetch all bookings with the latest booking's timestamp
    const currentBooking = await Booking.findAll({
      where: {
        created_at: {
          [Sequelize.Op.eq]: latestBooking.created_at,
        },
      },
    });
    // Fetch all booked seats
    const bookedSeats = await Booking.findAll();
  
    // Extract all seat numbers into an array
    const seatNumbers = bookedSeats.map(seat => seat.seat_no);
  
    // Calculate available seats (assuming total seats = 80)
    const totalSeats = 80;
    const availableSeats = totalSeats - bookedSeats.length;
  
    // Count the bookings at the latest timestamp
    const currentBookingCount = currentBooking.length;
  
    // Send the response
    res.status(200).json({
      message: "Seats booked successfully",
      seatNumbers,
      bookedSeatsCount: bookedSeats.length,
      availableSeats,
      currentBookingKey: currentBookingCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booked seats', error: error.message });
  }  
});

const resetBooking = asyncHandler(async (req, res) => {
  // Truncate the bookings table
  await Booking.truncate();

  return res.status(200).json({ message: "All bookings have been reset." });
});

export { seatBooking, showBookedSeat, resetBooking };
