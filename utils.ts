export const getDayName = (date: Date = new Date()) => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[date.getDay()];
};

export const getMonthName = (monthIndex: number) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return months[monthIndex];
};

export const formatDate = (date: Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (date: Date) => {
  return `${getDayName(date)}, ${date.getDate()} ${getMonthName(date.getMonth())} ${date.getFullYear()}`;
};

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString('id-ID', { hour12: false });
};
