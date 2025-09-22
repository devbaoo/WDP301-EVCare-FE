import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "../../services/constant/axiosInstance";
import { MY_BOOKINGS_ENDPOINT, BOOKING_DETAILS_ENDPOINT, BOOKING_TIME_SLOTS_ENDPOINT } from "../../services/constant/apiConfig";
import { Booking } from "../../interfaces/booking";
import { cancelBooking, rescheduleBooking } from "../../services/features/booking/bookingSlice";

function BookingHistory() {
    const dispatch = useDispatch();
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [newDate, setNewDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    const [availableSlots, setAvailableSlots] = useState<{ startTime: string; endTime: string; }[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [rescheduleError, setRescheduleError] = useState<string | null>(null); // Added for reschedule validation

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

    useEffect(() => {
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

    const openReschedule = async (booking: Booking) => {
        try {
            setLoading(true);
            setRescheduleError(null); 
            const detailRes = await axiosInstance.get(BOOKING_DETAILS_ENDPOINT(booking._id));
            const detail = detailRes.data?.data || booking;
            setSelectedBooking(detail);
            const initialDate = (detail.appointmentTime?.date || booking.appointmentTime.date || "").substring(0, 10);
            setNewDate(initialDate);
            setSelectedSlot("");
            setIsRescheduleOpen(true);
        } catch (err) {
            const error = err as any;
            setError(error.response?.data?.message || error.message || "Failed to load appointment details");
        } finally {
            setLoading(false);
        }
    };

    const closeReschedule = () => {
        setIsRescheduleOpen(false);
        setSelectedBooking(null);
        setNewDate("");
        setSelectedSlot("");
        setAvailableSlots([]);
        setRescheduleError(null); 
    };

    const submitReschedule = async () => {
        if (!selectedBooking) return;
        
        // Validation checks
        if (!newDate) {
            setRescheduleError("Please select a new date");
            return;
        }
        if (!selectedSlot) {
            setRescheduleError("Please select a new time slot");
            return;
        }
        
        setLoading(true);
        setError(null);
        setRescheduleError(null);
        try {
            // @ts-ignore
            await dispatch(rescheduleBooking({
                bookingId: selectedBooking._id,
                appointmentDate: newDate, 
                appointmentTime: selectedSlot,
            }));
            await fetchBookings();
            closeReschedule();
        } catch (err) {
            const error = err as any;
            setError(error.response?.data?.message || error.message || "Rescheduling failed");
        } finally {
            setLoading(false);
        }
    };

    const openCancel = (booking: Booking) => {
        setSelectedBooking(booking);
        setCancelReason("");
        setIsCancelOpen(true);
    };

    const closeCancel = () => {
        setIsCancelOpen(false);
        setSelectedBooking(null);
        setCancelReason("");
    };

    const submitCancel = async () => {
        if (!selectedBooking) return;
        setLoading(true);
        setError(null);
        try {
            // @ts-ignore
            await dispatch(cancelBooking({ bookingId: selectedBooking._id, reason: cancelReason }));
            await fetchBookings();
            closeCancel();
        } catch (err) {
            const error = err as any;
            setError(error.response?.data?.message || error.message || "Cancellation failed");
        } finally {
            setLoading(false);
        }
    };

    // Tải khung giờ khi chọn ngày (và đã có serviceCenterId)
    useEffect(() => {
        const loadSlots = async () => {
            try {
                if (!isRescheduleOpen || !newDate || !selectedBooking) return;
                const serviceCenterId = (selectedBooking as any)?.serviceCenter?._id || (selectedBooking as any)?.serviceCenterId;
                if (!serviceCenterId) return;
                setLoadingSlots(true);
                const res = await axiosInstance.get(BOOKING_TIME_SLOTS_ENDPOINT(serviceCenterId, newDate));
                const slots = res.data?.data?.availableSlots || [];
                setAvailableSlots(slots);
                setSelectedSlot("");
            } catch (err) {
                const error = err as any;
                setError(error.response?.data?.message || error.message || "Failed to load available time slots");
            } finally {
                setLoadingSlots(false);
            }
        };
        loadSlots();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newDate, isRescheduleOpen]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending_confirmation":
                return "bg-yellow-100 text-yellow-800";
            case "confirmed":
                return "bg-blue-100 text-blue-800";
            case "in_progress":
                return "bg-indigo-100 text-indigo-800";
            case "inspection_completed":
                return "bg-purple-100 text-purple-800";
            case "quote_provided":
                return "bg-cyan-100 text-cyan-800";
            case "quote_approved":
                return "bg-green-100 text-green-800";
            case "quote_rejected":
                return "bg-red-100 text-red-800";
            case "maintenance_in_progress":
                return "bg-blue-100 text-blue-800";
            case "maintenance_completed":
                return "bg-green-100 text-green-800";
            case "payment_pending":
                return "bg-yellow-100 text-yellow-800";
            case "completed":
                return "bg-green-700 text-white";
            case "cancelled":
                return "bg-red-100 text-red-800";
            case "rescheduled":
                return "bg-orange-100 text-orange-800";
            case "no_show":
                return "bg-gray-300 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            weekday: 'short'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const canModifyBooking = (status: string) => {
        return status !== "cancelled";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <h1 className="text-3xl md:text-4xl font-bold">Booking History</h1>
                    <p className="mt-2 opacity-90">View and manage your appointment history</p>
                </div>

                <div className="p-6">
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <h2 className="text-lg font-semibold text-blue-800 mb-3">Filter by Date</h2>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredBookings.map((booking, index) => (
                                            <tr key={booking._id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {formatDate(booking.appointmentTime.date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {booking.serviceType?.name || "N/A"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {booking.appointmentTime?.startTime && booking.appointmentTime?.endTime
                                                        ? `${booking.appointmentTime.startTime} - ${booking.appointmentTime.endTime}`
                                                        : "N/A"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                        {booking.status.replace("_", " ").toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-150"
                                                            onClick={() => fetchBookingDetails(booking._id)}
                                                        >
                                                            View Details
                                                        </button>
                                                        <button
                                                            className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${canModifyBooking(booking.status) ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'}`}
                                                            onClick={() => canModifyBooking(booking.status) && openReschedule(booking)}
                                                            disabled={!canModifyBooking(booking.status)}
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button
                                                            className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 ${canModifyBooking(booking.status) ? 'bg-rose-600 hover:bg-rose-700' : 'bg-gray-300 cursor-not-allowed'}`}
                                                            onClick={() => canModifyBooking(booking.status) && openCancel(booking)}
                                                            disabled={!canModifyBooking(booking.status)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredBookings.length === 0 && !loading && (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by scheduling a new appointment.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal chi tiết */}
            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                            <h2 className="text-2xl font-bold">Appointment Details</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Date</p>
                                <p className="text-lg font-semibold">{formatDate(selectedBooking.appointmentTime.date)}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">Service</p>
                                <p className="text-lg font-semibold">{selectedBooking.serviceType?.name || "N/A"}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <p className="mt-1">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                                        {selectedBooking.status.replace("_", " ").toUpperCase()}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">Description</p>
                                <p className="text-lg">{selectedBooking.serviceDetails?.description || "N/A"}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal dời lịch */}
            {isRescheduleOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white">
                            <h2 className="text-2xl font-bold">Reschedule Appointment</h2>
                            <p className="opacity-90 mt-1 text-sm">Select a new date and time slot</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Time Slot</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                    value={selectedSlot}
                                    onChange={(e) => setSelectedSlot(e.target.value)}
                                    disabled={loadingSlots}
                                >
                                    <option value="">
                                        {loadingSlots ? "Loading time slots..." : "Select time slot"}
                                    </option>
                                    {availableSlots.map((slot, idx) => (
                                        <option key={`${slot.startTime}-${idx}`} value={slot.startTime}>
                                            {slot.startTime} - {slot.endTime}
                                        </option>
                                    ))}
                                </select>
                                {(!loadingSlots && availableSlots.length === 0 && newDate) && (
                                    <p className="text-sm text-gray-500 mt-2">No available time slots for the selected date.</p>
                                )}
                            </div>
                            
                            {/* Validation error message */}
                            {rescheduleError && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{rescheduleError}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                onClick={closeReschedule}
                            >
                                Close
                            </button>
                            <button
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                onClick={submitReschedule}
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal hủy lịch */}
            {isCancelOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-gradient-to-r from-rose-600 to-red-700 p-6 text-white">
                            <h2 className="text-2xl font-bold">Cancel Appointment</h2>
                            <p className="opacity-90 mt-1 text-sm">Confirm appointment cancellation</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                    rows={3}
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="What is the reason for cancellation?"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                onClick={closeCancel}
                            >
                                Close
                            </button>
                            <button
                                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                                onClick={submitCancel}
                                disabled={loading}
                            >
                                {loading ? "Cancelling..." : "Confirm Cancellation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BookingHistory;