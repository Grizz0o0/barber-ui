import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useConsultAI } from '@/queries/useAI'
import { toast } from 'sonner'
import { Loader2, Sparkles, Scissors, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

const formSchema = z.object({
  faceShape: z.string().min(1, 'Vui lòng chọn khuôn mặt'),
  hairType: z.string().min(1, 'Vui lòng chọn loại tóc'),
  currentLength: z.string().min(1, 'Vui lòng chọn độ dài tóc'),
  desiredStyle: z.string().min(1, 'Vui lòng chọn phong cách mong muốn')
})

export default function AIStylist() {
  const navigate = useNavigate()
  const { mutate, isPending, data } = useConsultAI()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      faceShape: '',
      hairType: '',
      currentLength: '',
      desiredStyle: ''
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values, {
      onError: (error) => {
        toast.error('Có lỗi xảy ra khi tư vấn. Vui lòng thử lại.')
        console.error(error)
      }
    })
  }

  const recommendations = data?.metadata?.recommendations

  return (
    <div className='container mx-auto py-10 px-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-10'>
          <h1 className='text-4xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3'>
            <Sparkles className='w-8 h-8 text-purple-600' />
            AI Stylist - Tư vấn kiểu tóc
          </h1>
          <p className='text-muted-foreground text-lg'>
            Khám phá kiểu tóc hoàn hảo cho bạn với sự trợ giúp của Trí tuệ nhân tạo
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <Card className='h-fit shadow-lg border-primary/20'>
            <CardHeader className='bg-primary/5 rounded-t-xl'>
              <CardTitle className='flex items-center gap-2'>
                <User className='w-5 h-5' />
                Thông tin của bạn
              </CardTitle>
              <CardDescription>Hãy cho chúng tôi biết về đặc điểm tóc của bạn</CardDescription>
            </CardHeader>
            <CardContent className='pt-6'>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                  <FormField
                    control={form.control}
                    name='faceShape'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hình dáng khuôn mặt</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn khuôn mặt' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='tròn'>Tròn (Round)</SelectItem>
                            <SelectItem value='dài'>Dài (Oval)</SelectItem>
                            <SelectItem value='vuông'>Vuông (Square)</SelectItem>
                            <SelectItem value='trái tim'>Trái tim (Heart)</SelectItem>
                            <SelectItem value='kim cương'>Kim cương (Diamond)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='hairType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại tóc</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn loại tóc' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='thẳng'>Thẳng (Straight)</SelectItem>
                            <SelectItem value='gợn sóng'>Gợn sóng (Wavy)</SelectItem>
                            <SelectItem value='xoăn'>Xoăn (Curly)</SelectItem>
                            <SelectItem value='dày'>Dày (Thick)</SelectItem>
                            <SelectItem value='mỏng'>Mỏng (Thin)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='currentLength'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Độ dài tóc hiện tại</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn độ dài' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='ngắn'>Ngắn (Short)</SelectItem>
                            <SelectItem value='trung bình'>Trung bình (Medium)</SelectItem>
                            <SelectItem value='dài'>Dài (Long)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='desiredStyle'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phong cách mong muốn</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn phong cách' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='lịch lãm'>Lịch lãm (Professional)</SelectItem>
                            <SelectItem value='hiện đại'>Hiện đại (Modern)</SelectItem>
                            <SelectItem value='cổ điển'>Cổ điển (Classic)</SelectItem>
                            <SelectItem value='phá cách'>Phá cách (Edgy)</SelectItem>
                            <SelectItem value='gọn gàng'>Gọn gàng (Clean)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type='submit'
                    className='w-full text-lg font-semibold h-12 shadow-md transition-all hover:scale-[1.02]'
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        <Sparkles className='mr-2 h-5 w-5' />
                        Nhận tư vấn ngay
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className='space-y-6'>
            {!recommendations && !isPending && (
              <div className='h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-xl bg-muted/30'>
                <div className='w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4'>
                  <Scissors className='w-10 h-10 text-muted-foreground' />
                </div>
                <h3 className='text-xl font-semibold mb-2'>Chưa có gợi ý nào</h3>
                <p className='text-muted-foreground'>
                  Điền thông tin bên trái và bấm "Nhận tư vấn ngay" để xem các kiểu tóc phù hợp nhất với bạn.
                </p>
              </div>
            )}

            {isPending && (
              <div className='space-y-4 animate-pulse'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='bg-muted/50 h-40 rounded-xl relative overflow-hidden'>
                    <div className='absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_infinite]' />
                  </div>
                ))}
              </div>
            )}

            {recommendations && (
              <div className='space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700'>
                <h2 className='text-2xl font-bold flex items-center gap-2 mb-2'>
                  <Sparkles className='text-yellow-500' />
                  Gợi ý dành riêng cho bạn
                </h2>
                {recommendations.map((item, index) => (
                  <Card
                    key={index}
                    className='overflow-hidden hover:shadow-lg transition-shadow border-primary/20 group'
                  >
                    <div className='h-2 bg-linear-to-r from-blue-500 to-purple-500 w-0 group-hover:w-full transition-all duration-500' />
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-xl text-primary'>{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div>
                          <span className='font-semibold text-sm text-muted-foreground uppercase tracking-wider'>
                            Tại sao phù hợp?
                          </span>
                          <p className='mt-1'>{item.description}</p>
                        </div>
                        <div className='bg-secondary/50 p-3 rounded-lg'>
                          <span className='font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-1'>
                            <Scissors className='w-3 h-3' /> Styling Tips
                          </span>
                          <p className='mt-1 text-sm italic'>{item.stylingTips}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant='outline'
                        className='w-full hover:bg-primary hover:text-primary-foreground group-hover:border-primary'
                        onClick={() => navigate('/booking')}
                      >
                        Đặt lịch kiểu này
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
