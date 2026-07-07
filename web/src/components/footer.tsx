export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6 mt-12">
      <div className="max-w-lg mx-auto px-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Beacon. All rights reserved.
      </div>
    </footer>
  );
}
