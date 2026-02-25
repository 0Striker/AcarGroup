using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface ICalendarService
{
    Task<IEnumerable<CalendarEventDto>> GetScheduledJobsAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<IEnumerable<CalendarEventDto>> GetScheduledJobsByPersonnelAsync(int personnelId, DateTime? startDate = null, DateTime? endDate = null);
    Task<CalendarEventDto> ScheduleJobAsync(ScheduledJobCreateDto dto);
    Task<bool> UpdateScheduleAsync(int scheduleId, ScheduledJobCreateDto dto);
    Task<bool> ConfirmScheduleAsync(int scheduleId);
    Task<bool> CancelScheduleAsync(int scheduleId);
}
