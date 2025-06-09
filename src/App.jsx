import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import ProductManagement from './components/ProductManagement';
import CustomerManagement from './components/CustomerManagement';
import ShopManagement from './components/ShopManagement';
import BannerManagement from './components/BannerManagement';
import PostManagement from './components/PostManagement';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Quản lý cửa hàng
          </Typography>
          <Button color="inherit" component={Link} to="/products">
            Quản lý sản phẩm
          </Button>
          <Button color="inherit" component={Link} to="/customers">
            Quản lý người mua
          </Button>
          <Button color="inherit" component={Link} to="/shops">
            Quản lý Shop
          </Button>
          <Button color="inherit" component={Link} to="/banners">
            Quản lý Banner
          </Button>
          <Button color="inherit" component={Link} to="/posts">
            Quản lý Bài viết
          </Button>
        </Toolbar>
      </AppBar>


      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/shops" element={<ShopManagement />} />
          <Route path="/banners" element={<BannerManagement />} />
          <Route path="/posts" element={<PostManagement />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;