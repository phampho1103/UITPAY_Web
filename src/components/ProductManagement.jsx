import { useState, useEffect } from 'react';
import { 
  Typography, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField
} from '@mui/material';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  setDoc,
  doc, 
  deleteDoc,
  query,
  onSnapshot
} from 'firebase/firestore';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productid: '',
    name: '',
    price: '',
    productImage: '',
    origin: '',
    description: ''
  });
  const [rtdbData, setRtdbData] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'product'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsArray = [];
      querySnapshot.forEach((doc) => {
        productsArray.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsArray);
    });

    return () => unsubscribe();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const productRef = doc(db, 'product', newProduct.productid);
      await setDoc(productRef, {
        ...newProduct,
        price: Number(newProduct.price)
      });
      handleClose();
      setNewProduct({
        productid: '',
        name: '',
        price: '',
        productImage: '',
        origin: '',
        description: ''
      });
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'product', id));
    } catch (error) {
      console.error("Error deleting product: ", error);
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Quản lý sản phẩm
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Thêm sản phẩm
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Xuất xứ</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.productid}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.price?.toLocaleString('vi-VN')} VNĐ</TableCell>
                <TableCell>{product.origin}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>
                  <img 
                    src={product.productImage} 
                    alt={product.name} 
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" color="primary">Sửa</Button>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => handleDelete(product.id)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm sản phẩm mới</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="productid"
              label="ID sản phẩm"
              value={newProduct.productid}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="name"
              label="Tên sản phẩm"
              value={newProduct.name}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="price"
              label="Giá"
              type="number"
              value={newProduct.price}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="origin"
              label="Xuất xứ"
              value={newProduct.origin}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="productImage"
              label="URL hình ảnh"
              value={newProduct.productImage}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="description"
              label="Mô tả"
              value={newProduct.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">Thêm</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ProductManagement; 