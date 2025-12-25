import React from 'react';
import { Instagram, Facebook, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#F9F5F0] mt-auto" data-testid="footer">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div data-testid="footer-about">
            <h3 className="font-serif text-2xl mb-4 text-[#C5A059]">ALVEERA</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Ethnic Allure - Where tradition meets contemporary elegance. Discover our collection of exquisite sarees crafted for the modern woman.
            </p>
          </div>

          <div data-testid="footer-quick-links">
            <h4 className="font-serif text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/products" className="text-gray-600 hover:text-[#C5A059] transition-colors" data-testid="footer-link-shop">
                  Shop All
                </a>
              </li>
              <li>
                <a href="/products?category=new-arrivals" className="text-gray-600 hover:text-[#C5A059] transition-colors" data-testid="footer-link-new">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="/products?category=festive" className="text-gray-600 hover:text-[#C5A059] transition-colors" data-testid="footer-link-festive">
                  Festive Collection
                </a>
              </li>
              <li>
                <a href="/products?category=silk" className="text-gray-600 hover:text-[#C5A059] transition-colors" data-testid="footer-link-silk">
                  Silk Sarees
                </a>
              </li>
            </ul>
          </div>

          <div data-testid="footer-contact">
            <h4 className="font-serif text-lg mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2" data-testid="footer-phone">
                <Phone className="w-4 h-4 text-[#C5A059]" />
                <span>+91-XXXXXXXXXX</span>
              </div>
              <div className="flex items-center gap-2" data-testid="footer-email">
                <Mail className="w-4 h-4 text-[#C5A059]" />
                <span>info@alveeraethnic.com</span>
              </div>
              <div className="flex gap-4 mt-4" data-testid="footer-social">
                <a href="#" className="text-gray-600 hover:text-[#C5A059] transition-colors" data-testid="social-instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-600 hover:text-[#C5A059] transition-colors" data-testid="social-facebook">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-12 pt-8 text-center text-sm text-gray-600" data-testid="footer-copyright">
          <p>&copy; 2025 Alveera Ethnic Allure. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}