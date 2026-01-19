import Layout from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Scissors, User as UserIcon, Calendar, ThumbsUp } from 'lucide-react'
import { useGetLikedReviews, useLikeReviewMutation } from '@/queries/useReview'
import { format } from 'date-fns'
import type { Review } from '@/types'
import PageLoader from '@/components/common/PageLoader'
import { StarRating } from '@/components/common/StarRating'
import EmptyState from '@/components/common/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'

const LikedReviews = () => {
  const { user, isAuthenticated } = useAuth()
  const { data, isLoading } = useGetLikedReviews()
  const likeReviewMutation = useLikeReviewMutation()

  const reviews = (data?.metadata?.reviews || []) as Review[]

  const handleLike = (reviewId: string) => {
    if (!isAuthenticated) return
    likeReviewMutation.mutate(reviewId)
  }

  if (isLoading) return <PageLoader fullScreen />

  return (
    <Layout>
      <section className='py-12 bg-muted/30 min-h-[60vh]'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto'>
            <h1 className='text-3xl font-bold mb-8 font-display'>Đánh giá đã thích</h1>

            <div className='space-y-6'>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review._id} className='bg-card border-border/50'>
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
                              className='text-primary hover:text-primary'
                              onClick={() => handleLike(review._id)}
                            >
                              <ThumbsUp className='w-4 h-4 mr-1 fill-current' />
                              {review.likes?.length || 0} Likes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <EmptyState
                  icon={ThumbsUp}
                  title='Chưa có đánh giá yêu thích'
                  description='Bạn chưa thích đánh giá nào.'
                  action={
                    <Button asChild variant='gold'>
                      <Link to='/reviews'>Xem đánh giá</Link>
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default LikedReviews
