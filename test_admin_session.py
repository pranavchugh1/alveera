import requests
import json

def test_admin_session_validation():
    """Test GET /api/admin/me endpoint specifically"""
    base_url = "https://ecom-userauth.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("🔍 Testing Admin Session Validation...")
    
    # First login to get token
    login_data = {
        "email": "admin@alveera.com",
        "password": "Admin123!"
    }
    
    try:
        response = requests.post(f"{api_url}/admin/login", json=login_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            token = data['access_token']
            print(f"✅ Login successful, token received")
            
            # Test GET /api/admin/me with Bearer token
            headers = {'Authorization': f'Bearer {token}'}
            response = requests.get(f"{api_url}/admin/me", headers=headers, timeout=10)
            
            if response.status_code == 200:
                profile = response.json()
                print(f"✅ Admin profile retrieved: {json.dumps(profile, indent=2)}")
                
                # Verify required fields
                required_fields = ['id', 'email', 'full_name']
                missing = [f for f in required_fields if f not in profile]
                
                if not missing:
                    print(f"✅ All required fields present: {required_fields}")
                else:
                    print(f"❌ Missing fields: {missing}")
                    
            else:
                print(f"❌ Failed to get admin profile: Status {response.status_code}")
                
            # Test with invalid token
            invalid_headers = {'Authorization': 'Bearer invalid_token_here'}
            response = requests.get(f"{api_url}/admin/me", headers=invalid_headers, timeout=10)
            
            if response.status_code in [401, 403]:
                print(f"✅ Invalid token correctly rejected: Status {response.status_code}")
            else:
                print(f"❌ Invalid token not rejected: Status {response.status_code}")
                
            # Test without token
            response = requests.get(f"{api_url}/admin/me", timeout=10)
            
            if response.status_code in [401, 403]:
                print(f"✅ No token correctly rejected: Status {response.status_code}")
            else:
                print(f"❌ No token not rejected: Status {response.status_code}")
                
        else:
            print(f"❌ Login failed: Status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

if __name__ == "__main__":
    test_admin_session_validation()