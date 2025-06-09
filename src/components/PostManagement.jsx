import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fab,
  Chip
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Add as AddIcon,
  Visibility as VisibilityIcon 
} from '@mui/icons-material';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    date: ''
  });

  // Lấy danh sách bài viết từ Firebase
  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'post'));
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sắp xếp theo ngày mới nhất
      postsData.sort((a, b) => {
        const dateA = a.date?.toDate?.() || new Date(a.date) || new Date(0);
        const dateB = b.date?.toDate?.() || new Date(b.date) || new Date(0);
        return dateB - dateA;
      });
      setPosts(postsData);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu bài viết:', error);
      showSnackbar('Lỗi lấy dữ liệu bài viết', 'error');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (date) => {
    if (!date) return 'Chưa có ngày';
    
    let dateObj;
    if (date.toDate) {
      // Firestore Timestamp
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    
    return dateObj.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleOpenDialog = (post = null) => {
    if (post) {
      setEditingPost(post);
      const dateString = post.date ? 
        formatDateForInput(post.date.toDate ? post.date.toDate() : new Date(post.date)) : 
        getCurrentDateTimeString();
      
      setFormData({
        title: post.title || '',
        content: post.content || '',
        imageUrl: post.imageUrl || '',
        date: dateString
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        content: '',
        imageUrl: '',
        date: getCurrentDateTimeString()
      });
    }
    setOpenDialog(true);
  };

  const formatDateForInput = (date) => {
    if (!date) return getCurrentDateTimeString();
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      imageUrl: '',
      date: getCurrentDateTimeString()
    });
  };

  const handleOpenViewDialog = (post) => {
    setViewingPost(post);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingPost(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title.trim()) {
        showSnackbar('Vui lòng nhập tiêu đề bài viết', 'error');
        return;
      }
      if (!formData.content.trim()) {
        showSnackbar('Vui lòng nhập nội dung bài viết', 'error');
        return;
      }

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl.trim(),
        date: Timestamp.fromDate(new Date(formData.date))
      };

      if (editingPost) {
        // Cập nhật bài viết
        await updateDoc(doc(db, 'post', editingPost.id), postData);
        showSnackbar('Cập nhật bài viết thành công!');
      } else {
        // Thêm bài viết mới
        await addDoc(collection(db, 'post'), postData);
        showSnackbar('Thêm bài viết mới thành công!');
      }
      fetchPosts();
      handleCloseDialog();
    } catch (error) {
      console.error('Lỗi lưu bài viết:', error);
      showSnackbar('Lỗi lưu bài viết', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await deleteDoc(doc(db, 'post', postId));
        showSnackbar('Xóa bài viết thành công!');
        fetchPosts();
      } catch (error) {
        console.error('Lỗi xóa bài viết:', error);
        showSnackbar('Lỗi xóa bài viết', 'error');
      }
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Bài viết
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Tiêu đề</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Hình ảnh</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 300 }}>Nội dung</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Ngày đăng</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', minWidth: 150 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Chưa có bài viết nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id} hover>
                    <TableCell>
                      <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                        {post.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {truncateText(post.title, 50)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt="Post"
                          style={{
                            width: 80,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 4
                          }}
                        />
                      ) : (
                        <Chip label="Không có ảnh" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {truncateText(post.content, 100)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(post.date)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        onClick={() => handleOpenViewDialog(post)} 
                        color="info"
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleOpenDialog(post)} 
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeletePost(post.id)} 
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Floating Action Button để thêm bài viết */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Dialog cho thêm/sửa bài viết */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPost ? 'Chỉnh sửa Bài viết' : 'Thêm Bài viết mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu đề"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày đăng"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleInputChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="URL Hình ảnh"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                helperText="Nhập URL của hình ảnh bài viết (tùy chọn)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nội dung"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                multiline
                rows={6}
                helperText="Nhập nội dung bài viết"
              />
            </Grid>
            {formData.imageUrl && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Xem trước hình ảnh:
                </Typography>
                <Card sx={{ maxWidth: 400, mx: 'auto' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={formData.imageUrl}
                    alt="Preview"
                    sx={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </Card>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPost ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xem chi tiết bài viết */}
      <Dialog 
        open={openViewDialog} 
        onClose={handleCloseViewDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Chi tiết Bài viết</DialogTitle>
        <DialogContent>
          {viewingPost && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  ID: {viewingPost.id}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  {viewingPost.title}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  📅 {formatDate(viewingPost.date)}
                </Typography>
              </Grid>
              {viewingPost.imageUrl && (
                <Grid item xs={12}>
                  <Card>
                    <CardMedia
                      component="img"
                      image={viewingPost.imageUrl}
                      alt="Post image"
                      sx={{ maxHeight: 400, objectFit: 'contain' }}
                    />
                  </Card>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {viewingPost.content}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Đóng</Button>
          <Button 
            onClick={() => {
              handleCloseViewDialog();
              handleOpenDialog(viewingPost);
            }} 
            variant="contained"
          >
            Chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PostManagement; 