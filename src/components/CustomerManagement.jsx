import { useState, useEffect } from 'react';
import { 
  Typography, 
  Container,
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Paper,
  Button
} from '@mui/material';
import { rtdb, db } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { collection, getDocs } from 'firebase/firestore';

const ProductList = ({ products }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Sản phẩm đang chọn
      </Typography>
      {Object.entries(products).map(([productId, product]) => (
        <Card key={productId} sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <CardMedia
                component="img"
                height="140"
                image={product.productImage}
                alt={product.name}
                sx={{ objectFit: 'cover', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <CardContent>
                <Typography variant="h6">
                  {product.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Giá: {product.price.toLocaleString('vi-VN')} đ
                </Typography>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      ))}
    </Box>
  );
};

function CustomerManagement() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rtdbData, setRtdbData] = useState(null);

  useEffect(() => {
    const activeUsersRef = ref(rtdb, '/');
    
    const unsubscribe = onValue(activeUsersRef, async (snapshot) => {
      const data = snapshot.val();
      setRtdbData(data);
      console.log("Realtime Database data:", data);
      
      if (data) {
        try {
          const userids = Object.keys(data);
          console.log("Found userids:", userids);
          
          // Lấy tất cả documents trong collection user
          const querySnapshot = await getDocs(collection(db, 'user'));
          const usersData = [];
          
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            // Kiểm tra nếu userid từ realtime database tồn tại trong documents
            const matchingUserid = userids.find(id => userData.userid === id);
            
            if (matchingUserid) {
              usersData.push({
                userid: matchingUserid,
                name: userData.name,
                userImage: userData.userimage,
                sotien: userData.sotien,
                status: data[matchingUserid].status,
                timestamp: data[matchingUserid].timestamp,
                quantity: data[matchingUserid].quantity,
                totalprice: data[matchingUserid].totalprice,
                isChecked: data[matchingUserid].isChecked
              });
            }
          });
          
          console.log("Final users data:", usersData);
          setActiveUsers(usersData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setActiveUsers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, backgroundColor: 'transparent' }}>
        <Typography variant="h4" gutterBottom>
          Người mua hàng đang hoạt động
        </Typography>
        
        {activeUsers.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Chưa có người dùng nào đang hoạt động
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {activeUsers.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.userid}>
                <Card>
                  <CardActionArea onClick={() => {
                    setSelectedUser(user);
                    setOpenDialog(true);
                  }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={user.userImage}
                      alt={user.name}
                    />
                    <CardContent>
                      <Typography variant="h6">
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {user.userid}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog 
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Chi tiết người mua hàng
          </DialogTitle>
          <DialogContent>
            {selectedUser && rtdbData && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <img
                      src={selectedUser.userImage}
                      alt={selectedUser.name}
                      style={{
                        width: '100%',
                        borderRadius: '8px'
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="h6" gutterBottom>
                      {selectedUser.name}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      ID: {selectedUser.userid}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Trạng thái: {' '}
                      <span style={{ 
                        color: rtdbData[selectedUser.userid].isBuying ? '#f44336' : '#4caf50' 
                      }}>
                        {rtdbData[selectedUser.userid].isBuying ? 
                          'Người dùng đang mua hàng' : 
                          'Người dùng đã hoàn thành mua hàng, sẵn sàng Recheck'}
                      </span>
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Trạng thái thanh toán: {' '}
                      <span style={{ 
                        color: rtdbData[selectedUser.userid].isPaid ? '#4caf50' : '#f44336' 
                      }}>
                        {rtdbData[selectedUser.userid].isPaid ? 
                          'Người dùng đã hoàn thành thanh toán' : 
                          'Chưa thanh toán'}
                      </span>
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Số lượng: {rtdbData[selectedUser.userid].quantity}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Tổng tiền: {rtdbData[selectedUser.userid].totalprice.toLocaleString('vi-VN')} đ
                    </Typography>
                    <Button 
                      variant="contained"
                      disabled={rtdbData[selectedUser.userid].isBuying}
                      onClick={() => {
                        const userRef = ref(rtdb, `${selectedUser.userid}`);
                        update(userRef, {
                          isChecked: true
                        });
                      }}
                      sx={{ mt: 2 }}
                    >
                      Recheck
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    {rtdbData[selectedUser.userid].products && (
                      <ProductList products={rtdbData[selectedUser.userid].products} />
                    )}
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Paper>
    </Container>
  );
}

export default CustomerManagement;