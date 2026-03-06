import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

export const revalidate = 0

export default async function GalleryPage() {
    const supabase = createClient()
    const { data: images } = await supabase.from('product_images').select('image_url, products(name)')

    return (
        <div className="container mx-auto px-4 py-16 flex-1 bg-background mt-10">
            <h1 className="text-4xl font-bold mb-8 text-center text-foreground">Our Gallery</h1>
            <p className="text-center text-muted-foreground mb-12 text-lg">
                Explore our curated collection of fine rattan materials and exquisite furniture.
            </p>

            {!images || images.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
                    <p className="text-muted-foreground">No images in the gallery yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {images.map((img, i) => (
                        <Card key={i} className="overflow-hidden border-border shadow-sm hover:shadow-md transition-all">
                            <div className="aspect-square bg-muted relative">
                                <img src={img.image_url} alt={(img.products as any)?.name || 'Gallery image'} className="object-cover w-full h-full" />
                            </div>
                            <CardContent className="p-4">
                                <p className="font-medium text-center">{(img.products as any)?.name}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
