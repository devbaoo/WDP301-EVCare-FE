import { Button } from "antd";
import { MessageSquare, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-synop-blue-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">
                Ready to transform your EV service center?
              </h3>
              <a href="/login">
              <Button className="bg-white text-synop-blue-primary hover:bg-gray-100 rounded-full px-8">
                Get Started
              </Button>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Solutions</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Charging Management</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Vehicle Management</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Energy Management</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Payment Management</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">SynopLink</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Use Cases</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Press Room</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Contact Information</h4>
            <div className="space-y-3 text-sm">
              <p>Email: info@EV CARE.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: 48 Grattan St, Brooklyn, NY 11237</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="flex space-x-4">
                <MessageSquare className="w-5 h-5" />
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-synop-blue-light transition-colors underline">Press Inquiries</a>
                <a href="#" className="hover:text-synop-blue-light transition-colors underline">Contact Us</a>
                <a href="#" className="hover:text-synop-blue-light transition-colors underline">Status</a>
                <a href="#" className="hover:text-synop-blue-light transition-colors underline">Security</a>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <span>48 Grattan St, Brooklyn, NY 11237</span>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-synop-blue-light transition-colors underline">Privacy Policy</a>
                <a href="#" className="hover:text-synop-blue-light transition-colors underline">Terms & Conditions</a>
              </div>
              <span>©COPYRIGHT EV CARE  2025</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
