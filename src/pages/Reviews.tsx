import { useState, useMemo } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import {
  Star,
  Filter,
  Scissors,
  User as UserIcon,
  Calendar,
  ThumbsUp,
  MessageCircle,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { useGetServices } from '@/queries/useService'
import {
  useGetReviews,
  useCreateReviewMutation,
  useLikeReviewMutation,
  useReplyReviewMutation
} from '@/queries/useReview'
import { useGetBookings } from '@/queries/useBooking'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { Booking, Review, Service, User } from '@/types'
import PageLoader from '@/components/common/PageLoader'
import { StarRating } from '@/components/common/StarRating'
import EmptyState from '@/components/common/EmptyState'
import { useGetBarbers } from '@/queries/useAccount'

const Reviews = () => {
  const { isAuthenticated, user } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [filterService, setFilterService] = useState('all')
  const [filterBarber, setFilterBarber] = useState('all')
  const [filterRating, setFilterRating] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const { data: barbersData } = useGetBarbers()
  const barbers = (barbersData?.metadata || []) as User[]

  // Fetching data using hooks
  const { data: reviewsData, isLoading: isLoadingReviews, refetch: refetchReviews } = useGetReviews(1, 100)
  const { data: servicesData, isLoading: isLoadingServices } = useGetServices()
  const { data: bookingsData } = useGetBookings(
    { status: 'completed', user: user?._id },
    !!isAuthenticated && !!user?._id
  )

  const isLoading = isLoadingReviews || isLoadingServices

  // Derived state

  const reviews = useMemo(() => {
    return (reviewsData?.metadata?.reviews || []) as Review[]
  }, [reviewsData])

  const services = (servicesData?.metadata?.services || []) as Service[]

  const myBookings = useMemo(() => {
    const list = (bookingsData?.metadata?.bookings || []) as Booking[]
    return [...list].sort((a: Booking, b: Booking) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  }, [bookingsData])

  // Handling refresh manually or just using hooks refetch
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetchReviews()
    toast.success('Đã làm mới danh sách đánh giá')
    setIsRefreshing(false)
  }

  // Form state for new review
  const [newReview, setNewReview] = useState({
    bookingId: '',
    rating: 0,
    comment: ''
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [replyIndex, setReplyIndex] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const filteredReviews = reviews
    .filter((r) => {
      if (!filterService || filterService === 'all') return true

      // Get service ID from populated booking -> service
      // Get service ID from populated booking -> service
      let reviewServiceId = ''
      if (typeof r.booking === 'object' && r.booking !== null) {
        const booking = r.booking as any
        // Check if service is populated
        if (booking.service && typeof booking.service === 'object' && booking.service._id) {
          reviewServiceId = booking.service._id
        } else if (booking.service && typeof booking.service === 'string') {
          reviewServiceId = booking.service
        }
      }

      return reviewServiceId === filterService
    })
    .filter((r) => {
      if (!filterBarber || filterBarber === 'all') return true
      const reviewBarberId = typeof r.barber === 'string' ? r.barber : r.barber?._id
      return reviewBarberId === filterBarber
    })
    .filter((r) => filterRating === 'all' || r.rating === parseInt(filterRating))
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      if (sortBy === 'newest') return dateB - dateA
      if (sortBy === 'highest') return b.rating - a.rating
      if (sortBy === 'lowest') return a.rating - b.rating
      return 0
    })

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0
  }))

  const createReviewMutation = useCreateReviewMutation()

  const handleSubmitReview = async () => {
    if (!newReview.bookingId || !newReview.rating || !newReview.comment) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    const reviewData = {
      booking: newReview.bookingId,
      rating: newReview.rating,
      comment: newReview.comment,
      images: []
    }

    createReviewMutation.mutate(reviewData, {
      onSuccess: () => {
        toast.success('Đánh giá thành công!', {
          description: 'Cảm ơn bạn đã chia sẻ trải nghiệm.'
        })
        // Invalidate queries or recheck - mutation hook invalidates already
        setNewReview({ bookingId: '', rating: 0, comment: '' })
        setIsDialogOpen(false)
      },
      onError: (error: any) => {
        toast.error(error.message || 'Gửi đánh giá thất bại')
      }
    })
  }

  const isSubmittingReview = createReviewMutation.isPending

  const likeReviewMutation = useLikeReviewMutation()
  const replyReviewMutation = useReplyReviewMutation()

  const handleLike = (reviewId: string) => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thích đánh giá')
      return
    }
    likeReviewMutation.mutate(reviewId)
  }

  const handleOpenReply = (reviewId: string, currentReply?: string) => {
    setReplyIndex(reviewId)
    setReplyContent(currentReply || '')
  }

  const handleSubmitReply = () => {
    if (!replyIndex || !replyContent.trim()) return

    replyReviewMutation.mutate(
      { id: replyIndex, body: { reply: replyContent } },
      {
        onSuccess: () => {
          toast.success('Phản hồi thành công')
          setReplyIndex(null)
          setReplyContent('')
        },
        onError: (error: any) => {
          toast.error(error.message || 'Phản hồi thất bại')
        }
      }
    )
  }

  if (isLoading) {
    return <PageLoader fullScreen />
  }

  return (
    <Layout>
      {/* Hero */}
      <section className='py-16 px-16 md:py-20 bg-linear-to-b  from-card to-background'>
        <div className='container mx-auto px-4'>
          <div className='max-w-3xl mx-auto text-center'>
            <h1 className='font-display text-4xl md:text-5xl font-bold mb-4'>
              Đánh giá từ <span className='text-primary'>Khách hàng</span>
            </h1>
            <p className='text-muted-foreground text-lg mb-6'>
              Hơn {reviews.length} đánh giá chân thực từ khách hàng đã sử dụng dịch vụ
            </p>
            <Button variant='outline' onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Làm mới danh sách
            </Button>
          </div>
        </div>
      </section>

      {/* Rating Summary */}
      <section className='py-8 px-16 border-b border-border/50'>
        <div className='container mx-auto px-4'>
          <div className='grid md:grid-cols-2 gap-8 items-center'>
            <div className='flex items-center gap-6'>
              <div className='text-center'>
                <div className='font-display text-5xl font-bold text-primary'>{averageRating}</div>
                <div className='flex justify-center my-2'>
                  <StarRating rating={Math.round(parseFloat(averageRating))} size='lg' />
                </div>
                <p className='text-muted-foreground text-sm mt-1'>{reviews.length} đánh giá</p>
              </div>
              <div className='flex-1 space-y-2'>
                {ratingCounts.map(({ star, count, percentage }) => (
                  <div key={star} className='flex items-center gap-2'>
                    <span className='text-sm w-3'>{star}</span>
                    <Star className='w-4 h-4 fill-primary text-primary' />
                    <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
                      <div className='h-full bg-primary transition-all' style={{ width: `${percentage}%` }} />
                    </div>
                    <span className='text-sm text-muted-foreground w-8'>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex justify-end'>
              {isAuthenticated ? (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant='gold' size='lg'>
                      Viết đánh giá
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-lg'>
                    <DialogHeader>
                      <DialogTitle>Viết đánh giá của bạn</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4 py-4'>
                      <div>
                        <label className='text-sm font-medium mb-2 block'>Dịch vụ đã sử dụng</label>
                        <Select
                          value={newReview.bookingId}
                          onValueChange={(v) => setNewReview({ ...newReview, bookingId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn buổi cắt tóc' />
                          </SelectTrigger>
                          <SelectContent>
                            {myBookings.length > 0 ? (
                              myBookings.map((b) => {
                                const serviceName = typeof b.service === 'object' ? b.service?.name : 'Dịch vụ'
                                const barberName = typeof b.barber === 'object' ? b.barber?.name : 'Thợ'

                                return (
                                  <SelectItem key={b._id} value={b._id}>
                                    {format(new Date(b.startTime), 'dd/MM/yyyy', { locale: vi })} - {serviceName} (
                                    {barberName})
                                  </SelectItem>
                                )
                              })
                            ) : (
                              <SelectItem value='none' disabled>
                                Bạn chưa có lịch sử dụng dịch vụ nào
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className='text-sm font-medium mb-2 block'>Đánh giá</label>
                        <StarRating
                          rating={newReview.rating}
                          onRate={(r) => setNewReview({ ...newReview, rating: r })}
                          interactive
                          size='md'
                        />
                      </div>
                      <div>
                        <label className='text-sm font-medium mb-2 block'>Nhận xét</label>
                        <Textarea
                          placeholder='Chia sẻ trải nghiệm của bạn...'
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant='ghost' onClick={() => setIsDialogOpen(false)} disabled={isSubmittingReview}>
                        Hủy
                      </Button>
                      <Button variant='gold' onClick={handleSubmitReview} disabled={isSubmittingReview}>
                        {isSubmittingReview ? (
                          <>
                            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                            Đang gửi...
                          </>
                        ) : (
                          'Gửi đánh giá'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button variant='gold' size='lg' onClick={() => toast.info('Vui lòng đăng nhập để viết đánh giá')}>
                  Viết đánh giá
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className='py-6 px-16 bg-card/30'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-wrap gap-4 items-center'>
            <Filter className='w-5 h-5 text-muted-foreground' />
            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Dịch vụ' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả dịch vụ</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterBarber} onValueChange={setFilterBarber}>
              <SelectTrigger className='w-40'>
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
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className='w-30'>
                <SelectValue placeholder='Sao' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả</SelectItem>
                {[5, 4, 3, 2, 1].map((r) => (
                  <SelectItem key={r} value={r.toString()}>
                    {r} sao
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className='ml-auto'>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='w-35'>
                  <SelectValue placeholder='Sắp xếp' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='newest'>Mới nhất</SelectItem>
                  <SelectItem value='highest'>Cao nhất</SelectItem>
                  <SelectItem value='lowest'>Thấp nhất</SelectItem>
                  <SelectItem value='popular'>Phổ biến</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='space-y-6 max-w-4xl mx-auto'>
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <Card key={review._id} className='bg-card/50 border-border/50'>
                  <CardContent className='p-6'>
                    <div className='flex items-start gap-4'>
                      <img
                        src={review.user?.avatar || 'https://github.com/shadcn.png'}
                        alt={review.user?.name}
                        className='w-12 h-12 rounded-full object-cover'
                      />
                      <div className='flex-1'>
                        <div className='flex items-start justify-between mb-2'>
                          <div>
                            <h4 className='font-semibold'>{review.user?.name || 'Khách hàng'}</h4>
                            <div className='flex items-center gap-3 text-sm text-muted-foreground mt-1'>
                              {typeof review.booking === 'object' && (review.booking as any)?.service && (
                                <span className='flex items-center gap-1'>
                                  <Scissors className='w-3 h-3' />
                                  {(review.booking as any).service.name || 'Dịch vụ'}
                                </span>
                              )}
                              {review.barber && (
                                <span className='flex items-center gap-1'>
                                  <UserIcon className='w-3 h-3' />
                                  {typeof review.barber === 'object' ? review.barber.name : 'Thợ'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className='text-right'>
                            <StarRating rating={review.rating} size='sm' />
                            <p className='text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end'>
                              <Calendar className='w-3 h-3' />
                              {review.createdAt ? format(new Date(review.createdAt), 'dd/MM/yyyy') : ''}
                            </p>
                          </div>
                        </div>
                        <p className='text-muted-foreground leading-relaxed mb-4'>{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className='flex gap-2 mb-4'>
                            {review.images.map((img, idx) => (
                              <img key={idx} src={img} alt='' className='w-24 h-24 rounded-lg object-cover' />
                            ))}
                          </div>
                        )}
                        {review.reply && (
                          <div className='mt-4 bg-muted/50 p-4 rounded-lg'>
                            <p className='text-sm font-semibold mb-1'>Phản hồi từ cửa hàng:</p>
                            <p className='text-sm text-muted-foreground'>{review.reply}</p>
                          </div>
                        )}

                        <div className='flex items-center gap-4 mt-4'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className={`${
                              review.likes?.includes(user?._id || '') ? 'text-primary' : 'text-muted-foreground'
                            } hover:text-primary transition-colors`}
                            onClick={() => handleLike(review._id)}
                          >
                            <ThumbsUp
                              className={`w-4 h-4 mr-1 ${review.likes?.includes(user?._id || '') ? 'fill-current' : ''}`}
                            />
                            {review.likes?.length || 0} Likes
                          </Button>

                          {['admin', 'barber'].includes((user?.role || '').toLowerCase()) && (
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-muted-foreground hover:text-primary'
                              onClick={() => handleOpenReply(review._id, review.reply)}
                            >
                              <MessageCircle className='w-4 h-4 mr-1' />
                              {review.reply ? 'Sửa phản hồi' : 'Trả lời'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState
                icon={MessageCircle}
                title='Không có đánh giá'
                description='Chưa có đánh giá nào phù hợp với bộ lọc hiện tại.'
              />
            )}
          </div>
        </div>
      </section>
      {/* Reply Dialog */}
      <Dialog open={!!replyIndex} onOpenChange={(open) => !open && setReplyIndex(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trả lời đánh giá</DialogTitle>
          </DialogHeader>
          <div className='py-4'>
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder='Nhập nội dung phản hồi...'
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant='ghost' onClick={() => setReplyIndex(null)}>
              Hủy
            </Button>
            <Button variant='gold' onClick={handleSubmitReply} disabled={replyReviewMutation.isPending}>
              {replyReviewMutation.isPending ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Gửi phản hồi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

export default Reviews
