import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon, Loader2, Check, ChevronsUpDown, User as UserIcon, UserPlus } from 'lucide-react'
import { format } from 'date-fns'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { cn } from '@/lib/utils'
import { timeSlots } from '@/lib/constants'
import { useGetUsers } from '@/queries/useAccount'
import { useGetServices } from '@/queries/useService'
import { useCreateBookingMutation } from '@/queries/useBooking'
import type { User, Service } from '@/types'
import { toast } from 'sonner'

const formSchema = z
  .object({
    userId: z.string().optional(),
    guestName: z.string().optional(),
    guestPhone: z.string().optional(),
    barberId: z.string({ error: 'Vui lòng chọn thợ' }).min(1, 'Vui lòng chọn thợ'),
    serviceId: z.string({ error: 'Vui lòng chọn dịch vụ' }).min(1, 'Vui lòng chọn dịch vụ'),
    date: z.date({ error: 'Vui lòng chọn ngày' }),
    time: z.string({ error: 'Vui lòng chọn giờ' }).min(1, 'Vui lòng chọn giờ'),
    notes: z.string().optional(),
    type: z.enum(['member', 'guest'])
  })
  .superRefine((data, ctx) => {
    if (data.type === 'member' && !data.userId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vui lòng chọn khách hàng',
        path: ['userId']
      })
    }
    if (data.type === 'guest') {
      if (!data.guestName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Tên khách hàng là bắt buộc',
          path: ['guestName']
        })
      }
      if (!data.guestPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Số điện thoại là bắt buộc',
          path: ['guestPhone']
        })
      }
    }
  })

interface CreateBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  barbers: User[]
  initialValues?: Partial<z.infer<typeof formSchema>>
}

const CreateBookingDialog = ({ open, onOpenChange, onSuccess, barbers, initialValues }: CreateBookingDialogProps) => {
  const [activeTab, setActiveTab] = useState<'member' | 'guest'>('member')
  const [openCombobox, setOpenCombobox] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch users based on search
  const { data: usersData, isLoading: loadingUsers } = useGetUsers({
    page: 1,
    limit: 50,
    q: debouncedSearch
  })

  const { data: servicesData, isLoading: loadingServices } = useGetServices()
  const createBookingMutation = useCreateBookingMutation()

  const users = (usersData?.metadata?.users || []) as User[]
  const services = (servicesData?.metadata?.services || []) as Service[]
  const loadingConfig = loadingServices

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: initialValues?.userId || '',
      guestName: '',
      guestPhone: '',
      barberId: initialValues?.barberId || '',
      serviceId: initialValues?.serviceId || '',
      notes: initialValues?.notes || '',
      type: 'member'
    }
  })

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset({
        userId: '',
        guestName: '',
        guestPhone: '',
        barberId: '',
        serviceId: '',
        notes: '',
        type: 'member'
      })
      setActiveTab('member')
      setSearchTerm('')
    }
    onOpenChange(isOpen)
  }

  useEffect(() => {
    if (initialValues) {
      form.reset({
        userId: initialValues.userId || '',
        barberId: initialValues.barberId || '',
        serviceId: initialValues.serviceId || '',
        notes: initialValues.notes || '',
        type: 'member'
      })
    }
  }, [initialValues, form])

  // Sync tab with form type
  const handleTabChange = (value: string) => {
    const type = value as 'member' | 'guest'
    setActiveTab(type)
    form.setValue('type', type)
    if (type === 'guest') {
      form.setValue('userId', '')
    } else {
      form.setValue('guestName', '')
      form.setValue('guestPhone', '')
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const [hours, minutes] = values.time.split(':').map(Number)
    const startDateTime = new Date(values.date)
    startDateTime.setHours(hours, minutes, 0, 0)

    const payload: any = {
      barber: values.barberId,
      service: values.serviceId,
      startTime: startDateTime.toISOString(),
      notes: values.notes,
      source: 'walk-in'
    }

    if (values.type === 'member') {
      payload.user = values.userId
    } else {
      payload.guestName = values.guestName
      payload.guestPhone = values.guestPhone
    }

    createBookingMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Tạo lịch thành công')
        onSuccess()
        handleOpenChange(false)
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || 'Tạo lịch thất bại'
        if (errorMessage.includes('Không đủ thời gian')) {
          toast.error(errorMessage, {
            duration: 5000,
            style: { border: '2px solid red' }
          })
        } else {
          toast.error(errorMessage)
        }
      }
    })
  }

  const isLoading = createBookingMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-md max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Tạo lịch mới (Walk-in)</DialogTitle>
        </DialogHeader>

        {loadingConfig ? (
          <div className='flex h-40 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <Tabs value={activeTab} onValueChange={handleTabChange} className='w-full'>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='member'>
                    <UserIcon className='mr-2 h-4 w-4' />
                    Thành viên
                  </TabsTrigger>
                  <TabsTrigger value='guest'>
                    <UserPlus className='mr-2 h-4 w-4' />
                    Khách vãng lai
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='member' className='space-y-4 pt-4'>
                  <FormField
                    control={form.control}
                    name='userId'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Khách hàng thành viên</FormLabel>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                role='combobox'
                                className={cn('justify-between', !field.value && 'text-muted-foreground')}
                              >
                                {field.value
                                  ? users.find((u) => u._id === field.value)?.name ||
                                    users.find((u) => u._id === field.value)?.phone
                                  : 'Tìm theo tên hoặc SĐT...'}
                                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-[400px] p-0'>
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder='Nhập tên hoặc số điện thoại...'
                                value={searchTerm}
                                onValueChange={setSearchTerm}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {loadingUsers ? 'Đang tìm...' : 'Không tìm thấy khách hàng.'}
                                </CommandEmpty>
                                <CommandGroup>
                                  {users.map((user) => (
                                    <CommandItem
                                      value={user._id}
                                      key={user._id}
                                      onSelect={() => {
                                        form.setValue('userId', user._id)
                                        setOpenCombobox(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          user._id === field.value ? 'opacity-100' : 'opacity-0'
                                        )}
                                      />
                                      <div className='flex flex-col'>
                                        <span>{user.name}</span>
                                        <span className='text-xs text-muted-foreground'>{user.phone}</span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value='guest' className='space-y-4 pt-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='guestName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên khách</FormLabel>
                          <FormControl>
                            <Input placeholder='Nhập tên khách...' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='guestPhone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại</FormLabel>
                          <FormControl>
                            <Input placeholder='Nhập SĐT...' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <FormField
                control={form.control}
                name='barberId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thợ cắt</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn thợ' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {barbers.map((b) => (
                          <SelectItem key={b._id} value={b._id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='serviceId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dịch vụ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn dịch vụ' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name} ({s.duration} phút) -{' '}
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='date'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Ngày</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'dd/MM/yyyy') : <span>Chọn ngày</span>}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='time'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Giờ' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='max-h-50'>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time} disabled={false}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Input placeholder='Ghi chú thêm...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className='pt-4'>
                <Button type='button' variant='outline' onClick={() => handleOpenChange(false)}>
                  Hủy
                </Button>
                <Button type='submit' disabled={isLoading}>
                  {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  Tạo lịch
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CreateBookingDialog
