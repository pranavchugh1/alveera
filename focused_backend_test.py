import requests
import json
from datetime import datetime

class FocusedAPITester:
    def __init__(self, base_url="https://admin-auth-optim.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.test_results = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        result = {
            "test": test_name,
            "status": "PASS" if success else "FAIL",
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {test_name}: {details}")
        return success

    def test_admin_authentication(self):
        """Test admin authentication as specified in review request"""
        print("\n🔍 Testing Admin Authentication...")
        
        # 1. POST /api/admin/login with admin@alveera.com / Admin123! - should return JWT token
        login_data = {
            "email": "admin@alveera.com",
            "password": "Admin123!"
        }
        
        try:
            response = requests.post(f"{self.api_url}/admin/login", json=login_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data:
                    self.admin_token = data['access_token']
                    self.log_result("Admin Login", True, f"JWT token received, admin: {data.get('admin', {}).get('email', 'N/A')}")
                else:
                    self.log_result("Admin Login", False, "No access_token in response")
                    return False
            else:
                self.log_result("Admin Login", False, f"Status: {response.status_code}, Error: {response.text}")
                return False
        except Exception as e:
            self.log_result("Admin Login", False, f"Exception: {str(e)}")
            return False

        # 2. GET /api/admin/me with Bearer token - should return admin profile
        if self.admin_token:
            try:
                headers = {'Authorization': f'Bearer {self.admin_token}'}
                response = requests.get(f"{self.api_url}/admin/me", headers=headers, timeout=10)
                if response.status_code == 200:
                    profile = response.json()
                    required_fields = ['id', 'email', 'full_name']
                    missing = [f for f in required_fields if f not in profile]
                    if not missing:
                        self.log_result("Admin Profile", True, f"Profile retrieved: {profile.get('email')}")
                    else:
                        self.log_result("Admin Profile", False, f"Missing fields: {missing}")
                else:
                    self.log_result("Admin Profile", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("Admin Profile", False, f"Exception: {str(e)}")

        # 3. Test invalid credentials - should return 401
        invalid_login = {
            "email": "admin@alveera.com",
            "password": "WrongPassword"
        }
        
        try:
            response = requests.post(f"{self.api_url}/admin/login", json=invalid_login, timeout=10)
            expected_status = response.status_code in [401, 403]  # Either is acceptable for invalid creds
            self.log_result("Invalid Credentials", expected_status, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Invalid Credentials", False, f"Exception: {str(e)}")

        return self.admin_token is not None

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        print("\n🔍 Testing Admin Stats...")
        
        if not self.admin_token:
            self.log_result("Admin Stats", False, "No admin token available")
            return

        # GET /api/admin/stats with Bearer token - should return dashboard stats
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            response = requests.get(f"{self.api_url}/admin/stats", headers=headers, timeout=10)
            
            if response.status_code == 200:
                stats = response.json()
                required_fields = ['total_revenue', 'total_orders', 'total_products', 'pending_orders', 'recent_orders']
                missing = [f for f in required_fields if f not in stats]
                
                if not missing:
                    self.log_result("Admin Stats", True, 
                        f"Revenue: {stats['total_revenue']}, Orders: {stats['total_orders']}, Products: {stats['total_products']}")
                else:
                    self.log_result("Admin Stats", False, f"Missing fields: {missing}")
            else:
                self.log_result("Admin Stats", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Admin Stats", False, f"Exception: {str(e)}")

    def test_protected_product_crud(self):
        """Test protected product CRUD operations"""
        print("\n🔍 Testing Protected Product CRUD...")
        
        if not self.admin_token:
            self.log_result("Protected CRUD", False, "No admin token available")
            return None

        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Create a test product
        test_product = {
            "design_no": "ADMIN_TEST_001",
            "name": "Admin Test Saree",
            "description": "Beautiful test saree created by admin for testing purposes",
            "price": 4999.99,
            "material": "Pure Silk",
            "color": "Royal Blue",
            "image_url": "https://example.com/admin-test-saree.jpg",
            "category": "festive"
        }
        
        product_id = None
        
        # POST /api/products with Bearer token - create a new product
        try:
            response = requests.post(f"{self.api_url}/products", json=test_product, headers=headers, timeout=10)
            if response.status_code == 200:
                product = response.json()
                product_id = product.get('id')
                self.log_result("Create Product (Auth)", True, f"Product created: {product_id[:8]}...")
            else:
                self.log_result("Create Product (Auth)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Create Product (Auth)", False, f"Exception: {str(e)}")

        # Test without token - should return 401/403
        try:
            response = requests.post(f"{self.api_url}/products", json=test_product, timeout=10)
            expected = response.status_code in [401, 403]
            self.log_result("Create Product (No Auth)", expected, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Create Product (No Auth)", False, f"Exception: {str(e)}")

        if product_id:
            # PUT /api/products/{id} with Bearer token - update a product
            update_data = {
                "name": "Updated Admin Test Saree",
                "price": 5999.99,
                "color": "Deep Royal Blue"
            }
            
            try:
                response = requests.put(f"{self.api_url}/products/{product_id}", json=update_data, headers=headers, timeout=10)
                if response.status_code == 200:
                    self.log_result("Update Product (Auth)", True, f"Product updated: {product_id[:8]}...")
                else:
                    self.log_result("Update Product (Auth)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("Update Product (Auth)", False, f"Exception: {str(e)}")

            # Test update without token
            try:
                response = requests.put(f"{self.api_url}/products/{product_id}", json=update_data, timeout=10)
                expected = response.status_code in [401, 403]
                self.log_result("Update Product (No Auth)", expected, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("Update Product (No Auth)", False, f"Exception: {str(e)}")

            # DELETE /api/products/{id} with Bearer token - delete a product
            try:
                response = requests.delete(f"{self.api_url}/products/{product_id}", headers=headers, timeout=10)
                if response.status_code == 200:
                    self.log_result("Delete Product (Auth)", True, f"Product deleted: {product_id[:8]}...")
                else:
                    self.log_result("Delete Product (Auth)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("Delete Product (Auth)", False, f"Exception: {str(e)}")

        # Test delete without token
        try:
            response = requests.delete(f"{self.api_url}/products/dummy-id", timeout=10)
            expected = response.status_code in [401, 403]
            self.log_result("Delete Product (No Auth)", expected, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Delete Product (No Auth)", False, f"Exception: {str(e)}")

        return product_id

    def test_order_management(self):
        """Test order management functionality"""
        print("\n🔍 Testing Order Management...")
        
        if not self.admin_token:
            self.log_result("Order Management", False, "No admin token available")
            return

        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # First, create a product to use in order
        test_product = {
            "design_no": "ORDER_TEST_001",
            "name": "Order Test Saree",
            "description": "Test saree for order testing",
            "price": 2999.99,
            "material": "Cotton Silk",
            "color": "Emerald Green",
            "image_url": "https://example.com/order-test-saree.jpg",
            "category": "new-arrivals"
        }
        
        try:
            response = requests.post(f"{self.api_url}/products", json=test_product, headers=headers, timeout=10)
            if response.status_code != 200:
                self.log_result("Order Management Setup", False, "Could not create test product")
                return
            
            product = response.json()
            product_id = product['id']
            
            # POST /api/orders - create order (should snapshot product details)
            order_data = {
                "customer_name": "Priya Sharma",
                "customer_email": "priya.sharma@example.com",
                "customer_phone": "+91-9876543210",
                "items": [
                    {
                        "product_id": product_id,
                        "quantity": 2
                    }
                ],
                "total": 5999.98,
                "payment_method": "razorpay"
            }
            
            response = requests.post(f"{self.api_url}/orders", json=order_data, timeout=10)
            if response.status_code == 200:
                order = response.json()
                order_id = order['id']
                
                # Check if order has product snapshots
                items = order.get('items', [])
                if items and len(items) > 0:
                    item = items[0]
                    snapshot_fields = ['product_name', 'product_image', 'product_price']
                    missing_snapshots = [f for f in snapshot_fields if f not in item]
                    
                    if not missing_snapshots:
                        self.log_result("Create Order with Snapshots", True, 
                            f"Order created with product snapshots: {item['product_name']}")
                    else:
                        self.log_result("Create Order with Snapshots", False, 
                            f"Missing snapshot fields: {missing_snapshots}")
                else:
                    self.log_result("Create Order with Snapshots", False, "No items in order")
                
                # GET /api/admin/orders with Bearer token - get all orders with pagination
                response = requests.get(f"{self.api_url}/admin/orders", headers=headers, timeout=10)
                if response.status_code == 200:
                    orders_data = response.json()
                    if 'orders' in orders_data and 'total' in orders_data:
                        self.log_result("Get Admin Orders", True, 
                            f"Retrieved {len(orders_data['orders'])} orders, total: {orders_data['total']}")
                    else:
                        self.log_result("Get Admin Orders", False, "Invalid response format")
                else:
                    self.log_result("Get Admin Orders", False, f"Status: {response.status_code}")
                
                # PUT /api/admin/orders/{id}/status with Bearer token - update order status
                status_update = {"status": "confirmed"}
                response = requests.put(f"{self.api_url}/admin/orders/{order_id}/status", 
                                      json=status_update, headers=headers, timeout=10)
                if response.status_code == 200:
                    updated_order = response.json()
                    if updated_order.get('status') == 'confirmed':
                        self.log_result("Update Order Status", True, f"Status updated to: {updated_order['status']}")
                    else:
                        self.log_result("Update Order Status", False, "Status not updated correctly")
                else:
                    self.log_result("Update Order Status", False, f"Status: {response.status_code}")
                
            else:
                self.log_result("Create Order", False, f"Status: {response.status_code}")
                
            # Clean up - delete test product
            requests.delete(f"{self.api_url}/products/{product_id}", headers=headers, timeout=10)
            
        except Exception as e:
            self.log_result("Order Management", False, f"Exception: {str(e)}")

    def test_optimization_features(self):
        """Test optimization features"""
        print("\n🔍 Testing Optimization Features...")
        
        # GET /api/products - verify response is lightweight (description may be excluded)
        try:
            response = requests.get(f"{self.api_url}/products", timeout=10)
            if response.status_code == 200:
                products = response.json()
                if products:
                    # Check if description is excluded by default
                    first_product = products[0]
                    has_description = 'description' in first_product and first_product['description']
                    self.log_result("Products Lightweight", not has_description, 
                        f"Description included: {has_description}")
                else:
                    self.log_result("Products Lightweight", True, "No products to check (empty response)")
            else:
                self.log_result("Products Lightweight", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Products Lightweight", False, f"Exception: {str(e)}")

        # GET /api/products?include_description=true - should include full description
        try:
            response = requests.get(f"{self.api_url}/products", params={"include_description": "true"}, timeout=10)
            if response.status_code == 200:
                products = response.json()
                if products:
                    first_product = products[0]
                    has_description = 'description' in first_product and first_product['description']
                    self.log_result("Products with Description", has_description, 
                        f"Description included: {has_description}")
                else:
                    self.log_result("Products with Description", True, "No products to check")
            else:
                self.log_result("Products with Description", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Products with Description", False, f"Exception: {str(e)}")

    def run_focused_tests(self):
        """Run focused tests as per review request"""
        print("🚀 Starting Focused Backend API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test admin authentication
        auth_success = self.test_admin_authentication()
        
        if auth_success:
            # Test admin-specific endpoints
            self.test_admin_stats()
            self.test_protected_product_crud()
            self.test_order_management()
        else:
            print("❌ Admin authentication failed - cannot continue with protected endpoint tests")
        
        # Test optimization features
        self.test_optimization_features()
        
        # Print summary
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t['status'] == 'PASS'])
        failed_tests = total_tests - passed_tests
        
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {total_tests}")
        print(f"Tests Passed: {passed_tests}")
        print(f"Tests Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "No tests run")
        
        # Print failed tests
        failed_test_results = [t for t in self.test_results if t['status'] == 'FAIL']
        if failed_test_results:
            print(f"\n❌ Failed Tests:")
            for test in failed_test_results:
                print(f"  - {test['test']}: {test['details']}")
        
        return failed_tests == 0

def main():
    tester = FocusedAPITester()
    success = tester.run_focused_tests()
    
    # Save results
    try:
        with open('/app/focused_test_results.json', 'w') as f:
            json.dump({
                'test_results': tester.test_results,
                'timestamp': datetime.now().isoformat()
            }, f, indent=2)
    except Exception as e:
        print(f"Warning: Could not save test results: {e}")
    
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())