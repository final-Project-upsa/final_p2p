import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Switch } from 'react-router-dom';
import LandingPage from './containers/LandingPage';
import MarketplacePage from './containers/MarketplacePage';
import ViewProductPage from './containers/ViewProduct';
import NavBar from './components/NavBar';
import ResetPassword from './containers/auth_containers/ResetPassword';
import ResetPasswordConfirm from './containers/auth_containers/ResetPasswordConfirm';
import Activate from './containers/auth_containers/Activate';
import ActivateSuccess from './containers/auth_containers/ActivateSuccess'
import LoginPage from './containers/auth_containers/Login';
import SignUp from './containers/auth_containers/SignUp';
import SellerRegistration from './components/SellerRegister';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './containers/Dashboard_Components/DashboardLayout';
import SellerDashboard from './containers/Dashboard_Components/SellerDashboard';
import ProductsTab from './containers/Dashboard_Components/Products_Tab/ProductsTab';
import AddProduct from './containers/Dashboard_Components/Products_Tab/AddProducts';
import EditProduct from './containers/Dashboard_Components/Products_Tab/EditProduct';
import UserProfile from './containers/UserProfile';
import './index.css';
import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './actions/auth';
import Footer from './components/FooterSide';
import ChatRoom from './containers/Chat_components/ChatRoom';
import Inbox from './containers/Inbox';



  const App = () => {
    useEffect(() => {
      store.dispatch(loadUser());
    }, []);
    return (
      <Provider store={store}>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/marketplace" element={
              <>
                <NavBar />
                <MarketplacePage />
              </>
            } />

            <Route 
              path="/enroll_seller" 
              element={
                <ProtectedRoute>
                  <NavBar /> 
                  <SellerRegistration />
                  <Footer />
                </ProtectedRoute>
              } 
            />
            <Route path="/product/:id" element={<ViewProductPage />} /> 
            <Route exact path='/reset-password' Component={ResetPassword}/>
            <Route exact path='/password/reset/confirm/:uid/:token' Component={ResetPasswordConfirm}/>
            <Route exact path='/activate' Component={Activate}/>
            <Route exact path='/activate/:uid/:token' Component={ActivateSuccess}/>
            <Route exact path='/auth/user' Component={LoginPage} />
            <Route exact path='/signup' Component={SignUp} />
            {/* <Route exact path='/chatroom/:id' Component={ChatRoom} /> */}
            <Route 
              path="/chatroom/:id" 
              element={
                <ProtectedRoute>
                  <NavBar />
                  <ChatRoom />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inbox" 
              element={
                <ProtectedRoute>
                  <NavBar />
                  <Inbox />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/userprofile" 
              element={
                <ProtectedRoute>
                  <NavBar />
                  <UserProfile />
                  <Footer />
                </ProtectedRoute>
              } 
            />
            <Route path="/dashboard/*" element={<DashboardLayout>
              <Routes>
                <Route index element={<SellerDashboard />} />
                <Route path="products" element={<ProductsTab />} />
                <Route path="products/addproduct" element={<AddProduct />} />
                <Route path="/products/edit/:productId" element={<EditProduct />} />
              </Routes>
            </DashboardLayout>} />

          </Routes>
        </Router>
      </Provider>
    );
  };

  export default App;