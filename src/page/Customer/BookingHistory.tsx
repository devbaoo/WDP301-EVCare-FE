import { useEffect, useState } from "react";
import axiosInstance from "../../services/constant/axiosInstance";
import { MY_BOOKINGS_ENDPOINT, BOOKING_DETAILS_ENDPOINT } from "../../services/constant/apiConfig";
import { Booking } from "../../interfaces/booking";

function BookingHistory() {
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(MY_BOOKINGS_ENDPOINT);
                const data = Array.isArray(response.data.data.appointments) ? response.data.data.appointments : [];
                setAllBookings(data);
                setFilteredBookings(data);
            } catch (err) {
                const error = err as any;
                setError(error.message || "Failed to fetch bookings");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Tự động filter khi startDate hoặc endDate thay đổi
    useEffect(() => {
        const filtered = allBookings.filter((booking) => {
            const bookingDate = new Date(booking.appointmentTime.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && end) {
                return bookingDate >= start && bookingDate <= end;
            } else if (start) {
                return bookingDate >= start;
            } else if (end) {
                return bookingDate <= end;
            }
            return true;
        });
        setFilteredBookings(filtered);
    }, [startDate, endDate, allBookings]);

    const fetchBookingDetails = async (bookingId: string) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(BOOKING_DETAILS_ENDPOINT(bookingId));
            setSelectedBooking(response.data.data);
            setIsModalOpen(true);
        } catch (err) {
            const error = err as any;
            setError(error.message || "Failed to fetch booking details");
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
    };

    // Hàm lấy màu sắc dựa trên status
    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending_confirmation":
                return "bg-yellow-500 text-white rounded-full text-xs px-2 py-0.5";
            case "confirmed":
                return "bg-blue-500 text-white rounded-full text-xs px-2 py-0.5";
            case "completed":
                return "bg-green-600 text-white rounded-full text-xs px-2 py-0.5";
            case "cancelled":
                return "bg-red-600 text-white rounded-full text-xs px-2 py-0.5";
            default:
                return "bg-gray-500 text-white rounded-full text-xs px-2 py-0.5";
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
                <h1 className="text-4xl font-bold text-center text-blue-600 mb-4">Booking History</h1>
                <div className="flex justify-center mb-6">
                    <input
                        type="date"
                        className="border border-gray-300 rounded px-4 py-2 mr-2"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        className="border border-gray-300 rounded px-4 py-2 mr-2"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="End Date"
                    />
                </div>

                {loading && <p className="text-center text-blue-500">Loading...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="table-auto w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-blue-500 text-white">
                                    <th className="px-4 py-2 border border-gray-300">#</th>
                                    <th className="px-4 py-2 border border-gray-300">Date</th>
                                    <th className="px-4 py-2 border border-gray-300">Service</th>
                                    <th className="px-4 py-2 border border-gray-300">Status</th>
                                    <th className="px-4 py-2 border border-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((booking, index) => (
                                    <tr key={booking._id} className="hover:bg-gray-100">
                                        <td className="px-4 py-2 border border-gray-300 text-center">{index + 1}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">{new Date(booking.appointmentTime.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">{booking.serviceType?.name || "N/A"}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                            <span className={`inline-block font-medium ${getStatusColor(booking.status)}`}>
                                                {booking.status.replace("_", " ").toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                            <button
                                                className="text-blue-500 hover:underline"
                                                onClick={() => fetchBookingDetails(booking._id)}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {isModalOpen && selectedBooking && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h2 className="text-xl font-bold text-blue-600 mb-4">Booking Details</h2>
                            <p><strong>Date:</strong> {new Date(selectedBooking.appointmentTime.date).toLocaleDateString()}</p>
                            <p><strong>Service:</strong> {selectedBooking.serviceType?.name || "N/A"}</p>
                            <p><strong>Status:</strong>
                                <span className={`inline-block ${getStatusColor(selectedBooking.status)}`}>
                                    {selectedBooking.status.replace("_", " ").toUpperCase()}
                                </span>
                            </p>
                            <p><strong>Description:</strong> {selectedBooking.serviceDetails?.description || "N/A"}</p>
                            <button
                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BookingHistory;