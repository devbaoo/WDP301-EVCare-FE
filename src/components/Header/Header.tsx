import { Button } from "antd";

export default function Header() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-synop-blue-dark">
              Gnuh
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button className="text-synop-blue-dark font-semibold text-sm tracking-wide hover:text-synop-blue-primary transition-colors">
              SOLUTIONS
            </button>
            <button className="text-synop-blue-dark font-semibold text-sm tracking-wide hover:text-synop-blue-primary transition-colors">
              INTEROPERABILITY
            </button>
            <button className="text-synop-blue-dark font-semibold text-sm tracking-wide hover:text-synop-blue-primary transition-colors">
              COMPANY
            </button>
          </div>
          <Button className="bg-white text-synop-blue-primary border border-synop-blue-primary hover:bg-synop-blue-primary hover:text-white rounded-full px-6">
            Book a demo
          </Button>
        </div>
      </div>
    </nav>
  );
}
