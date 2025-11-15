import { motion } from 'motion/react';
import { ShoppingCart, Star, Filter, Search, TrendingUp, Award, Crown, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

interface Course {
  id: number;
  title: string;
  description: string;
  creator: string;
  thumbnail: string;
  price: number;
  rating: number;
  reviews: number;
  students: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  bestseller?: boolean;
}

export function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const courses: Course[] = [
    {
      id: 1,
      title: 'Complete Web Development Bootcamp 2024',
      description: 'Master HTML, CSS, JavaScript, React, Node.js and build real-world projects',
      creator: 'Jane Smith',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
      price: 1499,
      rating: 4.8,
      reviews: 2341,
      students: 15420,
      duration: '42 hours',
      level: 'Beginner',
      category: 'Programming',
      bestseller: true,
    },
    {
      id: 2,
      title: 'React Advanced Patterns & Best Practices',
      description: 'Deep dive into advanced React concepts, hooks, performance optimization',
      creator: 'John Doe',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
      price: 1999,
      rating: 4.9,
      reviews: 1823,
      students: 8950,
      duration: '28 hours',
      level: 'Advanced',
      category: 'Programming',
      bestseller: true,
    },
    {
      id: 3,
      title: 'UI/UX Design Masterclass',
      description: 'Learn Figma, design thinking, user research, prototyping and more',
      creator: 'Sarah Wilson',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600',
      price: 1299,
      rating: 4.7,
      reviews: 1456,
      students: 12340,
      duration: '35 hours',
      level: 'Intermediate',
      category: 'Design',
    },
    {
      id: 4,
      title: 'Python for Data Science & Machine Learning',
      description: 'Complete Python course with NumPy, Pandas, Matplotlib, Scikit-learn',
      creator: 'Michael Chen',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
      price: 1799,
      rating: 4.8,
      reviews: 2890,
      students: 18760,
      duration: '50 hours',
      level: 'Intermediate',
      category: 'Data Science',
      bestseller: true,
    },
    {
      id: 5,
      title: 'Digital Marketing Complete Course',
      description: 'SEO, Social Media, Email Marketing, Content Marketing & Analytics',
      creator: 'Emma Davis',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
      price: 999,
      rating: 4.6,
      reviews: 987,
      students: 6543,
      duration: '24 hours',
      level: 'Beginner',
      category: 'Marketing',
    },
    {
      id: 6,
      title: 'Mobile App Development with Flutter',
      description: 'Build iOS and Android apps with Flutter & Dart from scratch',
      creator: 'David Kumar',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600',
      price: 1699,
      rating: 4.7,
      reviews: 1234,
      students: 9876,
      duration: '38 hours',
      level: 'Intermediate',
      category: 'Programming',
    },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || course.category === category;
    return matchesSearch && matchesCategory;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'popular') return b.students - a.students;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });

  const handleBuyNow = (course: Course) => {
    setSelectedCourse(course);
    // Simulate Stripe checkout
    toast.success(`Redirecting to Stripe checkout for "${course.title}"`);
    console.log('Stripe checkout:', course);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Course Marketplace
              </span>
            </h1>
            <p className="text-muted-foreground">Discover and purchase courses from expert creators</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="p-6 border-primary/20">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Programming">Programming</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <TrendingUp className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </motion.div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {sortedCourses.length} {sortedCourses.length === 1 ? 'course' : 'courses'}
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {sortedCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
          >
            <Card className="h-full overflow-hidden border-primary/20 hover:border-primary/50 transition-all bg-gradient-to-br from-card to-primary/5 group">
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  {course.bestseller && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                      <Award className="w-3 h-3 mr-1" />
                      Bestseller
                    </Badge>
                  )}
                  <Badge variant="secondary" className="ml-auto bg-white/20 backdrop-blur-sm text-white border-0">
                    {course.level}
                  </Badge>
                </div>

                {/* Duration */}
                <div className="absolute bottom-3 left-3">
                  <Badge variant="secondary" className="bg-black/40 backdrop-blur-sm text-white border-0">
                    {course.duration}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">{course.category}</Badge>
                </div>

                <h3 className="text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                  <span>by {course.creator}</span>
                </div>

                {/* Rating & Students */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span>{course.rating}</span>
                    <span className="text-muted-foreground">({course.reviews})</span>
                  </div>
                  <span className="text-muted-foreground">{course.students.toLocaleString()} students</span>
                </div>

                {/* Price & Buy Button */}
                <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                  <div>
                    <p className="text-2xl">₹{course.price}</p>
                  </div>
                  <Button
                    onClick={() => handleBuyNow(course)}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {sortedCourses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <ShoppingCart className="w-20 h-20 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl mb-2 text-muted-foreground">No courses found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filters
          </p>
        </motion.div>
      )}

      {/* Featured Banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-8 border-primary/20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <Crown className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl mb-4">Become a Creator</h2>
            <p className="text-muted-foreground mb-6">
              Share your knowledge and earn by creating courses. Join thousands of creators on our platform.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-gradient-to-r from-primary to-accent text-white">
                Start Teaching
              </Button>
              <Button variant="outline">Learn More</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
