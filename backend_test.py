import requests
import sys
import json
from datetime import datetime

class ECommerceAPITester:
    def __init__(self, base_url="https://alveera-admin.preview.emergentagent.com"):
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

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

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
        
        # Test products API
        product_id = self.test_products_api()
        
        # Test categories API  
        self.test_categories_api()
        
        # Test orders API
        order_id = self.test_orders_api(product_id)
        
        # Test error handling
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
        }, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())