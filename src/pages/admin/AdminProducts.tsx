import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, Star, Package, Loader2 } from 'lucide-react'
import { ProductCategory } from '@/lib/schemas/product.schema'
import { ImageUpload } from '@/components/common/ImageUpload'
import { useGetProducts, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } from '@/queries'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  rating: number
  reviews: number
  image: string
  description: string
}

const categoryOptions = [
  { id: 'all', name: 'Tất cả' },
  { id: ProductCategory.Wax, name: 'Sáp vuốt tóc (Wax)' },
  { id: ProductCategory.Gel, name: 'Gel vuốt tóc' },
  { id: ProductCategory.Spray, name: 'Gôm xịt (Spray)' },
  { id: ProductCategory.Shampoo, name: 'Dầu gội' },
  { id: ProductCategory.Beard, name: 'Chăm sóc râu' },
  { id: ProductCategory.Other, name: 'Khác' }
]

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const AdminProducts = () => {
  const { data: productsData, isLoading: loading } = useGetProducts(1, 100)
  const createProductMutation = useCreateProductMutation()
  const updateProductMutation = useUpdateProductMutation()
  const deleteProductMutation = useDeleteProductMutation()

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    image: ''
  })

  // Normalize data from API
  const products: Product[] = (productsData?.metadata?.products || []).map((p: any) => ({
    id: p._id,
    name: p.name,
    category: p.category,
    price: p.price,
    stock: p.stock,
    rating: p.rating || 0,
    reviews: p.reviews || 0,
    image: p.images?.[0] || '',
    description: p.description
  }))

  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => filterCategory === 'all' || p.category === filterCategory)

  const resetForm = () => {
    setFormData({ name: '', category: '', price: '', stock: '', description: '', image: '' })
    setEditingProduct(null)
  }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString(),
        description: product.description,
        image: product.image
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.category || !formData.stock) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    const payload = {
      name: formData.name,
      category: formData.category as ProductCategory,
      price: parseInt(formData.price),
      stock: parseInt(formData.stock),
      description: formData.description,
      images: formData.image ? [formData.image] : [],
      isActive: true
    }

    if (editingProduct) {
      updateProductMutation.mutate(
        { id: editingProduct.id, body: payload },
        {
          onSuccess: () => {
            toast.success('Cập nhật sản phẩm thành công')
            setDialogOpen(false)
            resetForm()
          },
          onError: (error: any) => {
            console.error(error)
            toast.error(error.message || 'Cập nhật thất bại')
          }
        }
      )
    } else {
      createProductMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Thêm sản phẩm thành công')
          setDialogOpen(false)
          resetForm()
        },
        onError: (error: any) => {
          console.error(error)
          toast.error(error.message || 'Thêm sản phẩm thất bại')
        }
      })
    }
  }

  const handleDelete = () => {
    if (deletingProduct) {
      deleteProductMutation.mutate(deletingProduct.id, {
        onSuccess: () => {
          toast.success('Xóa sản phẩm thành công')
          setDeleteDialogOpen(false)
          setDeletingProduct(null)
        },
        onError: (error: any) => {
          console.error(error)
          toast.error('Xóa thất bại')
        }
      })
    }
  }

  return (
    <div className='p-6 lg:p-8'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8'>
        <div>
          <h1 className='font-display text-2xl md:text-3xl font-bold'>Quản lý sản phẩm</h1>
          <p className='text-muted-foreground'>Thêm, sửa, xóa các sản phẩm trong cửa hàng.</p>
        </div>
        <Button variant='gold' onClick={() => handleOpenDialog()}>
          <Plus className='w-4 h-4 mr-2' />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-4 mb-6'>
        <div className='relative flex-1 min-w-50 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm sản phẩm...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className='w-45'>
            <SelectValue placeholder='Danh mục' />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      ) : (
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {filteredProducts.map((product) => (
            <Card key={product.id} className='bg-card/50 border-border/50 overflow-hidden group'>
              <div className='aspect-square relative overflow-hidden'>
                <img
                  src={product.image || 'https://placehold.co/400x400?text=No+Image'}
                  alt={product.name}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform'
                />
              </div>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Star className='w-4 h-4 fill-primary text-primary' />
                  <span className='text-sm'>{product.rating}</span>
                  <span className='text-xs text-muted-foreground'>({product.reviews})</span>
                </div>
                <h3 className='font-display font-semibold mb-1 line-clamp-1'>{product.name}</h3>
                <p className='text-sm text-muted-foreground line-clamp-1 mb-2'>{product.description}</p>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-primary font-semibold'>{formatPrice(product.price)}</span>
                </div>
                <div className='flex items-center gap-1 text-sm text-muted-foreground mb-4'>
                  <Package className='w-4 h-4' />
                  Kho: {product.stock}
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm' className='flex-1' onClick={() => handleOpenDialog(product)}>
                    <Pencil className='w-4 h-4 mr-1' />
                    Sửa
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-destructive hover:bg-destructive hover:text-destructive-foreground'
                    onClick={() => {
                      setDeletingProduct(product)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4 max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50'>
            <div>
              <Label>Tên sản phẩm *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='VD: Volcanic Clay Gatsby'
              />
            </div>
            <div>
              <Label>Danh mục *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder='Chọn danh mục' />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions
                    .filter((c) => c.id !== 'all')
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Giá bán (VNĐ) *</Label>
                <Input
                  type='number'
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder='280000'
                />
              </div>
              <div>
                <Label>Số lượng trong kho *</Label>
                <Input
                  type='number'
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder='50'
                />
              </div>
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder='Mô tả chi tiết sản phẩm...'
                rows={3}
              />
            </div>
            <div>
              <Label>Hình ảnh</Label>
              <ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost'>Hủy</Button>
            </DialogClose>
            <Button variant='gold' onClick={handleSubmit}>
              {editingProduct ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className='text-muted-foreground'>
            Bạn có chắc chắn muốn xóa sản phẩm "{deletingProduct?.name}"? Hành động này không thể hoàn tác.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost'>Hủy</Button>
            </DialogClose>
            <Button variant='destructive' onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminProducts
