import { FilterX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookingStatus } from '@/lib/constants'
import type { User } from '@/types'

interface AdminBookingFiltersProps {
  filterStatus: string
  setFilterStatus: (value: string) => void
  filterBarber: string
  setFilterBarber: (value: string) => void
  barbers: User[]
  resetFilters: () => void
}

const AdminBookingFilters = ({
  filterStatus,
  setFilterStatus,
  filterBarber,
  setFilterBarber,
  barbers,
  resetFilters
}: AdminBookingFiltersProps) => {
  return (
    <Card className='bg-card/50 border-border/50 mb-6'>
      <CardContent className='p-4'>
        <div className='flex flex-wrap gap-4 items-center'>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Trạng thái' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả trạng thái</SelectItem>
              <SelectItem value={BookingStatus.PENDING}>Chờ xác nhận</SelectItem>
              <SelectItem value={BookingStatus.CONFIRMED}>Đã xác nhận</SelectItem>
              <SelectItem value={BookingStatus.COMPLETED}>Hoàn thành</SelectItem>
              <SelectItem value={BookingStatus.CANCELLED}>Đã hủy</SelectItem>
              <SelectItem value={BookingStatus.NO_SHOW}>Vắng mặt</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBarber} onValueChange={setFilterBarber}>
            <SelectTrigger className='w-56'>
              <SelectValue placeholder='Thợ cắt' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả thợ</SelectItem>
              {barbers.map((b) => (
                <SelectItem key={b._id} value={b._id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant='ghost' onClick={resetFilters} className='text-muted-foreground hover:text-foreground'>
            <FilterX className='w-4 h-4 mr-2' />
            Xóa bộ lọc
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AdminBookingFilters
