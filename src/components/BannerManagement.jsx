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
  Fab
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Add as AddIcon,
  Visibility as VisibilityIcon 
} from '@mui/icons-material';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [viewingBanner, setViewingBanner] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    imageUrl: ''
  });

  // Lấy danh sách banner từ Firebase
  const fetchBanners = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'banner'));
      const bannersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBanners(bannersData);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu banner:', error);
      showSnackbar('Lỗi lấy dữ liệu banner', 'error');
    }
  };

  useEffect(() => {
    fetchBanners();
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

  const handleOpenDialog = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        imageUrl: banner.imageUrl || ''
      });
    } else {
      setEditingBanner(null);
      setFormData({
        imageUrl: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBanner(null);
    setFormData({
      imageUrl: ''
    });
  };

  const handleOpenViewDialog = (banner) => {
    setViewingBanner(banner);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingBanner(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.imageUrl.trim()) {
        showSnackbar('Vui lòng nhập URL hình ảnh', 'error');
        return;
      }

      if (editingBanner) {
        // Cập nhật banner
        await updateDoc(doc(db, 'banner', editingBanner.id), formData);
        showSnackbar('Cập nhật banner thành công!');
      } else {
        // Thêm banner mới
        await addDoc(collection(db, 'banner'), formData);
        showSnackbar('Thêm banner mới thành công!');
      }
      fetchBanners();
      handleCloseDialog();
    } catch (error) {
      console.error('Lỗi lưu banner:', error);
      showSnackbar('Lỗi lưu banner', 'error');
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      try {
        await deleteDoc(doc(db, 'banner', bannerId));
        showSnackbar('Xóa banner thành công!');
        fetchBanners();
      } catch (error) {
        console.error('Lỗi xóa banner:', error);
        showSnackbar('Lỗi xóa banner', 'error');
      }
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Banner
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Hình ảnh</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>URL Hình ảnh</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Chưa có banner nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id} hover>
                    <TableCell>{banner.id}</TableCell>
                    <TableCell>
                      {banner.imageUrl && (
                        <img
                          src={banner.imageUrl}
                          alt="Banner"
                          style={{
                            width: 80,
                            height: 50,
                            objectFit: 'cover',
                            borderRadius: 4
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 300, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {banner.imageUrl}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        onClick={() => handleOpenViewDialog(banner)} 
                        color="info"
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleOpenDialog(banner)} 
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteBanner(banner.id)} 
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

      {/* Floating Action Button để thêm banner */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Dialog cho thêm/sửa banner */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL Hình ảnh"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                required
                helperText="Nhập URL của hình ảnh banner"
                multiline
                rows={2}
              />
            </Grid>
            {formData.imageUrl && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Xem trước:
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
            {editingBanner ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xem chi tiết banner */}
      <Dialog 
        open={openViewDialog} 
        onClose={handleCloseViewDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Chi tiết Banner</DialogTitle>
        <DialogContent>
          {viewingBanner && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  ID: {viewingBanner.id}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  URL Hình ảnh:
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ wordBreak: 'break-all' }}>
                  {viewingBanner.imageUrl}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Hình ảnh:
                </Typography>
                <Card>
                  <CardMedia
                    component="img"
                    image={viewingBanner.imageUrl}
                    alt="Banner"
                    sx={{ maxHeight: 400, objectFit: 'contain' }}
                  />
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Đóng</Button>
          <Button 
            onClick={() => {
              handleCloseViewDialog();
              handleOpenDialog(viewingBanner);
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

export default BannerManagement; 