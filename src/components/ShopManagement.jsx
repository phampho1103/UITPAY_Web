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
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ShopManagement = () => {
  const [shops, setShops] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    imageUrl: '',
    mapUrl: ''
  });

  // Lấy danh sách shop từ Firebase
  const fetchShops = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'shop'));
      const shopsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setShops(shopsData);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu shop:', error);
      showSnackbar('Lỗi lấy dữ liệu shop', 'error');
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenDialog = (shop = null) => {
    if (shop) {
      setEditingShop(shop);
      setFormData({
        name: shop.name || '',
        address: shop.address || '',
        imageUrl: shop.imageUrl || '',
        mapUrl: shop.mapUrl || ''
      });
    } else {
      setEditingShop(null);
      setFormData({
        name: '',
        address: '',
        imageUrl: '',
        mapUrl: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingShop(null);
    setFormData({
      name: '',
      address: '',
      imageUrl: '',
      mapUrl: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingShop) {
        // Cập nhật shop
        await updateDoc(doc(db, 'shop', editingShop.id), formData);
        showSnackbar('Cập nhật shop thành công!');
      } else {
        // Thêm shop mới
        await addDoc(collection(db, 'shop'), formData);
        showSnackbar('Thêm shop mới thành công!');
      }
      fetchShops();
      handleCloseDialog();
    } catch (error) {
      console.error('Lỗi lưu shop:', error);
      showSnackbar('Lỗi lưu shop', 'error');
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa shop này?')) {
      try {
        await deleteDoc(doc(db, 'shop', shopId));
        showSnackbar('Xóa shop thành công!');
        fetchShops();
      } catch (error) {
        console.error('Lỗi xóa shop:', error);
        showSnackbar('Lỗi xóa shop', 'error');
      }
    }
  };

  const ShopList = () => (
    <Grid container spacing={3}>
      {shops.map((shop) => (
        <Grid item xs={12} sm={6} md={4} key={shop.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {shop.imageUrl && (
              <CardMedia
                component="img"
                height="200"
                image={shop.imageUrl}
                alt={shop.name}
                sx={{ objectFit: 'cover' }}
              />
            )}
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {shop.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                📍 {shop.address}
              </Typography>
              {shop.mapUrl && (
                <Typography variant="body2" color="primary" gutterBottom>
                  <a href={shop.mapUrl} target="_blank" rel="noopener noreferrer">
                    Xem trên bản đồ
                  </a>
                </Typography>
              )}
            </CardContent>
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <IconButton onClick={() => handleOpenDialog(shop)} color="primary">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDeleteShop(shop.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const AddShopForm = () => (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Thêm Shop Mới
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tên Shop"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Địa chỉ"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="URL Hình ảnh"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              helperText="Nhập URL của hình ảnh shop"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="URL Bản đồ"
              name="mapUrl"
              value={formData.mapUrl}
              onChange={handleInputChange}
              helperText="Nhập URL Google Maps hoặc bản đồ khác"
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<AddIcon />}
              sx={{ mr: 1 }}
            >
              Thêm Shop
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Shop
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Danh sách Shop" />
          <Tab label="Thêm Shop mới" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 2 }}>
        {selectedTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Danh sách Shop ({shops.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setSelectedTab(1)}
              >
                Thêm Shop
              </Button>
            </Box>
            <ShopList />
          </Box>
        )}
        {selectedTab === 1 && <AddShopForm />}
      </Box>

      {/* Dialog cho edit shop */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingShop ? 'Chỉnh sửa Shop' : 'Thêm Shop mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên Shop"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL Hình ảnh"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                helperText="Nhập URL của hình ảnh shop"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL Bản đồ"
                name="mapUrl"
                value={formData.mapUrl}
                onChange={handleInputChange}
                helperText="Nhập URL Google Maps hoặc bản đồ khác"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingShop ? 'Cập nhật' : 'Thêm'}
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

export default ShopManagement; 