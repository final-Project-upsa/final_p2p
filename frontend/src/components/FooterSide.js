import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About TrustTrade</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-300">About Us</a></li>
              <li><a href="#" className="hover:text-blue-300">Careers</a></li>
              <li><a href="#" className="hover:text-blue-300">Press</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-300">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-300">Safety Center</a></li>
              <li><a href="#" className="hover:text-blue-300">Community Guidelines</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-300">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-300">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-300">Cookie Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-300">Facebook</a></li>
              <li><a href="#" className="hover:text-blue-300">Twitter</a></li>
              <li><a href="#" className="hover:text-blue-300">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center py-8">
          <p>&copy; 2024 TrustTrade. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;