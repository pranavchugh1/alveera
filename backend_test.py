import requests
import sys
import json
from datetime import datetime

class ECommerceAPITester:
    def __init__(self, base_url="https://fast-shop-app.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.admin_token = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "status": "PASS" if success else "FAIL",
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {name}: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Add authorization header if auth is required
        if auth_required and self.admin_token:
            headers['Authorization'] = f'Bearer {self.admin_token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success:
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        details += f", Items: {len(response_data)}"
                    elif isinstance(response_data, dict) and 'id' in response_data:
                        details += f", ID: {response_data['id'][:8]}..."
                    elif isinstance(response_data, dict) and 'access_token' in response_data:
                        details += f", Token received"
                except:
                    pass
            else:
                details += f" (Expected: {expected_status})"
                try:
                    error_detail = response.json()
                    details += f", Error: {error_detail.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if success else {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_admin_authentication(self):
        """Test admin authentication endpoints"""
        print("\n🔍 Testing Admin Authentication...")
        
        # Test admin login with valid credentials
        login_data = {
            "email": "admin@alveera.com",
            "password": "Admin123!"
        }
        
        success, response = self.run_test(
            "Admin Login - Valid Credentials",
            "POST",
            "admin/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            self.log_test("Admin Token Stored", True, "Token saved for subsequent tests")
        else:
            self.log_test("Admin Token Storage", False, "Failed to get admin token")
            return False
        
        # Test admin login with invalid credentials
        invalid_login = {
            "email": "admin@alveera.com",
            "password": "WrongPassword"
        }
        
        self.run_test(
            "Admin Login - Invalid Credentials",
            "POST",
            "admin/login",
            401,
            data=invalid_login
        )
        
        # Test admin login with non-existent email
        invalid_email = {
            "email": "nonexistent@alveera.com",
            "password": "Admin123!"
        }
        
        self.run_test(
            "Admin Login - Non-existent Email",
            "POST",
            "admin/login",
            401,
            data=invalid_email
        )
        
        return True

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        print("\n🔍 Testing Admin Stats...")
        
        if not self.admin_token:
            self.log_test("Admin Stats", False, "No admin token available")
            return
        
        # Test admin stats with valid token
        success, stats = self.run_test(
            "Get Admin Stats - With Auth",
            "GET",
            "admin/stats",
            200,
            auth_required=True
        )
        
        if success and stats:
            # Verify required fields are present
            required_fields = ['total_revenue', 'total_orders', 'total_products', 'pending_orders', 'recent_orders']
            missing_fields = [field for field in required_fields if field not in stats]
            
            if not missing_fields:
                self.log_test("Admin Stats Fields", True, f"All required fields present: {required_fields}")
            else:
                self.log_test("Admin Stats Fields", False, f"Missing fields: {missing_fields}")
        
        # Test admin stats without auth token
        self.run_test(
            "Get Admin Stats - No Auth",
            "GET",
            "admin/stats",
            401
        )

    def test_protected_product_crud(self):
        """Test protected product CRUD operations"""
        print("\n🔍 Testing Protected Product CRUD...")
        
        if not self.admin_token:
            self.log_test("Protected Product CRUD", False, "No admin token available")
            return None
        
        # Test create product with auth
        test_product = {
            "design_no": "TEST001",
            "name": "Test Saree",
            "description": "A beautiful test saree for API testing",
            "price": 2999.99,
            "material": "Silk",
            "color": "Red",
            "image_url": "https://example.com/test-saree.jpg",
            "category": "festive"
        }
        
        success, product = self.run_test(
            "Create Product - With Auth",
            "POST",
            "products",
            200,
            data=test_product,
            auth_required=True
        )
        
        product_id = None
        if success and product:
            product_id = product.get('id')
        
        # Test create product without auth
        self.run_test(
            "Create Product - No Auth",
            "POST",
            "products",
            401,
            data=test_product
        )
        
        if product_id:
            # Test update product with auth
            update_data = {
                "name": "Updated Test Saree",
                "price": 3499.99
            }
            
            self.run_test(
                "Update Product - With Auth",
                "PUT",
                f"products/{product_id}",
                200,
                data=update_data,
                auth_required=True
            )
            
            # Test update product without auth
            self.run_test(
                "Update Product - No Auth",
                "PUT",
                f"products/{product_id}",
                401,
                data=update_data
            )
            
            # Test delete product with auth
            self.run_test(
                "Delete Product - With Auth",
                "DELETE",
                f"products/{product_id}",
                200,
                auth_required=True
            )
            
            # Test delete non-existent product
            self.run_test(
                "Delete Non-existent Product",
                "DELETE",
                "products/non-existent-id",
                404,
                auth_required=True
            )
        
        # Test delete product without auth
        self.run_test(
            "Delete Product - No Auth",
            "DELETE",
            "products/some-id",
            401
        )
        
        return product_id

    def test_admin_orders(self):
        """Test admin orders management"""
        print("\n🔍 Testing Admin Orders Management...")
        
        if not self.admin_token:
            self.log_test("Admin Orders", False, "No admin token available")
            return None
        
        # Test get all orders with auth
        success, orders_response = self.run_test(
            "Get All Orders - With Auth",
            "GET",
            "admin/orders",
            200,
            auth_required=True
        )
        
        # Test get orders without auth
        self.run_test(
            "Get All Orders - No Auth",
            "GET",
            "admin/orders",
            401
        )
        
        # Test get orders with status filter
        self.run_test(
            "Get Orders by Status",
            "GET",
            "admin/orders",
            200,
            params={"status": "pending"},
            auth_required=True
        )
        
        # Test get orders with pagination
        self.run_test(
            "Get Orders with Pagination",
            "GET",
            "admin/orders",
            200,
            params={"limit": 10, "offset": 0},
            auth_required=True
        )
        
        return orders_response.get('orders', []) if success else []

    def test_order_status_update(self):
        """Test order status update functionality"""
        print("\n🔍 Testing Order Status Update...")
        
        if not self.admin_token:
            self.log_test("Order Status Update", False, "No admin token available")
            return
        
        # First create an order using public endpoint
        # Get a product first
        success, products = self.run_test(
            "Get Products for Order",
            "GET",
            "products",
            200
        )
        
        if not success or not products:
            self.log_test("Order Status Update", False, "No products available to create order")
            return
        
        product_id = products[0]['id']
        
        # Create order
        order_data = {
            "customer_name": "Admin Test Customer",
            "customer_email": "admintest@example.com",
            "customer_phone": "+91XXXXXXXXXX",
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 1
                }
            ],
            "total": 2999.99,
            "payment_method": "stripe"
        }
        
        success, order = self.run_test(
            "Create Order for Status Update",
            "POST",
            "orders",
            200,
            data=order_data
        )
        
        if success and order:
            order_id = order['id']
            
            # Test update order status with auth
            status_update = {"status": "confirmed"}
            
            self.run_test(
                "Update Order Status - With Auth",
                "PUT",
                f"admin/orders/{order_id}/status",
                200,
                data=status_update,
                auth_required=True
            )
            
            # Test update order status without auth
            self.run_test(
                "Update Order Status - No Auth",
                "PUT",
                f"admin/orders/{order_id}/status",
                401,
                data=status_update
            )
            
            # Test update with invalid status
            invalid_status = {"status": "invalid_status"}
            
            self.run_test(
                "Update Order Status - Invalid Status",
                "PUT",
                f"admin/orders/{order_id}/status",
                400,
                data=invalid_status,
                auth_required=True
            )
            
            # Test update non-existent order
            self.run_test(
                "Update Non-existent Order Status",
                "PUT",
                "admin/orders/non-existent-id/status",
                404,
                data=status_update,
                auth_required=True
            )

    def test_products_api(self):
        """Test products API endpoints"""
        print("\n🔍 Testing Products API...")
        
        # Test get all products
        success, products = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        
        if not success or not products:
            print("❌ Cannot continue product tests - no products available")
            return None
            
        # Test product filtering
        self.run_test(
            "Filter by Category",
            "GET", 
            "products",
            200,
            params={"category": "new-arrivals"}
        )
        
        self.run_test(
            "Filter by Material",
            "GET",
            "products", 
            200,
            params={"material": "Silk"}
        )
        
        self.run_test(
            "Filter by Color",
            "GET",
            "products",
            200, 
            params={"color": "Navy Blue"}
        )
        
        self.run_test(
            "Filter by Price Range",
            "GET",
            "products",
            200,
            params={"min_price": 1000, "max_price": 5000}
        )
        
        self.run_test(
            "Search Products",
            "GET",
            "products",
            200,
            params={"search": "saree"}
        )
        
        # Test get single product
        if products:
            product_id = products[0]['id']
            self.run_test(
                "Get Single Product",
                "GET",
                f"products/{product_id}",
                200
            )
            
            # Test non-existent product
            self.run_test(
                "Get Non-existent Product",
                "GET",
                "products/non-existent-id",
                404
            )
            
            return product_id
        
        return None

    def test_categories_api(self):
        """Test categories API"""
        print("\n🔍 Testing Categories API...")
        
        self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200
        )

    def test_orders_api(self, product_id):
        """Test orders API"""
        print("\n🔍 Testing Orders API...")
        
        if not product_id:
            print("❌ Cannot test orders - no product ID available")
            return None
            
        # Test create order
        order_data = {
            "customer_name": "Test Customer",
            "customer_email": "test@example.com", 
            "customer_phone": "+91XXXXXXXXXX",
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 2
                }
            ],
            "total": 2999.98,
            "payment_method": "stripe"
        }
        
        success, order = self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data=order_data
        )
        
        if success and order:
            order_id = order['id']
            
            # Test get order
            self.run_test(
                "Get Order",
                "GET",
                f"orders/{order_id}",
                200
            )
            
            return order_id
            
        # Test get non-existent order
        self.run_test(
            "Get Non-existent Order",
            "GET",
            "orders/non-existent-id",
            404
        )
        
        return None

    def test_error_handling(self):
        """Test API error handling"""
        print("\n🔍 Testing Error Handling...")
        
        # Test invalid endpoints
        self.run_test(
            "Invalid Endpoint",
            "GET",
            "invalid-endpoint",
            404
        )
        
        # Test invalid order data
        invalid_order = {
            "customer_name": "",  # Empty required field
            "items": [],  # Empty items
            "total": -100  # Invalid total
        }
        
        self.run_test(
            "Create Order with Invalid Data",
            "POST",
            "orders",
            422  # Validation error
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting E-commerce API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test admin authentication first
        auth_success = self.test_admin_authentication()
        
        if auth_success:
            # Test admin-specific endpoints
            self.test_admin_stats()
            self.test_protected_product_crud()
            self.test_admin_orders()
            self.test_order_status_update()
        else:
            print("❌ Admin authentication failed - skipping admin-specific tests")
        
        # Test public endpoints
        product_id = self.test_products_api()
        self.test_categories_api()
        order_id = self.test_orders_api(product_id)
        self.test_error_handling()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if t['status'] == 'FAIL']
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ECommerceAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    try:
        with open('/app/test_reports/backend_api_results.json', 'w') as f:
            json.dump({
                'summary': {
                    'total_tests': tester.tests_run,
                    'passed_tests': tester.tests_passed,
                    'failed_tests': tester.tests_run - tester.tests_passed,
                    'success_rate': (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0
                },
                'test_results': tester.test_results,
                'timestamp': datetime.now().isoformat()
            }, f, indent=2)
    except Exception as e:
        print(f"Warning: Could not save test results: {e}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())