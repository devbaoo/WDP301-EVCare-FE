import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { 
    SearchOutlined, 
    CalendarOutlined, 
    EyeOutlined, 
    EditOutlined, 
    CloseOutlined, 
    FilterOutlined,
    ReloadOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";
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
    const [rescheduleError, setRescheduleError] = useState<string | null>(null);

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
                return "bg-yellow-100 text-yellow-800 border border-yellow-200";
            case "confirmed":
                return "bg-blue-100 text-blue-800 border border-blue-200";
            case "in_progress":
                return "bg-indigo-100 text-indigo-800 border border-indigo-200";
            case "inspection_completed":
                return "bg-purple-100 text-purple-800 border border-purple-200";
            case "quote_provided":
                return "bg-cyan-100 text-cyan-800 border border-cyan-200";
            case "quote_approved":
                return "bg-green-100 text-green-800 border border-green-200";
            case "quote_rejected":
                return "bg-red-100 text-red-800 border border-red-200";
            case "maintenance_in_progress":
                return "bg-blue-100 text-blue-800 border border-blue-200";
            case "maintenance_completed":
                return "bg-green-100 text-green-800 border border-green-200";
            case "payment_pending":
                return "bg-yellow-100 text-yellow-800 border border-yellow-200";
            case "completed":
                return "bg-green-700 text-white border border-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800 border border-red-200";
            case "rescheduled":
                return "bg-orange-100 text-orange-800 border border-orange-200";
            case "no_show":
                return "bg-gray-300 text-gray-800 border border-gray-400";
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircleOutlined className="mr-1" />;
            case "cancelled":
                return <CloseOutlined className="mr-1" />;
            case "confirmed":
            case "in_progress":
                return <ClockCircleOutlined className="mr-1" />;
            default:
                return <InfoCircleOutlined className="mr-1" />;
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

    const formatTime = (timeString: string) => {
        if (!timeString) return "N/A";
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${period}`;
    };

    const canCancelBooking = (status: string) => {
        return status !== "cancelled" && status !== "completed" && status !== "confirmed";
    };

    const canRescheduleBooking = (status: string) => {
        return status !== "cancelled" && status !== "completed";
    };

    const clearFilters = () => {
        setStartDate("");
        setEndDate("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <CalendarOutlined className="text-3xl" />
                            <h1 className="text-3xl md:text-4xl font-bold">Booking History</h1>
                        </div>
                        <p className="mt-2 opacity-90 flex items-center gap-2">
                            <InfoCircleOutlined />
                            View and manage your appointment history
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    {/* Filter Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                                <FilterOutlined />
                                Filter by Date Range
                            </h2>
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <ReloadOutlined />
                                Clear Filters
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <CalendarOutlined />
                                    From Date
                                </label>
                                <div className="relative">
                                    <CalendarOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <CalendarOutlined />
                                    To Date
                                </label>
                                <div className="relative">
                                    <CalendarOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded-lg w-full text-center">
                                    <div className="text-sm font-medium">Total Bookings</div>
                                    <div className="text-2xl font-bold">{filteredBookings.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                            <p className="text-gray-600 flex items-center gap-2">
                                <ReloadOutlined />
                                Loading your bookings...
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 animate-fade-in">
                            <div className="flex items-center">
                                <ExclamationCircleOutlined className="text-red-500 text-lg mr-3" />
                                <div>
                                    <p className="text-red-700 font-medium">Error loading bookings</p>
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bookings Table */}
                    {!loading && !error && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                #
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                                                <CalendarOutlined />
                                                Date
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Service
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Time Slot
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredBookings.map((booking, index) => (
                                            <tr key={booking._id} className="hover:bg-blue-50 transition-all duration-200 group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {formatDate(booking.appointmentTime.date)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 font-medium">
                                                        {booking.serviceType?.name || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600 flex items-center gap-1">
                                                        <ClockCircleOutlined />
                                                        {booking.appointmentTime?.startTime && booking.appointmentTime?.endTime
                                                            ? `${formatTime(booking.appointmentTime.startTime)} - ${formatTime(booking.appointmentTime.endTime)}`
                                                            : "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1.5 inline-flex items-center text-xs leading-4 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                        {getStatusIcon(booking.status)}
                                                        {booking.status.replace("_", " ").toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 text-sm font-medium"
                                                            onClick={() => fetchBookingDetails(booking._id)}
                                                        >
                                                            <EyeOutlined />
                                                            Details
                                                        </button>
                                                        <button
                                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-all duration-200 ${
                                                                canRescheduleBooking(booking.status)
                                                                ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'
                                                                : 'bg-gray-300 cursor-not-allowed'
                                                            }`}
                                                            onClick={() => canRescheduleBooking(booking.status) && openReschedule(booking)}
                                                            disabled={!canRescheduleBooking(booking.status)}
                                                        >
                                                            <EditOutlined />
                                                            Reschedule
                                                        </button>
                                                        <button
                                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-all duration-200 ${
                                                                canCancelBooking(booking.status)
                                                                ? 'bg-red-600 hover:bg-red-700 hover:shadow-md'
                                                                : 'bg-gray-300 cursor-not-allowed'
                                                            }`}
                                                            onClick={() => canCancelBooking(booking.status) && openCancel(booking)}
                                                            disabled={!canCancelBooking(booking.status)}
                                                        >
                                                            <CloseOutlined />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Empty State */}
                            {filteredBookings.length === 0 && !loading && (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                        <SearchOutlined className="text-3xl text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        {startDate || endDate 
                                            ? "Try adjusting your date filters to see more results." 
                                            : "You haven't made any appointments yet. Schedule your first appointment to get started."
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Details Modal */}
            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-scale-in">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <InfoCircleOutlined />
                                    Appointment Details
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                                >
                                    <CloseOutlined />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {[
                                { icon: <CalendarOutlined />, label: "Date", value: formatDate(selectedBooking.appointmentTime.date) },
                                { icon: <ClockCircleOutlined />, label: "Time", value: selectedBooking.appointmentTime?.startTime && selectedBooking.appointmentTime?.endTime
                                    ? `${formatTime(selectedBooking.appointmentTime.startTime)} - ${formatTime(selectedBooking.appointmentTime.endTime)}`
                                    : "N/A" },
                                { icon: <InfoCircleOutlined />, label: "Service", value: selectedBooking.serviceType?.name || "N/A" },
                                { icon: <CheckCircleOutlined />, label: "Status", value: selectedBooking.status.replace("_", " ").toUpperCase(), status: true },
                                { icon: <EditOutlined />, label: "Description", value: selectedBooking.serviceDetails?.description || "N/A" }
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="text-blue-600 mt-1">{item.icon}</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-500">{item.label}</p>
                                        {item.status ? (
                                            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                                                {item.value}
                                            </span>
                                        ) : (
                                            <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <button
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={closeModal}
                            >
                                <CloseOutlined />
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {isRescheduleOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-scale-in">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <EditOutlined />
                                Reschedule Appointment
                            </h2>
                            <p className="opacity-90 mt-1 text-sm">Select a new date and time slot</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <CalendarOutlined />
                                    New Date
                                </label>
                                <div className="relative">
                                    <CalendarOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <ClockCircleOutlined />
                                    New Time Slot
                                </label>
                                <div className="relative">
                                    <ClockCircleOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <select
                                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none"
                                        value={selectedSlot}
                                        onChange={(e) => setSelectedSlot(e.target.value)}
                                        disabled={loadingSlots}
                                    >
                                        <option value="">
                                            {loadingSlots ? "Loading time slots..." : "Select time slot"}
                                        </option>
                                        {availableSlots.map((slot, idx) => (
                                            <option key={`${slot.startTime}-${idx}`} value={slot.startTime}>
                                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {(!loadingSlots && availableSlots.length === 0 && newDate) && (
                                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                        <InfoCircleOutlined />
                                        No available time slots for the selected date.
                                    </p>
                                )}
                            </div>
                            
                            {rescheduleError && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fade-in">
                                    <div className="flex items-center">
                                        <ExclamationCircleOutlined className="text-red-500 text-lg mr-3" />
                                        <p className="text-red-700 text-sm">{rescheduleError}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                onClick={closeReschedule}
                            >
                                <CloseOutlined />
                                Close
                            </button>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                onClick={submitReschedule}
                                disabled={loading}
                            >
                                {loading ? <ReloadOutlined className="animate-spin" /> : <CheckCircleOutlined />}
                                {loading ? "Updating..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {isCancelOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-scale-in">
                        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 text-white">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <CloseOutlined />
                                Cancel Appointment
                            </h2>
                            <p className="opacity-90 mt-1 text-sm">Confirm appointment cancellation</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <ExclamationCircleOutlined className="text-red-500 text-xl" />
                                    <div>
                                        <p className="font-semibold text-red-800">Warning</p>
                                        <p className="text-red-700 text-sm">This action cannot be undone. Your appointment will be cancelled.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <EditOutlined />
                                    Reason (optional)
                                </label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                    rows={3}
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="What is the reason for cancellation?"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                onClick={closeCancel}
                            >
                                <CloseOutlined />
                                Close
                            </button>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                                onClick={submitCancel}
                                disabled={loading}
                            >
                                {loading ? <ReloadOutlined className="animate-spin" /> : <CloseOutlined />}
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