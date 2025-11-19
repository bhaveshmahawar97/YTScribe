import { Course } from '../models/courseModel.js';

export async function createCourse(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { title, description, category, price, thumbnailUrl, level, isPublished = true, videos = [] } = req.body || {};
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const course = await Course.create({
      title,
      description: description || '',
      category: category || '',
      price: typeof price === 'number' ? price : parseFloat(price) || 0,
      thumbnailUrl: thumbnailUrl || '',
      creator: userId,
      level: level || '',
      isPublished: !!isPublished,
      videos: Array.isArray(videos) ? videos : [],
    });

    return res.status(201).json({ success: true, course });
  } catch (err) {
    next(err);
  }
}

export async function getMarketplaceCourses(req, res, next) {
  try {
    const courses = await Course.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .populate('creator', 'name');

    const data = courses.map((c) => ({
      _id: c._id,
      title: c.title,
      description: c.description,
      category: c.category,
      price: c.price,
      thumbnailUrl: c.thumbnailUrl,
      creatorName: c.creator?.name || 'Creator',
      level: c.level || 'Beginner',
      students: 0,
      rating: 4.8,
      reviews: 0,
      duration: c.videos?.length ? `${c.videos.length} lessons` : 'Self-paced',
    }));

    return res.json({ success: true, courses: data });
  } catch (err) {
    next(err);
  }
}

export async function getAllCourses(req, res, next) {
  try {
    const courses = await Course.find({})
      .sort({ createdAt: -1 })
      .populate('creator', 'name');

    const data = courses.map((c) => ({
      _id: c._id,
      title: c.title,
      description: c.description,
      category: c.category,
      price: c.price,
      thumbnailUrl: c.thumbnailUrl,
      creatorName: c.creator?.name || 'Creator',
      level: c.level || 'Beginner',
      students: 0,
      rating: 4.8,
      reviews: 0,
      duration: c.videos?.length ? `${c.videos.length} lessons` : 'Self-paced',
    }));

    return res.json({ success: true, courses: data });
  } catch (err) {
    next(err);
  }
}
