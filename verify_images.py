import requests

try:
    response = requests.get('http://localhost:8000/api/products')
    response.raise_for_status()
    products = response.json()
    
    if not products:
        print("No products found.")
    else:
        print(f"Found {len(products)} products.")
        sample = products[0]
        print(f"Sample Product: {sample.get('name')}")
        print(f"Images: {sample.get('images', 'MISSING')}")
        print(f"Image URL: {sample.get('image_url', 'MISSING')}")
        
        if sample.get('images') and len(sample.get('images')) > 0:
            print("VERIFICATION SUCCESS: Product has images.")
        else:
            print("VERIFICATION FAILED: Product missing images.")

except Exception as e:
    print(f"Error: {e}")
